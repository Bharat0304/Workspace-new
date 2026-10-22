import re
import os

with open('../frontend/index.html', 'r') as f:
    html = f.read()

# Extract body content
body_match = re.search(r'<body>(.*?)</body>', html, re.DOTALL | re.IGNORECASE)
body = body_match.group(1) if body_match else html

# Remove navbar and overlay
body = re.sub(r'<!-- ========== NAVBAR ========== -->.*?</nav>', '', body, flags=re.DOTALL)
body = re.sub(r'<!-- Mobile overlay -->.*?</div>', '', body, flags=re.DOTALL)

# Convert class to className
body = body.replace('class=', 'className=')
body = body.replace('for=', 'htmlFor=')

# Self-close tags
body = re.sub(r'<img(.*?)(?<!/)>', r'<img\1/>', body)
body = re.sub(r'<input(.*?)(?<!/)>', r'<input\1/>', body)
body = re.sub(r'<hr(.*?)(?<!/)>', r'<hr\1/>', body)
body = re.sub(r'<br(.*?)(?<!/)>', r'<br\1/>', body)

# Replace inline styles
body = body.replace('style="overflow: hidden;"', "style={{ overflow: 'hidden' }}")

# Fix refs
body = body.replace('id="hero"', 'id="hero" ref={heroRef}')
body = body.replace('id="bulbWrapper"', 'id="bulbWrapper" ref={bulbWrapperRef}')
body = body.replace('id="bulbCanvas"', 'id="bulbCanvas" ref={bulbCanvasRef}')
body = body.replace('id="studentCanvas"', 'id="studentCanvas" ref={studentCanvasRef}')
body = body.replace('id="particleField"', 'id="particleField" ref={particleFieldRef}')

# Update image src
body = body.replace('src="images/', 'src="/images/')

# HTML comments
body = re.sub(r'<!--(.*?)-->', r'{/* \1 */}', body)

js_logic = """
import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

const Landing = () => {
    const heroRef = useRef(null);
    const bulbWrapperRef = useRef(null);
    const bulbCanvasRef = useRef(null);
    const studentCanvasRef = useRef(null);
    const particleFieldRef = useRef(null);
    
    useEffect(() => {
        const hero = heroRef.current;
        const bulbWrapper = bulbWrapperRef.current;
        const bulbCanvas = bulbCanvasRef.current;
        const studentCanvas = studentCanvasRef.current;
        const particleField = particleFieldRef.current;
        
        const bulbCtx = bulbCanvas ? bulbCanvas.getContext('2d', { willReadFrequently: true }) : null;
        const studentCtx = studentCanvas ? studentCanvas.getContext('2d', { willReadFrequently: true }) : null;

        const BULB_MOVE = 12;
        const PARTICLES = 22;

        let mouseX = 0, mouseY = 0, tMouseX = 0, tMouseY = 0, time = 0;
        let animationFrameId;

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
                    const br = (px[i] + px[i+1] + px[i+2]) / 3;
                    if (br < 35) { px[i+3] = 0; }
                    else if (br < 65) { const f = (br - 35) / 30; px[i+3] = Math.floor(px[i+3] * f * f); }
                    if (px[i+3] > 0) {
                        const g = Math.min(255, br * 1.15);
                        px[i] = g; px[i+1] = g; px[i+2] = g;
                    }
                }
                bulbCtx.putImageData(d, 0, 0);
            };
            img.src = '/bulb.png';
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
                    const r = px[i], g = px[i+1], b = px[i+2];
                    const br = (r + g + b) / 3;
                    const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
                    const sat = mx === 0 ? 0 : (mx - mn) / mx;
                    if (br > 180 && sat < 0.15) { px[i+3] = 0; }
                    else if (br > 140 && sat < 0.2) {
                        px[i+3] = Math.floor(px[i+3] * Math.max(0, Math.min(1, 1 - (br - 140) / 40)));
                    }
                }
                studentCtx.putImageData(d, 0, 0);
            };
            img.src = '/student2.png';
        }

        function createParticles() {
            if (!particleField) return;
            particleField.innerHTML = '';
            for (let i = 0; i < PARTICLES; i++) {
                const p = document.createElement('div');
                p.className = 'particle';
                const a = Math.random() * Math.PI * 2;
                const dist = 35 + Math.random() * 65;
                const s = 1 + Math.random() * 1.5;
                p.style.cssText = `left:calc(50% + ${(Math.random()-.5)*50}px);top:calc(50% + ${(Math.random()-.5)*50}px);width:${s}px;height:${s}px;--tx:${Math.cos(a)*dist}px;--ty:${Math.sin(a)*dist}px;--duration:${2.5+Math.random()*3.5}s;--delay:${Math.random()*5}s;box-shadow:0 0 ${s*2.5}px rgba(255,255,255,0.4);`;
                particleField.appendChild(p);
            }
        }

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

        function render(t) {
            time = t;
            updateBulb();
            animationFrameId = requestAnimationFrame(render);
        }
        
        loadBulb();
        loadStudent();
        createParticles();

        window.addEventListener('mousemove', onMouseMove);
        animationFrameId = requestAnimationFrame(render);

        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <div className="landing-page-container">
"""

jsx = js_logic + body + """
        </div>
    );
};

export default Landing;
"""

with open('src/pages/Landing.jsx', 'w') as f:
    f.write(jsx)

print("Created Landing.jsx")
