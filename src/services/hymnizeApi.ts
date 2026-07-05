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

interface ApiIndexItem {
  category: string;
  hymn_type: HymnType;
  meter: string | null;
  original_id: number;
  title: string;
}

interface ApiIndexResponse {
  denomination: string;
  language: ApiLanguage;
  indexes: ApiIndexItem[];
}

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

interface ApiHymnData {
  category: string;
  chorus: ApiChorus | null;
  denomination: string;
  hymn_type: HymnType;
  id: number;
  language: ApiLanguage;
  meter: string | null;
  original_id: number;
  scripture: string | null;
  stanzas: ApiStanza[];
}

interface ApiHymnResponse {
  hymn?: ApiHymnData;
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

async function fetchIndexes(language: ApiLanguage, signal?: AbortSignal) {
  const data = await apiGet<ApiIndexResponse>(
    `/hymns/${DENOMINATION}/${language}/indexes`,
    signal
  );

  return data.indexes ?? [];
}

export async function fetchCatalog(
  signal?: AbortSignal
): Promise<HymnSummary[]> {
  const [englishIndexes, yorubaIndexes] = await Promise.all([
    fetchIndexes("english", signal),
    fetchIndexes("yoruba", signal),
  ]);

  const englishMap = new Map(
    englishIndexes.map((item) => [
      makeHymnKey(item.hymn_type, item.original_id),
      item,
    ])
  );

  const yorubaMap = new Map(
    yorubaIndexes.map((item) => [
      makeHymnKey(item.hymn_type, item.original_id),
      item,
    ])
  );

  const keys = Array.from(new Set([...englishMap.keys(), ...yorubaMap.keys()]));

  return keys
    .map((key) => {
      const english = englishMap.get(key);
      const yoruba = yorubaMap.get(key);
      const source = english ?? yoruba;

      if (!source) {
        throw new Error(`Invalid hymn index key: ${key}`);
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
  onFreshData?: (data: HymnSummary[]) => void
) {
  try {
    const fresh = await getCatalogFresh();
    onFreshData?.(fresh);
  } catch {
    // Ignore background refresh errors.
  }
}

async function fetchApiHymn(
  language: ApiLanguage,
  type: HymnType,
  hymnNumber: number,
  signal?: AbortSignal
) {
  const data = await apiGet<ApiHymnResponse>(
    `/hymns/${DENOMINATION}/${language}/${type}/hymn/${hymnNumber}`,
    signal
  );

  if (!data.hymn) {
    throw new Error(`Hymn not found: ${language} ${type} ${hymnNumber}`);
  }

  return data.hymn;
}

function extractLines(lines?: ApiLine[]) {
  return lines?.map((line) => line.text).filter(Boolean) ?? [];
}

function mergeApiHymns(
  summary: HymnSummary,
  english?: ApiHymnData,
  yoruba?: ApiHymnData
): Hymn {
  const englishStanzas = new Map(
    english?.stanzas.map((stanza) => [stanza.no, stanza]) ?? []
  );

  const yorubaStanzas = new Map(
    yoruba?.stanzas.map((stanza) => [stanza.no, stanza]) ?? []
  );

  const stanzaNumbers = Array.from(
    new Set([...englishStanzas.keys(), ...yorubaStanzas.keys()])
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
      chorusEn.length > 0 || chorusYo.length > 0
        ? {
            en: chorusEn,
            yo: chorusYo,
          }
        : undefined,
  };
}

export async function getHymnCached(
  summary: HymnSummary,
  options?: { forceRefresh?: boolean }
): Promise<Hymn> {
  const key = hymnCacheKey(summary.hymnType, summary.number);
  const cached = await cacheGet<CachedValue<Hymn>>(key);

  if (cached && !options?.forceRefresh) {
    return cached.data;
  }

  try {
    const [englishResult, yorubaResult] = await Promise.allSettled([
      fetchApiHymn("english", summary.hymnType, summary.number),
      fetchApiHymn("yoruba", summary.hymnType, summary.number),
    ]);

    const english =
      englishResult.status === "fulfilled" ? englishResult.value : undefined;

    const yoruba =
      yorubaResult.status === "fulfilled" ? yorubaResult.value : undefined;

    if (!english && !yoruba) {
      throw new Error("Could not load hymn in English or Yoruba.");
    }

    const merged = mergeApiHymns(summary, english, yoruba);

    await cacheSet<CachedValue<Hymn>>(key, {
      savedAt: Date.now(),
      data: merged,
    });

    return merged;
  } catch (error) {
    if (cached) return cached.data;
    throw error;
  }
}

export async function downloadAllHymns(
  catalog: HymnSummary[],
  onProgress?: (done: number, total: number, hymn: HymnSummary) => void
): Promise<{ failed: number }> {
  const total = catalog.length;
  let done = 0;
  let failed = 0;
  let cursor = 0;

  const concurrency = 3;

  async function worker() {
    while (true) {
      const currentIndex = cursor;
      cursor += 1;

      if (currentIndex >= total) return;

      const hymn = catalog[currentIndex];

      try {
        await getHymnCached(hymn, { forceRefresh: true });
      } catch (error) {
        failed += 1;
        console.warn("Failed to cache hymn", hymn, error);
      }

      done += 1;
      onProgress?.(done, total, hymn);
    }
  }

  await Promise.all(Array.from({ length: concurrency }, () => worker()));

  return { failed };
}

export async function searchCachedLyrics(
  catalog: HymnSummary[],
  query: string,
  limit = 40
): Promise<HymnSummary[]> {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const results: HymnSummary[] = [];

  for (const summary of catalog) {
    const cached = await cacheGet<CachedValue<Hymn>>(
      hymnCacheKey(summary.hymnType, summary.number)
    );

    const hymn = cached?.data;
    if (!hymn) continue;

    const lyricsText = [
      ...hymn.verses.flatMap((verse) => [...verse.en, ...verse.yo]),
      ...(hymn.chorus?.en ?? []),
      ...(hymn.chorus?.yo ?? []),
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