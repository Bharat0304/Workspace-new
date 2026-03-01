/* ============================================
   WORKSPACE — Analytics Page JavaScript
   Frame-by-Frame Face Rotation + Chart Animation
   ============================================ */

(function () {
    'use strict';

    // === DOM ===
    const navbar = document.getElementById('navbar');
    const hamburger = document.getElementById('hamburger');
    const mobileOverlay = document.getElementById('mobileOverlay');
    const heroParticles = document.getElementById('heroParticles');

    // ============================================
    // HERO PARTICLES
    // ============================================
    function createHeroParticles() {
        if (!heroParticles) return;
        const COUNT = 30;
        for (let i = 0; i < COUNT; i++) {
            const p = document.createElement('div');
            p.className = 'hero-particle';
            const x = Math.random() * 100;
            const y = Math.random() * 100;
            const s = 1 + Math.random() * 2;
            p.style.cssText = `
                left: ${x}%;
                top: ${y}%;
                width: ${s}px;
                height: ${s}px;
                --ty: ${-30 - Math.random() * 60}px;
                --duration: ${3 + Math.random() * 5}s;
                --delay: ${Math.random() * 6}s;
                box-shadow: 0 0 ${s * 2}px rgba(255,255,255,0.25);
            `;
            heroParticles.appendChild(p);
        }
    }

    // ============================================
    // FRAME-BY-FRAME FACE ROTATION
    // ============================================
    function initFaceFrames() {
        var faceImg = document.getElementById('faceFrame');
        var faceContainer = document.getElementById('faceContainer');
        if (!faceImg || !faceContainer) return;

        // --- Frame paths ---
        // Left rotation: 38 frames (neutral → left)
        // Right rotation: 47 frames (neutral → right)
        var LEFT_COUNT = 38;
        var RIGHT_COUNT = 47;

        var leftFrames = [];
        var rightFrames = [];

        // Build frame path arrays
        for (var i = 1; i <= LEFT_COUNT; i++) {
            var num = i < 10 ? '00' + i : '0' + i;
            leftFrames.push('left/ezgif-frame-' + num + '.jpg');
        }

        // Right starts at 002
        for (var j = 2; j <= RIGHT_COUNT + 1; j++) {
            var num2 = j < 10 ? '00' + j : '0' + j;
            rightFrames.push('right/ezgif-frame-' + num2 + '.jpg');
        }

        // --- Preload all frames for smooth playback ---
        var preloadedLeft = [];
        var preloadedRight = [];

        leftFrames.forEach(function (src) {
            var img = new Image();
            img.src = src;
            preloadedLeft.push(img);
        });

        rightFrames.forEach(function (src) {
            var img = new Image();
            img.src = src;
            preloadedRight.push(img);
        });

        // --- State ---
        // frameIndex: 0 = neutral (center)
        // Positive values = right rotation (1 to RIGHT_COUNT)
        // Negative values = left rotation (-1 to -LEFT_COUNT)
        var frameIndex = 0;
        var mouseNearFace = false;

        // --- Mouse proximity detection ---
        document.addEventListener('mousemove', function (e) {
            var rect = faceContainer.getBoundingClientRect();
            var pad = 120;
            mouseNearFace = (
                e.clientX >= rect.left - pad &&
                e.clientX <= rect.right + pad &&
                e.clientY >= rect.top - pad &&
                e.clientY <= rect.bottom + pad
            );
        }, { passive: true });

        // --- Scroll wheel handler ---
        // Scroll UP  →  rotate to RIGHT (positive frameIndex)
        // Scroll DOWN → rotate to LEFT  (negative frameIndex)
        document.addEventListener('wheel', function (e) {
            if (!mouseNearFace) return;

            e.preventDefault();

            // Determine scroll direction and step
            var step = 0;
            if (e.deltaY < 0) {
                // Scroll UP → go towards right
                step = 1;
            } else if (e.deltaY > 0) {
                // Scroll DOWN → go towards left
                step = -1;
            }

            // Update frame index with clamping
            var newIndex = frameIndex + step;
            newIndex = Math.max(-LEFT_COUNT + 1, Math.min(RIGHT_COUNT - 1, newIndex));

            if (newIndex !== frameIndex) {
                frameIndex = newIndex;
                updateFrame();
            }
        }, { passive: false });

        // --- Touch support ---
        var lastTouchY = null;
        var touchAccum = 0;

        faceContainer.addEventListener('touchstart', function (e) {
            lastTouchY = e.touches[0].clientY;
            touchAccum = 0;
        }, { passive: true });

        faceContainer.addEventListener('touchmove', function (e) {
            if (lastTouchY === null) return;
            var dy = lastTouchY - e.touches[0].clientY;
            lastTouchY = e.touches[0].clientY;
            touchAccum += dy;

            // Every 8px of touch movement = 1 frame step
            var steps = Math.floor(touchAccum / 8);
            if (steps !== 0) {
                touchAccum -= steps * 8;
                var newIndex = frameIndex + steps;
                newIndex = Math.max(-LEFT_COUNT + 1, Math.min(RIGHT_COUNT - 1, newIndex));
                if (newIndex !== frameIndex) {
                    frameIndex = newIndex;
                    updateFrame();
                }
            }
        }, { passive: true });

        faceContainer.addEventListener('touchend', function () {
            lastTouchY = null;
            touchAccum = 0;
        });

        // --- Update displayed frame ---
        function updateFrame() {
            var src;
            if (frameIndex === 0) {
                // Neutral frame (first frame of left set)
                src = leftFrames[0];
            } else if (frameIndex < 0) {
                // Left rotation: index -1 maps to leftFrames[1], -2 to [2], etc.
                var leftIdx = Math.abs(frameIndex);
                if (leftIdx < leftFrames.length) {
                    src = leftFrames[leftIdx];
                }
            } else {
                // Right rotation: index 1 maps to rightFrames[0], 2 to [1], etc.
                var rightIdx = frameIndex - 1;
                if (rightIdx < rightFrames.length) {
                    src = rightFrames[rightIdx];
                }
            }

            if (src && faceImg.src.indexOf(src) === -1) {
                faceImg.src = src;
            }
        }

        // Start at neutral
        updateFrame();
    }

    // ============================================
    // CHART BAR ANIMATION
    // ============================================
    function animateChartBars() {
        var chartArea = document.getElementById('chartArea');
        if (!chartArea) return;

        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    // Animate each bar group with stagger
                    var groups = chartArea.querySelectorAll('.chart-bar-group');
                    groups.forEach(function (group, i) {
                        setTimeout(function () {
                            group.classList.add('animated');
                        }, i * 200);
                    });

                    // Animate trend curve after bars
                    setTimeout(function () {
                        chartArea.classList.add('animated');
                    }, groups.length * 200 + 300);

                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.3 });

        observer.observe(chartArea);
    }

    // ============================================
    // NAVBAR
    // ============================================
    function handleNavScroll() {
        if (!navbar) return;
        if (window.scrollY > 50) {
            navbar.style.borderBottomColor = 'var(--border)';
        } else {
            navbar.style.borderBottomColor = 'transparent';
        }
    }

    // ============================================
    // MOBILE MENU
    // ============================================
    function toggleMobile() {
        if (!hamburger || !mobileOverlay) return;
        hamburger.classList.toggle('active');
        mobileOverlay.classList.toggle('active');
        document.body.style.overflow = mobileOverlay.classList.contains('active') ? 'hidden' : '';
    }

    // ============================================
    // SCROLL REVEAL
    // ============================================
    function setupReveal() {
        var reveals = document.querySelectorAll('.section-inner, .chart-panel, .final-cta-inner');
        reveals.forEach(function (el) { el.classList.add('reveal'); });

        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

        reveals.forEach(function (el) { observer.observe(el); });
    }

    // ============================================
    // SMOOTH SCROLL
    // ============================================
    function setupSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(function (link) {
            link.addEventListener('click', function (e) {
                var target = document.querySelector(link.getAttribute('href'));
                if (target) {
                    e.preventDefault();
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    if (mobileOverlay && mobileOverlay.classList.contains('active')) {
                        toggleMobile();
                    }
                }
            });
        });
    }

    // ============================================
    // FACE AND SCREEN ANALYSIS DATA
    // ============================================
    function initAnalysisData() {
        // Hardcoded face analysis data
        const faceData = {
            facePresent: true,
            gazeDirection: "Center",
            headTilt: 2.3,
            blinkRate: 0.8,
            emotion: "Focused",
            attention: 85
        };

        // Hardcoded screen analysis data
        const screenData = {
            activity: "CODING",
            distractionScore: 15.2,
            textDensity: 72,
            codeDetected: true,
            contentType: "Development",
            focusTime: 45,
            breakTime: 8,
            efficiency: 89
        };

        // Update face analysis display
        updateFaceDisplay(faceData);
        
        // Update screen analysis display
        updateScreenDisplay(screenData);

        // Simulate real-time updates
        setInterval(() => {
            simulateDataUpdate(faceData, screenData);
        }, 3000);
    }

    function updateFaceDisplay(data) {
        const facePresentEl = document.getElementById('facePresent');
        const gazeDirectionEl = document.getElementById('gazeDirection');
        const headTiltEl = document.getElementById('headTilt');
        const blinkRateEl = document.getElementById('blinkRate');
        
        if (facePresentEl) facePresentEl.textContent = data.facePresent ? "Yes" : "No";
        if (gazeDirectionEl) gazeDirectionEl.textContent = data.gazeDirection;
        if (headTiltEl) headTiltEl.textContent = data.headTilt.toFixed(1);
        if (blinkRateEl) blinkRateEl.textContent = data.blinkRate.toFixed(1);
    }

    function updateScreenDisplay(data) {
        const contentTypeEl = document.getElementById('contentType');
        const distractionScoreEl = document.getElementById('distractionScore');
        const textDensityEl = document.getElementById('textDensity');
        const codeDetectedEl = document.getElementById('codeDetected');
        const focusTimeEl = document.getElementById('focusTime');
        const breakTimeEl = document.getElementById('breakTime');
        const efficiencyEl = document.getElementById('efficiency');
        
        if (contentTypeEl) contentTypeEl.textContent = data.contentType;
        if (distractionScoreEl) distractionScoreEl.textContent = data.distractionScore.toFixed(1);
        if (textDensityEl) textDensityEl.textContent = data.textDensity;
        if (codeDetectedEl) codeDetectedEl.textContent = data.codeDetected ? "Yes" : "No";
        if (focusTimeEl) focusTimeEl.textContent = data.focusTime;
        if (breakTimeEl) breakTimeEl.textContent = data.breakTime;
        if (efficiencyEl) efficiencyEl.textContent = data.efficiency;
    }

    function simulateDataUpdate(faceData, screenData) {
        // Simulate small variations in data
        faceData.headTilt += (Math.random() - 0.5) * 0.5;
        faceData.blinkRate = Math.max(0.5, Math.min(2.0, faceData.blinkRate + (Math.random() - 0.5) * 0.2));
        faceData.attention = Math.max(60, Math.min(100, faceData.attention + (Math.random() - 0.5) * 5));
        
        screenData.distractionScore = Math.max(5, Math.min(50, screenData.distractionScore + (Math.random() - 0.5) * 3));
        screenData.textDensity = Math.max(40, Math.min(95, screenData.textDensity + (Math.random() - 0.5) * 5));
        screenData.efficiency = Math.max(70, Math.min(95, screenData.efficiency + (Math.random() - 0.5) * 2));

        // Randomly change activity
        if (Math.random() < 0.1) {
            const activities = ["CODING", "READING", "BROWSING", "WATCHING"];
            const contentTypes = ["Development", "Documentation", "Research", "Learning"];
            screenData.activity = activities[Math.floor(Math.random() * activities.length)];
            screenData.contentType = contentTypes[Math.floor(Math.random() * contentTypes.length)];
        }

        updateFaceDisplay(faceData);
        updateScreenDisplay(screenData);
    }

    // ============================================
    // INIT
    // ============================================
    function init() {
        createHeroParticles();
        initFaceFrames();
        animateChartBars();
        setupReveal();
        setupSmoothScroll();
        initAnalysisData();

        if (hamburger) hamburger.addEventListener('click', toggleMobile);

        window.addEventListener('scroll', handleNavScroll, { passive: true });
        handleNavScroll();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
