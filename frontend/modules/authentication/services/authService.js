/* ============================================================
   AUTHENTICATION — Service Layer
   Public API for auth. UI components only import from here.
   Never imports directly from mock/ in UI-facing code.
   ============================================================ */

import { mockGoogleLogin, mockEmailLogin } from '../mock/mockAuth.js';
import { authState } from '../state/authState.js';

const PROFILE_KEY = 'ws_profile';

export const authService = {
    /**
     * Initiates Google login flow via mock.
     * Updates auth state on success.
     * @returns {Promise<{user, isNewUser}>}
     */
    async loginWithGoogle() {
        const result = await mockGoogleLogin();
        const profileExists = !!localStorage.getItem(PROFILE_KEY);

        const isNewUser = result.isNewUser && !profileExists;

        authState.setUser(
            {
                name: result.name,
                email: result.email,
                photo: result.photo,
            },
            result.accessToken,
            !isNewUser
        );

        return { user: authState.getUser(), isNewUser };
    },

    /**
     * Initiates email/password login flow via mock.
     * @param {string} email
     * @param {string} password
     * @returns {Promise<{user, isNewUser}>}
     */
    async loginWithEmail(email, password) {
        const result = await mockEmailLogin(email, password);
        const profileExists = !!localStorage.getItem(PROFILE_KEY);

        authState.setUser(
            {
                name: result.name,
                email: result.email,
                photo: result.photo,
            },
            result.accessToken,
            !result.isNewUser || profileExists
        );

        return { user: authState.getUser(), isNewUser: result.isNewUser && !profileExists };
    },

    /**
     * Logs out the current user. Clears session + auth state.
     */
    logout() {
        authState.clear();
    },

    /**
     * Checks whether a profile has been created for the current user.
     * @returns {boolean}
     */
    checkProfile() {
        return !!localStorage.getItem(PROFILE_KEY);
    },

    /**
     * Returns the current auth state snapshot.
     */
    getAuthState() {
        return authState.getState();
    },
};
