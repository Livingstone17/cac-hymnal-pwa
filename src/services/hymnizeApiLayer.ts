// hymnizeApiLayer.ts
//
// Performance-focused API layer:
//  1. (P1) Collections are snapshotted into IndexedDB so fresh-cache sessions
//     restore them in milliseconds instead of re-downloading ~3 MB.
//  2. (P3) Lyrics search uses a precomputed in-memory index (normalized +
//     diacritic-stripped variants built once) instead of re-normalizing every
//     line of every hymn on every keystroke.

import {
  API_BASE,
  CACHE_PREFIX,
  CATALOG_CACHE_KEY,
  CATALOG_TTL_MS,
  DENOMINATION,
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

interface ApiCollectionHymn {
  id: number;
  category: string;
  meter: string | null;
  title: string;
  scripture: string | null;
  stanzas: ApiStanza[];
  chorus: ApiChorus | null;
}

interface ApiHymnData {
  id: number;
  original_id: number;

  denomination: string;
  language: ApiLanguage;
  hymn_type: HymnType;

  category: string;
  meter: string | null;
  title: string;
  scripture: string | null;

  stanzas: ApiStanza[];
  chorus: ApiChorus | null;
}

const COLLECTIONS_CACHE_KEY = `${CACHE_PREFIX}:collections:v1`;

interface CollectionsSnapshot {
  savedAt: number;
  english: { regular: ApiHymnData[]; various: ApiHymnData[] };
  yoruba: { regular: ApiHymnData[]; various: ApiHymnData[] };
}

const collections: Record<ApiLanguage, Record<HymnType, ApiHymnData[]>> = {
  english: {
    regular: [],
    various: [],
  },

  yoruba: {
    regular: [],
    various: [],
  },
};

let collectionsLoaded = false;
let collectionsPromise: Promise<void> | null = null;

// ── Lyrics search index (P3) ────────────────────────────────────────────────

interface LyricsEntry {
  lines: string[];
  blocks: string[];
  stripLines: string[];
  stripBlocks: string[];
}

/** hymnId → precomputed normalized lyrics. Rebuilt whenever collections change. */
let lyricsIndex: Map<number, LyricsEntry> | null = null;

/**
 * Offline-only fallback index built once from the per-hymn IndexedDB cache.
 * Only populated when collections are unavailable (no snapshot, offline), so
 * repeated keystrokes don't re-read ~1000 hymn records on every search.
 */
let offlineLyricsIndex: Map<number, LyricsEntry> | null = null;

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

function normalize(text: string): string {
  return text.toLowerCase().replace(/\s+/g, " ").trim();
}

function stripDiacritics(text: string): string {
  return normalize(text)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .normalize("NFC");
}

function buildLyricsIndex(): Map<number, LyricsEntry> {
  const index = new Map<number, LyricsEntry>();

  // Merge both languages by hymn key so one entry holds en + yo lines.
  const byKey = new Map<string, ApiHymnData[]>();

  for (const language of ["english", "yoruba"] as ApiLanguage[]) {
    for (const hymnType of ["regular", "various"] as HymnType[]) {
      for (const hymn of collections[language][hymnType]) {
        const key = makeHymnKey(hymn.hymn_type, hymn.original_id);
        const list = byKey.get(key) ?? [];
        list.push(hymn);
        byKey.set(key, list);
      }
    }
  }

  for (const [key, hymns] of byKey) {
    const lines: string[] = [];
    const blocks: string[] = [];

    for (const hymn of hymns) {
      for (const stanza of hymn.stanzas ?? []) {
        const stanzaLines = stanza.lines.map((l) => l.text).filter(Boolean);
        lines.push(...stanzaLines);
        blocks.push(stanzaLines.join(" "));
      }

      if (hymn.chorus?.lines) {
        const chorusLines = hymn.chorus.lines
          .map((l) => l.text)
          .filter(Boolean);
        lines.push(...chorusLines);
        blocks.push(chorusLines.join(" "));
      }
    }

    if (!lines.length) continue;

    const [type, num] = key.split(":");
    index.set(makeHymnId(type as HymnType, Number(num)), {
      lines: lines.map(normalize),
      blocks: blocks.map(normalize),
      stripLines: lines.map(stripDiacritics),
      stripBlocks: blocks.map(stripDiacritics),
    });
  }

  return index;
}

function getLyricsIndex(): Map<number, LyricsEntry> | null {
  if (lyricsIndex) return lyricsIndex;
  if (!collectionsLoaded) return null;
  lyricsIndex = buildLyricsIndex();
  return lyricsIndex;
}

// ── Collection loading (P1) ─────────────────────────────────────────────────

function normalizeCollectionHymn(
  hymn: ApiCollectionHymn,
  language: ApiLanguage,
  hymnType: HymnType,
): ApiHymnData {
  return {
    id: hymn.id,
    original_id: hymn.id,

    denomination: DENOMINATION,
    language,
    hymn_type: hymnType,

    category: hymn.category,
    meter: hymn.meter,
    title: hymn.title,
    scripture: hymn.scripture,

    stanzas: hymn.stanzas,
    chorus: hymn.chorus,
  };
}

async function apiGet<T>(path: string, signal?: AbortSignal): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
    signal,
  });

  if (!res.ok) {
    throw new Error(`Hymnize API error: ${res.status} ${res.statusText}`);
  }

  return res.json() as Promise<T>;
}

async function fetchCollection(
  language: ApiLanguage,
  hymnType: HymnType,
  signal?: AbortSignal,
): Promise<ApiHymnData[]> {
  const hymns = await apiGet<ApiCollectionHymn[]>(
    `/collections/${DENOMINATION}%2F${language}%2F${hymnType}`,
    signal,
  );

  return hymns.map((hymn) => normalizeCollectionHymn(hymn, language, hymnType));
}

async function saveCollectionsSnapshot(
  englishRegular: ApiHymnData[],
  englishVarious: ApiHymnData[],
  yorubaRegular: ApiHymnData[],
  yorubaVarious: ApiHymnData[],
) {
  const snapshot: CollectionsSnapshot = {
    savedAt: Date.now(),
    english: { regular: englishRegular, various: englishVarious },
    yoruba: { regular: yorubaRegular, various: yorubaVarious },
  };

  await cacheSet(COLLECTIONS_CACHE_KEY, snapshot);
}

async function loadCollections(
  signal?: AbortSignal,
  options?: { force?: boolean },
): Promise<void> {
  const force = Boolean(options?.force);

  if (collectionsLoaded && !force) {
    return;
  }

  if (collectionsPromise) {
    return collectionsPromise;
  }

  // Restore from the IndexedDB snapshot first — zero network when available.
  if (!force) {
    const snapshot = await cacheGet<CollectionsSnapshot>(COLLECTIONS_CACHE_KEY);

    if (snapshot) {
      collections.english.regular = snapshot.english.regular;
      collections.english.various = snapshot.english.various;
      collections.yoruba.regular = snapshot.yoruba.regular;
      collections.yoruba.various = snapshot.yoruba.various;

      collectionsLoaded = true;
      lyricsIndex = null; // new content → rebuild on next search
      return;
    }
  }

  collectionsPromise = (async () => {
    const [englishRegular, englishVarious, yorubaRegular, yorubaVarious] =
      await Promise.all([
        fetchCollection("english", "regular", signal),
        fetchCollection("english", "various", signal),
        fetchCollection("yoruba", "regular", signal),
        fetchCollection("yoruba", "various", signal),
      ]);

    collections.english.regular = englishRegular;
    collections.english.various = englishVarious;

    collections.yoruba.regular = yorubaRegular;
    collections.yoruba.various = yorubaVarious;

    collectionsLoaded = true;
    lyricsIndex = null;

    // Fire-and-forget snapshot so next session starts offline-ready.
    void saveCollectionsSnapshot(
      englishRegular,
      englishVarious,
      yorubaRegular,
      yorubaVarious,
    );
  })();

  try {
    await collectionsPromise;
  } finally {
    collectionsPromise = null;
  }
}

function getAllCollectionHymns(): ApiHymnData[] {
  return [
    ...collections.english.regular,
    ...collections.english.various,
    ...collections.yoruba.regular,
    ...collections.yoruba.various,
  ];
}

function findCollectionHymn(
  language: ApiLanguage,
  hymnType: HymnType,
  hymnNumber: number,
): ApiHymnData | undefined {
  return collections[language][hymnType].find(
    (hymn) => hymn.original_id === hymnNumber,
  );
}

export async function fetchCatalog(
  signal?: AbortSignal,
  options?: { forceCollections?: boolean },
): Promise<HymnSummary[]> {
  await loadCollections(signal, { force: options?.forceCollections });

  const englishMap = new Map(
    getAllCollectionHymns()
      .filter((hymn) => hymn.language === "english")
      .map((hymn) => [makeHymnKey(hymn.hymn_type, hymn.original_id), hymn]),
  );

  const yorubaMap = new Map(
    getAllCollectionHymns()
      .filter((hymn) => hymn.language === "yoruba")
      .map((hymn) => [makeHymnKey(hymn.hymn_type, hymn.original_id), hymn]),
  );

  const keys = Array.from(new Set([...englishMap.keys(), ...yorubaMap.keys()]));

  return keys
    .map((key) => {
      const english = englishMap.get(key);
      const yoruba = yorubaMap.get(key);

      const source = english ?? yoruba;

      if (!source) {
        throw new Error(`Invalid hymn key: ${key}`);
      }

      const hymnType = source.hymn_type;
      const number = source.original_id;

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
    // (P1) If the cached catalog is still fresh, skip the ~3 MB re-download.
    // Restore the in-memory collections from the IDB snapshot instead so hymn
    // detail and lyrics search stay instant.
    const cached = await cacheGet<CachedValue<HymnSummary[]>>(CATALOG_CACHE_KEY);

    const cacheIsFresh = cached && Date.now() - cached.savedAt < CATALOG_TTL_MS;

    if (cacheIsFresh) {
      await loadCollections();
      return;
    }

    const fresh = await getCatalogFresh();
    onFreshData?.(fresh);
  } catch {
    // Ignore refresh failures.
  }
}

function extractLines(lines?: ApiLine[]) {
  return lines?.map((line) => line.text).filter(Boolean) ?? [];
}

function mergeApiHymns(
  summary: HymnSummary,
  english?: ApiHymnData,
  yoruba?: ApiHymnData,
): Hymn {
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

    scripture: english?.scripture ?? yoruba?.scripture,

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

  await loadCollections();

  const english = findCollectionHymn(
    "english",
    summary.hymnType,
    summary.number,
  );

  const yoruba = findCollectionHymn("yoruba", summary.hymnType, summary.number);

  if (!english && !yoruba) {
    throw new Error(`Could not find hymn ${summary.number}.`);
  }

  const merged = mergeApiHymns(summary, english, yoruba);

  await cacheSet<CachedValue<Hymn>>(key, {
    savedAt: Date.now(),
    data: merged,
  });

  return merged;
}

export async function downloadAllHymns(
  catalog: HymnSummary[],
  onProgress?: (done: number, total: number, hymn: HymnSummary) => void,
): Promise<{ failed: number }> {
  await loadCollections();

  const total = catalog.length;
  let done = 0;
  let failed = 0;

  for (const hymn of catalog) {
    try {
      await getHymnCached(hymn);
    } catch (error) {
      failed += 1;
      console.warn("Failed to cache hymn", hymn, error);
    }

    done += 1;
    onProgress?.(done, total, hymn);
  }

  // Per-hymn cache changed — rebuild the offline index lazily next search.
  offlineLyricsIndex = null;

  return { failed };
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

  // ── Load hymns into memory (snapshot restore or network) ────────────────

  let useCollections = false;

  try {
    await loadCollections();
    // Verify collections actually have data
    const totalInMemory =
      collections.english.regular.length +
      collections.english.various.length +
      collections.yoruba.regular.length +
      collections.yoruba.various.length;

    if (totalInMemory > 0) {
      useCollections = true;
    }
  } catch {
    // loadCollections failed (offline, no snapshot) — fall back to IndexedDB
    useCollections = false;
  }

  // ── Path A: precomputed in-memory index ─────────────────────────────────

  if (useCollections) {
    const index = getLyricsIndex();

    for (const summary of catalog) {
      const entry = index?.get(summary.id);
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

      // 2. Joined verse blocks (catches cross-line phrases)
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
  } else {
    // ── Path B: offline fallback via per-hymn IndexedDB cache ─────────────
    // The index is built ONCE and reused across keystrokes, so ~1000 hymn
    // records are read a single time instead of on every search.

    const offlineIndex = await getOfflineLyricsIndex(catalog);

    for (const summary of catalog) {
      const entry = offlineIndex.get(summary.id);
      if (!entry) continue;

      let bestScore = 0;

      for (let i = 0; i < entry.lines.length; i++) {
        let s = 0;
        if (entry.lines[i].includes(queryNorm)) s = 110;
        else if (entry.stripLines[i].includes(queryStripped)) s = 90;

        if (s > bestScore) bestScore = s;
        if (bestScore >= 110) break;
      }

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
  }

  // ── Sort and return ─────────────────────────────────────────────────────

  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.summary.number - b.summary.number;
  });

  return scored.slice(0, limit).map((item) => item.summary);
}
