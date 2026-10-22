/* ============================================================
   ONBOARDING — Mock Profile Service
   Simulates profile creation and retrieval with staged delays.
   ============================================================ */

const PROFILE_KEY = 'ws_profile';

/**
 * Simulates a 3.5s profile creation sequence with staged progress updates.
 * @param {Object} profileData
 * @param {Function} [onStage] - Called with stage index (0-3) as each stage completes
 * @returns {Promise<Object>} the created profile
 */
export async function mockCreateProfile(profileData, onStage) {
    const stages = [
        { delay: 800,  label: 'Creating Profile' },
        { delay: 900,  label: 'Building Baseline' },
        { delay: 850,  label: 'Preparing Focus Engine' },
        { delay: 600,  label: 'Almost Ready' },
    ];

    for (let i = 0; i < stages.length; i++) {
        await _delay(stages[i].delay);
        if (onStage) onStage(i);
    }

    const profile = {
        ...profileData,
        id: `profile_${Date.now()}`,
        createdAt: new Date().toISOString(),
        version: 1,
    };

    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    return profile;
}

/**
 * Retrieves the stored profile from localStorage.
 * @returns {Promise<Object|null>}
 */
export async function mockGetProfile() {
    await _delay(150);
    try {
        const raw = localStorage.getItem(PROFILE_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

/**
 * Simulates a partial profile update.
 * @param {Object} updates
 * @returns {Promise<Object>}
 */
export async function mockUpdateProfile(updates) {
    await _delay(400);
    try {
        const raw = localStorage.getItem(PROFILE_KEY);
        const existing = raw ? JSON.parse(raw) : {};
        const updated = { ...existing, ...updates, updatedAt: new Date().toISOString() };
        localStorage.setItem(PROFILE_KEY, JSON.stringify(updated));
        return updated;
    } catch (err) {
        throw new Error('Failed to update profile.');
    }
}

function _delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
