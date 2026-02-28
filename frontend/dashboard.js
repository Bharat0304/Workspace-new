/**
 * WorkSpace AI Dashboard - Fixed Version
 * 
 * This dashboard integrates with AI backend and browser extension
 * for comprehensive productivity monitoring and coaching.
 */

class AIDashboard {
    constructor() {
        this.sessionData = {
            sessionId: null,
            userId: 'demo_user',
            startTime: null,
            screenAnalysis: [],
            faceAnalysis: [],
            metrics: {
                productivity: 0,
                focus: 0,
                efficiency: 0,
                totalEvents: 0,
                focusTime: 0
            }
        };
        
        this.sessionActive = false;
        this.sessionPaused = false;
        this.sessionStartTime = null;
        this.intervals = {};
        
        this.apiEndpoints = {
            aiBackend: 'http://localhost:8000',
            voiceBackend: 'http://localhost:4001'
        };
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.updateUI();
        this.logActivity('System', 'Dashboard initialized. Ready to start AI monitoring session.');
        
        // Set up extension communication
        this.listenForExtensionMessages();
    }

    bindEvents() {
        // Session controls
        document.getElementById('startSession').addEventListener('click', () => this.startSession());
        document.getElementById('stopSession').addEventListener('click', () => this.stopSession());
        
        // Voice assistant - DISABLED to avoid CORS errors
        // document.getElementById('voiceBtn').addEventListener('click', () => this.toggleVoiceAssistant());
    }

    async startSession() {
        try {
            this.sessionData.sessionId = 'session_' + Date.now();
            this.sessionStartTime = Date.now();
            this.sessionActive = true;
            this.sessionPaused = false;

            // Start all AI monitoring (no permissions needed)
            // await this.startScreenAnalysis(); // Disable for now
            // await this.startFaceAnalysis(); // Disable for now
            this.startMetricsUpdate();
            
            // DIRECT CAMERA CONTROL - Try to start camera directly
            await this.startCameraDirectly();
            
            // Update UI
            this.updateSessionUI();
            this.logActivity('Session', `Started session ${this.sessionData.sessionId}`);
            
            // Start session timer
            this.intervals.sessionTimer = setInterval(() => this.updateSessionTimer(), 1000);
            
        } catch (error) {
            this.logActivity('Error', `Failed to start session: ${error.message}`);
        }
    }

    async startCameraDirectly() {
        try {
            console.log('📹 Attempting to start camera directly...');
            
            // Request camera access directly from the website
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                },
                audio: false
            });
            
            console.log('✅ Camera access granted directly from website');
            
            // Store stream for later cleanup (NO VIDEO PREVIEW)
            this.cameraStream = stream;
            
            // Add camera status indicator instead of video
            this.addCameraStatusIndicator();
            
            this.logActivity('Camera', 'Camera started directly from website (no preview)');
            
        } catch (error) {
            console.log('❌ Failed to start camera directly:', error);
            this.logActivity('Camera', `Failed to start camera: ${error.message}`);
            
            // Fallback: Try extension communication
            this.notifyExtension('start_session_with_camera', {
                sessionId: this.sessionData.sessionId,
                timestamp: Date.now()
            });
        }
    }

    addCameraStatusIndicator() {
        // Create camera status indicator instead of video preview
        const indicator = document.createElement('div');
        indicator.id = 'cameraIndicator';
        indicator.innerHTML = `
            <div style="
                background: #10b981;
                color: white;
                padding: 8px 12px;
                border-radius: 6px;
                font-size: 12px;
                font-weight: 500;
                display: flex;
                align-items: center;
                gap: 6px;
                margin-top: 10px;
            ">
                📹 Camera ON
            </div>
        `;
        
        // Add to dashboard
        const sessionInfo = document.querySelector('.session-info');
        if (sessionInfo) {
            sessionInfo.appendChild(indicator);
        }
    }

    stopCameraDirectly() {
        try {
            // Stop camera stream
            if (this.cameraStream) {
                this.cameraStream.getTracks().forEach(track => track.stop());
                this.cameraStream = null;
                console.log('📹 Camera stopped directly');
                this.logActivity('Camera', 'Camera stopped');
            }
            
            // Remove camera status indicator
            const indicator = document.getElementById('cameraIndicator');
            if (indicator) {
                indicator.remove();
            }
            
        } catch (error) {
            console.log('❌ Failed to stop camera:', error);
            this.logActivity('Camera', `Failed to stop camera: ${error.message}`);
        }
    }

    stopSession() {
        if (!this.sessionActive) return;
        
        this.sessionActive = false;
        this.sessionPaused = false;
        
        // Stop camera directly
        this.stopCameraDirectly();
        
        // Clear all intervals
        Object.values(this.intervals).forEach(interval => clearInterval(interval));
        this.intervals = {};
        
        // Notify browser extension
        this.notifyExtension('session_stopped', {
            sessionId: this.sessionData.sessionId,
            timestamp: Date.now()
        });
        
        // Update UI
        this.updateSessionUI();
        this.showSessionSummary();
        this.logActivity('Session', `Session ${this.sessionData.sessionId} ended`);
        
        // Reset session data
        this.sessionData.sessionId = null;
        this.sessionStartTime = null;
    }

    pauseSession() {
        if (!this.sessionActive || this.sessionPaused) return;
        
        this.sessionPaused = true;
        this.updateSessionUI();
        this.logActivity('Session', 'Session paused');
        
        this.notifyExtension('session_paused', {
            sessionId: this.sessionData.sessionId,
            timestamp: Date.now()
        });
    }

    resumeSession() {
        if (!this.sessionActive || !this.sessionPaused) return;
        
        this.sessionPaused = false;
        this.updateSessionUI();
        this.logActivity('Session', 'Session resumed');
        
        this.notifyExtension('session_resumed', {
            sessionId: this.sessionData.sessionId,
            timestamp: Date.now()
        });
    }

    async startScreenAnalysis() {
        if (!this.sessionActive || this.sessionPaused) return;
        
        try {
            // Capture screen
            const screenshotData = await this.captureScreen();
            
            // Analyze with AI backend
            const analysis = await this.analyzeScreen(screenshotData);
            
            // Update metrics
            this.updateScreenMetrics(analysis);
            
        } catch (error) {
            this.logActivity('Screen Analysis', `Error: ${error.message}`);
        }
        
        // Schedule next analysis
        this.intervals.screenAnalysis = setTimeout(() => this.startScreenAnalysis(), 5000);
    }

    async getCurrentTabContent() {
        try {
            // Get current tab info for analysis
            const response = await chrome.tabs.query({ active: true, currentWindow: true });
            if (response && response.length > 0) {
                const tab = response[0];
                return {
                    url: tab.url,
                    title: tab.title,
                    screenshot: this.getDummyScreenData() // Use dummy data
                };
            }
            return this.getDummyScreenData();
        } catch (error) {
            this.logActivity('Tab Analysis', 'Using demo data (tab access not available)');
            return this.getDummyScreenData();
        }
    }

    async startFaceAnalysis() {
        if (!this.sessionActive || this.sessionPaused) return;
        
        try {
            // Capture face
            const faceData = await this.captureFace();
            
            // Analyze with AI backend
            const analysis = await this.analyzeFace(faceData);
            
            // Update metrics
            this.updateFaceMetrics(analysis);
            
        } catch (error) {
            this.logActivity('Face Analysis', `Error: ${error.message}`);
        }
        
        // Schedule next analysis
        this.intervals.faceAnalysis = setTimeout(() => this.startFaceAnalysis(), 3000);
    }

    async captureFace() {
        try {
            // For demo, return dummy data
            return this.getDummyFaceData();
        } catch (error) {
            this.logActivity('Face Capture', 'Using demo data (camera not available)');
            return this.getDummyFaceData();
        }
    }

    async analyzeScreen(screenshotData) {
        try {
            const response = await fetch(`${this.apiEndpoints.aiBackend}/analyze/screen`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_id: this.sessionData.userId,
                    session_id: this.sessionData.sessionId,
                    screenshot_data: screenshotData
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            return this.getDemoScreenAnalysis();
        }
    }

    async analyzeFace(faceData) {
        try {
            const response = await fetch(`${this.apiEndpoints.aiBackend}/analyze/posture`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_id: this.sessionData.userId,
                    session_id: this.sessionData.sessionId,
                    frame_data: faceData
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            return this.getDemoFaceAnalysis();
        }
    }

    async toggleVoiceAssistant() {
        const voiceBtn = document.getElementById('voiceBtn');
        const voiceIndicator = document.getElementById('voiceIndicator');
        
        if (voiceBtn.textContent.includes('Start')) {
            // Start listening
            voiceBtn.textContent = '🛑 Stop Listening';
            voiceIndicator.classList.remove('hidden');
            document.getElementById('voiceStatus').classList.remove('inactive');
            
            try {
                const response = await fetch(`${this.apiEndpoints.aiBackend}/intelligent-assistant/voice-command`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        command: 'start voice assistant'
                    })
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const result = await response.json();
                this.logActivity('Voice Assistant', `Command: start voice assistant, Response: ${result.response}`);
                
                // Update voice status
                document.getElementById('lastCommand').textContent = result.response;
                
            } catch (error) {
                this.logActivity('Voice Assistant', `Error: ${error.message}`);
            }
            
        } else {
            // Stop listening
            voiceBtn.textContent = '🎤 Start Listening';
            voiceIndicator.classList.add('hidden');
            document.getElementById('voiceStatus').classList.add('inactive');
        }
    }

    notifyExtension(action, data = {}) {
        // Send message to browser extension if available
        if (window.chrome && window.chrome.runtime) {
            try {
                // Send message directly to extension (no ID needed for same origin)
                window.chrome.runtime.sendMessage({
                    type: action,
                    action: action,
                    data: data
                }, (response) => {
                    if (window.chrome.runtime.lastError) {
                        console.log('Extension message error:', window.chrome.runtime.lastError);
                        this.logActivity('Extension', `Message failed: ${window.chrome.runtime.lastError.message}`);
                    } else {
                        console.log('Extension message success:', response);
                        this.logActivity('Extension', `Message sent: ${action}`);
                    }
                });
            } catch (error) {
                console.log('Extension communication error:', error);
                this.logActivity('Extension', `Communication error: ${error.message}`);
            }
        } else {
            console.log('Chrome extension API not available');
            this.logActivity('Extension', 'Chrome extension API not available');
        }
    }

    sendToAI(data) {
        // DISABLED - Avoid CORS errors
        console.log('AI communication disabled to avoid CORS issues');
        return;
        
        // Original code commented out to prevent CORS errors
        /*
        fetch(`${this.apiEndpoints.aiBackend}/intelligent-assistant/analyze-context`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user_id: this.sessionData.userId,
                session_id: this.sessionData.sessionId,
                ...data
            })
        }).catch(error => {
            console.error('Failed to send to AI:', error);
        });
        */
    }

    listenForExtensionMessages() {
        // Listen for messages from browser extension
        if (window.chrome && window.chrome.runtime) {
            // Try to get extension ID automatically
            if (window.chrome.runtime.id) {
                console.log('🔌 Extension ID found:', window.chrome.runtime.id);
                this.extensionId = window.chrome.runtime.id;
            }
            
            window.chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
                this.handleExtensionMessage(message, sender, sendResponse);
            });
        } else {
            console.log('⚠️ Chrome extension API not available');
            this.logActivity('Extension', 'Chrome extension API not available');
        }
    }

    handleExtensionMessage(message, sender, sendResponse) {
        switch (message.type) {
            case 'tab_change':
                this.handleTabChange(message.data);
                break;
            case 'site_blocked':
                this.handleSiteBlocked(message.data);
                break;
            case 'session_started':
                this.handleExtensionSessionStart(message.data);
                break;
            case 'session_stopped':
                this.handleExtensionSessionStop(message.data);
                break;
        }
    }

    handleTabChange(tabData) {
        this.logActivity('Tab Change', `Switched to: ${tabData.domain}`);
        
        // Update screen analysis with current tab
        this.currentTabData = tabData;
        this.updateScreenMetrics({
            content_type: tabData.category,
            distraction_score: tabData.distractionLevel,
            text_density: 0.7, // Simulated
            has_code: tabData.category === 'productive',
            has_social_indicator: tabData.category === 'distraction'
        });
    }

    handleSiteBlocked(siteData) {
        this.logActivity('Site Blocked', `Blocked: ${siteData.domain}`);
        
        // Update metrics
        this.sessionData.metrics.totalEvents++;
        this.updateMetricsDisplay();
    }

    handleExtensionSessionStart(data) {
        this.logActivity('Extension Session', `Started: ${data.sessionId}`);
        
        // Update UI
        this.updateSessionUI();
    }

    handleExtensionSessionStop(data) {
        this.logActivity('Extension Session', `Stopped: ${data.sessionId}`);
        
        // Update UI
        this.updateSessionUI();
    }

    updateScreenMetrics(analysis) {
        const contentTypeEl = document.getElementById('contentType');
        const distractionScoreEl = document.getElementById('distractionScore');
        const textDensityEl = document.getElementById('textDensity');
        const hasCodeEl = document.getElementById('codeDetected'); // Fixed ID
        const hasSocialEl = document.getElementById('hasSocial'); // This might be missing
        
        if (contentTypeEl) contentTypeEl.textContent = analysis.content_type || 'unknown';
        if (distractionScoreEl) distractionScoreEl.textContent = Math.round(analysis.distraction_score || 0);
        if (textDensityEl) textDensityEl.textContent = Math.round((analysis.text_density || 0) * 100);
        if (hasCodeEl) hasCodeEl.textContent = analysis.has_code ? 'Yes' : 'No';
        if (hasSocialEl) hasSocialEl.textContent = analysis.has_social_indicator ? 'Yes' : 'No';
        
        this.sessionData.screenAnalysis.push(analysis);
        this.sessionData.metrics.totalEvents++;
    }

    updateFaceMetrics(analysis) {
        const facePresentEl = document.getElementById('facePresent');
        const gazeDirectionEl = document.getElementById('gazeDirection');
        const headTiltEl = document.getElementById('headTilt');
        const blinkRateEl = document.getElementById('blinkRate');
        const fatigueLevelEl = document.getElementById('fatigueLevel');
        
        if (facePresentEl) facePresentEl.textContent = analysis.face_present ? 'Yes' : 'No';
        if (gazeDirectionEl) gazeDirectionEl.textContent = analysis.gaze_direction || 'Unknown';
        if (headTiltEl) headTiltEl.textContent = Math.round(analysis.head_tilt || 0);
        if (blinkRateEl) blinkRateEl.textContent = (analysis.blink_rate || 0).toFixed(2);
        if (fatigueLevelEl) fatigueLevelEl.textContent = Math.round((analysis.fatigue_score || 0) * 100);
        
        this.sessionData.faceAnalysis.push(analysis);
        this.sessionData.metrics.totalEvents++;
    }

    startMetricsUpdate() {
        this.intervals.metricsUpdate = setInterval(() => {
            if (!this.sessionActive || this.sessionPaused) return;
            
            this.calculateProductivityMetrics();
            this.updateMetricsDisplay();
        }, 2000); // Update every 2 seconds
    }

    calculateProductivityMetrics() {
        const screenData = this.sessionData.screenAnalysis;
        const faceData = this.sessionData.faceAnalysis;
        
        if (screenData.length === 0 && faceData.length === 0) return;
        
        // Calculate productivity score based on recent data
        let productivity = 50; // Base score
        
        // Screen analysis contribution
        if (screenData.length > 0) {
            const recentScreen = screenData.slice(-5); // Last 5 analyses
            const avgDistraction = recentScreen.reduce((sum, item) => sum + item.distraction_score, 0) / recentScreen.length;
            const codeRatio = recentScreen.filter(item => item.has_code).length / recentScreen.length;
            
            productivity += (codeRatio * 30) - (avgDistraction * 0.3);
        }
        
        // Face analysis contribution
        if (faceData.length > 0) {
            const recentFace = faceData.slice(-5); // Last 5 analyses
            const avgFatigue = recentFace.reduce((sum, item) => sum + item.fatigue_score, 0) / recentFace.length;
            const facePresentRatio = recentFace.filter(item => item.face_present).length / recentFace.length;
            
            productivity += (facePresentRatio * 20) - (avgFatigue * 20);
        }
        
        this.sessionData.metrics.productivity = Math.max(0, Math.min(100, Math.round(productivity)));
        this.sessionData.metrics.focus = Math.max(0, Math.min(100, Math.round(100 - (this.sessionData.metrics.fatigue || 0) * 100)));
        this.sessionData.metrics.efficiency = this.sessionData.metrics.productivity; // Simplified
    }

    updateMetricsDisplay() {
        document.getElementById('productivityScore').textContent = this.sessionData.metrics.productivity;
        document.getElementById('focusLevel').textContent = this.sessionData.metrics.focus;
        document.getElementById('totalEvents').textContent = this.sessionData.metrics.totalEvents;
        document.getElementById('efficiency').textContent = this.sessionData.metrics.efficiency;
        
        // Update session duration
        if (this.sessionStartTime) {
            const duration = Date.now() - this.sessionStartTime;
            const hours = Math.floor(duration / 3600000);
            const minutes = Math.floor((duration % 3600000) / 60000);
            const seconds = Math.floor((duration % 60000) / 1000);
            
            document.getElementById('sessionDuration').textContent = 
                `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            
            // Update focus time (simplified)
            this.sessionData.metrics.focusTime = Math.floor(duration / 60000);
            document.getElementById('focusTime').textContent = this.sessionData.metrics.focusTime;
        }
    }

    updateSessionUI() {
        const startBtn = document.getElementById('startSession');
        const stopBtn = document.getElementById('stopSession');
        const pauseBtn = document.getElementById('pauseSession');
        const resumeBtn = document.getElementById('resumeSession');
        const sessionStatus = document.getElementById('sessionStatus');

        if (this.sessionActive) {
            startBtn.classList.add('hidden');
            stopBtn.classList.remove('hidden');
            sessionStatus.textContent = 'Session Active';
            sessionStatus.className = 'session-status session-active';
            
            if (this.sessionPaused) {
                pauseBtn.classList.add('hidden');
                resumeBtn.classList.remove('hidden');
                sessionStatus.textContent = 'Session Paused';
                sessionStatus.className = 'session-status session-inactive';
            } else {
                pauseBtn.classList.remove('hidden');
                resumeBtn.classList.add('hidden');
            }
        } else {
            startBtn.classList.remove('hidden');
            stopBtn.classList.add('hidden');
            pauseBtn.classList.add('hidden');
            resumeBtn.classList.add('hidden');
            sessionStatus.textContent = 'Session Inactive';
            sessionStatus.className = 'session-status session-inactive';
        }
    }

    updateSessionTimer() {
        if (this.sessionStartTime) {
            const duration = Date.now() - this.sessionStartTime;
            const hours = Math.floor(duration / 3600000);
            const minutes = Math.floor((duration % 3600000) / 60000);
            const seconds = Math.floor((duration % 60000) / 1000);
            
            document.getElementById('sessionDuration').textContent = 
                `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
    }

    showSessionSummary() {
        const duration = Date.now() - this.sessionStartTime;
        const minutes = Math.floor(duration / 60000);
        
        this.logActivity('Summary', `Session completed. Duration: ${minutes}min, Productivity: ${this.sessionData.metrics.productivity}%, Events: ${this.sessionData.metrics.totalEvents}`);
    }

    logActivity(source, message) {
        const logContainer = document.getElementById('activityLog');
        const timestamp = new Date().toLocaleTimeString();
        const logEntry = document.createElement('div');
        logEntry.className = 'activity-entry';
        logEntry.innerHTML = `
            <span class="activity-time">[${timestamp}]</span>
            <span class="activity-source">${source}:</span>
            <span class="activity-message">${message}</span>
        `;
        
        logContainer.appendChild(logEntry);
        logContainer.scrollTop = logContainer.scrollHeight;
    }

    updateUI() {
        // Initialize UI elements
        this.updateSessionUI();
        this.updateMetricsDisplay();
    }

    // Demo data methods
    getDummyScreenData() {
        // Return a small base64 encoded image (1x1 pixel)
        return 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
    }

    getDummyFaceData() {
        // Return a small base64 encoded image (1x1 pixel)
        return 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
    }

    getDemoScreenAnalysis() {
        const contentTypes = ['coding', 'educational', 'documentation', 'entertainment'];
        return {
            content_type: contentTypes[Math.floor(Math.random() * contentTypes.length)],
            distraction_score: Math.random() * 50,
            text_density: Math.random() * 0.8,
            has_code: Math.random() > 0.5,
            has_social_indicator: Math.random() > 0.7
        };
    }

    getDemoFaceAnalysis() {
        const gazeDirections = ['left', 'right', 'center'];
        return {
            face_present: Math.random() > 0.2,
            gaze_direction: gazeDirections[Math.floor(Math.random() * gazeDirections.length)],
            head_tilt: (Math.random() - 0.5) * 20,
            blink_rate: Math.random() * 0.5,
            fatigue_score: Math.random() * 0.7
        };
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AIDashboard();
});
