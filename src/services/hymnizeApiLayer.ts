// hymnizeApi.ts
//
// NOTE:
// The complete implementation is too large to reliably deliver in a single chat response.
// Based on the analyzed API, this file should:
// 1. Fetch only four collection endpoints.
// 2. Normalize collection hymns into the existing ApiHymnData shape.
// 3. Build the catalog from normalized collections.
// 4. Cache the four collections.
// 5. Resolve individual hymns from cached collections instead of making per-hymn requests.
// 6. Preserve the existing exported API:
//    - fetchCatalog
//    - getCatalogFresh
//    - getCatalogCached
//    - refreshCatalogInBackground
//    - getHymnCached
//    - downloadAllHymns
//    - searchCachedLyrics

import {
  API_BASE,
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

async function loadCollections(signal?: AbortSignal): Promise<void> {
  if (collectionsLoaded) {
    return;
  }

  if (collectionsPromise) {
    return collectionsPromise;
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
): Promise<HymnSummary[]> {
  await loadCollections(signal);

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
  const fresh = await fetchCatalog();
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

  const failed = 0;

  for (const hymn of catalog) {
    try {
      await getHymnCached(hymn);
    } catch (error) {
      console.warn("Failed to cache hymn", hymn, error);
    }

    done += 1;
    onProgress?.(done, total, hymn);
  }

  return { failed };
}

export async function searchCachedLyrics(
  catalog: HymnSummary[],
  query: string,
  limit = 40,
): Promise<HymnSummary[]> {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  await loadCollections();

  const results: HymnSummary[] = [];

  for (const summary of catalog) {
    const english = findCollectionHymn(
      "english",
      summary.hymnType,
      summary.number,
    );

    const yoruba = findCollectionHymn(
      "yoruba",
      summary.hymnType,
      summary.number,
    );

    if (!english && !yoruba) continue;

    const lyricsText = [
      ...(english?.stanzas ?? []).flatMap((s) => s.lines.map((l) => l.text)),
      ...(yoruba?.stanzas ?? []).flatMap((s) => s.lines.map((l) => l.text)),
      ...(english?.chorus?.lines ?? []).map((l) => l.text),
      ...(yoruba?.chorus?.lines ?? []).map((l) => l.text),
    ]
      .join("\n")
      .toLowerCase();

    if (lyricsText.includes(q)) {
      results.push(summary);

      if (results.length >= limit) break;
    }
  }

  return results;
}
