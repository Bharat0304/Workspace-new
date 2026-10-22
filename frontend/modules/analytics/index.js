/* ============================================
   ANALYTICS MODULE — Dashboard Bootstrapper
   ============================================ */

import { initNavbar } from '../../shared/components/navbar.js';
import { initFaceRotation } from './components/face.js';
import { initGrowthChart } from './components/chart.js';
import { initAuth } from '../authentication/index.js';

function setupScrollReveal() {
    const reveals = document.querySelectorAll('.section-inner, .chart-panel');
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

function init() {
    initNavbar();
    initAuth();
    initFaceRotation();
    initGrowthChart();
    setupScrollReveal();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}