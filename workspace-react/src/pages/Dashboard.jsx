
import React, { useEffect } from 'react';
import Chart from 'chart.js/auto';

const Dashboard = () => {
    useEffect(() => {
        // Vanilla JS logic ported directly
        const sessionToggle = document.getElementById('sessionToggle');
        const sessionStatus = document.getElementById('sessionStatus');
        const sessionStatusText = document.getElementById('sessionStatusText');
        const sessionPulse = document.getElementById('sessionPulse');
        
        const testWebcamBtn = document.getElementById('testWebcamBtn');
        const camModal = document.getElementById('camModal');
        const closeCamModal = document.getElementById('closeCamModal');
        const webcamVideo = document.getElementById('webcamVideo');
        const aiOverlay = document.getElementById('aiOverlay');
        const camAnalysisScore = document.getElementById('camAnalysisScore');
        const camDistractionScore = document.getElementById('camDistractionScore');
        const camFatigueScore = document.getElementById('camFatigueScore');
        const camContentType = document.getElementById('camContentType');
        const detectedIndicatorsList = document.getElementById('detectedIndicatorsList');
        
        let sessionActive = false;
        let stream = null;
        let analysisInterval = null;
        
        // --- Backend connection added here ---
        const BACKEND_URL = 'http://localhost:8000';
        
        async function analyzeFrame() {
            if (!stream) return;
            
            const canvas = document.createElement('canvas');
            canvas.width = webcamVideo.videoWidth;
            canvas.height = webcamVideo.videoHeight;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(webcamVideo, 0, 0);
            
            const base64Data = canvas.toDataURL('image/jpeg').split(',')[1];
            
            try {
                const response = await fetch(`${BACKEND_URL}/analyze/focus`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ frame_data: base64Data })
                });
                
                if (response.ok) {
                    const data = await response.json();
                    updateCameraDashboard(data);
                }
            } catch (err) {
                console.error("Focus analysis error:", err);
            }
        }
        
        function updateCameraDashboard(data) {
            camAnalysisScore.textContent = `${Math.round(data.focus_score)}%`;
            camDistractionScore.textContent = `${Math.round(data.distraction_score)}%`;
            camFatigueScore.textContent = `${Math.round(data.fatigue_score)}%`;
            camContentType.textContent = data.content_type;
            
            detectedIndicatorsList.innerHTML = '';
            data.detected_indicators.forEach(ind => {
                const badge = document.createElement('span');
                badge.className = 'indicator-badge';
                badge.textContent = ind.replace('_', ' ').toUpperCase();
                detectedIndicatorsList.appendChild(badge);
            });
            
            // Draw box (mock for now, normally you'd parse bounding boxes)
            if (aiOverlay) {
                const ctx = aiOverlay.getContext('2d');
                ctx.clearRect(0, 0, aiOverlay.width, aiOverlay.height);
                if (data.focus_score > 50) {
                    ctx.strokeStyle = '#22c55e';
                    ctx.lineWidth = 4;
                    ctx.strokeRect(aiOverlay.width * 0.25, aiOverlay.height * 0.2, aiOverlay.width * 0.5, aiOverlay.height * 0.6);
                    ctx.fillStyle = '#22c55e';
                    ctx.font = '16px monospace';
                    ctx.fillText('FOCUSED', aiOverlay.width * 0.25, aiOverlay.height * 0.2 - 10);
                }
            }
        }
        
        async function startWebcam() {
            try {
                stream = await navigator.mediaDevices.getUserMedia({ video: true });
                webcamVideo.srcObject = stream;
                camModal.style.display = 'flex';
                
                // Match overlay size to video
                webcamVideo.onloadedmetadata = () => {
                    aiOverlay.width = webcamVideo.videoWidth;
                    aiOverlay.height = webcamVideo.videoHeight;
                };
                
                analysisInterval = setInterval(analyzeFrame, 1000);
            } catch (err) {
                alert("Camera access denied or unavailable.");
            }
        }
        
        function stopWebcam() {
            if (stream) {
                stream.getTracks().forEach(t => t.stop());
                stream = null;
            }
            if (analysisInterval) {
                clearInterval(analysisInterval);
                analysisInterval = null;
            }
            if (camModal) camModal.style.display = 'none';
        }

        if (testWebcamBtn) testWebcamBtn.addEventListener('click', startWebcam);
        if (closeCamModal) closeCamModal.addEventListener('click', stopWebcam);
        if (sessionToggle) sessionToggle.addEventListener('click', () => {
            sessionActive = !sessionActive;
            if (sessionActive) {
                sessionToggle.textContent = 'End Session';
                sessionToggle.className = 'btn btn-danger';
                sessionStatus.className = 'session-status session-active';
                sessionStatusText.textContent = 'Session Active';
                sessionPulse.style.background = '#22c55e';
                sessionPulse.style.boxShadow = '0 0 10px #22c55e';
            } else {
                sessionToggle.textContent = 'Start Session';
                sessionToggle.className = 'btn btn-amber';
                sessionStatus.className = 'session-status session-inactive';
                sessionStatusText.textContent = 'Session Inactive';
                sessionPulse.style.background = '#ef4444';
                sessionPulse.style.boxShadow = 'none';
            }
        });
        
        // Mock charts
        const ctxFocus = document.getElementById('focusTrendChart');
        if (ctxFocus) {
            new Chart(ctxFocus, {
                type: 'line',
                data: {
                    labels: ['0m', '10m', '20m', '30m', '40m', '50m'],
                    datasets: [{
                        label: 'Focus Score',
                        data: [75, 82, 90, 85, 60, 75],
                        borderColor: '#f59e0b',
                        tension: 0.4,
                        fill: false
                    }]
                },
                options: { responsive: true, maintainAspectRatio: false }
            });
        }
        
        return () => {
            stopWebcam();
        };
    }, []);

    return (
        <div className="dashboard-container">

    <div className="dashboard-container">
        {/*  Dashboard Header  */}
        <header className="dashboard-header">
            <div className="header-content">
                <div className="logo">
                    WORK<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                        stroke-width="1.5">
                        <path d="M9 21h6M12 3a6 6 0 0 0-4 10.5V17h8v-3.5A6 6 0 0 0 12 3z" />
                        <line x1="10" y1="17" x2="10" y2="21" />
                        <line x1="14" y1="17" x2="14" y2="21" />
                    </svg>SPACE AI
                </div>
                <div className="session-info">
                    <a
                        href="https://chromewebstore.google.com/detail/workspace-ai-tab-monitor/gkpkmkfcneilbmkekpgnifklkfchbaib"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-amber"
                        style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', padding: '6px 14px' }}
                    >
                        🧩 Get Extension
                    </a>
                    <span id="userId">User: Guest</span>
                    <div id="sessionStatus" className="session-status session-inactive">
                        Session Inactive
                    </div>
                </div>
            </div>
        </header>

        {/*  Main Dashboard Content  */}
        <main className="dashboard-main">
            {/*  Session Controls  */}
            <section className="session-controls">
                <h2>Session Management</h2>
                <div className="control-buttons">
                    <button id="startSession" className="btn btn-primary">🚀 Start Session</button>
                    <button id="stopSession" className="btn btn-danger hidden">⏹️ Stop Session</button>
                    <button id="pauseSession" className="btn btn-secondary hidden">⏸️ Pause</button>
                    <button id="resumeSession" className="btn btn-secondary hidden">▶️ Resume</button>
                    <button id="testWebcamBtn" className="btn btn-amber">📷 Test AI Webcam</button>
                    <a
                        href="https://chromewebstore.google.com/detail/workspace-ai-tab-monitor/gkpkmkfcneilbmkekpgnifklkfchbaib"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-amber"
                        style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                    >
                        🧩 Get Extension
                    </a>
                </div>
                <div className="metrics-grid">
                    <div className="metric">
                        <div className="metric-label">Session Duration</div>
                        <div className="metric-value">
                            <span id="sessionDuration">00:00:00</span>
                        </div>
                    </div>
                    <div className="metric">
                        <div className="metric-label">Productivity Score</div>
                        <div className="metric-value">
                            <span id="productivityScore">0</span>
                            <span className="metric-unit">%</span>
                        </div>
                    </div>
                    <div className="metric">
                        <div className="metric-label">Focus Level</div>
                        <div className="metric-value">
                            <span id="focusLevel">0</span>
                            <span className="metric-unit">%</span>
                        </div>
                    </div>
                    <div className="metric">
                        <div className="metric-label">Fatigue Level</div>
                        <div className="metric-value">
                            <span id="fatigueLevel">0</span>
                            <span className="metric-unit">%</span>
                        </div>
                    </div>
                </div>
            </section>

            {/*  AI Features Grid  */}
            <div className="ai-grid">
                {/*  Screen Analysis  */}
                <div className="ai-card">
                    <div className="ai-card-header">
                        <h3 className="ai-card-title">🖥️ Screen Analysis</h3>
                        <div id="screenStatus" className="ai-status inactive"></div>
                    </div>
                    <p>Real-time screen content analysis for productivity tracking</p>
                    <div className="metrics-grid">
                        <div className="metric">
                            <div className="metric-label">Content Type</div>
                            <div className="metric-value" id="contentType">-</div>
                        </div>
                        <div className="metric">
                            <div className="metric-label">Distraction</div>
                            <div className="metric-value">
                                <span id="distractionScore">0</span>
                                <span className="metric-unit">%</span>
                            </div>
                        </div>
                        <div className="metric">
                            <div className="metric-label">Text Density</div>
                            <div className="metric-value">
                                <span id="textDensity">0</span>
                                <span className="metric-unit">%</span>
                            </div>
                        </div>
                        <div className="metric">
                            <div className="metric-label">Code Detected</div>
                            <div className="metric-value" id="codeDetected">No</div>
                        </div>
                    </div>
                </div>

                {/*  Face Analysis  */}
                <div className="ai-card">
                    <div className="ai-card-header">
                        <h3 className="ai-card-title">👤 Face Analysis</h3>
                        <div id="faceStatus" className="ai-status inactive"></div>
                    </div>
                    <p>Biometric analysis for engagement and fatigue detection</p>
                    <div className="metrics-grid">
                        <div className="metric">
                            <div className="metric-label">Face Present</div>
                            <div className="metric-value" id="facePresent">No</div>
                        </div>
                        <div className="metric">
                            <div className="metric-label">Gaze Direction</div>
                            <div className="metric-value" id="gazeDirection">-</div>
                        </div>
                        <div className="metric">
                            <div className="metric-label">Head Tilt</div>
                            <div className="metric-value">
                                <span id="headTilt">0</span>
                                <span className="metric-unit">°</span>
                            </div>
                        </div>
                        <div className="metric">
                            <div className="metric-label">Blink Rate</div>
                            <div className="metric-value">
                                <span id="blinkRate">0</span>
                                <span className="metric-unit">Hz</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/*  Voice Assistant  */}
                <div className="ai-card">
                    <div className="ai-card-header">
                        <h3 className="ai-card-title">🎤 Voice Assistant</h3>
                        <div id="voiceStatus" className="ai-status inactive"></div>
                    </div>
                    <p>AI-powered voice interaction and commands</p>
                    <div className="voice-controls">
                        <button id="voiceBtn" className="btn btn-primary">🎤 Start Listening</button>
                        <div id="voiceIndicator" className="voice-indicator hidden">
                            <div className="recording">🔴 Recording...</div>
                        </div>
                    </div>
                    <div className="metrics-grid">
                        <div className="metric">
                            <div className="metric-label">Last Command</div>
                            <div className="metric-value" id="lastCommand">-</div>
                        </div>
                        <div className="metric">
                            <div className="metric-label">Response Time</div>
                            <div className="metric-value">
                                <span id="responseTime">0</span>
                                <span className="metric-unit">ms</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/*  Session Analytics  */}
                <div className="ai-card">
                    <div className="ai-card-header">
                        <h3 className="ai-card-title">📊 Session Analytics</h3>
                        <div className="ai-status"></div>
                    </div>
                    <p>Real-time productivity insights and patterns</p>
                    <div className="metrics-grid">
                        <div className="metric">
                            <div className="metric-label">Total Events</div>
                            <div className="metric-value" id="totalEvents">0</div>
                        </div>
                        <div className="metric">
                            <div className="metric-label">Focus Time</div>
                            <div className="metric-value">
                                <span id="focusTime">0</span>
                                <span className="metric-unit">min</span>
                            </div>
                        </div>
                        <div className="metric">
                            <div className="metric-label">Break Time</div>
                            <div className="metric-value">
                                <span id="breakTime">0</span>
                                <span className="metric-unit">min</span>
                            </div>
                        </div>
                        <div className="metric">
                            <div className="metric-label">Efficiency</div>
                            <div className="metric-value">
                                <span id="efficiency">0</span>
                                <span className="metric-unit">%</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/*  Activity Log  */}
            <section className="activity-log">
                <h3>Activity Log</h3>
                <div id="activityLog">
                    <div className="log-entry">
                        <div className="log-time">System</div>
                        <div className="log-message">Dashboard initialized. Ready to start AI monitoring session.</div>
                    </div>
                </div>
            </section>
        </main>

        {/* Webcam Modal */}
        <div id="camModal" style={{ display: 'none', position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 1000, justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ background: '#1a1a2e', padding: '20px', borderRadius: '10px', width: '80%', maxWidth: '800px', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 style={{ margin: 0 }}>Webcam Analysis</h3>
                    <button id="closeCamModal" style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '20px' }}>✕</button>
                </div>
                <div style={{ position: 'relative', width: '100%', background: '#000', borderRadius: '8px', overflow: 'hidden' }}>
                    <video id="webcamVideo" autoPlay playsInline style={{ width: '100%', display: 'block' }}></video>
                    <canvas id="aiOverlay" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}></canvas>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px', gap: '20px' }}>
                    <div className="metric">
                        <div className="metric-label">Focus Score</div>
                        <div className="metric-value" id="camAnalysisScore">-</div>
                    </div>
                    <div className="metric">
                        <div className="metric-label">Distraction</div>
                        <div className="metric-value" id="camDistractionScore">-</div>
                    </div>
                    <div className="metric">
                        <div className="metric-label">Fatigue</div>
                        <div className="metric-value" id="camFatigueScore">-</div>
                    </div>
                    <div className="metric">
                        <div className="metric-label">Activity</div>
                        <div className="metric-value" id="camContentType" style={{ fontSize: '1rem' }}>-</div>
                    </div>
                </div>
                <div style={{ marginTop: '15px' }}>
                    <div className="metric-label">Detected Indicators</div>
                    <div id="detectedIndicatorsList" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}></div>
                </div>
            </div>
        </div>
    </div>


        </div>
    );
};

export default Dashboard;
