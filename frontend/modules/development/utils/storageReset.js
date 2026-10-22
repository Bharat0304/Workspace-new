/* ============================================================
   DEVELOPMENT MODULE — Storage Reset Utility
   Safe, targeted reset of WorkSpace storage keys.
   Never deletes unrelated browser data.
   ============================================================ */

/** Prefix used by ALL WorkSpace keys across all storages. */
const WS_PREFIX = 'ws_';

/**
 * All known WorkSpace localStorage keys.
 * Add new keys here as modules are created.
 * Do NOT use wildcard deletion — be explicit for safety.
 */
const WS_LOCALSTORAGE_KEYS = [
    'ws_profile',
    'ws_onboarding_draft',
    'ws_feature_flags',
    'ws_env_override',
    // Development-added
    'ws_mock_profile',
    // Future keys (register as modules are built)
    'ws_session',
    'ws_analytics_cache',
    'ws_user_preferences',
];

/**
 * All known WorkSpace sessionStorage keys.
 */
const WS_SESSIONSTORAGE_KEYS = [
    'ws_auth_state',
    'ws_dev_state',
    'ws_current_route',
];

/**
 * Removes all registered WorkSpace keys from localStorage.
 * Performs a secondary safety scan for any unregistered ws_ keys.
 * @returns {{ removed: string[], count: number }}
 */
export function clearLocalStorage() {
    const removed = [];

    // Remove all registered keys
    WS_LOCALSTORAGE_KEYS.forEach(key => {
        if (localStorage.getItem(key) !== null) {
            localStorage.removeItem(key);
            removed.push(`localStorage:${key}`);
        }
    });

    // Safety scan: catch any ws_ keys not in registry
    const allKeys = Object.keys(localStorage);
    allKeys.forEach(key => {
        if (key.startsWith(WS_PREFIX) && !WS_LOCALSTORAGE_KEYS.includes(key)) {
            localStorage.removeItem(key);
            removed.push(`localStorage:${key} [unregistered]`);
            console.warn(`[StorageReset] Removed unregistered key: "${key}" — add it to WS_LOCALSTORAGE_KEYS`);
        }
    });

    return { removed, count: removed.length };
}

/**
 * Removes all registered WorkSpace keys from sessionStorage.
 * @returns {{ removed: string[], count: number }}
 */
export function clearSessionStorage() {
    const removed = [];

    WS_SESSIONSTORAGE_KEYS.forEach(key => {
        if (sessionStorage.getItem(key) !== null) {
            sessionStorage.removeItem(key);
            removed.push(`sessionStorage:${key}`);
        }
    });

    // Safety scan
    const allKeys = Object.keys(sessionStorage);
    allKeys.forEach(key => {
        if (key.startsWith(WS_PREFIX) && !WS_SESSIONSTORAGE_KEYS.includes(key)) {
            sessionStorage.removeItem(key);
            removed.push(`sessionStorage:${key} [unregistered]`);
            console.warn(`[StorageReset] Removed unregistered key: "${key}" — add it to WS_SESSIONSTORAGE_KEYS`);
        }
    });

    return { removed, count: removed.length };
}

/**
 * Full application reset:
 * 1. Clears all localStorage WS keys
 * 2. Clears all sessionStorage WS keys
 * 3. Returns combined report
 *
 * Does NOT reload the page — caller decides whether to reload.
 * @returns {{ localStorage: object, sessionStorage: object, total: number }}
 */
export function resetAllStorage() {
    const local = clearLocalStorage();
    const session = clearSessionStorage();
    const total = local.count + session.count;

    return {
        localStorage: local,
        sessionStorage: session,
        total,
        allRemoved: [...local.removed, ...session.removed],
    };
}

/**
 * Registers a new storage key with the reset system.
 * Useful for programmatic registration from modules.
 * @param {'local'|'session'} storageType
 * @param {string} key
 */
export function registerStorageKey(storageType, key) {
    if (!key.startsWith(WS_PREFIX)) {
        console.warn(`[StorageReset] Key "${key}" should start with "${WS_PREFIX}"`);
    }
    if (storageType === 'local' && !WS_LOCALSTORAGE_KEYS.includes(key)) {
        WS_LOCALSTORAGE_KEYS.push(key);
    } else if (storageType === 'session' && !WS_SESSIONSTORAGE_KEYS.includes(key)) {
        WS_SESSIONSTORAGE_KEYS.push(key);
    }
}
