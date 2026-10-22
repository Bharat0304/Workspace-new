/* ============================================================
   DEVELOPMENT MODULE — Developer Service
   Orchestrates all developer panel actions.
   Always goes through the real service layer — never bypasses it.
   ============================================================ */

import { authState } from '../../authentication/state/authState.js';
import { authService } from '../../authentication/services/authService.js';
import { onboardingState } from '../../onboarding/state/onboardingState.js';
import { featureFlags, FLAG_NAMES } from '../../../app/config/featureFlags.js';
import { resetAllStorage } from '../utils/storageReset.js';
import { devState } from '../state/devState.js';
import { MOCK_NEW_USER, MOCK_EXISTING_USER, MOCK_COMPLETE_PROFILE } from '../mock/mockUsers.js';

const PROFILE_KEY = 'ws_profile';

export const devService = {
    // ── Authentication ───────────────────────────────────────

    /**
     * Logs in as a new user (profile incomplete).
     * Seeds the auth state and launches the onboarding module.
     * Always uses the real authState service — no bypassing.
     */
    async loginAsNewUser() {
        devState.log('Dev login as New User initiated', 'info');

        // Ensure profile doesn't exist (so authService treats this as new)
        localStorage.removeItem(PROFILE_KEY);

        // Seed auth state directly (mimics what authService.loginWithGoogle() does)
        authState.setUser(
            {
                name: MOCK_NEW_USER.name,
                email: MOCK_NEW_USER.email,
                photo: null,
            },
            MOCK_NEW_USER.accessToken,
            false   // profileComplete = false
        );

        devState.log('Auth state seeded as new user', 'success');

        // Dynamically import onboarding to launch it
        const { initOnboarding } = await import('../../onboarding/index.js');
        initOnboarding(authState.getUser());

        devState.log('Onboarding launched for new user', 'success');
        return authState.getUser();
    },

    /**
     * Logs in as a returning user (profile complete).
     * Seeds both auth state and profile — skips onboarding.
     */
    async loginAsExistingUser() {
        devState.log('Dev login as Existing User initiated', 'info');

        // Seed a complete profile in localStorage
        localStorage.setItem(PROFILE_KEY, JSON.stringify({
            ...MOCK_COMPLETE_PROFILE,
            createdAt: new Date().toISOString(),
        }));

        // Seed auth state as logged-in with complete profile
        authState.setUser(
            {
                name: MOCK_EXISTING_USER.name,
                email: MOCK_EXISTING_USER.email,
                photo: null,
            },
            MOCK_EXISTING_USER.accessToken,
            true    // profileComplete = true
        );

        devState.log('Auth state seeded as existing user', 'success');
        devState.log('Mock profile written to localStorage', 'info');

        // Redirect to dashboard
        const isSubfolder = window.location.pathname.includes('/pages/') || window.location.pathname.includes('/modules/');
        const prefix = isSubfolder ? '../../../' : '';
        window.location.href = `${prefix}modules/dashboard/pages/dashboard.html`;

        return authState.getUser();
    },

    /**
     * Logs out the current user.
     * Uses the real authService.logout() to ensure proper cleanup.
     */
    logout() {
        devState.log('Dev logout initiated', 'info');
        authService.logout();
        onboardingState.clearDraft();
        devState.log('Auth state cleared, onboarding draft cleared', 'success');
    },

    // ── Application ───────────────────────────────────────────

    /**
     * Full application reset:
     * 1. Clears all WorkSpace storage
     * 2. Resets mock services
     * 3. Reloads the page
     */
    async resetApplication() {
        devState.log('Application reset initiated', 'warn');

        const report = resetAllStorage();
        devState.log(`Storage cleared: ${report.total} key(s) removed`, 'success');

        // Small delay so the log is visible before reload
        await _delay(400);
        window.location.reload();
    },

    /**
     * Clears WorkSpace-specific storage without reloading.
     */
    clearWorkSpaceStorage() {
        devState.log('Clearing WorkSpace storage', 'warn');
        const report = resetAllStorage();
        devState.log(`Cleared ${report.total} storage key(s)`, 'success');
        return report;
    },

    /**
     * Resets mock data (profile + onboarding draft) without full reset.
     */
    resetMockData() {
        devState.log('Resetting mock data', 'warn');
        localStorage.removeItem(PROFILE_KEY);
        onboardingState.clearDraft();
        devState.log('Mock profile and onboarding draft removed', 'success');
    },

    // ── Navigation ────────────────────────────────────────────

    /**
     * Navigation triggers — open each major route.
     * Currently scrolls to relevant section or opens modal.
     * Will use Router when routing layer is built.
     */
    navigateTo(route) {
        devState.log(`Navigate to: ${route}`, 'info');
        switch (route) {
            case 'landing':
                window.scrollTo({ top: 0, behavior: 'smooth' });
                break;
            case 'authentication':
                import('../../authentication/components/AuthModal.js').then(({ openAuthModal }) => openAuthModal());
                break;
            case 'onboarding': {
                const user = authState.getUser() || { name: 'Dev', email: 'dev@workspace.local', photo: null };
                import('../../onboarding/index.js').then(({ initOnboarding }) => initOnboarding(user));
                break;
            }
            case 'dashboard': {
                const isSubfolder = window.location.pathname.includes('/pages/') || window.location.pathname.includes('/modules/');
                const prefix = isSubfolder ? '../../../' : '';
                window.location.href = `${prefix}modules/dashboard/pages/dashboard.html`;
                break;
            }
            case 'analytics': {
                const isSubfolder = window.location.pathname.includes('/pages/') || window.location.pathname.includes('/modules/');
                const prefix = isSubfolder ? '../../../' : '';
                window.location.href = `${prefix}modules/analytics/pages/analytics.html`;
                break;
            }
            default:
                devState.log(`Unknown route: ${route}`, 'error');
        }
    },

    // ── State Inspection ──────────────────────────────────────

    /**
     * Returns a snapshot of all observable application state.
     */
    getStateSnapshot() {
        const auth = authState.getState();
        const onboarding = onboardingState.getState();
        const flags = featureFlags.getAll();

        return {
            auth: {
                isLoggedIn: auth.isLoggedIn,
                user: auth.user ? { name: auth.user.name, email: auth.user.email } : null,
                profileComplete: auth.profileComplete,
            },
            onboarding: {
                currentStep: onboarding.currentStep,
                isDraft: onboarding.isDraft,
                hasData: Object.values(onboarding.formData).some(v => !!v),
            },
            route: {
                current: 'landing',   // Will read from Router when implemented
                previous: null,
            },
            flags: {
                mockServices: flags.enableMockServices,
                developerPanel: flags.enableDeveloperPanel,
                experimental: flags.enableExperimentalFeatures,
            },
            storage: {
                localStorageKeys: Object.keys(localStorage).filter(k => k.startsWith('ws_')),
                sessionStorageKeys: Object.keys(sessionStorage).filter(k => k.startsWith('ws_')),
            },
        };
    },

    // ── Feature Flags ─────────────────────────────────────────

    /**
     * Toggles a feature flag and updates the panel.
     * @param {string} flagName
     * @param {boolean} value
     */
    setFlag(flagName, value) {
        featureFlags.set(flagName, value);
        devState.log(`Flag "${flagName}" set to ${value}`, 'info');
    },
};

// ── Private Helpers ──────────────────────────────────────────

function _showDashboardPlaceholder(name) {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position:fixed;inset:0;z-index:3000;
        background:#000;display:flex;align-items:center;
        justify-content:center;flex-direction:column;gap:1.2rem;
        animation:devFadeIn 0.5s ease;
    `;
    overlay.innerHTML = `
        <style>@keyframes devFadeIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }</style>
        <div style="
            width:56px;height:56px;border-radius:50%;
            background:rgba(217,119,6,0.15);display:flex;
            align-items:center;justify-content:center;
            border:1px solid rgba(217,119,6,0.3);
        ">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#D97706" stroke-width="1.5">
                <path d="M9 21h6M12 3a6 6 0 0 0-4 10.5V17h8v-3.5A6 6 0 0 0 12 3z"/>
                <line x1="10" y1="17" x2="10" y2="21"/><line x1="14" y1="17" x2="14" y2="21"/>
            </svg>
        </div>
        <p style="font-family:'Outfit',sans-serif;font-weight:800;font-size:1.4rem;color:#fff;margin:0;">
            Welcome, ${name}.
        </p>
        <p style="font-family:'DM Mono',monospace;font-size:0.75rem;color:rgba(255,255,255,0.4);margin:0;letter-spacing:0.05em;">
            DASHBOARD · COMING SOON
        </p>
        <div style="display:flex;gap:0.75rem;margin-top:0.5rem;">
            <button onclick="this.closest('div[style]').remove()" style="
                padding:0.5rem 1.2rem;background:transparent;border:1px solid #D97706;
                color:#D97706;border-radius:6px;font-family:'DM Mono',monospace;
                font-size:0.75rem;cursor:pointer;letter-spacing:0.05em;">
                ← Back to Landing
            </button>
        </div>
    `;
    document.body.appendChild(overlay);
}

function _delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
