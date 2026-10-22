/* ============================================
   DASHBOARD MODULE — 3D Bulb Interaction
   ============================================ */

export function initBulb() {
    const hero = document.getElementById('hero');
    const bulbWrapper = document.getElementById('bulbWrapper');
    const bulbCanvas = document.getElementById('bulbCanvas');
    const particleField = document.getElementById('particleField');

    if (!bulbCanvas) return;
    const bulbCtx = bulbCanvas.getContext('2d');

    const BULB_MOVE = 12;
    const PARTICLES = 22;

    let mouseX = 0, mouseY = 0, tMouseX = 0, tMouseY = 0, time = 0;

    // Load and manipulate bulb image
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = function () {
        bulbCanvas.width = img.width;
        bulbCanvas.height = img.height;
        bulbCtx.drawImage(img, 0, 0);
        const d = bulbCtx.getImageData(0, 0, bulbCanvas.width, bulbCanvas.height);
        const px = d.data;
        for (let i = 0; i < px.length; i += 4) {
            const br = (px[i] + px[i+1] + px[i+2]) / 3;
            if (br < 35) {
                px[i+3] = 0;
            } else if (br < 65) {
                const f = (br - 35) / 30;
                px[i+3] = Math.floor(px[i+3] * f * f);
            }
            if (px[i+3] > 0) {
                const g = Math.min(255, br * 1.15);
                px[i] = g; px[i+1] = g; px[i+2] = g;
            }
        }
        bulbCtx.putImageData(d, 0, 0);
    };
    img.src = 'modules/dashboard/assets/bulb.png';

    // Particle field
    function createParticles() {
        if (!particleField) return;
        particleField.innerHTML = '';
        for (let i = 0; i < PARTICLES; i++) {
            const p = document.createElement('div');
            p.className = 'particle';
            const a = Math.random() * Math.PI * 2;
            const dist = 35 + Math.random() * 65;
            const s = 1 + Math.random() * 1.5;
            p.style.cssText = `
                left: calc(50% + ${(Math.random()-.5)*50}px);
                top: calc(50% + ${(Math.random()-.5)*50}px);
                width: ${s}px;
                height: ${s}px;
                --tx: ${Math.cos(a)*dist}px;
                --ty: ${Math.sin(a)*dist}px;
                --duration: ${2.5+Math.random()*3.5}s;
                --delay: ${Math.random()*5}s;
                box-shadow: 0 0 ${s*2.5}px rgba(255,255,255,0.4);
            `;
            particleField.appendChild(p);
        }
    }

    createParticles();

    // Mouse interaction
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
            bulbWrapper.style.transform = `translateY(${fy}px) translate(${mouseX*BULB_MOVE}px,${mouseY*BULB_MOVE}px)`;
        }
    }

    if (hero) {
        hero.addEventListener('mousemove', onMouseMove, { passive: true });
        hero.addEventListener('touchmove', (e) => { if (e.touches.length) onMouseMove(e.touches[0]); }, { passive: true });
        hero.addEventListener('mouseleave', () => { tMouseX = 0; tMouseY = 0; });
    }

    function animate(ts) {
        time = ts || 0;
        updateBulb();
        requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
}