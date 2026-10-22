/* ============================================================
   AUTHENTICATION — State Store
   Singleton auth state. Persists to sessionStorage.
   ============================================================ */

const SESSION_KEY = 'ws_auth_state';

const _defaults = {
    user: null,
    accessToken: null,
    isLoggedIn: false,
    profileComplete: false,
};

let _state = _loadFromSession();

function _loadFromSession() {
    try {
        const raw = sessionStorage.getItem(SESSION_KEY);
        return raw ? JSON.parse(raw) : { ..._defaults };
    } catch {
        return { ..._defaults };
    }
}

function _persist() {
    try {
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(_state));
    } catch {
        // sessionStorage not available
    }
}

export const authState = {
    /** Returns a frozen copy of the current auth state. */
    getState() {
        return Object.freeze({ ..._state });
    },

    /** Returns the current user object or null. */
    getUser() {
        return _state.user ? { ..._state.user } : null;
    },

    /** Sets the authenticated user and marks as logged in. */
    setUser(user, accessToken, profileComplete = false) {
        _state = {
            user: { ...user },
            accessToken,
            isLoggedIn: true,
            profileComplete,
        };
        _persist();
    },

    /** Updates profileComplete flag (after onboarding). */
    setProfileComplete(value = true) {
        _state.profileComplete = value;
        _persist();
    },

    /** Clears all auth state (logout). */
    clear() {
        _state = { ..._defaults };
        try {
            sessionStorage.removeItem(SESSION_KEY);
        } catch {
            // noop
        }
    },

    /** Returns true if user is currently logged in. */
    isLoggedIn() {
        return _state.isLoggedIn;
    },
};
