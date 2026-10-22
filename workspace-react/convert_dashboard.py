import re

with open('../frontend/dashboard.html', 'r') as f:
    html = f.read()

# Extract body content
body_match = re.search(r'<body>(.*?)</body>', html, re.DOTALL | re.IGNORECASE)
body = body_match.group(1) if body_match else html

# Convert class to className
body = body.replace('class=', 'className=')
body = body.replace('for=', 'htmlFor=')

# Replace inline styles and fix empty tags
body = body.replace('style="width: 75%"', 'style={{width: "75%"}}')
body = body.replace('style="width: 45%"', 'style={{width: "45%"}}')
body = body.replace('style="width: 15%"', 'style={{width: "15%"}}')
body = body.replace('style="width: 5%"', 'style={{width: "5%"}}')
body = body.replace('style="display: none;"', 'style={{display: "none"}}')
body = body.replace('style="background: #ef4444;"', 'style={{background: "#ef4444"}}')

body = re.sub(r'<img(.*?)(?<!/)>', r'<img\1/>', body)
body = re.sub(r'<input(.*?)(?<!/)>', r'<input\1/>', body)
body = re.sub(r'<hr(.*?)(?<!/)>', r'<hr\1/>', body)
body = re.sub(r'<br(.*?)(?<!/)>', r'<br\1/>', body)

# Fix local links
body = body.replace('href="index.html"', 'href="/"')
body = body.replace('href="analytics.html"', 'href="/analytics"')

body = re.sub(r'<!--(.*?)-->', r'{/* \1 */}', body)

js_logic = """
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
            camModal.style.display = 'none';
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
"""

jsx = js_logic + body + """
        </div>
    );
};

export default Dashboard;
"""

with open('src/pages/Dashboard.jsx', 'w') as f:
    f.write(jsx)

print("Created Dashboard.jsx")
