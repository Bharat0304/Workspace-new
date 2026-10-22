/* ============================================
   WORKSPACE CLIENT — Central Bootstrapper (App Entry)
   ============================================ */

import { ENV } from './config/env.js';
import { featureFlags } from './config/featureFlags.js';
import { initNavbar } from '../shared/components/navbar.js';
import { initBulb } from '../modules/dashboard/components/bulb.js';
import { initStudent } from '../modules/dashboard/components/student.js';
import { initFaq } from '../modules/dashboard/components/faq.js';
import { initWaitlist } from '../modules/dashboard/services/waitlistService.js';
import { initAuth } from '../modules/authentication/index.js';
import { initDevPanel } from '../modules/development/index.js';

function setupScrollReveal() {
    const reveals = document.querySelectorAll('.section-inner, .student-section, .dashboard-preview, .stats-row, .reflection-mockup, .final-cta-inner');
    reveals.forEach(el => el.classList.add('reveal'));

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    reveals.forEach(el => observer.observe(el));
}

function setupSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href === '#') return;
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
}

function init() {
    // Shared navbar initialization
    initNavbar();

    // Authentication module — wires login/CTA buttons to auth modal
    initAuth();

    // Module-specific initializations
    if (document.getElementById('hero')) {
        initBulb();
        initStudent();
        initFaq();
        initWaitlist();
        setupScrollReveal();
        setupSmoothScroll();
    }

    // Developer panel — env-gated, async, zero production impact
    initDevPanel();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}