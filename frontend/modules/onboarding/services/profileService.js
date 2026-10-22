/* ============================================================
   ONBOARDING — Profile Service Layer
   Public API. UI components only import from here.
   ============================================================ */

import { mockCreateProfile, mockGetProfile, mockUpdateProfile } from '../mock/mockProfile.js';

export const profileService = {
    /**
     * Creates a new user profile. Accepts staged progress callback.
     * @param {Object} data - Complete profile data from onboarding steps
     * @param {Function} [onStage] - Called with stage index (0-3) as each stage completes
     * @returns {Promise<Object>} created profile
     */
    async createProfile(data, onStage) {
        return mockCreateProfile(data, onStage);
    },

    /**
     * Fetches the current user's profile.
     * @returns {Promise<Object|null>}
     */
    async getProfile() {
        return mockGetProfile();
    },

    /**
     * Partially updates the profile.
     * @param {Object} updates
     * @returns {Promise<Object>}
     */
    async updateProfile(updates) {
        return mockUpdateProfile(updates);
    },
};
