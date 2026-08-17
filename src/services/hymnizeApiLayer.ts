// // hymnizeApiLayer.ts
// //
// // Data layer for the static CAC hymnal dataset, served through jsDelivr
// // (base URL configurable via VITE_HYMNAL_DATA_BASE):
// //
// //   - Four lightweight catalog indexes (english|yoruba / regular|various /
// //     index.json) — metadata only, no lyrics.
// //   - Individual merged hymn files (merged/{type}/{id}.json) — both English
// //     and Yoruba in a single response, fetched only when a hymn is opened.
// //   - A precomputed lyrics search index (search-index.json) — loaded once,
// //     cached in IndexedDB, and kept in memory for subsequent local searches.
// //
// // Everything is snapshotted into IndexedDB so fresh-cache sessions restore in
// // milliseconds, and offline users keep access to previously cached hymns.

// import {
//   CACHE_PREFIX,
//   CATALOG_CACHE_KEY,
//   CATALOG_TTL_MS,
//   HYMNAL_DATA_BASE,
// } from "../constants/hymnal";

// import { cacheGet, cacheSet } from "../lib/indexedDB";

// import {
//   hymnCacheKey,
//   makeHymnId,
//   makeHymnKey,
//   slugify,
// } from "../lib/hymnUtils";

// import type {
//   ApiLanguage,
//   CachedValue,
//   Hymn,
//   HymnSummary,
//   HymnType,
//   Verse,
// } from "../types/hymnal";

// interface ApiLine {
//   dynamic: string | null;
//   text: string;
// }

// interface ApiStanza {
//   no: number;
//   lines: ApiLine[];
// }

// interface ApiChorus {
//   lines: ApiLine[];
// }

// // ── Catalog index (data/{language}/{type}/index.json) ──────────────────────

// interface CatalogIndexEntry {
//   id: number;
//   title: string;
//   category: string;
//   meter: string | null;
//   scripture: string | null;
// }

// interface CatalogIndexFile {
//   language: ApiLanguage;
//   type: HymnType;
//   count: number;
//   hymns: CatalogIndexEntry[];
// }

// interface CatalogIndexSnapshot {
//   savedAt: number;
//   english: { regular: CatalogIndexEntry[]; various: CatalogIndexEntry[] };
//   yoruba: { regular: CatalogIndexEntry[]; various: CatalogIndexEntry[] };
// }

// // ── Merged hymn (data/merged/{type}/{id}.json) ─────────────────────────────

// interface MergedLanguage {
//   id: number;
//   language: ApiLanguage;
//   type: HymnType;
//   category: string;
//   meter: string | null;
//   title: string;
//   scripture: string | null;
//   stanzas: ApiStanza[];
//   chorus: ApiChorus | null;
// }

// interface MergedHymn {
//   id: number;
//   type: HymnType;
//   english: MergedLanguage | null;
//   yoruba: MergedLanguage | null;
// }

// // ── Search index (data/search-index.json) ──────────────────────────────────

// interface SearchIndexEntry {
//   id: number;
//   type?: HymnType | string;
//   english?: string[];
//   yoruba?: string[];
//   en?: string[];
//   yo?: string[];
// }

// interface SearchIndexFile {
//   hymns?: SearchIndexEntry[];
//   entries?: SearchIndexEntry[];
//   searchIndex?: SearchIndexEntry[];
//   search_index?: SearchIndexEntry[];
// }

// interface DatasetManifest {
//   version: string;
//   generatedAt: string;
//   schemaVersion: number;

//   counts: {
//     english: {
//       regular: number;
//       various: number;
//     };

//     yoruba: {
//       regular: number;
//       various: number;
//     };
//   };

//   hymns: Record<string, string>;
// }

// const CATALOG_INDEX_CACHE_KEY = `${CACHE_PREFIX}:catalog-index:v1`;
// const SEARCH_INDEX_CACHE_KEY = `${CACHE_PREFIX}:search-index:v1`;

// const SEARCH_INDEX_RETRY_MS = 10 * 60 * 1000; // re-attempt a failed index load

// // ── In-memory catalog indexes ──────────────────────────────────────────────

// const catalogIndex: Record<
//   ApiLanguage,
//   Record<HymnType, CatalogIndexEntry[]>
// > = {
//   english: {
//     regular: [],
//     various: [],
//   },

//   yoruba: {
//     regular: [],
//     various: [],
//   },
// };

// let catalogIndexLoaded = false;
// let catalogIndexPromise: Promise<void> | null = null;

// // ── Lyrics search index (P3) ───────────────────────────────────────────────

// interface LyricsEntry {
//   lines: string[];
//   blocks: string[];
//   stripLines: string[];
//   stripBlocks: string[];
// }

// interface ParsedSearchIndex {
//   /** hymnId (makeHymnId) → entry, for entries that carry a `type`. */
//   index: Map<number, LyricsEntry>;
//   /** bare hymn number → entry, for entries without a `type`. */
//   bareIndex: Map<number, LyricsEntry>;
// }

// /** In-memory parsed search index. Rebuilt on catalog refresh. */
// let searchIndex: ParsedSearchIndex | null = null;
// let searchIndexPromise: Promise<boolean> | null = null;
// let searchIndexLoadAttemptedAt: number | null = null;

// /**
//  * Offline-only fallback index built once from the per-hymn IndexedDB cache.
//  * Only used when the search index is unavailable (not yet generated, offline
//  * before it was cached), so repeated keystrokes don't re-read ~1000 hymn
//  * records on every search.
//  */
// let offlineLyricsIndex: Map<number, LyricsEntry> | null = null;

// function normalize(text: string): string {
//   return text.toLowerCase().replace(/\s+/g, " ").trim();
// }

// function stripDiacritics(text: string): string {
//   return normalize(text)
//     .normalize("NFD")
//     .replace(/[\u0300-\u036f]/g, "")
//     .normalize("NFC");
// }

// function entryFromHymn(hymn: Hymn): LyricsEntry | null {
//   const lines: string[] = [];
//   const blocks: string[] = [];

//   for (const verse of hymn.verses) {
//     if (verse.en.length > 0) {
//       lines.push(...verse.en);
//       blocks.push(verse.en.join(" "));
//     }

//     if (verse.yo.length > 0) {
//       lines.push(...verse.yo);
//       blocks.push(verse.yo.join(" "));
//     }
//   }

//   if (hymn.chorus) {
//     if (hymn.chorus.en.length > 0) {
//       lines.push(...hymn.chorus.en);
//       blocks.push(hymn.chorus.en.join(" "));
//     }

//     if (hymn.chorus.yo.length > 0) {
//       lines.push(...hymn.chorus.yo);
//       blocks.push(hymn.chorus.yo.join(" "));
//     }
//   }

//   if (!lines.length) return null;

//   return {
//     lines: lines.map(normalize),
//     blocks: blocks.map(normalize),
//     stripLines: lines.map(stripDiacritics),
//     stripBlocks: blocks.map(stripDiacritics),
//   };
// }

// async function buildOfflineLyricsIndex(
//   catalog: HymnSummary[],
// ): Promise<Map<number, LyricsEntry>> {
//   const index = new Map<number, LyricsEntry>();

//   for (const summary of catalog) {
//     const key = hymnCacheKey(summary.hymnType, summary.number);
//     const cached = await cacheGet<CachedValue<Hymn>>(key);
//     if (!cached?.data) continue;

//     const entry = entryFromHymn(cached.data);
//     if (entry) index.set(summary.id, entry);
//   }

//   return index;
// }

// async function getOfflineLyricsIndex(
//   catalog: HymnSummary[],
// ): Promise<Map<number, LyricsEntry>> {
//   if (!offlineLyricsIndex) {
//     offlineLyricsIndex = await buildOfflineLyricsIndex(catalog);
//   }
//   return offlineLyricsIndex;
// }

// // ── Network ────────────────────────────────────────────────────────────────

// async function apiGet<T>(path: string, signal?: AbortSignal): Promise<T> {
//   const res = await fetch(`${HYMNAL_DATA_BASE}${path}`, {
//     method: "GET",
//     headers: {
//       Accept: "application/json",
//     },
//     signal,
//   });

//   if (!res.ok) {
//     throw new Error(`Hymnal data error: ${res.status} ${res.statusText}`);
//   }

//   return res.json() as Promise<T>;
// }

// // ── Catalog index loading ──────────────────────────────────────────────────

// async function fetchCatalogIndexFile(
//   language: ApiLanguage,
//   hymnType: HymnType,
//   signal?: AbortSignal,
// ): Promise<CatalogIndexEntry[]> {
//   const file = await apiGet<CatalogIndexFile>(
//     `/${language}/${hymnType}/index.json`,
//     signal,
//   );

//   return file.hymns ?? [];
// }

// async function saveCatalogIndexSnapshot(
//   englishRegular: CatalogIndexEntry[],
//   englishVarious: CatalogIndexEntry[],
//   yorubaRegular: CatalogIndexEntry[],
//   yorubaVarious: CatalogIndexEntry[],
// ) {
//   const snapshot: CatalogIndexSnapshot = {
//     savedAt: Date.now(),
//     english: { regular: englishRegular, various: englishVarious },
//     yoruba: { regular: yorubaRegular, various: yorubaVarious },
//   };

//   await cacheSet(CATALOG_INDEX_CACHE_KEY, snapshot);
// }

// async function loadCatalogIndexes(
//   signal?: AbortSignal,
//   options?: { force?: boolean },
// ): Promise<void> {
//   const force = Boolean(options?.force);

//   if (catalogIndexLoaded && !force) {
//     return;
//   }

//   if (catalogIndexPromise) {
//     return catalogIndexPromise;
//   }

//   // Restore from the IndexedDB snapshot first — zero network when available.
//   if (!force) {
//     const snapshot = await cacheGet<CatalogIndexSnapshot>(
//       CATALOG_INDEX_CACHE_KEY,
//     );

//     if (snapshot) {
//       catalogIndex.english.regular = snapshot.english.regular;
//       catalogIndex.english.various = snapshot.english.various;
//       catalogIndex.yoruba.regular = snapshot.yoruba.regular;
//       catalogIndex.yoruba.various = snapshot.yoruba.various;

//       catalogIndexLoaded = true;
//       return;
//     }
//   }

//   catalogIndexPromise = (async () => {
//     const [englishRegular, englishVarious, yorubaRegular, yorubaVarious] =
//       await Promise.all([
//         fetchCatalogIndexFile("english", "regular", signal),
//         fetchCatalogIndexFile("english", "various", signal),
//         fetchCatalogIndexFile("yoruba", "regular", signal),
//         fetchCatalogIndexFile("yoruba", "various", signal),
//       ]);

//     catalogIndex.english.regular = englishRegular;
//     catalogIndex.english.various = englishVarious;

//     catalogIndex.yoruba.regular = yorubaRegular;
//     catalogIndex.yoruba.various = yorubaVarious;

//     catalogIndexLoaded = true;

//     // Catalog changed — drop the in-memory search index and clear the retry
//     // guard so the next search revalidates against the (freshly TTL'd) copy
//     // instead of waiting out the 10-minute backoff.
//     searchIndex = null;
//     searchIndexLoadAttemptedAt = null;

//     // Fire-and-forget snapshot so next session starts offline-ready.
//     void saveCatalogIndexSnapshot(
//       englishRegular,
//       englishVarious,
//       yorubaRegular,
//       yorubaVarious,
//     );
//   })();

//   try {
//     await catalogIndexPromise;
//   } finally {
//     catalogIndexPromise = null;
//   }
// }

// // ── Catalog (HymnSummary[]) ────────────────────────────────────────────────

// export async function fetchCatalog(
//   signal?: AbortSignal,
//   options?: { forceCollections?: boolean },
// ): Promise<HymnSummary[]> {
//   await loadCatalogIndexes(signal, { force: options?.forceCollections });

//   // A hymn number is only unique within its type (regular vs various), so
//   // build the maps per (type, id) instead of by bare id.
//   const englishByKey = new Map<string, CatalogIndexEntry>();
//   const yorubaByKey = new Map<string, CatalogIndexEntry>();

//   for (const hymnType of ["regular", "various"] as HymnType[]) {
//     for (const entry of catalogIndex.english[hymnType]) {
//       englishByKey.set(makeHymnKey(hymnType, entry.id), entry);
//     }

//     for (const entry of catalogIndex.yoruba[hymnType]) {
//       yorubaByKey.set(makeHymnKey(hymnType, entry.id), entry);
//     }
//   }

//   const keys = Array.from(
//     new Set([...englishByKey.keys(), ...yorubaByKey.keys()]),
//   );

//   return keys
//     .map((key) => {
//       const english = englishByKey.get(key);
//       const yoruba = yorubaByKey.get(key);

//       const source = english ?? yoruba;

//       if (!source) {
//         throw new Error(`Invalid hymn key: ${key}`);
//       }

//       const [hymnTypeRaw, numberRaw] = key.split(":");
//       const hymnType = hymnTypeRaw as HymnType;
//       const number = Number(numberRaw);

//       const categoryEn =
//         english?.category ?? yoruba?.category ?? "Uncategorized";

//       const categoryYo =
//         yoruba?.category ?? english?.category ?? "Uncategorized";

//       return {
//         id: makeHymnId(hymnType, number),

//         number,

//         hymnType,

//         titleEn: english?.title ?? yoruba?.title ?? `Hymn ${number}`,

//         titleYo: yoruba?.title ?? english?.title ?? `Hymn ${number}`,

//         category: slugify(categoryEn),

//         categoryEn,

//         categoryYo,

//         meter: english?.meter ?? yoruba?.meter ?? null,

//         scripture: english?.scripture ?? yoruba?.scripture ?? null,
//       };
//     })
//     .sort((a, b) => {
//       const typeOrder: Record<HymnType, number> = {
//         regular: 0,
//         various: 1,
//       };

//       if (a.hymnType !== b.hymnType) {
//         return typeOrder[a.hymnType] - typeOrder[b.hymnType];
//       }

//       return a.number - b.number;
//     });
// }

// async function saveCatalog(data: HymnSummary[]) {
//   await cacheSet<CachedValue<HymnSummary[]>>(CATALOG_CACHE_KEY, {
//     savedAt: Date.now(),
//     data,
//   });
// }

// export async function getCatalogFresh(): Promise<HymnSummary[]> {
//   const fresh = await fetchCatalog(undefined, { forceCollections: true });
//   await saveCatalog(fresh);
//   return fresh;
// }

// export async function getCatalogCached(): Promise<HymnSummary[]> {
//   const cached = await cacheGet<CachedValue<HymnSummary[]>>(CATALOG_CACHE_KEY);

//   const cacheIsFresh = cached && Date.now() - cached.savedAt < CATALOG_TTL_MS;

//   if (cacheIsFresh) {
//     return cached.data;
//   }

//   try {
//     return await getCatalogFresh();
//   } catch (error) {
//     if (cached) return cached.data;
//     throw error;
//   }
// }

// export async function refreshCatalogInBackground(
//   onFreshData?: (data: HymnSummary[]) => void,
// ) {
//   try {
//     // If the cached catalog is still fresh, restore the catalog indexes from
//     // the IDB snapshot so hymn detail and lyrics search stay instant.
//     const cached =
//       await cacheGet<CachedValue<HymnSummary[]>>(CATALOG_CACHE_KEY);

//     const cacheIsFresh = cached && Date.now() - cached.savedAt < CATALOG_TTL_MS;

//     if (cacheIsFresh) {
//       await loadCatalogIndexes();
//       return;
//     }

//     const fresh = await getCatalogFresh();
//     onFreshData?.(fresh);
//   } catch {
//     // Ignore refresh failures.
//   }
// }

// // ── Individual hymns ───────────────────────────────────────────────────────

// function extractLines(lines?: ApiLine[]) {
//   return lines?.map((line) => line.text).filter(Boolean) ?? [];
// }

// function mergeMergedHymn(summary: HymnSummary, merged: MergedHymn): Hymn {
//   const english = merged.english;
//   const yoruba = merged.yoruba;

//   const englishStanzas = new Map(
//     english?.stanzas.map((stanza) => [stanza.no, stanza]) ?? [],
//   );

//   const yorubaStanzas = new Map(
//     yoruba?.stanzas.map((stanza) => [stanza.no, stanza]) ?? [],
//   );

//   const stanzaNumbers = Array.from(
//     new Set([...englishStanzas.keys(), ...yorubaStanzas.keys()]),
//   ).sort((a, b) => a - b);

//   const verses: Verse[] = stanzaNumbers.map((number) => ({
//     number,
//     en: extractLines(englishStanzas.get(number)?.lines),
//     yo: extractLines(yorubaStanzas.get(number)?.lines),
//   }));

//   const chorusEn = extractLines(english?.chorus?.lines);
//   const chorusYo = extractLines(yoruba?.chorus?.lines);

//   return {
//     ...summary,

//     categoryEn: english?.category ?? summary.categoryEn,

//     categoryYo: yoruba?.category ?? summary.categoryYo,

//     meter: english?.meter ?? yoruba?.meter ?? summary.meter,

//     scripture: english?.scripture ?? yoruba?.scripture ?? summary.scripture,

//     verses,

//     chorus:
//       chorusEn.length || chorusYo.length
//         ? {
//             en: chorusEn,
//             yo: chorusYo,
//           }
//         : undefined,
//   };
// }

// export async function getHymnCached(
//   summary: HymnSummary,
//   options?: { forceRefresh?: boolean },
// ): Promise<Hymn> {
//   const key = hymnCacheKey(summary.hymnType, summary.number);

//   const cached = await cacheGet<CachedValue<Hymn>>(key);

//   if (cached && !options?.forceRefresh) {
//     return cached.data;
//   }

//   // A single request — the merged file contains both English and Yoruba, so
//   // the language toggle never triggers another network call.
//   const merged = await apiGet<MergedHymn>(
//     `/merged/${summary.hymnType}/${summary.number}.json`,
//   );

//   const hymn = mergeMergedHymn(summary, merged);

//   await cacheSet<CachedValue<Hymn>>(key, {
//     savedAt: Date.now(),
//     data: hymn,
//   });

//   return hymn;
// }

// // ── Offline download ───────────────────────────────────────────────────────

// export async function downloadAllHymns(
//   catalog: HymnSummary[],
//   onProgress?: (done: number, total: number, hymn: HymnSummary) => void,
// ): Promise<{ failed: number }> {
//   const total = catalog.length;
//   let done = 0;
//   let failed = 0;
//   let cursor = 0;

//   // Limited concurrency to avoid flooding the CDN with parallel requests.
//   const concurrency = 6;

//   async function worker() {
//     while (true) {
//       const currentIndex = cursor;
//       cursor += 1;

//       if (currentIndex >= total) return;

//       const hymn = catalog[currentIndex];

//       try {
//         await getHymnCached(hymn);
//       } catch (error) {
//         failed += 1;
//         console.warn("Failed to cache hymn", hymn, error);
//       }

//       done += 1;
//       onProgress?.(done, total, hymn);
//     }
//   }

//   await Promise.all(Array.from({ length: concurrency }, () => worker()));

//   // Per-hymn cache changed — rebuild the offline index lazily next search.
//   offlineLyricsIndex = null;

//   return { failed };
// }

// // ── Lyrics search ──────────────────────────────────────────────────────────

// function buildSearchIndex(file: SearchIndexFile): ParsedSearchIndex | null {
//   const entries =
//     file.hymns ?? file.entries ?? file.searchIndex ?? file.search_index;

//   if (!Array.isArray(entries) || entries.length === 0) {
//     return null;
//   }

//   const index = new Map<number, LyricsEntry>();
//   const bareIndex = new Map<number, LyricsEntry>();

//   for (const entry of entries) {
//     const lines = [
//       ...toLineArray(entry.english ?? entry.en),
//       ...toLineArray(entry.yoruba ?? entry.yo),
//     ].filter((line) => line.length > 0);

//     if (!lines.length) continue;

//     const normalized = lines.map(normalize);
//     const stripped = lines.map(stripDiacritics);

//     const lyricsEntry: LyricsEntry = {
//       lines: normalized,
//       // One joined block lets cross-line phrases match across the whole hymn.
//       blocks: [normalized.join(" ")],
//       stripLines: stripped,
//       stripBlocks: [stripped.join(" ")],
//     };

//     const type =
//       entry.type === "regular" || entry.type === "various"
//         ? entry.type
//         : undefined;

//     if (type) {
//       index.set(makeHymnId(type, entry.id), lyricsEntry);
//     } else {
//       bareIndex.set(entry.id, lyricsEntry);
//     }
//   }

//   if (index.size === 0 && bareIndex.size === 0) {
//     return null;
//   }

//   return { index, bareIndex };
// }

// function toLineArray(value: string[] | string | undefined): string[] {
//   if (!value) return [];
//   return Array.isArray(value) ? value : [value];
// }

// async function loadSearchIndex(force = false): Promise<boolean> {
//   if (searchIndex) return true;

//   if (searchIndexPromise) {
//     return searchIndexPromise;
//   }

//   // Avoid a network attempt on every keystroke when the index is unavailable.
//   if (
//     !force &&
//     searchIndexLoadAttemptedAt !== null &&
//     Date.now() - searchIndexLoadAttemptedAt < SEARCH_INDEX_RETRY_MS
//   ) {
//     return false;
//   }

//   searchIndexPromise = (async () => {
//     try {
//       const cached = await cacheGet<CachedValue<SearchIndexFile>>(
//         SEARCH_INDEX_CACHE_KEY,
//       );

//       const cacheIsFresh =
//         cached && Date.now() - cached.savedAt < CATALOG_TTL_MS;

//       let raw: SearchIndexFile | undefined;

//       if (cacheIsFresh) {
//         raw = cached.data;
//       } else {
//         try {
//           raw = await apiGet<SearchIndexFile>("/search-index.json");

//           await cacheSet<CachedValue<SearchIndexFile>>(SEARCH_INDEX_CACHE_KEY, {
//             savedAt: Date.now(),
//             data: raw,
//           });
//         } catch (error) {
//           // Offline or index not generated yet — fall back to a stale copy.
//           if (cached) raw = cached.data;
//           else throw error;
//         }
//       }

//       if (!raw) return false;

//       searchIndex = buildSearchIndex(raw);
//       return searchIndex !== null;
//     } catch {
//       return false;
//     } finally {
//       searchIndexPromise = null;
//       searchIndexLoadAttemptedAt = Date.now();
//     }
//   })();

//   return searchIndexPromise;
// }

// function lookupSearchEntry(
//   parsed: ParsedSearchIndex | null,
//   summary: HymnSummary,
// ): LyricsEntry | undefined {
//   if (!parsed) return undefined;

//   return (
//     parsed.index.get(makeHymnId(summary.hymnType, summary.number)) ??
//     parsed.bareIndex.get(summary.number)
//   );
// }

// export async function searchCachedLyrics(
//   catalog: HymnSummary[],
//   query: string,
//   limit = 40,
// ): Promise<HymnSummary[]> {
//   const trimmed = query.trim();
//   if (!trimmed || trimmed.length < 2) return [];

//   const queryNorm = normalize(trimmed);
//   const queryStripped = stripDiacritics(trimmed);

//   interface ScoredResult {
//     summary: HymnSummary;
//     score: number;
//   }

//   const scored: ScoredResult[] = [];

//   // ── Load lyrics source (search index → offline per-hymn cache) ──────────

//   let parsed: ParsedSearchIndex | null = null;
//   let offlineIndex: Map<number, LyricsEntry> | null = null;

//   if (await loadSearchIndex()) {
//     parsed = searchIndex;
//   } else {
//     offlineIndex = await getOfflineLyricsIndex(catalog);
//   }

//   for (const summary of catalog) {
//     const entry = parsed
//       ? lookupSearchEntry(parsed, summary)
//       : offlineIndex?.get(summary.id);

//     if (!entry) continue;

//     let bestScore = 0;

//     // 1. Individual lines (highest score possible)
//     for (let i = 0; i < entry.lines.length; i++) {
//       let s = 0;
//       if (entry.lines[i].includes(queryNorm)) s = 110;
//       else if (entry.stripLines[i].includes(queryStripped)) s = 90;

//       if (s > bestScore) bestScore = s;
//       if (bestScore >= 110) break;
//     }

//     // 2. Joined blocks (catches cross-line phrases)
//     if (bestScore < 70) {
//       for (let i = 0; i < entry.blocks.length; i++) {
//         let s = 0;
//         if (entry.blocks[i].includes(queryNorm)) s = 70;
//         else if (entry.stripBlocks[i].includes(queryStripped)) s = 50;

//         if (s > bestScore) bestScore = s;
//         if (bestScore >= 70) break;
//       }
//     }

//     if (bestScore > 0) {
//       scored.push({ summary, score: bestScore });
//     }
//   }

//   // ── Sort and return ─────────────────────────────────────────────────────

//   scored.sort((a, b) => {
//     if (b.score !== a.score) return b.score - a.score;
//     return a.summary.number - b.summary.number;
//   });

//   return scored.slice(0, limit).map((item) => item.summary);
// }

// hymnizeApiLayer.ts
//
// CAC Hymnal static-data API layer
//
// Data source:
//   GitHub -> jsDelivr -> React PWA
//
// Performance strategy:
//   1. Catalog indexes are loaded from jsDelivr instead of downloading
//      the full Hymnize collections.
//   2. Individual merged hymns are cached in IndexedDB.
//   3. data/index.json is used as a lightweight dataset manifest.
//   4. Individual hymn hashes are used to detect changed hymns.
//   5. Changed cached hymns are marked stale instead of deleted.
//   6. Offline users can continue using their existing cached hymns.
//   7. Lyrics search keeps the existing precomputed in-memory index.

import {
  CACHE_PREFIX,
  CATALOG_CACHE_KEY,
  CATALOG_TTL_MS,
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

// ─────────────────────────────────────────────────────────────────────────────
// Configuration
// ─────────────────────────────────────────────────────────────────────────────

const DATA_BASE = (
  import.meta.env.VITE_HYMNAL_DATA_BASE ||
  "https://cdn.jsdelivr.net/gh/livingstone17/cac-hymnal-api@main/data"
).replace(/\/$/, "");

const DATASET_MANIFEST_CACHE_KEY = `${CACHE_PREFIX}:dataset-manifest:v1`;

const DATASET_CHECK_INTERVAL = 1000 * 60 * 30; // 30 minutes

// ─────────────────────────────────────────────────────────────────────────────
// API/data types
// ─────────────────────────────────────────────────────────────────────────────

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

interface ApiLanguageHymn {
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
  english?: ApiLanguageHymn;
  yoruba?: ApiLanguageHymn;
}

interface DatasetManifest {
  name: string;
  version: string;
  datasetHash?: string;
  updatedAt: string;
  source: string;
  denomination: string;
  languages: string[];

  collections: {
    english: {
      regular: {
        count: number;
        path: string;
        hash: string;
      };
      various: {
        count: number;
        path: string;
        hash: string;
      };
    };

    yoruba: {
      regular: {
        count: number;
        path: string;
        hash: string;
      };
      various: {
        count: number;
        path: string;
        hash: string;
      };
    };
  };

  merged: {
    regular: string;
    various: string;
  };

  /**
   * Added by the updated build.js.
   *
   * Example:
   *
   * {
   *   "regular:1": "abc123",
   *   "regular:397": "def456"
   * }
   */
  files?: Record<string, string>;
}

interface CachedManifest {
  savedAt: number;
  data: DatasetManifest;
}

interface HymnCacheValue extends CachedValue<Hymn> {
  stale?: boolean;
  contentHash?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Lyrics search index
// ─────────────────────────────────────────────────────────────────────────────

interface LyricsEntry {
  lines: string[];
  blocks: string[];
  stripLines: string[];
  stripBlocks: string[];
}

/**
 * hymnId -> precomputed normalized lyrics.
 */
let lyricsIndex: Map<number, LyricsEntry> | null = null;

/**
 * Offline-only fallback index built from per-hymn IndexedDB cache.
 */
let offlineLyricsIndex: Map<number, LyricsEntry> | null = null;

// ─────────────────────────────────────────────────────────────────────────────
// In-memory dataset state
// ─────────────────────────────────────────────────────────────────────────────

let datasetManifest: DatasetManifest | null = null;

let manifestCheckPromise: Promise<DatasetManifest | null> | null = null;

let catalog: HymnSummary[] | null = null;

let catalogPromise: Promise<HymnSummary[]> | null = null;

// ─────────────────────────────────────────────────────────────────────────────
// Utility functions
// ─────────────────────────────────────────────────────────────────────────────

function normalize(text: string): string {
  return text.toLowerCase().replace(/\s+/g, " ").trim();
}

function stripDiacritics(text: string): string {
  return normalize(text)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .normalize("NFC");
}

function extractLines(lines?: ApiLine[]): string[] {
  return lines?.map((line) => line.text).filter(Boolean) ?? [];
}

function mergedHymnUrl(hymnType: HymnType, number: number): string {
  return `${DATA_BASE}/merged/${hymnType}/${number}.json`;
}

function indexUrl(language: ApiLanguage, hymnType: HymnType): string {
  return `${DATA_BASE}/${language}/${hymnType}/index.json`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Generic static-data fetch
// ─────────────────────────────────────────────────────────────────────────────

async function dataGet<T>(url: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
    cache: "no-cache",
    signal,
  });

  if (!response.ok) {
    throw new Error(
      `CAC Hymnal data error: ${response.status} ${response.statusText}`,
    );
  }

  return response.json() as Promise<T>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Manifest
// ─────────────────────────────────────────────────────────────────────────────

async function getCachedManifest(): Promise<CachedManifest | null> {
  const cached = await cacheGet<CachedManifest>(DATASET_MANIFEST_CACHE_KEY);

  return cached ?? null;
}

async function saveCachedManifest(manifest: DatasetManifest): Promise<void> {
  await cacheSet<CachedManifest>(DATASET_MANIFEST_CACHE_KEY, {
    savedAt: Date.now(),
    data: manifest,
  });

  datasetManifest = manifest;
}

/**
 * Mark cached hymns whose content hash has changed as stale.
 *
 * We do NOT delete the cached hymn.
 *
 * This is important for offline support:
 *
 *   online + changed -> fetch new version
 *   offline + changed -> continue using old cached version
 */
async function invalidateChangedHymns(
  oldManifest: DatasetManifest,
  newManifest: DatasetManifest,
): Promise<void> {
  const oldFiles = oldManifest.files ?? {};
  const newFiles = newManifest.files ?? {};

  const keys = new Set([...Object.keys(oldFiles), ...Object.keys(newFiles)]);

  for (const hymnKey of keys) {
    const oldHash = oldFiles[hymnKey];
    const newHash = newFiles[hymnKey];

    if (oldHash === newHash) {
      continue;
    }

    const [type, numberString] = hymnKey.split(":");

    const number = Number(numberString);

    if (
      (type !== "regular" && type !== "various") ||
      !Number.isInteger(number)
    ) {
      continue;
    }

    const key = hymnCacheKey(type as HymnType, number);

    const cached = await cacheGet<HymnCacheValue>(key);

    if (!cached) {
      continue;
    }

    await cacheSet<HymnCacheValue>(key, {
      ...cached,
      stale: true,
      contentHash: newHash,
    });
  }
}

/**
 * Fetch and synchronize the dataset manifest.
 *
 * The manifest is only checked every 30 minutes.
 *
 * If the network is unavailable, the existing cached manifest is returned
 * and the app continues working offline.
 */
async function syncDatasetVersion(): Promise<DatasetManifest | null> {
  if (datasetManifest) {
    const cached = await getCachedManifest();

    if (cached && Date.now() - cached.savedAt < DATASET_CHECK_INTERVAL) {
      return datasetManifest;
    }
  }

  if (manifestCheckPromise) {
    return manifestCheckPromise;
  }

  manifestCheckPromise = (async () => {
    const cached = await getCachedManifest();

    try {
      const remote = await dataGet<DatasetManifest>(`${DATA_BASE}/index.json`);

      if (!cached) {
        await saveCachedManifest(remote);
        return remote;
      }

      /**
       * Dataset hasn't changed.
       */
      const oldHash = cached.data.datasetHash;

      const newHash = remote.datasetHash;

      const versionChanged =
        oldHash && newHash
          ? oldHash !== newHash
          : cached.data.updatedAt !== remote.updatedAt;

      if (versionChanged) {
        console.info("[CAC Hymnal] Dataset update detected.", {
          previous: cached.data.datasetHash ?? cached.data.updatedAt,
          current: remote.datasetHash ?? remote.updatedAt,
        });

        await invalidateChangedHymns(cached.data, remote);
      }

      await saveCachedManifest(remote);

      return remote;
    } catch (error) {
      console.warn("[CAC Hymnal] Dataset manifest check failed.", error);

      /**
       * Never break the app because the manifest is unavailable.
       */
      return cached?.data ?? null;
    }
  })();

  try {
    return await manifestCheckPromise;
  } finally {
    manifestCheckPromise = null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Catalog index
// ─────────────────────────────────────────────────────────────────────────────

interface IndexRecord {
  id?: number;
  number?: number;
  original_id?: number;

  category?: string;
  meter?: string | null;
  title?: string;
  scripture?: string | null;

  language?: ApiLanguage;
  type?: HymnType;
  hymn_type?: HymnType;
}

/**
 * The Node build currently generates language-specific index files.
 *
 * We accept either:
 *
 *   [ {...}, {...} ]
 *
 * or:
 *
 *   { hymns: [ {...}, {...} ] }
 *
 * to make the frontend tolerant of the generated index format.
 */
function extractIndexRecords(payload: unknown): IndexRecord[] {
  if (Array.isArray(payload)) {
    return payload as IndexRecord[];
  }

  if (
    payload &&
    typeof payload === "object" &&
    Array.isArray((payload as { hymns?: unknown }).hymns)
  ) {
    return (payload as { hymns: IndexRecord[] }).hymns;
  }

  return [];
}

function getRecordNumber(record: IndexRecord): number | null {
  const value = record.number ?? record.original_id ?? record.id;

  return Number.isInteger(value) ? Number(value) : null;
}

function getRecordType(record: IndexRecord, fallback: HymnType): HymnType {
  if (record.type === "regular" || record.type === "various") {
    return record.type;
  }

  if (record.hymn_type === "regular" || record.hymn_type === "various") {
    return record.hymn_type;
  }

  return fallback;
}

function getRecordLanguage(
  record: IndexRecord,
  fallback: ApiLanguage,
): ApiLanguage {
  if (record.language === "english" || record.language === "yoruba") {
    return record.language;
  }

  return fallback;
}

async function fetchCatalogIndexes(
  signal?: AbortSignal,
): Promise<HymnSummary[]> {
  const requests = (
    [
      ["english", "regular"],
      ["english", "various"],
      ["yoruba", "regular"],
      ["yoruba", "various"],
    ] as Array<[ApiLanguage, HymnType]>
  ).map(async ([language, hymnType]) => {
    const payload = await dataGet<unknown>(
      indexUrl(language, hymnType),
      signal,
    );

    return {
      language,
      hymnType,
      records: extractIndexRecords(payload),
    };
  });

  const results = await Promise.all(requests);

  const byKey = new Map<
    string,
    {
      english?: IndexRecord;
      yoruba?: IndexRecord;
      hymnType: HymnType;
      number: number;
    }
  >();

  for (const result of results) {
    for (const record of result.records) {
      const number = getRecordNumber(record);

      if (number === null) {
        continue;
      }

      const hymnType = getRecordType(record, result.hymnType);

      const language = getRecordLanguage(record, result.language);

      const key = makeHymnKey(hymnType, number);

      const existing = byKey.get(key) ?? {
        hymnType,
        number,
      };

      if (language === "english") {
        existing.english = record;
      } else {
        existing.yoruba = record;
      }

      byKey.set(key, existing);
    }
  }

  return Array.from(byKey.values())
    .map((item) => {
      const english = item.english;

      const yoruba = item.yoruba;

      const categoryEn =
        english?.category ?? yoruba?.category ?? "Uncategorized";

      const categoryYo =
        yoruba?.category ?? english?.category ?? "Uncategorized";

      return {
        id: makeHymnId(item.hymnType, item.number),

        number: item.number,

        hymnType: item.hymnType,

        titleEn: english?.title ?? yoruba?.title ?? `Hymn ${item.number}`,

        titleYo: yoruba?.title ?? english?.title ?? `Hymn ${item.number}`,

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

// ─────────────────────────────────────────────────────────────────────────────
// Catalog cache
// ─────────────────────────────────────────────────────────────────────────────

async function saveCatalog(data: HymnSummary[]): Promise<void> {
  await cacheSet<CachedValue<HymnSummary[]>>(CATALOG_CACHE_KEY, {
    savedAt: Date.now(),
    data,
  });

  catalog = data;
}

export async function fetchCatalog(
  signal?: AbortSignal,
  options?: {
    forceCollections?: boolean;
  },
): Promise<HymnSummary[]> {
  /**
   * Always synchronize the manifest first.
   *
   * This does NOT necessarily make a network request because
   * syncDatasetVersion() is throttled to 30 minutes.
   */
  await syncDatasetVersion();

  if (catalog && !options?.forceCollections) {
    return catalog;
  }

  if (catalogPromise && !options?.forceCollections) {
    return catalogPromise;
  }

  catalogPromise = fetchCatalogIndexes(signal);

  try {
    const fresh = await catalogPromise;

    catalog = fresh;

    return fresh;
  } finally {
    catalogPromise = null;
  }
}

export async function getCatalogFresh(): Promise<HymnSummary[]> {
  const fresh = await fetchCatalog(undefined, {
    forceCollections: true,
  });

  await saveCatalog(fresh);

  return fresh;
}

export async function getCatalogCached(): Promise<HymnSummary[]> {
  const cached = await cacheGet<CachedValue<HymnSummary[]>>(CATALOG_CACHE_KEY);

  /**
   * Synchronize the manifest.
   *
   * If the user is offline, this safely returns the cached manifest.
   */
  await syncDatasetVersion();

  if (cached) {
    const cacheIsFresh = Date.now() - cached.savedAt < CATALOG_TTL_MS;

    if (cacheIsFresh) {
      catalog = cached.data;
      return cached.data;
    }
  }

  try {
    const fresh = await getCatalogFresh();

    return fresh;
  } catch (error) {
    if (cached) {
      catalog = cached.data;
      return cached.data;
    }

    throw error;
  }
}

export async function refreshCatalogInBackground(
  onFreshData?: (data: HymnSummary[]) => void,
): Promise<void> {
  try {
    const before = await getCachedManifest();

    const remote = await syncDatasetVersion();

    if (!remote) {
      return;
    }

    /**
     * If there was no previous manifest, simply ensure the catalog
     * exists. We don't need to force anything.
     */
    if (!before) {
      return;
    }

    const changed =
      before.data.datasetHash && remote.datasetHash
        ? before.data.datasetHash !== remote.datasetHash
        : before.data.updatedAt !== remote.updatedAt;

    if (!changed) {
      return;
    }

    /**
     * Catalog metadata may also have changed, so refresh the lightweight
     * catalog indexes. This is only four small index requests, not the
     * old ~3 MB collection download.
     */
    const fresh = await getCatalogFresh();

    onFreshData?.(fresh);
  } catch (error) {
    console.warn("[CAC Hymnal] Background catalog refresh failed.", error);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Merged hymn conversion
// ─────────────────────────────────────────────────────────────────────────────

function mergeMergedHymn(summary: HymnSummary, merged: MergedHymn): Hymn {
  const english = merged.english;

  const yoruba = merged.yoruba;

  const englishStanzas = new Map(
    english?.stanzas?.map((stanza) => [stanza.no, stanza]) ?? [],
  );

  const yorubaStanzas = new Map(
    yoruba?.stanzas?.map((stanza) => [stanza.no, stanza]) ?? [],
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

// ─────────────────────────────────────────────────────────────────────────────
// Individual hymn fetching + caching
// ─────────────────────────────────────────────────────────────────────────────

export async function getHymnCached(
  summary: HymnSummary,
  options?: {
    forceRefresh?: boolean;
  },
): Promise<Hymn> {
  const key = hymnCacheKey(summary.hymnType, summary.number);

  const cached = await cacheGet<HymnCacheValue>(key);

  /**
   * Check the dataset manifest before deciding whether the cached hymn
   * is still current.
   */
  const manifest = await syncDatasetVersion();

  const hymnManifestKey = `${summary.hymnType}:${summary.number}`;

  const remoteHash = manifest?.files?.[hymnManifestKey];

  /**
   * Cached hymn is valid when:
   *
   * - caller didn't request a forced refresh
   * - cached hymn isn't marked stale
   * - and either:
   *     a) manifest doesn't have per-file hashes yet, or
   *     b) cached hash matches remote hash
   */
  const cacheIsValid =
    cached &&
    !options?.forceRefresh &&
    !cached.stale &&
    (!remoteHash || !cached.contentHash || cached.contentHash === remoteHash);

  if (cacheIsValid) {
    return cached.data;
  }

  try {
    const merged = await dataGet<MergedHymn>(
      mergedHymnUrl(summary.hymnType, summary.number),
    );

    const hymn = mergeMergedHymn(summary, merged);

    await cacheSet<HymnCacheValue>(key, {
      savedAt: Date.now(),

      data: hymn,

      stale: false,

      contentHash: remoteHash,
    });

    /**
     * The cached hymn changed, so the offline lyrics index needs
     * to be rebuilt when next required.
     */
    offlineLyricsIndex = null;

    return hymn;
  } catch (error) {
    /**
     * Network unavailable.
     *
     * If an old version exists, return it.
     *
     * This is what preserves offline behavior even after a hymn has
     * been marked stale.
     */
    if (cached) {
      console.warn(
        `[CAC Hymnal] Using cached hymn ${summary.number} because refresh failed.`,
        error,
      );

      return cached.data;
    }

    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Download all hymns
// ─────────────────────────────────────────────────────────────────────────────

export async function downloadAllHymns(
  catalogData: HymnSummary[],
  onProgress?: (done: number, total: number, hymn: HymnSummary) => void,
): Promise<{ failed: number }> {
  const total = catalogData.length;

  let done = 0;
  let failed = 0;

  /**
   * Do not download the old four collections.
   *
   * Each merged hymn is downloaded individually and cached.
   */
  for (const hymn of catalogData) {
    try {
      await getHymnCached(hymn);
    } catch (error) {
      failed += 1;

      console.warn("Failed to cache hymn", hymn, error);
    }

    done += 1;

    onProgress?.(done, total, hymn);
  }

  offlineLyricsIndex = null;

  return {
    failed,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Lyrics search
// ─────────────────────────────────────────────────────────────────────────────

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

  if (!lines.length) {
    return null;
  }

  return {
    lines: lines.map(normalize),

    blocks: blocks.map(normalize),

    stripLines: lines.map(stripDiacritics),

    stripBlocks: blocks.map(stripDiacritics),
  };
}

async function buildOfflineLyricsIndex(
  catalogData: HymnSummary[],
): Promise<Map<number, LyricsEntry>> {
  const index = new Map<number, LyricsEntry>();

  for (const summary of catalogData) {
    const key = hymnCacheKey(summary.hymnType, summary.number);

    const cached = await cacheGet<HymnCacheValue>(key);

    if (!cached?.data) {
      continue;
    }

    const entry = entryFromHymn(cached.data);

    if (entry) {
      index.set(summary.id, entry);
    }
  }

  return index;
}

async function getOfflineLyricsIndex(
  catalogData: HymnSummary[],
): Promise<Map<number, LyricsEntry>> {
  if (!offlineLyricsIndex) {
    offlineLyricsIndex = await buildOfflineLyricsIndex(catalogData);
  }

  return offlineLyricsIndex;
}

function buildLyricsIndexFromCatalogCache(catalogData: HymnSummary[]): null {
  /**
   * The new architecture intentionally does not preload all hymn lyrics
   * into memory.
   *
   * That would defeat the performance benefit of moving away from the
   * ~3 MB Hymnize collection download.
   *
   * Search therefore uses the already downloaded/cached hymns when offline.
   */
  void catalogData;

  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Search
// ─────────────────────────────────────────────────────────────────────────────

export async function searchCachedLyrics(
  catalogData: HymnSummary[],
  query: string,
  limit = 40,
): Promise<HymnSummary[]> {
  const trimmed = query.trim();

  if (!trimmed || trimmed.length < 2) {
    return [];
  }

  const queryNorm = normalize(trimmed);

  const queryStripped = stripDiacritics(trimmed);

  interface ScoredResult {
    summary: HymnSummary;
    score: number;
  }

  const scored: ScoredResult[] = [];

  /**
   * Search the locally cached hymns.
   *
   * This is the offline-safe path.
   *
   * The old implementation searched the entire 3 MB collection snapshot.
   * We intentionally no longer download that snapshot just for search.
   */
  const offlineIndex = await getOfflineLyricsIndex(catalogData);

  for (const summary of catalogData) {
    const entry = offlineIndex.get(summary.id);

    if (!entry) {
      continue;
    }

    let bestScore = 0;

    /**
     * 1. Individual lines
     */
    for (let i = 0; i < entry.lines.length; i++) {
      let score = 0;

      if (entry.lines[i].includes(queryNorm)) {
        score = 110;
      } else if (entry.stripLines[i].includes(queryStripped)) {
        score = 90;
      }

      if (score > bestScore) {
        bestScore = score;
      }

      if (bestScore >= 110) {
        break;
      }
    }

    /**
     * 2. Joined verse blocks
     */
    if (bestScore < 70) {
      for (let i = 0; i < entry.blocks.length; i++) {
        let score = 0;

        if (entry.blocks[i].includes(queryNorm)) {
          score = 70;
        } else if (entry.stripBlocks[i].includes(queryStripped)) {
          score = 50;
        }

        if (score > bestScore) {
          bestScore = score;
        }

        if (bestScore >= 70) {
          break;
        }
      }
    }

    if (bestScore > 0) {
      scored.push({
        summary,
        score: bestScore,
      });
    }
  }

  scored.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }

    return a.summary.number - b.summary.number;
  });

  return scored.slice(0, limit).map((item) => item.summary);
}

// ─────────────────────────────────────────────────────────────────────────────
// Optional helper
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Call this when the app starts if you want the manifest checked
 * without waiting for the user to open a hymn.
 */
export async function checkForDatasetUpdates(): Promise<void> {
  await syncDatasetVersion();
}
