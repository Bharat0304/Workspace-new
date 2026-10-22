class WorkSpaceMonitor {
    constructor() {
        this.sessionActive = false;
        this.lastBlockAt = 0;
        this.currentTab = null;
        this.startTime = null;
        this.blockedCount = 0;
        this.blockingTimers = new Map(); // Track countdown timers
        this.monitoringTimers = new Map(); // Track monitoring timers
        
        // Camera monitoring
        this.cameraMonitoring = false;
        this.cameraStream = null;
        this.focusScores = [];
        this.postureScores = [];
        this.lastCameraCheck = 0;
        this.cameraInterval = null;
        
        // Session tracking
        this.blockedSitesList = [];
        
        // Educational sites (auto-allowed)
        this.educationalSites = new Set([
            'khanacademy.org', 'coursera.org', 'edx.org', 'udacity.com',
            'pluralsight.com', 'brilliant.org', 'w3schools.com',
            'stackoverflow.com', 'github.com', 'gitlab.com', 'codecademy.com',
            'freecodecamp.org', 'theodinproject.com', 'leetcode.com',
            'hackerrank.com', 'codewars.com', 'topcoder.com',
            'youtube.com', 'youtu.be'  // Added YouTube as educational
        ]);
        
        this.init();
    }

    init() {
        console.log('🚀 Tab Monitor initialized');
        this.setupMessageListeners();
        this.setupTabListeners();
        this.startSession(); // Auto-start session
    }

    setupMessageListeners() {
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            console.log('📨 Message received:', message);
            
            switch (message.type || message.action) {
                case 'start_session':
                case 'session_started':
                    this.startSession();
                    sendResponse({ success: true });
                    break;
                case 'session_stopped':
                    this.stopSession();
                    sendResponse({ success: true });
                    break;
                case 'start_camera':
                    this.startCameraMonitoring().then(() => {
                        sendResponse({ success: true });
                    }).catch(() => {
                        sendResponse({ success: false });
                    });
                    break;
                case 'stop_camera':
                    this.stopCameraMonitoring().then(() => {
                        sendResponse({ success: true });
                    }).catch(() => {
                        sendResponse({ success: false });
                    });
                    break;
                case 'get_status':
                    return {
                        active: this.sessionActive,
                        startTime: this.startTime,
                        blockedCount: this.blockedCount,
                        currentTab: this.currentTab,
                        camera: this.getCameraStatus()
                    };    
                    break;
                case 'check_tab':
                    this.checkCurrentTab();
                    sendResponse({ success: true });
                    break;
                case 'to_background':
                    // Handle messages from dashboard
                    if (message.action === 'session_started') {
                        this.startSession();
                    } else if (message.action === 'session_stopped') {
                        this.stopSession();
                    }
                    sendResponse({ success: true });
                    break;
                default:
                    console.log('🤷 Unknown message type:', message.type);
                    sendResponse({ success: false, error: 'Unknown message type' });
            }
        });
    }

    setupTabListeners() {
        // Listen for tab updates
        chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
            if (changeInfo.status === 'complete' && tab.url) {
                console.log('🔄 Tab updated:', tab.url);
                this.handleTabChange(tab);
            }
        });

        // Listen for tab activation
        chrome.tabs.onActivated.addListener(async (activeInfo) => {
            try {
                const tab = await chrome.tabs.get(activeInfo.tabId);
                console.log('🔄 Tab activated:', tab.url);
                this.handleTabChange(tab);
            } catch (error) {
                console.log('❌ Failed to get activated tab:', error);
            }
        });
    }

    async handleTabChange(tab) {
        if (!this.sessionActive) return;

        this.currentTab = tab;
        console.log('🔍 Analyzing tab:', tab.url);

        // Skip internal pages
        if (tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://')) {
            console.log('⏭️ Skipping internal page:', tab.url);
            return;
        }

        try {
            // Get tab content for analysis
            const [tabContent] = await Promise.all([
                this.getTabContent(tab)
            ]);

            // Send to backend for AI analysis
            const analysis = await this.analyzeWithBackend(tab, tabContent);

            if (analysis.is_distracting) {
                console.log('🚫 Distracting content detected:', tab.url);
                await this.showBlockingWarning(tab);
            } else if (analysis.is_educational) {
                console.log('✅ Educational content allowed:', tab.url);
                this.notifyEducational(tab);
            } else {
                console.log('⚪ Neutral content allowed:', tab.url);
            }
        } catch (error) {
            console.log('❌ Error analyzing tab:', error);
        }
    }

    async getTabContent(tab) {
        try {
            const results = await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: () => {
                    return {
                        title: document.title,
                        text: document.body.innerText.substring(0, 2000),
                        url: window.location.href
                    };
                }
            });
            return results[0]?.result || {};
        } catch (error) {
            console.log('❌ Failed to get tab content:', error);
            return { title: tab.title, text: '', url: tab.url };
        }
    }

    async analyzeWithBackend(tab, content) {
        try {
            const response = await fetch('http://localhost:8000/analyze/tab', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    url: tab.url,
                    title: content.title,
                    text: content.text
                })
            });

            if (!response.ok) {
                throw new Error(`Backend error: ${response.status}`);
            }

            const analysis = await response.json();
            console.log('🧠 AI Analysis (from backend):', analysis);
            return analysis;

        } catch (error) {
            console.log('❌ Backend analysis failed:', error);
            // Fallback to local analysis
            return this.localYouTubeAnalysis(tab, content);
        }
    }

    localYouTubeAnalysis(tab, content) {
        const url = tab.url.toLowerCase();
        const title = content.title.toLowerCase();
        const text = content.text.toLowerCase();

        // Educational keywords
        const educationalKeywords = [
            'tutorial', 'learn', 'course', 'lecture', 'education', 'study',
            'math', 'science', 'physics', 'chemistry', 'biology', 'programming',
            'coding', 'computer science', 'algorithm', 'data structure',
            'khan academy', 'coursera', 'edx', 'mit', 'stanford',
            '3blue1brown', 'crash course', 'ted ed', 'national geographic',
            'documentary', 'explain', 'how to', 'guide', 'lesson',
            'indian education', 'jee', 'neet', 'iit', 'unacademy',
            'byju\'s', 'physics wallah', 'khan academy', 'vedantu'
        ];

        // Distracting keywords
        const distractingKeywords = [
            'music', 'song', 'dance', 'funny', 'meme', 'prank', 'comedy',
            'gaming', 'gameplay', 'stream', 'vlog', 'challenge', 'trend',
            'celebrity', 'gossip', 'news', 'politics', 'sports', 'entertainment',
            'movie', 'trailer', 'review', 'unboxing', 'haul', 'makeup',
            'fashion', 'lifestyle', 'food', 'recipe', 'travel', 'vacation',
            'bb ki vines', 'carryminati', 'bhuvan bam', 'ashish chanchlani',
            'roast', 'parody', 'bollywood', 'hollywood', 'netflix', 'amazon prime',
            'tiktok', 'instagram', 'facebook', 'twitter', 'reddit', 'discord'
        ];

        // Count keyword matches
        let educationalScore = 0;
        let distractionScore = 0;

        educationalKeywords.forEach(keyword => {
            if (title.includes(keyword) || text.includes(keyword)) {
                educationalScore++;
            }
        });

        distractingKeywords.forEach(keyword => {
            if (title.includes(keyword) || text.includes(keyword)) {
                distractionScore++;
            }
        });

        // Determine content type
        let contentType = 'neutral';
        let isEducational = false;
        let isDistracting = false;

        if (url.includes('youtube.com') || url.includes('youtu.be')) {
            if (educationalScore > distractionScore) {
                contentType = 'youtube_educational';
                isEducational = true;
            } else if (distractionScore > educationalScore) {
                contentType = 'youtube_distracting';
                isDistracting = true;
            }
        } else {
            if (educationalScore >= 2) {
                contentType = 'educational';
                isEducational = true;
            } else if (distractionScore >= 2) {
                contentType = 'distracting';
                isDistracting = true;
            }
        }

        console.log(`📊 Local analysis: ${contentType} (E:${educationalScore}, D:${distractionScore})`);

        return {
            is_educational: isEducational,
            is_distracting: isDistracting,
            content_type: contentType,
            educational_score: educationalScore,
            distraction_score: distractionScore
        };
    }

    async showBlockingWarning(tab) {
        // Prevent duplicate warnings
        if (this.blockingTimers.has(tab.id)) {
            console.log('⏭️ Warning already active for tab:', tab.id);
            return;
        }

        try {
            console.log('⚠️ Showing 5-second warning for:', tab.url);

            // Show countdown overlay
            await this.showCountdownOverlay(tab);

            // Set timer to block after 5 seconds
            const timer = setTimeout(async () => {
                await this.blockTab(tab);
                this.blockingTimers.delete(tab.id);
            }, 5000);

            this.blockingTimers.set(tab.id, timer);

        } catch (error) {
            console.log('❌ Failed to show warning:', error);
        }
    }

    async showCountdownOverlay(tab) {
        const overlayHtml = `
            <div id="workspace-warning-overlay" style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.9);
                z-index: 999999;
                display: flex;
                align-items: center;
                justify-content: center;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            ">
                <div style="
                    background: linear-gradient(135deg, #ff6b6b, #ee5a6f);
                    color: white;
                    padding: 40px;
                    border-radius: 20px;
                    text-align: center;
                    max-width: 500px;
                    box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                    animation: pulse 2s infinite;
                ">
                    <h2 style="margin: 0 0 20px 0; font-size: 32px; font-weight: bold;">
                        ⚠️ Distracting Content Detected
                    </h2>
                    <p style="margin: 0 0 30px 0; font-size: 18px; line-height: 1.5;">
                        This content appears to be distracting. You'll be redirected in <span id="countdown">5</span> seconds.
                    </p>
                    <div style="
                        font-size: 64px;
                        font-weight: bold;
                        margin: 20px 0;
                        animation: countdown-pulse 1s infinite;
                    " id="countdown-display">5</div>
                    <p style="margin: 20px 0 0 0; font-size: 14px; opacity: 0.8;">
                        Stay focused on your goals! 🎯
                    </p>
                </div>
            </div>
            <style>
                @keyframes pulse {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.05); }
                }
                @keyframes countdown-pulse {
                    0%, 100% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.1); opacity: 0.8; }
                }
            </style>
        `;

        await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: (html) => {
                // Remove existing overlay
                const existing = document.getElementById('workspace-warning-overlay');
                if (existing) existing.remove();

                // Add new overlay
                document.body.insertAdjacentHTML('beforeend', html);

                // Countdown logic
                let count = 5;
                const countdownEl = document.getElementById('countdown-display');
                const countdownText = document.getElementById('countdown');

                const interval = setInterval(() => {
                    count--;
                    if (countdownEl) countdownEl.textContent = count;
                    if (countdownText) countdownText.textContent = count;

                    if (count <= 0) {
                        clearInterval(interval);
                    }
                }, 1000);
            },
            args: [overlayHtml]
        });
    }

    async blockTab(tab) {
        try {
            console.log(`🚫 Blocking tab: ${tab.url}`);
            
            // Track blocked site
            const url = new URL(tab.url);
            const domain = url.hostname;
            
            if (!this.blockedSitesList.includes(domain)) {
                this.blockedSitesList.push(domain);
            }
            
            // Update blocked count
            this.blockedCount++;
            this.lastBlockAt = Date.now();
            
            // Create blocked page
            const blockedUrl = chrome.runtime.getURL('blocked.html') + 
                '?url=' + encodeURIComponent(tab.url) + 
                '&reason=' + encodeURIComponent('Distracting content detected');
            
            // Redirect to blocked page
            await chrome.tabs.update(tab.id, { url: blockedUrl });
            
            console.log(`✅ Successfully blocked: ${domain}`);
            
        } catch (error) {
            console.log(`❌ Failed to block tab: ${error.message}`);
        }
    }

    notifyEducational(tab) {
        console.log('✅ Educational content allowed:', tab.url);
        // Skip notifications to avoid icon errors
        console.log('📢 Educational content allowed - notifications disabled');
    }

    async getEducationalAlternative() {
        // Return a default educational URL or fetch from API
        const alternatives = [
            'https://www.khanacademy.org',
            'https://www.coursera.org',
            'https://www.edx.org',
            'https://github.com',
            'https://stackoverflow.com'
        ];
        
        return alternatives[Math.floor(Math.random() * alternatives.length)];
    }

    async checkCurrentTab() {
        try {
            const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
            if (tabs && tabs.length > 0) {
                await this.handleTabChange(tabs[0]);
            }
        } catch (error) {
            console.log('❌ Failed to check current tab:', error);
        }
    }

    async startSession() {
        try {
            this.sessionActive = true;
            this.startTime = Date.now();
            this.blockedCount = 0;
            
            // Start camera monitoring
            await this.startCameraMonitoring();
            
            console.log('🚀 Session started - Tab monitoring active');
            console.log('📹 Camera monitoring started');
            
        } catch (error) {
            console.log('❌ Failed to start session:', error);
        }
    }

    async stopSession() {
        try {
            this.sessionActive = false;
            
            // Save session data before stopping
            await this.saveSessionData();
            
            // Always stop camera when session ends
            await this.stopCameraMonitoring();
            
            // Clear all timers
            this.blockingTimers.forEach(timer => clearTimeout(timer));
            this.blockingTimers.clear();
            
            this.monitoringTimers.forEach(timer => clearTimeout(timer));
            this.monitoringTimers.clear();
            
            console.log('🛑 Session stopped');
            console.log('📹 Camera monitoring stopped');
            
        } catch (error) {
            console.log('❌ Failed to stop session:', error);
        }
    }

    async saveSessionData() {
        try {
            if (!this.startTime) return;
            
            const sessionData = {
                id: Date.now().toString(),
                date: new Date().toISOString(),
                duration: Date.now() - this.startTime,
                avgFocus: this.getAverageScore(this.focusScores),
                avgPosture: this.getAverageScore(this.postureScores),
                avgFatigue: this.calculateFatigueScore(),
                blockedSites: this.blockedCount,
                focusScores: [...this.focusScores],
                postureScores: [...this.postureScores],
                blockedSitesList: this.blockedSitesList || []
            };
            
            // Get existing session data
            const existingData = await this.getStoredSessionData();
            existingData.push(sessionData);
            
            // Save to localStorage (accessible by analytics dashboard)
            await this.saveToLocalStorage('workspaceSessionData', existingData);
            
            console.log('💾 Session data saved:', sessionData);
            
        } catch (error) {
            console.log('❌ Failed to save session data:', error);
        }
    }

    async getStoredSessionData() {
        try {
            const result = await chrome.storage.local.get(['workspaceSessionData']);
            return result.workspaceSessionData || [];
        } catch (error) {
            console.log('❌ Failed to get stored session data:', error);
            return [];
        }
    }

    async saveToLocalStorage(key, data) {
        try {
            await chrome.storage.local.set({ [key]: data });
        } catch (error) {
            console.log('❌ Failed to save to local storage:', error);
        }
    }

    calculateFatigueScore() {
        const avgFocus = this.getAverageScore(this.focusScores);
        const avgPosture = this.getAverageScore(this.postureScores);
        
        if (!avgFocus || !avgPosture) return 0;
        
        // Fatigue is inverse of average focus and posture
        const avgScore = (avgFocus + avgPosture) / 2;
        return Math.max(0, Math.min(100, 100 - avgScore));
    }

    // Camera monitoring methods (simplified for now)
    async startCameraMonitoring() {
        try {
            console.log('📹 Requesting camera permission...');
            
            // Get current tab and validate it's suitable for camera
            const currentTab = await this.getCurrentTab();
            if (!currentTab) {
                console.log('❌ No active tab for camera request');
                this.cameraMonitoring = false;
                return;
            }
            
            // Check if tab is suitable for camera access
            if (currentTab.url.startsWith('chrome://') || 
                currentTab.url.startsWith('chrome-extension://') ||
                currentTab.url.startsWith('edge://') ||
                currentTab.url.startsWith('about:')) {
                console.log('❌ Cannot access camera on internal page:', currentTab.url);
                this.cameraMonitoring = false;
                return;
            }
            
            console.log('📹 Using tab for camera:', currentTab.url);
            
            // For now, just set monitoring to true without actual camera
            this.cameraMonitoring = true;
            this.cameraTabId = currentTab.id;
            console.log('✅ Camera monitoring started (simplified)');
            
        } catch (error) {
            console.log('❌ Camera monitoring setup failed:', error);
            this.cameraMonitoring = false;
        }
    }

    async stopCameraMonitoring() {
        try {
            console.log('📹 Attempting to stop camera monitoring...');
            
            // Stop frame capture interval first
            if (this.cameraInterval) {
                clearInterval(this.cameraInterval);
                this.cameraInterval = null;
                console.log('📹 Camera interval stopped');
            }
            
            this.cameraMonitoring = false;
            this.cameraTabId = null;
            
            console.log('📹 Camera monitoring stopped');
            
            // Clear camera scores
            this.focusScores = [];
            this.postureScores = [];
            
        } catch (error) {
            console.log('❌ Failed to stop camera monitoring:', error);
            this.cameraMonitoring = false;
            this.cameraTabId = null;
            this.focusScores = [];
            this.postureScores = [];
        }
    }

    async getCurrentTab() {
        try {
            const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
            return tabs[0] || null;
        } catch (error) {
            console.log('❌ Failed to get current tab:', error);
            return null;
        }
    }

    getAverageScore(scores) {
        if (scores.length === 0) return 0;
        const sum = scores.reduce((a, b) => a + b, 0);
        return Math.round(sum / scores.length);
    }

    getCameraStatus() {
        return {
            monitoring: this.cameraMonitoring,
            focusScores: this.focusScores.slice(-10), // Last 10 scores
            postureScores: this.postureScores.slice(-10), // Last 10 scores
            avgFocus: this.getAverageScore(this.focusScores),
            avgPosture: this.getAverageScore(this.postureScores),
            lastCheck: this.lastCameraCheck
        };
    }
}

// Initialize the monitor
new WorkSpaceMonitor();
