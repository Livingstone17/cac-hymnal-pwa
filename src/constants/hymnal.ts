export const API_BASE = "https://worker.hymnize.com/api";
export const DENOMINATION = "cac";

export const DB_NAME = "cac-gospel-hymnal-db";
export const DB_VERSION = 1;
export const STORE_NAME = "kv";

export const CACHE_PREFIX = `hymnize:${DENOMINATION}`;
export const CATALOG_CACHE_KEY = `${CACHE_PREFIX}:catalog:v1`;
export const OFFLINE_READY_KEY = `${CACHE_PREFIX}:offline-ready:v1`;
export const CATALOG_TTL_MS = 24 * 60 * 60 * 1000;

export const LS_PREFIX = "cac-hymnal:";
export const LS_ONBOARDED = `${LS_PREFIX}onboarded`;
export const LS_LANGUAGE = `${LS_PREFIX}language`;
export const LS_SETTINGS_LANG = `${LS_PREFIX}settings-language`;
export const LS_FAVORITES = `${LS_PREFIX}favorites`;
export const LS_RECENTLY_VIEWED = `${LS_PREFIX}recently-viewed`;
export const LS_RECENT_SEARCHES = `${LS_PREFIX}recent-searches`;
export const LS_DARK_MODE = `${LS_PREFIX}dark-mode`;
export const LS_FONT_SIZE = `${LS_PREFIX}font-size`;
export const LS_REMINDER_ENABLED = `${LS_PREFIX}reminder-enabled`;
export const LS_REMINDER_TIME = `${LS_PREFIX}reminder-time`;