/* ============================================
   WORKSPACE — Full Landing Page JavaScript
   ============================================ */

(function () {
    'use strict';

    // === DOM ===
    const hero = document.getElementById('hero');
    const bulbWrapper = document.getElementById('bulbWrapper');
    const bulbCanvas = document.getElementById('bulbCanvas');
    const studentCanvas = document.getElementById('studentCanvas');
    const particleField = document.getElementById('particleField');
    const navbar = document.getElementById('navbar');
    const hamburger = document.getElementById('hamburger');
    const mobileOverlay = document.getElementById('mobileOverlay');
    const faqList = document.getElementById('faqList');
    const waitlistForm = document.getElementById('waitlistForm');

    const bulbCtx = bulbCanvas ? bulbCanvas.getContext('2d') : null;
    const studentCtx = studentCanvas ? studentCanvas.getContext('2d') : null;

    // === Config ===
    const BULB_MOVE = 12;
    const PARTICLES = 22;

    let mouseX = 0, mouseY = 0, tMouseX = 0, tMouseY = 0, time = 0;

    // ============================================
    // IMAGE PROCESSING
    // ============================================
    function loadBulb() {
        if (!bulbCtx) return;
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = function () {
            bulbCanvas.width = img.width;
            bulbCanvas.height = img.height;
            bulbCtx.drawImage(img, 0, 0);
            const d = bulbCtx.getImageData(0, 0, bulbCanvas.width, bulbCanvas.height);
            const px = d.data;
            for (let i = 0; i < px.length; i += 4) {
                const br = (px[i] + px[i + 1] + px[i + 2]) / 3;
                if (br < 35) { px[i + 3] = 0; }
                else if (br < 65) { const f = (br - 35) / 30; px[i + 3] = Math.floor(px[i + 3] * f * f); }
                if (px[i + 3] > 0) {
                    const g = Math.min(255, br * 1.15);
                    px[i] = g; px[i + 1] = g; px[i + 2] = g;
                }
            }
            bulbCtx.putImageData(d, 0, 0);
        };
        img.src = 'bulb.png';
    }

    function loadStudent() {
        if (!studentCtx) return;
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = function () {
            studentCanvas.width = img.width;
            studentCanvas.height = img.height;
            studentCtx.drawImage(img, 0, 0);
            const d = studentCtx.getImageData(0, 0, studentCanvas.width, studentCanvas.height);
            const px = d.data;
            for (let i = 0; i < px.length; i += 4) {
                const r = px[i], g = px[i + 1], b = px[i + 2];
                const br = (r + g + b) / 3;
                const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
                const sat = mx === 0 ? 0 : (mx - mn) / mx;
                if (br > 180 && sat < 0.15) { px[i + 3] = 0; }
                else if (br > 140 && sat < 0.2) {
                    px[i + 3] = Math.floor(px[i + 3] * Math.max(0, Math.min(1, 1 - (br - 140) / 40)));
                }
            }
            studentCtx.putImageData(d, 0, 0);
        };
        img.src = 'student2.png';
    }

    // ============================================
    // PARTICLES
    // ============================================
    function createParticles() {
        if (!particleField) return;
        particleField.innerHTML = '';
        for (let i = 0; i < PARTICLES; i++) {
            const p = document.createElement('div');
            p.className = 'particle';
            const a = Math.random() * Math.PI * 2;
            const dist = 35 + Math.random() * 65;
            const s = 1 + Math.random() * 1.5;
            p.style.cssText = `left:calc(50% + ${(Math.random() - .5) * 50}px);top:calc(50% + ${(Math.random() - .5) * 50}px);width:${s}px;height:${s}px;--tx:${Math.cos(a) * dist}px;--ty:${Math.sin(a) * dist}px;--duration:${2.5 + Math.random() * 3.5}s;--delay:${Math.random() * 5}s;box-shadow:0 0 ${s * 2.5}px rgba(255,255,255,0.4);`;
            particleField.appendChild(p);
        }
    }

    // ============================================
    // BULB CURSOR INTERACTION
    // ============================================
    function onMouseMove(e) {
        if (!hero) return;
        const r = hero.getBoundingClientRect();
        tMouseX = ((e.clientX - r.left) / r.width - 0.5) * 2;
        tMouseY = ((e.clientY - r.top) / r.height - 0.5) * 2;
    }

    function updateBulb() {
        mouseX += (tMouseX - mouseX) * 0.05;
        mouseY += (tMouseY - mouseY) * 0.05;
        const fy = Math.sin(time * 0.001) * 5;
        if (bulbWrapper) {
            bulbWrapper.style.transform = `translateY(${fy}px) translate(${mouseX * BULB_MOVE}px,${mouseY * BULB_MOVE}px)`;
        }
    }

    // ============================================
    // NAVBAR SCROLL
    // ============================================
    function handleNavScroll() {
        if (!navbar) return;
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }

    // ============================================
    // MOBILE MENU
    // ============================================
    function toggleMobile() {
        hamburger.classList.toggle('active');
        mobileOverlay.classList.toggle('active');
        document.body.style.overflow = mobileOverlay.classList.contains('active') ? 'hidden' : '';
    }

    // ============================================
    // FAQ ACCORDION
    // ============================================
    function setupFaq() {
        if (!faqList) return;
        faqList.addEventListener('click', (e) => {
            const btn = e.target.closest('.faq-question');
            if (!btn) return;
            const item = btn.parentElement;
            const wasActive = item.classList.contains('active');

            // Close all
            faqList.querySelectorAll('.faq-item').forEach(fi => fi.classList.remove('active'));

            // Toggle clicked
            if (!wasActive) item.classList.add('active');
        });
    }

    // ============================================
    // WAITLIST FORM
    // ============================================
    function setupWaitlist() {
        if (!waitlistForm) return;
        waitlistForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('waitlistEmail');
            if (email && email.value) {
                const btn = waitlistForm.querySelector('.btn-amber');
                if (btn) {
                    btn.textContent = 'You\'re In! ✓';
                    btn.style.background = '#059669';
                    btn.style.borderColor = '#059669';
                    btn.style.color = '#fff';
                    email.disabled = true;
                    btn.disabled = true;
                }
            }
        });
    }

    // ============================================
    // SCROLL REVEAL
    // ============================================
    function setupReveal() {
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

    // ============================================
    // SMOOTH SCROLL for nav links
    // ============================================
    function setupSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(link => {
            link.addEventListener('click', (e) => {
                const target = document.querySelector(link.getAttribute('href'));
                if (target) {
                    e.preventDefault();
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    // Close mobile menu if open
                    if (mobileOverlay && mobileOverlay.classList.contains('active')) {
                        toggleMobile();
                    }
                }
            });
        });
    }

    // ============================================
    // ANIMATION LOOP
    // ============================================
    function animate(ts) {
        time = ts || 0;
        updateBulb();
        requestAnimationFrame(animate);
    }

    // ============================================
    // INIT
    // ============================================
    function init() {
        loadBulb();
        loadStudent();
        createParticles();
        setupFaq();
        setupWaitlist();
        setupReveal();
        setupSmoothScroll();

        if (hero) {
            hero.addEventListener('mousemove', onMouseMove, { passive: true });
            hero.addEventListener('touchmove', (e) => { if (e.touches.length) onMouseMove(e.touches[0]); }, { passive: true });
            hero.addEventListener('mouseleave', () => { tMouseX = 0; tMouseY = 0; });
        }

        if (hamburger) hamburger.addEventListener('click', toggleMobile);
        // Voice Assist button handler
        const micBtn = document.getElementById('micBtn');
        if (micBtn) {
            micBtn.addEventListener('click', async () => {
                try {
                    const resp = await fetch('http://localhost:4001/listen');
                    const data = await resp.json();
                    console.log('Voice Assistant response:', data);
                    alert('Transcript: ' + (data.transcript || 'No transcript'));
                } catch (e) {
                    console.error('Error contacting voice assistant:', e);
                }
            });
        }

        window.addEventListener('scroll', handleNavScroll, { passive: true });
        handleNavScroll();

        requestAnimationFrame(animate);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
