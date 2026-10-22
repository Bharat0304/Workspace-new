
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


    

    

    {/*  ========== SECTION 01: HERO ==========  */}
    <section className="hero" id="hero" ref={heroRef}>
        <div className="text-layer background-layer">
            <span className="bg-text">WORK</span>
        </div>
        <div className="text-layer foreground-layer">
            <span className="fg-letter">S</span>
            <span className="fg-letter">P</span>
            <span className="fg-letter bulb-placeholder" id="bulbSlot">
                <span className="bulb-wrapper" id="bulbWrapper" ref={bulbWrapperRef}>
                    <canvas id="bulbCanvas" ref={bulbCanvasRef}></canvas>
                    <div className="bulb-glow-aura"></div>
                    <div className="bulb-glow-aura aura-2"></div>
                    <div className="bulb-particle-field" id="particleField" ref={particleFieldRef}></div>
                </span>
            </span>
            <span className="fg-letter">C</span>
            <span className="fg-letter">E</span>
        </div>
        <div className="ambient-glow"></div>
    </section>

    {/*  Student image  */}
    <section className="student-section" id="studentSection">
        <canvas id="studentCanvas" ref={studentCanvasRef}></canvas>
        <div className="hero-tagline">
            <p className="tagline-text">The AI that trains your brain like a gym trains your body.</p>
            <div className="hero-ctas">
                <a href="#pricing" className="btn-amber btn-lg">Start for Free</a>
                <a href="#mechanism" className="btn-ghost-outline btn-lg">Watch How It Works</a>
            </div>
        </div>
        <div className="scroll-indicator" id="scrollIndicator">
            <span>↓ SCROLL</span>
        </div>
    </section>

    {/*  ========== SECTION 02: THE PROBLEM ==========  */}
    <section className="section" id="problem">
        <div className="section-inner">
            <span className="section-label">01 / THE PROBLEM</span>
            <h2 className="section-headline">Willpower alone doesn't build study habits.<br/><span className="text-amber">Systems do.</span></h2>
            <p className="section-sub">Students preparing for JEE, NEET, UPSC, and other high-stakes exams don't fail because they're not smart. They fail because their environment fights against them. WorkSpace fixes the environment.</p>
            <div className="pain-grid">
                <div className="pain-item">
                    <span className="pain-number">01</span>
                    <h3 className="pain-label">Distraction Wins</h3>
                    <p className="pain-desc">Your phone, your browser, your environment — everything is designed to pull you away from deep work.</p>
                </div>
                <div className="pain-item">
                    <span className="pain-number">02</span>
                    <h3 className="pain-label">No Structure</h3>
                    <p className="pain-desc">Without a system, you study what feels easy — not what moves the needle. Planning takes energy you don't have.</p>
                </div>
                <div className="pain-item">
                    <span className="pain-number">03</span>
                    <h3 className="pain-label">No Feedback Loop</h3>
                    <p className="pain-desc">You have no idea if today was productive. No data, no trends, no course-correction until it's too late.</p>
                </div>
            </div>
        </div>
    </section>

    {/*  ========== SECTION 03: HOW IT WORKS ==========  */}
    <section className="section" id="mechanism">
        <div className="section-inner">
            <span className="section-label">02 / THE SYSTEM</span>
            <h2 className="section-headline">A closed-loop cognitive engine —<br/>not just a timer.</h2>
            <div className="loop-flow" id="loopFlow">
                <div className="loop-node">BASELINE</div>
                <span className="loop-arrow">→</span>
                <div className="loop-node">SCHEDULE</div>
                <span className="loop-arrow">→</span>
                <div className="loop-node">FOCUS BLOCK</div>
                <span className="loop-arrow">→</span>
                <div className="loop-node">MONITOR</div>
                <span className="loop-arrow">→</span>
                <div className="loop-node">DETECT</div>
                <span className="loop-arrow">→</span>
                <div className="loop-node">REFLECT</div>
                <span className="loop-arrow">→</span>
                <div className="loop-node">COMPLETE</div>
                <span className="loop-arrow">→</span>
                <div className="loop-node">ANALYTICS</div>
                <span className="loop-arrow">→</span>
                <div className="loop-node">OVERLOAD</div>
                <span className="loop-arrow loop-repeat">↻</span>
            </div>
            <p className="section-sub loop-explain">WorkSpace doesn't just block distractions — it builds a continuous feedback loop around your entire study session. Every action is measured, every resistance is catalogued, every session makes the next one smarter.</p>
        </div>
    </section>

    {/*  ========== SECTION 04: FEATURES ==========  */}
    <section className="section" id="features">
        <div className="section-inner">
            <span className="section-label">03 / FEATURES</span>
            <h2 className="section-headline">Every layer works together.</h2>

            <div className="feature-row">
                <div className="feature-text">
                    <h3 className="feature-title">Adaptive Schedule Intelligence</h3>
                    <p className="feature-desc">AI builds and adjusts your study plan daily based on your cognitive state, resistance patterns, and remaining syllabus. No more manual planning.</p>
                </div>
                <div className="feature-visual">
                    <svg viewBox="0 0 120 80" fill="none" stroke="#D97706" stroke-width="1"><rect x="10" y="10" width="100" height="60" rx="4"/><line x1="10" y1="30" x2="110" y2="30"/><line x1="40" y1="10" x2="40" y2="70"/><circle cx="55" cy="45" r="3" fill="#D97706"/><circle cx="70" cy="40" r="3" fill="#D97706"/><circle cx="85" cy="50" r="3" fill="#D97706"/><path d="M55 45 L70 40 L85 50" stroke-width="1.5"/></svg>
                </div>
            </div>

            <div className="feature-row reverse">
                <div className="feature-text">
                    <h3 className="feature-title">Progressive Cognitive Overload</h3>
                    <p className="feature-desc">Like a gym, your brain's capacity is trained incrementally. Each week pushes you slightly beyond your comfort zone — then recovers.</p>
                </div>
                <div className="feature-visual">
                    <svg viewBox="0 0 120 80" fill="none" stroke="#D97706" stroke-width="1"><path d="M15 65 Q30 55 40 50 Q50 45 60 35 Q70 25 80 20 Q90 15 105 15" stroke-width="2"/><line x1="15" y1="15" x2="15" y2="65"/><line x1="15" y1="65" x2="105" y2="65"/><circle cx="40" cy="50" r="2.5" fill="#D97706"/><circle cx="60" cy="35" r="2.5" fill="#D97706"/><circle cx="80" cy="20" r="2.5" fill="#D97706"/></svg>
                </div>
            </div>

            <div className="feature-row">
                <div className="feature-text">
                    <h3 className="feature-title">Resistance Reflection Engine</h3>
                    <p className="feature-desc">When you resist studying, WorkSpace doesn't punish you. It asks why — then adapts. Every friction point becomes a data point for improvement.</p>
                </div>
                <div className="feature-visual">
                    <svg viewBox="0 0 120 80" fill="none" stroke="#D97706" stroke-width="1"><circle cx="60" cy="35" r="20"/><path d="M52 30 Q60 20 68 30" stroke-width="1.5"/><circle cx="53" cy="33" r="2" fill="#D97706"/><circle cx="67" cy="33" r="2" fill="#D97706"/><path d="M50 42 Q60 48 70 42" stroke-width="1.5"/><line x1="60" y1="55" x2="45" y2="70"/><line x1="60" y1="55" x2="75" y2="70"/></svg>
                </div>
            </div>

            <div className="feature-row reverse">
                <div className="feature-text">
                    <h3 className="feature-title">Environment Control</h3>
                    <p className="feature-desc">Tabs redirect, distractions are blocked, focus is restored automatically. Your digital environment becomes an ally, not an enemy.</p>
                </div>
                <div className="feature-visual">
                    <svg viewBox="0 0 120 80" fill="none" stroke="#D97706" stroke-width="1"><rect x="25" y="15" width="70" height="45" rx="3"/><line x1="25" y1="25" x2="95" y2="25"/><circle cx="32" cy="20" r="2"/><circle cx="40" cy="20" r="2"/><circle cx="48" cy="20" r="2"/><line x1="45" y1="38" x2="75" y2="38" stroke-width="2"/><path d="M55 48 L60 53 L70 43" stroke-width="2"/><rect x="40" y="62" width="40" height="6" rx="3"/></svg>
                </div>
            </div>

            <div className="feature-row">
                <div className="feature-text">
                    <h3 className="feature-title">Adaptive Strictness</h3>
                    <p className="feature-desc">Enforcement level adjusts to your emotional and behavioral state. Feeling strong? Locks tighten. Struggling? It eases up and supports.</p>
                </div>
                <div className="feature-visual">
                    <svg viewBox="0 0 120 80" fill="none" stroke="#D97706" stroke-width="1"><rect x="30" y="25" width="15" height="40" rx="2"/><rect x="52" y="15" width="15" height="50" rx="2"/><rect x="74" y="32" width="15" height="33" rx="2"/><line x1="37" y1="38" x2="37" y2="58" stroke-width="3" stroke="#D97706" opacity="0.4"/><line x1="59" y1="22" x2="59" y2="58" stroke-width="3" stroke="#D97706" opacity="0.6"/><line x1="81" y1="40" x2="81" y2="58" stroke-width="3" stroke="#D97706" opacity="0.3"/></svg>
                </div>
            </div>

            <div className="feature-row reverse">
                <div className="feature-text">
                    <h3 className="feature-title">Deep Analytics Dashboard</h3>
                    <p className="feature-desc">Every session quantified: focus percentage, compliance score, growth curve. See your brain getting stronger — week over week.</p>
                </div>
                <div className="feature-visual">
                    <svg viewBox="0 0 120 80" fill="none" stroke="#D97706" stroke-width="1"><polyline points="15,60 30,50 45,55 60,35 75,30 90,20 105,15" stroke-width="2"/><circle cx="60" cy="35" r="3" fill="#D97706"/><circle cx="90" cy="20" r="3" fill="#D97706"/><line x1="15" y1="15" x2="15" y2="65"/><line x1="15" y1="65" x2="110" y2="65"/><text x="20" y="74" font-size="6" fill="#555">W1</text><text x="55" y="74" font-size="6" fill="#555">W2</text><text x="90" y="74" font-size="6" fill="#555">W3</text></svg>
                </div>
            </div>
        </div>
    </section>

    {/*  ========== SECTION 05: THE OVERLOAD PRINCIPLE ==========  */}
    <section className="section" id="science">
        <div className="section-inner">
            <span className="section-label">04 / THE SCIENCE</span>
            <h2 className="section-headline">Your brain responds to load the same way<br/><span className="text-amber">muscle does.</span></h2>
            <div className="science-split">
                <div className="science-chart">
                    <div className="chart-y-label">CAPACITY</div>
                    <div className="chart-area" id="overloadChart">
                        <svg viewBox="0 0 300 150" fill="none" preserveAspectRatio="none">
                            <line x1="0" y1="145" x2="300" y2="145" stroke="#1C1C1C" stroke-width="1"/>
                            <line x1="0" y1="110" x2="300" y2="110" stroke="#111" stroke-width="0.5" stroke-dasharray="4"/>
                            <line x1="0" y1="75" x2="300" y2="75" stroke="#111" stroke-width="0.5" stroke-dasharray="4"/>
                            <line x1="0" y1="40" x2="300" y2="40" stroke="#111" stroke-width="0.5" stroke-dasharray="4"/>
                            <path d="M0 120 Q30 120 50 110 Q70 100 90 95 Q110 105 130 90 Q150 80 170 75 Q190 85 210 70 Q230 60 250 55 Q270 65 290 50 L300 45" stroke="#D97706" stroke-width="2.5" fill="none"/>
                            <text x="10" y="158" font-size="9" fill="#555" font-family="DM Mono">Day 1</text>
                            <text x="140" y="158" font-size="9" fill="#555" font-family="DM Mono">Day 15</text>
                            <text x="265" y="158" font-size="9" fill="#555" font-family="DM Mono">Day 30</text>
                        </svg>
                    </div>
                </div>
                <div className="science-steps">
                    <div className="science-step">
                        <span className="step-num">01</span>
                        <h4>Establish Baseline</h4>
                        <p>Measure your current focus capacity, tolerance, and natural study rhythms.</p>
                    </div>
                    <div className="science-step">
                        <span className="step-num">02</span>
                        <h4>Apply Incremental Load</h4>
                        <p>Push study time and depth slightly beyond your current threshold each cycle.</p>
                    </div>
                    <div className="science-step">
                        <span className="step-num">03</span>
                        <h4>Detect Fatigue, Reduce Load</h4>
                        <p>When cognitive fatigue is detected, the system backs off — preventing burnout.</p>
                    </div>
                    <div className="science-step">
                        <span className="step-num">04</span>
                        <h4>Introduce Recovery — Then Push Again</h4>
                        <p>After recovery, the next cycle begins at a slightly higher baseline than before.</p>
                    </div>
                </div>
            </div>
        </div>
    </section>

    {/*  ========== SECTION 06: RESISTANCE REFLECTION ==========  */}
    <section className="section" id="psychology">
        <div className="section-inner">
            <span className="section-label">05 / PSYCHOLOGY</span>
            <h2 className="section-headline">When you want to quit, it doesn't punish you.<br/><span className="text-amber">It asks you.</span></h2>
            <div className="reflection-mockup">
                <div className="mockup-window">
                    <div className="mockup-header">
                        <span className="mockup-dot"></span>
                        <span className="mockup-dot"></span>
                        <span className="mockup-dot"></span>
                        <span className="mockup-title">WorkSpace — Focus Interrupted</span>
                    </div>
                    <div className="mockup-body">
                        <p className="mockup-question">What's going on right now?</p>
                        <div className="mockup-options">
                            <button className="mockup-btn">I'm tired</button>
                            <button className="mockup-btn">I'm bored</button>
                            <button className="mockup-btn">I don't get it</button>
                            <button className="mockup-btn">Short break</button>
                        </div>
                    </div>
                </div>
            </div>
            <p className="section-sub reflection-copy">Each response adapts what happens next. WorkSpace learns your resistance patterns over time and adjusts before they escalate.</p>
        </div>
    </section>

    {/*  ========== SECTION 07: ANALYTICS PREVIEW ==========  */}
    <section className="section" id="analytics">
        <div className="section-inner">
            <span className="section-label">06 / ANALYTICS</span>
            <h2 className="section-headline">Every session quantified.<br/>Every week compared.</h2>
            <div className="dashboard-preview">
                <div className="dash-sidebar">
                    <div className="dash-metric">
                        <span className="dash-metric-value">4h 32m</span>
                        <span className="dash-metric-label">Daily Study Time</span>
                    </div>
                    <div className="dash-metric">
                        <span className="dash-metric-value">87%</span>
                        <span className="dash-metric-label">Focus Score</span>
                    </div>
                    <div className="dash-metric">
                        <span className="dash-metric-value">92%</span>
                        <span className="dash-metric-label">Compliance</span>
                    </div>
                    <div className="dash-metric">
                        <span className="dash-metric-value">3</span>
                        <span className="dash-metric-label">Distraction Attempts</span>
                    </div>
                </div>
                <div className="dash-main">
                    <div className="dash-chart-title">Cognitive Growth — 30 Day View</div>
                    <svg className="dash-chart" viewBox="0 0 400 120" fill="none" preserveAspectRatio="none">
                        <line x1="0" y1="115" x2="400" y2="115" stroke="#1C1C1C"/>
                        <line x1="0" y1="85" x2="400" y2="85" stroke="#111" stroke-dasharray="3"/>
                        <line x1="0" y1="55" x2="400" y2="55" stroke="#111" stroke-dasharray="3"/>
                        <line x1="0" y1="25" x2="400" y2="25" stroke="#111" stroke-dasharray="3"/>
                        <path d="M0 100 Q20 95 40 90 Q60 92 80 85 Q100 80 120 78 Q140 82 160 72 Q180 68 200 62 Q220 65 240 55 Q260 50 280 45 Q300 48 320 38 Q340 32 360 28 Q380 25 400 20" stroke="#D97706" stroke-width="2" fill="none"/>
                        <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#D97706" stop-opacity="0.15"/><stop offset="100%" stop-color="#D97706" stop-opacity="0"/></linearGradient>
                        <path d="M0 100 Q20 95 40 90 Q60 92 80 85 Q100 80 120 78 Q140 82 160 72 Q180 68 200 62 Q220 65 240 55 Q260 50 280 45 Q300 48 320 38 Q340 32 360 28 Q380 25 400 20 L400 115 L0 115 Z" fill="url(#chartGrad)"/>
                    </svg>
                    <div className="dash-bottom-row">
                        <div className="dash-mini"><span className="mini-label">Resistance</span><span className="mini-val">Low</span></div>
                        <div className="dash-mini"><span className="mini-label">Fatigue</span><span className="mini-val">Moderate</span></div>
                        <div className="dash-mini"><span className="mini-label">Strictness</span><span className="mini-val">Level 4</span></div>
                        <div className="dash-mini"><span className="mini-label">Overload</span><span className="mini-val">Phase 2</span></div>
                    </div>
                </div>
            </div>
            <p className="dash-note">Available on all devices. Syncs across sessions. All processed locally.</p>
        </div>
    </section>

    {/*  ========== SECTION 08: SOCIAL PROOF ==========  */}
    <section className="section" id="proof">
        <div className="section-inner">
            <span className="section-label">07 / EARLY RESULTS</span>
            <h2 className="section-headline">Built with and for<br/><span className="text-amber">serious exam aspirants.</span></h2>
            <div className="stats-row">
                <div className="stat-block">
                    <span className="stat-number">4.2 HRS</span>
                    <span className="stat-label">Avg daily focus gained in 30 days</span>
                </div>
                <div className="stat-block">
                    <span className="stat-number">3.1×</span>
                    <span className="stat-label">Focus streak improvement</span>
                </div>
                <div className="stat-block">
                    <span className="stat-number">89%</span>
                    <span className="stat-label">Compliance rate by week 3</span>
                </div>
            </div>
            <div className="testimonials">
                <div className="testimonial">
                    <p className="testimonial-text">"I went from 2 hours of scattered study to 5+ hours of deep work. WorkSpace didn't just help me focus — it rewired my entire routine."</p>
                    <div className="testimonial-author">
                        <span className="author-name">Arjun M.</span>
                        <span className="author-role">JEE 2025 Aspirant</span>
                    </div>
                </div>
                <div className="testimonial-sep"></div>
                <div className="testimonial">
                    <p className="testimonial-text">"The reflection prompts changed everything. Instead of feeling guilty when I lost focus, WorkSpace turned those moments into insights."</p>
                    <div className="testimonial-author">
                        <span className="author-name">Priya S.</span>
                        <span className="author-role">NEET 2025 Aspirant</span>
                    </div>
                </div>
                <div className="testimonial-sep"></div>
                <div className="testimonial">
                    <p className="testimonial-text">"The overload principle is real. Week 3 I was doing 6 hours without even noticing. My brain adapted because WorkSpace pushed it correctly."</p>
                    <div className="testimonial-author">
                        <span className="author-name">Rahul K.</span>
                        <span className="author-role">UPSC 2026 Aspirant</span>
                    </div>
                </div>
            </div>
        </div>
    </section>

    {/*  ========== SECTION 09: PRICING / WAITLIST ==========  */}
    <section className="section" id="pricing">
        <div className="section-inner">
            <span className="section-label">08 / ACCESS</span>
            <h2 className="section-headline">Join the waitlist.<br/><span className="text-amber">Get early access.</span></h2>
            <div className="waitlist-block">
                <p className="waitlist-note">WorkSpace is in closed beta.</p>
                <form className="waitlist-form" id="waitlistForm">
                    <input type="email" className="waitlist-input" id="waitlistEmail" placeholder="your@email.com" required/>
                    <button type="submit" className="btn-amber btn-lg">Claim Your Spot</button>
                </form>
                <p className="waitlist-disclaimer">No spam. No payment required. You'll be notified when your access opens.</p>
            </div>
        </div>
    </section>

    {/*  ========== SECTION 10: FAQ ==========  */}
    <section className="section" id="faq">
        <div className="section-inner">
            <span className="section-label">09 / QUESTIONS</span>
            <h2 className="section-headline">Common questions.</h2>
            <div className="faq-list" id="faqList">
                <div className="faq-item">
                    <button className="faq-question"><span>Is WorkSpace a browser extension or an app?</span><span className="faq-toggle">+</span></button>
                    <div className="faq-answer"><p>WorkSpace runs as a browser extension with a companion web dashboard. The extension monitors and controls your study environment, while the dashboard provides analytics and scheduling.</p></div>
                </div>
                <div className="faq-item">
                    <button className="faq-question"><span>How does it monitor my activity without violating my privacy?</span><span className="faq-toggle">+</span></button>
                    <div className="faq-answer"><p>All processing happens locally on your device. WorkSpace only tracks which domains you visit during focus sessions — never your content. No data is sent to external servers without your explicit consent.</p></div>
                </div>
                <div className="faq-item">
                    <button className="faq-question"><span>Can I override focus locks in emergencies?</span><span className="faq-toggle">+</span></button>
                    <div className="faq-answer"><p>Yes. WorkSpace includes an emergency override — but it requires a reflection prompt first. This creates a friction buffer that prevents impulsive exits while allowing genuine emergencies through.</p></div>
                </div>
                <div className="faq-item">
                    <button className="faq-question"><span>What exams is WorkSpace designed for?</span><span className="faq-toggle">+</span></button>
                    <div className="faq-answer"><p>WorkSpace is exam-agnostic. It's built for any high-stakes preparation — JEE, NEET, UPSC, GATE, CAT, GRE, and more. The AI adapts to your specific study patterns regardless of the subject.</p></div>
                </div>
                <div className="faq-item">
                    <button className="faq-question"><span>Does it work offline?</span><span className="faq-toggle">+</span></button>
                    <div className="faq-answer"><p>Core focus tracking and environment control work offline. Analytics sync and AI schedule adjustments require a connection, but your session data is cached and uploaded when you reconnect.</p></div>
                </div>
                <div className="faq-item">
                    <button className="faq-question"><span>How is this different from Forest or Cold Turkey?</span><span className="faq-toggle">+</span></button>
                    <div className="faq-answer"><p>Those tools block distractions. WorkSpace builds an entire cognitive training system: adaptive scheduling, progressive overload, resistance psychology, and deep analytics. Blocking is just one layer of many.</p></div>
                </div>
            </div>
        </div>
    </section>

    {/*  ========== SECTION 11: FINAL CTA ==========  */}
    <section className="section final-cta" id="finalCta">
        <div className="final-cta-inner">
            <h2 className="final-headline">TRAIN YOUR<br/>BRAIN.</h2>
            <div className="final-bulb-glow"></div>
            <p className="final-sub">WorkSpace doesn't ask you to try harder.<br/>It builds the system that makes trying easier.</p>
            <a href="#pricing" className="btn-amber btn-xl">Begin Your Baseline</a>
        </div>
    </section>

    {/*  ========== SECTION 12: FOOTER ==========  */}
    <footer className="footer" id="footer">
        <div className="footer-inner">
            <div className="footer-col">
                <span className="footer-logo">WORK<svg className="logo-bulb" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 21h6M12 3a6 6 0 0 0-4 10.5V17h8v-3.5A6 6 0 0 0 12 3z"/></svg>SPACE</span>
                <p className="footer-tagline">The AI that trains your brain.</p>
            </div>
            <div className="footer-col">
                <a href="#features" className="footer-link">Features</a>
                <a href="#mechanism" className="footer-link">How It Works</a>
                <a href="#faq" className="footer-link">FAQ</a>
                <a href="#" className="footer-link">Privacy</a>
                <a href="#" className="footer-link">Terms</a>
            </div>
            <div className="footer-col">
                <a href="#" className="footer-link">Twitter / X</a>
                <a href="#" className="footer-link">Instagram</a>
                <a href="#" className="footer-link">LinkedIn</a>
                <p className="footer-built">Built for serious students.</p>
            </div>
        </div>
        <div className="footer-bottom">
            <span>© 2025 WorkSpace. All rights reserved.</span>
        </div>
    </footer>

    <script src="main.js"></script>

        </div>
    );
};

export default Landing;
