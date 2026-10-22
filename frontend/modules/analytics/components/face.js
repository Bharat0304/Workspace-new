/* ============================================
   ANALYTICS MODULE — 3D Face Rotation Component
   ============================================ */

export function initFaceRotation() {
    const faceImg = document.getElementById('faceFrame');
    const faceContainer = document.getElementById('faceContainer');
    const heroSection = document.getElementById('analyticsHero');
    if (!faceImg || !faceContainer) return;

    const LEFT_COUNT = 38;
    const RIGHT_COUNT = 47;

    const leftFrames = [];
    const rightFrames = [];

    // Build frame path arrays
    // Left frames: ezgif-frame-001.jpg to ezgif-frame-038.jpg
    for (let i = 1; i <= LEFT_COUNT; i++) {
        const num = i < 10 ? '00' + i : '0' + i;
        leftFrames.push('../assets/frames/left/ezgif-frame-' + num + '.jpg');
    }

    // Right frames: ezgif-frame-002.jpg to ezgif-frame-048.jpg
    for (let j = 2; j <= RIGHT_COUNT + 1; j++) {
        const num2 = j < 10 ? '00' + j : '0' + j;
        rightFrames.push('../assets/frames/right/ezgif-frame-' + num2 + '.jpg');
    }

    // Preload all frames for smooth playback
    leftFrames.forEach(src => { const img = new Image(); img.src = src; });
    rightFrames.forEach(src => { const img = new Image(); img.src = src; });

    // === Two-Mode State Machine ===
    let targetFrameIndex = 0;   // Where scroll/scrub want us to be
    let currentFrameIndex = 0;  // Where we actually are
    let isScrolling = false;    // Tracks active interaction
    let scrollTimeout = null;
    let idleAngle = 0;
    
    function updateFrame(index) {
        const clampedIndex = Math.round(index);
        let src;
        if (clampedIndex === 0) {
            src = leftFrames[0];
        } else if (clampedIndex < 0) {
            const leftIdx = Math.abs(clampedIndex);
            src = leftIdx < leftFrames.length ? leftFrames[leftIdx] : leftFrames[leftFrames.length - 1];
        } else {
            const rightIdx = clampedIndex - 1;
            src = rightIdx < rightFrames.length ? rightFrames[rightIdx] : rightFrames[rightFrames.length - 1];
        }

        if (src && faceImg.src.indexOf(src) === -1) {
            faceImg.src = src;
        }
    }

    // Idle constants — tuned for a slow, cinematic full-range sweep
    const IDLE_SPEED     = 0.010;  // ~10.5 sec period at 60fps — slow & smooth
    const IDLE_AMPLITUDE = 28;     // ±28 frames — wide, full visible sweep

    function animationLoop() {
        if (isScrolling) {
            // SCROLL MODE: Fast lerp — chases scroll target quickly
            currentFrameIndex += (targetFrameIndex - currentFrameIndex) * 0.2;
        } else {
            // IDLE MODE: Pure sine wave — no lerp, no damping, full amplitude
            idleAngle += IDLE_SPEED;
            currentFrameIndex = Math.sin(idleAngle) * IDLE_AMPLITUDE;
        }

        updateFrame(currentFrameIndex);
        requestAnimationFrame(animationLoop);
    }

    requestAnimationFrame(animationLoop);

    // Re-sync idle angle from current frame so idle resumes without a jump
    function resumeIdle() {
        const norm = Math.max(-1, Math.min(1, currentFrameIndex / IDLE_AMPLITUDE));
        idleAngle = Math.asin(norm);
        isScrolling = false;
    }

    function onPageScroll() {
        isScrolling = true;
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(resumeIdle, 800); // 800ms after scroll stops → idle

        const scrollY = window.scrollY;
        const heroHeight = heroSection ? heroSection.offsetHeight : window.innerHeight;
        const heroScrollRange = heroHeight * 1.2;
        const progress = Math.min(scrollY / heroScrollRange, 1);

        targetFrameIndex = (1 - progress) * (RIGHT_COUNT - 1) - progress * (LEFT_COUNT - 1);
        currentFrameIndex = targetFrameIndex;
    }
    window.addEventListener('scroll', onPageScroll, { passive: true });
    onPageScroll(); // Set initial frame on page load

    let mouseNearFace = false;
    document.addEventListener('mousemove', (e) => {
        const rect = faceContainer.getBoundingClientRect();
        const pad = 120;
        mouseNearFace = (e.clientX >= rect.left - pad && e.clientX <= rect.right + pad && e.clientY >= rect.top - pad && e.clientY <= rect.bottom + pad);
    }, { passive: true });

    document.addEventListener('wheel', (e) => {
        if (!mouseNearFace) return;
        e.preventDefault();
        isScrolling = true;
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(resumeIdle, 800);

        const step = e.deltaY > 0 ? -2.5 : 2.5;
        targetFrameIndex = Math.max(-(LEFT_COUNT - 1), Math.min(RIGHT_COUNT - 1, targetFrameIndex + step));
        currentFrameIndex = targetFrameIndex;
    }, { passive: false });

    let lastTouchY = null;
    faceContainer.addEventListener('touchstart', (e) => {
        lastTouchY = e.touches[0].clientY;
        isScrolling = true;
    }, { passive: true });

    faceContainer.addEventListener('touchmove', (e) => {
        if (lastTouchY === null) return;
        const dy = lastTouchY - e.touches[0].clientY;
        lastTouchY = e.touches[0].clientY;
        targetFrameIndex = Math.max(-(LEFT_COUNT - 1), Math.min(RIGHT_COUNT - 1, targetFrameIndex + (dy / 2)));
        currentFrameIndex = targetFrameIndex;
    }, { passive: true });

    faceContainer.addEventListener('touchend', () => {
        lastTouchY = null;
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(resumeIdle, 800);
    });
}