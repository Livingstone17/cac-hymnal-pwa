// hymnizeApiLayer.ts
//
// Data layer for the static CAC hymnal dataset, served through jsDelivr
// (base URL configurable via VITE_HYMNAL_DATA_BASE):
//
//   - Four lightweight catalog indexes (english|yoruba / regular|various /
//     index.json) — metadata only, no lyrics.
//   - Individual merged hymn files (merged/{type}/{id}.json) — both English
//     and Yoruba in a single response, fetched only when a hymn is opened.
//   - A precomputed lyrics search index (search-index.json) — loaded once,
//     cached in IndexedDB, and kept in memory for subsequent local searches.
//
// Everything is snapshotted into IndexedDB so fresh-cache sessions restore in
// milliseconds, and offline users keep access to previously cached hymns.

import {
  CACHE_PREFIX,
  CATALOG_CACHE_KEY,
  CATALOG_TTL_MS,
  HYMNAL_DATA_BASE,
} from "../constants/hymnal";

import { cacheGet, cacheSet } from "../lib/indexedDB";

import {
  hymnCacheKey,
  makeHymnId,
  makeHymnKey,
  slugify,
} from "../lib/hymnUtils";

import type {
  ApiLanguage,
  CachedValue,
  Hymn,
  HymnSummary,
  HymnType,
  Verse,
} from "../types/hymnal";

interface ApiLine {
  dynamic: string | null;
  text: string;
}

interface ApiStanza {
  no: number;
  lines: ApiLine[];
}

interface ApiChorus {
  lines: ApiLine[];
}

// ── Catalog index (data/{language}/{type}/index.json) ──────────────────────

interface CatalogIndexEntry {
  id: number;
  title: string;
  category: string;
  meter: string | null;
  scripture: string | null;
}

interface CatalogIndexFile {
  language: ApiLanguage;
  type: HymnType;
  count: number;
  hymns: CatalogIndexEntry[];
}

interface CatalogIndexSnapshot {
  savedAt: number;
  english: { regular: CatalogIndexEntry[]; various: CatalogIndexEntry[] };
  yoruba: { regular: CatalogIndexEntry[]; various: CatalogIndexEntry[] };
}

// ── Merged hymn (data/merged/{type}/{id}.json) ─────────────────────────────

interface MergedLanguage {
  id: number;
  language: ApiLanguage;
  type: HymnType;
  category: string;
  meter: string | null;
  title: string;
  scripture: string | null;
  stanzas: ApiStanza[];
  chorus: ApiChorus | null;
}

interface MergedHymn {
  id: number;
  type: HymnType;
  english: MergedLanguage | null;
  yoruba: MergedLanguage | null;
}

// ── Search index (data/search-index.json) ──────────────────────────────────

interface SearchIndexEntry {
  id: number;
  type?: HymnType | string;
  english?: string[];
  yoruba?: string[];
  en?: string[];
  yo?: string[];
}

interface SearchIndexFile {
  hymns?: SearchIndexEntry[];
  entries?: SearchIndexEntry[];
  searchIndex?: SearchIndexEntry[];
  search_index?: SearchIndexEntry[];
}

const CATALOG_INDEX_CACHE_KEY = `${CACHE_PREFIX}:catalog-index:v1`;
const SEARCH_INDEX_CACHE_KEY = `${CACHE_PREFIX}:search-index:v1`;

const SEARCH_INDEX_RETRY_MS = 10 * 60 * 1000; // re-attempt a failed index load

// ── In-memory catalog indexes ──────────────────────────────────────────────

const catalogIndex: Record<ApiLanguage, Record<HymnType, CatalogIndexEntry[]>> = {
  english: {
    regular: [],
    various: [],
  },

  yoruba: {
    regular: [],
    various: [],
  },
};

let catalogIndexLoaded = false;
let catalogIndexPromise: Promise<void> | null = null;

// ── Lyrics search index (P3) ───────────────────────────────────────────────

interface LyricsEntry {
  lines: string[];
  blocks: string[];
  stripLines: string[];
  stripBlocks: string[];
}

interface ParsedSearchIndex {
  /** hymnId (makeHymnId) → entry, for entries that carry a `type`. */
  index: Map<number, LyricsEntry>;
  /** bare hymn number → entry, for entries without a `type`. */
  bareIndex: Map<number, LyricsEntry>;
}

/** In-memory parsed search index. Rebuilt on catalog refresh. */
let searchIndex: ParsedSearchIndex | null = null;
let searchIndexPromise: Promise<boolean> | null = null;
let searchIndexLoadAttemptedAt: number | null = null;

/**
 * Offline-only fallback index built once from the per-hymn IndexedDB cache.
 * Only used when the search index is unavailable (not yet generated, offline
 * before it was cached), so repeated keystrokes don't re-read ~1000 hymn
 * records on every search.
 */
let offlineLyricsIndex: Map<number, LyricsEntry> | null = null;

function normalize(text: string): string {
  return text.toLowerCase().replace(/\s+/g, " ").trim();
}

function stripDiacritics(text: string): string {
  return normalize(text)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .normalize("NFC");
}

function entryFromHymn(hymn: Hymn): LyricsEntry | null {
  const lines: string[] = [];
  const blocks: string[] = [];

  for (const verse of hymn.verses) {
    if (verse.en.length > 0) {
      lines.push(...verse.en);
      blocks.push(verse.en.join(" "));
    }

    if (verse.yo.length > 0) {
      lines.push(...verse.yo);
      blocks.push(verse.yo.join(" "));
    }
  }

  if (hymn.chorus) {
    if (hymn.chorus.en.length > 0) {
      lines.push(...hymn.chorus.en);
      blocks.push(hymn.chorus.en.join(" "));
    }

    if (hymn.chorus.yo.length > 0) {
      lines.push(...hymn.chorus.yo);
      blocks.push(hymn.chorus.yo.join(" "));
    }
  }

  if (!lines.length) return null;

  return {
    lines: lines.map(normalize),
    blocks: blocks.map(normalize),
    stripLines: lines.map(stripDiacritics),
    stripBlocks: blocks.map(stripDiacritics),
  };
}

async function buildOfflineLyricsIndex(
  catalog: HymnSummary[],
): Promise<Map<number, LyricsEntry>> {
  const index = new Map<number, LyricsEntry>();

  for (const summary of catalog) {
    const key = hymnCacheKey(summary.hymnType, summary.number);
    const cached = await cacheGet<CachedValue<Hymn>>(key);
    if (!cached?.data) continue;

    const entry = entryFromHymn(cached.data);
    if (entry) index.set(summary.id, entry);
  }

  return index;
}

async function getOfflineLyricsIndex(
  catalog: HymnSummary[],
): Promise<Map<number, LyricsEntry>> {
  if (!offlineLyricsIndex) {
    offlineLyricsIndex = await buildOfflineLyricsIndex(catalog);
  }
  return offlineLyricsIndex;
}

// ── Network ────────────────────────────────────────────────────────────────

async function apiGet<T>(path: string, signal?: AbortSignal): Promise<T> {
  const res = await fetch(`${HYMNAL_DATA_BASE}${path}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
    signal,
  });

  if (!res.ok) {
    throw new Error(`Hymnal data error: ${res.status} ${res.statusText}`);
  }

  return res.json() as Promise<T>;
}

// ── Catalog index loading ──────────────────────────────────────────────────

async function fetchCatalogIndexFile(
  language: ApiLanguage,
  hymnType: HymnType,
  signal?: AbortSignal,
): Promise<CatalogIndexEntry[]> {
  const file = await apiGet<CatalogIndexFile>(
    `/${language}/${hymnType}/index.json`,
    signal,
  );

  return file.hymns ?? [];
}

async function saveCatalogIndexSnapshot(
  englishRegular: CatalogIndexEntry[],
  englishVarious: CatalogIndexEntry[],
  yorubaRegular: CatalogIndexEntry[],
  yorubaVarious: CatalogIndexEntry[],
) {
  const snapshot: CatalogIndexSnapshot = {
    savedAt: Date.now(),
    english: { regular: englishRegular, various: englishVarious },
    yoruba: { regular: yorubaRegular, various: yorubaVarious },
  };

  await cacheSet(CATALOG_INDEX_CACHE_KEY, snapshot);
}

async function loadCatalogIndexes(
  signal?: AbortSignal,
  options?: { force?: boolean },
): Promise<void> {
  const force = Boolean(options?.force);

  if (catalogIndexLoaded && !force) {
    return;
  }

  if (catalogIndexPromise) {
    return catalogIndexPromise;
  }

  // Restore from the IndexedDB snapshot first — zero network when available.
  if (!force) {
    const snapshot = await cacheGet<CatalogIndexSnapshot>(
      CATALOG_INDEX_CACHE_KEY,
    );

    if (snapshot) {
      catalogIndex.english.regular = snapshot.english.regular;
      catalogIndex.english.various = snapshot.english.various;
      catalogIndex.yoruba.regular = snapshot.yoruba.regular;
      catalogIndex.yoruba.various = snapshot.yoruba.various;

      catalogIndexLoaded = true;
      return;
    }
  }

  catalogIndexPromise = (async () => {
    const [englishRegular, englishVarious, yorubaRegular, yorubaVarious] =
      await Promise.all([
        fetchCatalogIndexFile("english", "regular", signal),
        fetchCatalogIndexFile("english", "various", signal),
        fetchCatalogIndexFile("yoruba", "regular", signal),
        fetchCatalogIndexFile("yoruba", "various", signal),
      ]);

    catalogIndex.english.regular = englishRegular;
    catalogIndex.english.various = englishVarious;

    catalogIndex.yoruba.regular = yorubaRegular;
    catalogIndex.yoruba.various = yorubaVarious;

    catalogIndexLoaded = true;

    // Catalog changed — drop the in-memory search index and clear the retry
    // guard so the next search revalidates against the (freshly TTL'd) copy
    // instead of waiting out the 10-minute backoff.
    searchIndex = null;
    searchIndexLoadAttemptedAt = null;

    // Fire-and-forget snapshot so next session starts offline-ready.
    void saveCatalogIndexSnapshot(
      englishRegular,
      englishVarious,
      yorubaRegular,
      yorubaVarious,
    );
  })();

  try {
    await catalogIndexPromise;
  } finally {
    catalogIndexPromise = null;
  }
}

// ── Catalog (HymnSummary[]) ────────────────────────────────────────────────

export async function fetchCatalog(
  signal?: AbortSignal,
  options?: { forceCollections?: boolean },
): Promise<HymnSummary[]> {
  await loadCatalogIndexes(signal, { force: options?.forceCollections });

  // A hymn number is only unique within its type (regular vs various), so
  // build the maps per (type, id) instead of by bare id.
  const englishByKey = new Map<string, CatalogIndexEntry>();
  const yorubaByKey = new Map<string, CatalogIndexEntry>();

  for (const hymnType of ["regular", "various"] as HymnType[]) {
    for (const entry of catalogIndex.english[hymnType]) {
      englishByKey.set(makeHymnKey(hymnType, entry.id), entry);
    }

    for (const entry of catalogIndex.yoruba[hymnType]) {
      yorubaByKey.set(makeHymnKey(hymnType, entry.id), entry);
    }
  }

  const keys = Array.from(
    new Set([...englishByKey.keys(), ...yorubaByKey.keys()]),
  );

  return keys
    .map((key) => {
      const english = englishByKey.get(key);
      const yoruba = yorubaByKey.get(key);

      const source = english ?? yoruba;

      if (!source) {
        throw new Error(`Invalid hymn key: ${key}`);
      }

      const [hymnTypeRaw, numberRaw] = key.split(":");
      const hymnType = hymnTypeRaw as HymnType;
      const number = Number(numberRaw);

      const categoryEn =
        english?.category ?? yoruba?.category ?? "Uncategorized";

      const categoryYo =
        yoruba?.category ?? english?.category ?? "Uncategorized";

      return {
        id: makeHymnId(hymnType, number),

        number,

        hymnType,

        titleEn: english?.title ?? yoruba?.title ?? `Hymn ${number}`,

        titleYo: yoruba?.title ?? english?.title ?? `Hymn ${number}`,

        category: slugify(categoryEn),

        categoryEn,

        categoryYo,

        meter: english?.meter ?? yoruba?.meter ?? null,

        scripture: english?.scripture ?? yoruba?.scripture ?? null,
      };
    })
    .sort((a, b) => {
      const typeOrder: Record<HymnType, number> = {
        regular: 0,
        various: 1,
      };

      if (a.hymnType !== b.hymnType) {
        return typeOrder[a.hymnType] - typeOrder[b.hymnType];
      }

      return a.number - b.number;
    });
}

async function saveCatalog(data: HymnSummary[]) {
  await cacheSet<CachedValue<HymnSummary[]>>(CATALOG_CACHE_KEY, {
    savedAt: Date.now(),
    data,
  });
}

export async function getCatalogFresh(): Promise<HymnSummary[]> {
  const fresh = await fetchCatalog(undefined, { forceCollections: true });
  await saveCatalog(fresh);
  return fresh;
}

export async function getCatalogCached(): Promise<HymnSummary[]> {
  const cached = await cacheGet<CachedValue<HymnSummary[]>>(CATALOG_CACHE_KEY);

  const cacheIsFresh = cached && Date.now() - cached.savedAt < CATALOG_TTL_MS;

  if (cacheIsFresh) {
    return cached.data;
  }

  try {
    return await getCatalogFresh();
  } catch (error) {
    if (cached) return cached.data;
    throw error;
  }
}

export async function refreshCatalogInBackground(
  onFreshData?: (data: HymnSummary[]) => void,
) {
  try {
    // If the cached catalog is still fresh, restore the catalog indexes from
    // the IDB snapshot so hymn detail and lyrics search stay instant.
    const cached = await cacheGet<CachedValue<HymnSummary[]>>(CATALOG_CACHE_KEY);

    const cacheIsFresh = cached && Date.now() - cached.savedAt < CATALOG_TTL_MS;

    if (cacheIsFresh) {
      await loadCatalogIndexes();
      return;
    }

    const fresh = await getCatalogFresh();
    onFreshData?.(fresh);
  } catch {
    // Ignore refresh failures.
  }
}

// ── Individual hymns ───────────────────────────────────────────────────────

function extractLines(lines?: ApiLine[]) {
  return lines?.map((line) => line.text).filter(Boolean) ?? [];
}

function mergeMergedHymn(summary: HymnSummary, merged: MergedHymn): Hymn {
  const english = merged.english;
  const yoruba = merged.yoruba;

  const englishStanzas = new Map(
    english?.stanzas.map((stanza) => [stanza.no, stanza]) ?? [],
  );

  const yorubaStanzas = new Map(
    yoruba?.stanzas.map((stanza) => [stanza.no, stanza]) ?? [],
  );

  const stanzaNumbers = Array.from(
    new Set([...englishStanzas.keys(), ...yorubaStanzas.keys()]),
  ).sort((a, b) => a - b);

  const verses: Verse[] = stanzaNumbers.map((number) => ({
    number,
    en: extractLines(englishStanzas.get(number)?.lines),
    yo: extractLines(yorubaStanzas.get(number)?.lines),
  }));

  const chorusEn = extractLines(english?.chorus?.lines);
  const chorusYo = extractLines(yoruba?.chorus?.lines);

  return {
    ...summary,

    categoryEn: english?.category ?? summary.categoryEn,

    categoryYo: yoruba?.category ?? summary.categoryYo,

    meter: english?.meter ?? yoruba?.meter ?? summary.meter,

    scripture: english?.scripture ?? yoruba?.scripture ?? summary.scripture,

    verses,

    chorus:
      chorusEn.length || chorusYo.length
        ? {
            en: chorusEn,
            yo: chorusYo,
          }
        : undefined,
  };
}

export async function getHymnCached(
  summary: HymnSummary,
  options?: { forceRefresh?: boolean },
): Promise<Hymn> {
  const key = hymnCacheKey(summary.hymnType, summary.number);

  const cached = await cacheGet<CachedValue<Hymn>>(key);

  if (cached && !options?.forceRefresh) {
    return cached.data;
  }

  // A single request — the merged file contains both English and Yoruba, so
  // the language toggle never triggers another network call.
  const merged = await apiGet<MergedHymn>(
    `/merged/${summary.hymnType}/${summary.number}.json`,
  );

  const hymn = mergeMergedHymn(summary, merged);

  await cacheSet<CachedValue<Hymn>>(key, {
    savedAt: Date.now(),
    data: hymn,
  });

  return hymn;
}

// ── Offline download ───────────────────────────────────────────────────────

export async function downloadAllHymns(
  catalog: HymnSummary[],
  onProgress?: (done: number, total: number, hymn: HymnSummary) => void,
): Promise<{ failed: number }> {
  const total = catalog.length;
  let done = 0;
  let failed = 0;
  let cursor = 0;

  // Limited concurrency to avoid flooding the CDN with parallel requests.
  const concurrency = 6;

  async function worker() {
    while (true) {
      const currentIndex = cursor;
      cursor += 1;

      if (currentIndex >= total) return;

      const hymn = catalog[currentIndex];

      try {
        await getHymnCached(hymn);
      } catch (error) {
        failed += 1;
        console.warn("Failed to cache hymn", hymn, error);
      }

      done += 1;
      onProgress?.(done, total, hymn);
    }
  }

  await Promise.all(Array.from({ length: concurrency }, () => worker()));

  // Per-hymn cache changed — rebuild the offline index lazily next search.
  offlineLyricsIndex = null;

  return { failed };
}

// ── Lyrics search ──────────────────────────────────────────────────────────

function buildSearchIndex(file: SearchIndexFile): ParsedSearchIndex | null {
  const entries = file.hymns ?? file.entries ?? file.searchIndex ?? file.search_index;

  if (!Array.isArray(entries) || entries.length === 0) {
    return null;
  }

  const index = new Map<number, LyricsEntry>();
  const bareIndex = new Map<number, LyricsEntry>();

  for (const entry of entries) {
    const lines = [
      ...toLineArray(entry.english ?? entry.en),
      ...toLineArray(entry.yoruba ?? entry.yo),
    ].filter((line) => line.length > 0);

    if (!lines.length) continue;

    const normalized = lines.map(normalize);
    const stripped = lines.map(stripDiacritics);

    const lyricsEntry: LyricsEntry = {
      lines: normalized,
      // One joined block lets cross-line phrases match across the whole hymn.
      blocks: [normalized.join(" ")],
      stripLines: stripped,
      stripBlocks: [stripped.join(" ")],
    };

    const type = entry.type === "regular" || entry.type === "various" ? entry.type : undefined;

    if (type) {
      index.set(makeHymnId(type, entry.id), lyricsEntry);
    } else {
      bareIndex.set(entry.id, lyricsEntry);
    }
  }

  if (index.size === 0 && bareIndex.size === 0) {
    return null;
  }

  return { index, bareIndex };
}

function toLineArray(value: string[] | string | undefined): string[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

async function loadSearchIndex(force = false): Promise<boolean> {
  if (searchIndex) return true;

  if (searchIndexPromise) {
    return searchIndexPromise;
  }

  // Avoid a network attempt on every keystroke when the index is unavailable.
  if (
    !force &&
    searchIndexLoadAttemptedAt !== null &&
    Date.now() - searchIndexLoadAttemptedAt < SEARCH_INDEX_RETRY_MS
  ) {
    return false;
  }

  searchIndexPromise = (async () => {
    try {
      const cached = await cacheGet<CachedValue<SearchIndexFile>>(
        SEARCH_INDEX_CACHE_KEY,
      );

      const cacheIsFresh = cached && Date.now() - cached.savedAt < CATALOG_TTL_MS;

      let raw: SearchIndexFile | undefined;

      if (cacheIsFresh) {
        raw = cached.data;
      } else {
        try {
          raw = await apiGet<SearchIndexFile>("/search-index.json");

          await cacheSet<CachedValue<SearchIndexFile>>(SEARCH_INDEX_CACHE_KEY, {
            savedAt: Date.now(),
            data: raw,
          });
        } catch (error) {
          // Offline or index not generated yet — fall back to a stale copy.
          if (cached) raw = cached.data;
          else throw error;
        }
      }

      if (!raw) return false;

      searchIndex = buildSearchIndex(raw);
      return searchIndex !== null;
    } catch {
      return false;
    } finally {
      searchIndexPromise = null;
      searchIndexLoadAttemptedAt = Date.now();
    }
  })();

  return searchIndexPromise;
}

function lookupSearchEntry(
  parsed: ParsedSearchIndex | null,
  summary: HymnSummary,
): LyricsEntry | undefined {
  if (!parsed) return undefined;

  return (
    parsed.index.get(makeHymnId(summary.hymnType, summary.number)) ??
    parsed.bareIndex.get(summary.number)
  );
}

export async function searchCachedLyrics(
  catalog: HymnSummary[],
  query: string,
  limit = 40,
): Promise<HymnSummary[]> {
  const trimmed = query.trim();
  if (!trimmed || trimmed.length < 2) return [];

  const queryNorm = normalize(trimmed);
  const queryStripped = stripDiacritics(trimmed);

  interface ScoredResult {
    summary: HymnSummary;
    score: number;
  }

  const scored: ScoredResult[] = [];

  // ── Load lyrics source (search index → offline per-hymn cache) ──────────

  let parsed: ParsedSearchIndex | null = null;
  let offlineIndex: Map<number, LyricsEntry> | null = null;

  if (await loadSearchIndex()) {
    parsed = searchIndex;
  } else {
    offlineIndex = await getOfflineLyricsIndex(catalog);
  }

  for (const summary of catalog) {
    const entry = parsed
      ? lookupSearchEntry(parsed, summary)
      : offlineIndex?.get(summary.id);

    if (!entry) continue;

    let bestScore = 0;

    // 1. Individual lines (highest score possible)
    for (let i = 0; i < entry.lines.length; i++) {
      let s = 0;
      if (entry.lines[i].includes(queryNorm)) s = 110;
      else if (entry.stripLines[i].includes(queryStripped)) s = 90;

      if (s > bestScore) bestScore = s;
      if (bestScore >= 110) break;
    }

    // 2. Joined blocks (catches cross-line phrases)
    if (bestScore < 70) {
      for (let i = 0; i < entry.blocks.length; i++) {
        let s = 0;
        if (entry.blocks[i].includes(queryNorm)) s = 70;
        else if (entry.stripBlocks[i].includes(queryStripped)) s = 50;

        if (s > bestScore) bestScore = s;
        if (bestScore >= 70) break;
      }
    }

    if (bestScore > 0) {
      scored.push({ summary, score: bestScore });
    }
  }

  // ── Sort and return ─────────────────────────────────────────────────────

  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.summary.number - b.summary.number;
  });

  return scored.slice(0, limit).map((item) => item.summary);
}
