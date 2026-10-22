/* ============================================================
   ONBOARDING MODULE — Entry Point
   Orchestrates the 4-step onboarding flow.
   Called by LoginCard after successful new-user auth.
   ============================================================ */

import { onboardingState } from './state/onboardingState.js';
import { createProgressBar, updateProgressBar } from './components/ProgressBar.js';
import { renderStep1, validateStep1 } from './steps/Step1Personal.js';
import { renderStep2, validateStep2 } from './steps/Step2Academic.js';
import { renderStep3, validateStep3 } from './steps/Step3Goals.js';
import { renderStep4 } from './steps/Step4Review.js';

const STEP_LABELS = ['Personal', 'Academic', 'Goals', 'Review'];
const LOGO_SVG = `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#D97706" stroke-width="1.5"><path d="M9 21h6M12 3a6 6 0 0 0-4 10.5V17h8v-3.5A6 6 0 0 0 12 3z"/><line x1="10" y1="17" x2="10" y2="21"/><line x1="14" y1="17" x2="14" y2="21"/></svg>`;

let _overlayEl = null;
let _progressBarEl = null;
let _stepContentEl = null;
let _backBtn = null;
let _continueBtn = null;

/**
 * Initializes and displays the onboarding flow.
 * @param {Object} user - User object from auth service { name, email, photo }
 */
export function initOnboarding(user) {
    _injectStyles();
    onboardingState.seedUserData(user);
    _buildOverlay();
    _renderCurrentStep();
    requestAnimationFrame(() => {
        _overlayEl.classList.add('active');
    });
}

// ── Private ──────────────────────────────────────────────────

function _injectStyles() {
    if (document.getElementById('ws-onboarding-styles')) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.id = 'ws-onboarding-styles';
    
    // Heuristic: Check if we are running in a subdirectory page (like client/modules/analytics/pages/)
    const isSubfolder = window.location.pathname.includes('/pages/') || window.location.pathname.includes('/modules/');
    const prefix = isSubfolder ? '../../../' : '';
    
    link.href = `${prefix}modules/onboarding/styles/onboarding.css`;
    document.head.appendChild(link);
}

function _buildOverlay() {
    // Remove old instance if exists
    document.getElementById('obOverlay')?.remove();

    _overlayEl = document.createElement('div');
    _overlayEl.className = 'ob-overlay';
    _overlayEl.id = 'obOverlay';

    // Layout wrapper
    const layout = document.createElement('div');
    layout.className = 'ob-layout';

    // Top bar
    const topBar = document.createElement('div');
    topBar.className = 'ob-top-bar';
    topBar.innerHTML = `
        <span class="ob-brand">WORK${LOGO_SVG}SPACE</span>
        <span class="ob-step-counter" id="obStepCounter">Step 1 of 4</span>
    `;

    // Progress bar
    _progressBarEl = createProgressBar(4, 1, STEP_LABELS);

    // Step content area
    _stepContentEl = document.createElement('div');
    _stepContentEl.className = 'ob-step-content visible';
    _stepContentEl.id = 'obStepContent';

    // Navigation footer
    const navFooter = document.createElement('div');
    navFooter.className = 'ob-nav-footer';
    navFooter.id = 'obNavFooter';

    _backBtn = document.createElement('button');
    _backBtn.className = 'ob-btn-back';
    _backBtn.type = 'button';
    _backBtn.id = 'obBackBtn';
    _backBtn.innerHTML = `
        <svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M10 3L5 8l5 5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Back
    `;
    _backBtn.disabled = true;

    _continueBtn = document.createElement('button');
    _continueBtn.className = 'ob-btn-continue';
    _continueBtn.type = 'button';
    _continueBtn.id = 'obContinueBtn';
    _continueBtn.innerHTML = `
        Continue
        <svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M6 3l5 5-5 5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
    `;

    navFooter.appendChild(_backBtn);
    navFooter.appendChild(_continueBtn);

    layout.appendChild(topBar);
    layout.appendChild(_progressBarEl);
    layout.appendChild(_stepContentEl);
    layout.appendChild(navFooter);

    _overlayEl.appendChild(layout);
    document.body.appendChild(_overlayEl);

    // Wire navigation
    _backBtn.addEventListener('click', _handleBack);
    _continueBtn.addEventListener('click', _handleContinue);
}

function _renderCurrentStep() {
    const step = onboardingState.getCurrentStep();

    // Update progress bar
    updateProgressBar(_progressBarEl, step);

    // Update counter
    const counter = _overlayEl.querySelector('#obStepCounter');
    if (counter) counter.textContent = `Step ${step} of 4`;

    // Back button state
    if (_backBtn) _backBtn.disabled = step === 1;

    // Continue button text on last step: hide it (Step4 has its own CTA)
    if (_continueBtn) {
        const navFooter = _overlayEl.querySelector('#obNavFooter');
        if (step === 4) {
            _continueBtn.style.display = 'none';
        } else {
            _continueBtn.style.display = '';
        }
    }

    // Render the step
    switch (step) {
        case 1: renderStep1(_stepContentEl); break;
        case 2: renderStep2(_stepContentEl); break;
        case 3: renderStep3(_stepContentEl); break;
        case 4: renderStep4(_stepContentEl, { onNavigate: _navigateToStep }); break;
    }

    // Scroll to top on step change
    _overlayEl.scrollTo({ top: 0, behavior: 'smooth' });
}

async function _handleContinue() {
    const step = onboardingState.getCurrentStep();
    let valid = true;

    // Validate current step
    switch (step) {
        case 1: valid = validateStep1(_stepContentEl); break;
        case 2: valid = validateStep2(_stepContentEl); break;
        case 3: valid = validateStep3(_stepContentEl); break;
    }

    if (!valid) return;

    // Transition animation
    await _transitionStep('forward');
    onboardingState.nextStep();
    _renderCurrentStep();
    _animateStepIn('right');
}

async function _handleBack() {
    if (onboardingState.getCurrentStep() === 1) return;
    await _transitionStep('backward');
    onboardingState.prevStep();
    _renderCurrentStep();
    _animateStepIn('left');
}

function _navigateToStep(step) {
    onboardingState.goToStep(step);
    _renderCurrentStep();
    _animateStepIn('left');
}

function _transitionStep(direction) {
    return new Promise(resolve => {
        _stepContentEl.classList.remove('visible');
        _stepContentEl.classList.add(direction === 'forward' ? 'exit-left' : 'exit-right');
        setTimeout(() => {
            _stepContentEl.classList.remove('exit-left', 'exit-right');
            resolve();
        }, 300);
    });
}

function _animateStepIn(from) {
    _stepContentEl.classList.remove('visible', 'enter-right', 'enter-left');
    _stepContentEl.classList.add(from === 'right' ? 'enter-right' : 'enter-left');
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            _stepContentEl.classList.remove('enter-right', 'enter-left');
            _stepContentEl.classList.add('visible');
        });
    });
}
