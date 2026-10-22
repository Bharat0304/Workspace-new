/* ============================================================
   AUTHENTICATION MODULE — Entry Point
   Initializes auth by injecting the CSS and wiring click events
   on the existing landing page buttons.
   ============================================================ */

import { openAuthModal } from './components/AuthModal.js';
import { authState } from './state/authState.js';

/**
 * Initialize the authentication module.
 * Wires the "Log In" and "Get Early Access" buttons to open the auth modal.
 * Injects auth CSS into the document head.
 * Call this once from app.js.
 */
export function initAuth() {
    _injectStyles();
    _wireButtons();
}

/**
 * Opens the authentication modal.
 * Centralized entry point for all CTAs.
 */
export function openAuthentication() {
    if (authState.isLoggedIn()) {
        const isSubfolder = window.location.pathname.includes('/pages/') || window.location.pathname.includes('/modules/');
        const prefix = isSubfolder ? '../../../' : '';
        window.location.href = `${prefix}modules/dashboard/pages/dashboard.html`;
        return;
    }
    openAuthModal();
}

// Expose globally for future-proofing and non-module components
window.openAuthentication = openAuthentication;

function _injectStyles() {
    if (document.getElementById('ws-auth-styles')) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.id = 'ws-auth-styles';
    
    // Heuristic: Check if we are running in a subdirectory page (like client/modules/analytics/pages/)
    const isSubfolder = window.location.pathname.includes('/pages/') || window.location.pathname.includes('/modules/');
    const prefix = isSubfolder ? '../../../' : '';
    
    link.href = `${prefix}modules/authentication/styles/auth.css`;
    document.head.appendChild(link);
}

function _wireButtons() {
    // Primary login button in navbar
    const loginBtn = document.getElementById('loginBtn');
    if (loginBtn) {
        loginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            openAuthentication();
        });
    }

    // "Get Early Access" CTA in navbar
    const ctaNav = document.getElementById('ctaNav');
    if (ctaNav) {
        ctaNav.addEventListener('click', (e) => {
            e.preventDefault();
            openAuthentication();
        });
    }

    // Hero section CTAs (Get Started, etc.) and other page CTAs
    document.querySelectorAll('[data-auth-trigger]').forEach(el => {
        el.addEventListener('click', (e) => {
            e.preventDefault();
            openAuthentication();
        });
    });

    // Mobile overlay login link
    const mobileLinks = document.querySelectorAll('.mobile-link');
    mobileLinks.forEach(link => {
        if (link.textContent.trim() === 'Log In') {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                openAuthentication();
            });
        }
    });
}
