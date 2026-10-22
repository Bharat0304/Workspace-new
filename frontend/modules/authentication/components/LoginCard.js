/* ============================================================
   AUTHENTICATION — Login Card Component
   Renders the auth card UI. Manages loading/error/success states.
   Calls authService — never touches mock layer directly.
   ============================================================ */

import { authService } from '../services/authService.js';
import { createGoogleButton } from './GoogleButton.js';
import { initOnboarding } from '../../onboarding/index.js';

const LOGO_SVG = `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 21h6M12 3a6 6 0 0 0-4 10.5V17h8v-3.5A6 6 0 0 0 12 3z"/><line x1="10" y1="17" x2="10" y2="21"/><line x1="14" y1="17" x2="14" y2="21"/></svg>`;

/**
 * Renders the login card into the given container element.
 * @param {HTMLElement} container
 * @param {{ onClose: Function }} options
 */
export function renderLoginCard(container, { onClose } = {}) {
    let isEmailMode = false;
    let isLoading = false;

    container.innerHTML = _buildCardHTML();

    _attachEventListeners();

    // ── Internal renderers ──────────────────────────────────

    function _buildCardHTML() {
        return `
            <button class="auth-close" id="authCloseBtn" aria-label="Close">&times;</button>

            <div class="auth-brand">
                <span class="auth-brand-logo">
                    WORK${LOGO_SVG}SPACE
                </span>
            </div>

            <h2 class="auth-heading">Welcome back.</h2>
            <p class="auth-subheading">Sign in to continue to your WorkSpace.</p>

            <div class="auth-error-banner" id="authErrorBanner" role="alert">
                <span class="auth-error-banner-text" id="authErrorText"></span>
            </div>

            <div id="authContent">
                ${_buildGoogleSection()}
            </div>

            <p class="auth-toggle" id="authToggle">
                Prefer email?
                <button class="auth-toggle-link" id="authToggleBtn">Sign in with email</button>
            </p>

            <p class="auth-privacy">
                By continuing, you agree to our
                <a href="#" tabindex="-1">Terms</a> and
                <a href="#" tabindex="-1">Privacy Policy</a>.
                We don't share your data.
            </p>
        `;
    }

    function _buildGoogleSection() {
        return `<div id="googleBtnMount"></div>`;
    }

    function _buildEmailForm() {
        return `
            <form class="auth-form" id="authEmailForm" novalidate>
                <div class="auth-field">
                    <label class="auth-label" for="authEmail">Email</label>
                    <input
                        class="auth-input"
                        type="email"
                        id="authEmail"
                        name="email"
                        placeholder="you@email.com"
                        autocomplete="email"
                        required
                    />
                    <span class="auth-field-error" id="emailError">Please enter a valid email.</span>
                </div>
                <div class="auth-field">
                    <label class="auth-label" for="authPassword">Password</label>
                    <input
                        class="auth-input"
                        type="password"
                        id="authPassword"
                        name="password"
                        placeholder="••••••••"
                        autocomplete="current-password"
                        required
                    />
                    <span class="auth-field-error" id="passwordError">Password must be at least 6 characters.</span>
                </div>
                <button class="auth-submit-btn" type="submit" id="emailSubmitBtn">
                    Sign In
                </button>
            </form>
        `;
    }

    function _buildLoadingHTML(message = 'Signing in…') {
        return `
            <div class="auth-loading">
                <div class="auth-spinner"></div>
                <span class="auth-loading-text">${message}</span>
            </div>
        `;
    }

    // ── Helpers ─────────────────────────────────────────────

    function _mountGoogleButton() {
        const mount = container.querySelector('#googleBtnMount');
        if (!mount) return;
        const btn = createGoogleButton({
            onClick: _handleGoogleLogin,
        });
        mount.appendChild(btn);
    }

    function _setLoading(loading, message) {
        isLoading = loading;
        const content = container.querySelector('#authContent');
        const toggle = container.querySelector('#authToggle');
        const closeBtn = container.querySelector('#authCloseBtn');
        if (!content) return;

        if (loading) {
            content.innerHTML = _buildLoadingHTML(message);
            if (toggle) toggle.style.display = 'none';
            if (closeBtn) closeBtn.style.display = 'none';
        } else {
            if (toggle) toggle.style.display = '';
            if (closeBtn) closeBtn.style.display = '';
            _renderCurrentMode();
        }
    }

    function _showError(message) {
        const banner = container.querySelector('#authErrorBanner');
        const text = container.querySelector('#authErrorText');
        if (!banner || !text) return;
        text.textContent = message;
        banner.classList.add('visible');
        setTimeout(() => banner.classList.remove('visible'), 5000);
    }

    function _renderCurrentMode() {
        const content = container.querySelector('#authContent');
        if (!content) return;
        if (isEmailMode) {
            content.innerHTML = _buildEmailForm();
            _attachEmailFormListeners();
        } else {
            content.innerHTML = _buildGoogleSection();
            _mountGoogleButton();
        }
    }

    // ── Auth Handlers ────────────────────────────────────────

    async function _handleGoogleLogin() {
        if (isLoading) return;
        _setLoading(true, 'Connecting to Google…');
        _hideError();

        try {
            const { user, isNewUser } = await authService.loginWithGoogle();
            _setLoading(true, 'Welcome, ' + user.name.split(' ')[0] + '!');

            await _delay(600);

            if (onClose) onClose();

            if (isNewUser) {
                initOnboarding(user);
            } else {
                _navigateToDashboard();
            }
        } catch (err) {
            _setLoading(false);
            _showError(err.message || 'Something went wrong. Please try again.');
        }
    }

    function _attachEmailFormListeners() {
        const form = container.querySelector('#authEmailForm');
        if (!form) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (isLoading) return;

            const email = container.querySelector('#authEmail')?.value.trim() ?? '';
            const password = container.querySelector('#authPassword')?.value ?? '';
            let valid = true;

            // Validate email
            if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                container.querySelector('#authEmail')?.classList.add('error');
                container.querySelector('#emailError')?.classList.add('visible');
                valid = false;
            } else {
                container.querySelector('#authEmail')?.classList.remove('error');
                container.querySelector('#emailError')?.classList.remove('visible');
            }

            // Validate password
            if (!password || password.length < 6) {
                container.querySelector('#authPassword')?.classList.add('error');
                container.querySelector('#passwordError')?.classList.add('visible');
                valid = false;
            } else {
                container.querySelector('#authPassword')?.classList.remove('error');
                container.querySelector('#passwordError')?.classList.remove('visible');
            }

            if (!valid) return;

            _setLoading(true, 'Signing in…');
            _hideError();

            try {
                const { user, isNewUser } = await authService.loginWithEmail(email, password);
                _setLoading(true, 'Welcome back, ' + user.name.split(' ')[0] + '!');

                await _delay(600);

                if (onClose) onClose();

                if (isNewUser) {
                    initOnboarding(user);
                } else {
                    _navigateToDashboard();
                }
            } catch (err) {
                _setLoading(false);
                _showError(err.message || 'Sign-in failed. Please check your credentials.');
            }
        });
    }

    function _hideError() {
        const banner = container.querySelector('#authErrorBanner');
        if (banner) banner.classList.remove('visible');
    }

    function _navigateToDashboard() {
        // Redirect to Dashboard feature workspace
        const isSubfolder = window.location.pathname.includes('/pages/') || window.location.pathname.includes('/modules/');
        const prefix = isSubfolder ? '../../../' : '';
        window.location.href = `${prefix}modules/dashboard/pages/dashboard.html`;
    }

    // ── Event Listeners ──────────────────────────────────────

    function _attachEventListeners() {
        // Mount initial Google button
        _mountGoogleButton();

        // Close button
        container.addEventListener('click', (e) => {
            if (e.target.closest('#authCloseBtn') && onClose) {
                onClose();
            }
        });

        // Toggle email mode
        container.addEventListener('click', (e) => {
            if (e.target.closest('#authToggleBtn')) {
                isEmailMode = !isEmailMode;
                _renderCurrentMode();
                const toggleBtn = container.querySelector('#authToggleBtn');
                const togglePara = container.querySelector('#authToggle');
                if (toggleBtn && togglePara) {
                    if (isEmailMode) {
                        toggleBtn.textContent = 'Use Google instead';
                        togglePara.childNodes[0].textContent = 'Prefer Google? ';
                    } else {
                        toggleBtn.textContent = 'Sign in with email';
                        togglePara.childNodes[0].textContent = 'Prefer email? ';
                    }
                }
            }
        });
    }
}

function _delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
