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
                    // START CAMERA FROM WEBSITE BUTTON
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
                case 'start_session_with_camera':
                    // START SESSION + CAMERA FROM WEBSITE
                    this.startSession();
                    this.startCameraMonitoring().then(() => {
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

        // RESTORED: Direct blocking for known distracting sites
        if (this.isDistractingSite(tab.url)) {
            console.log('🚫 Direct blocking for known distracting site:', tab.url);
            await this.showBlockingWarning(tab);
            return;
        }

        // YOUTUBE SPECIAL HANDLING - Allow homepage/search, analyze videos
        if (tab.url.includes('youtube.com')) {
            await this.handleYouTube(tab);
            return;
        }

        // Camera only starts from website button - no auto-start
        console.log('⚪ Tab monitoring active - camera from website only');
    }

    async handleYouTube(tab) {
        try {
            // Check if it's a YouTube video page
            if (tab.url.includes('/watch?v=')) {
                console.log('🎬 YouTube video detected - analyzing content...');
                
                // Get tab content for analysis
                const tabContent = await this.getTabContent(tab);
                
                // Use local analysis instead of backend (backend might not be working)
                const analysis = this.localYouTubeAnalysis(tab, tabContent);

                if (analysis.is_distracting) {
                    console.log('🚫 YouTube video is distracting:', tab.url);
                    await this.showBlockingWarning(tab);
                } else if (analysis.is_educational) {
                    console.log('✅ YouTube video is educational:', tab.url);
                    this.notifyEducational(tab);
                } else {
                    console.log('⚪ YouTube video is neutral:', tab.url);
                }
            } else {
                // YouTube homepage, search, or other pages - allow
                console.log('✅ YouTube homepage/search allowed:', tab.url);
            }
        } catch (error) {
            console.log('❌ Error analyzing YouTube:', error);
        }
    }

    isRegularWebsite(url) {
        // Check if it's a regular website (not internal page)
        return !url.startsWith('chrome://') && 
               !url.startsWith('chrome-extension://') && 
               !url.startsWith('edge://') && 
               !url.startsWith('about:') &&
               !url.startsWith('moz-extension://') &&
               !url.startsWith('chrome://extensions/');
    }

    isDistractingSite(url) {
        const distractingDomains = [
            'instagram.com', 'facebook.com', 'twitter.com', 'tiktok.com',
            'netflix.com', 'twitch.tv', 'reddit.com', 'discord.com',
            'spotify.com', 'snapchat.com', 'pinterest.com', 'linkedin.com',
            'youtu.be', 'vimeo.com', 'dailymotion.com',
            'bilibili.com', 'vine.co', 'funnyordie.com', '9gag.com',
            'memedroid.com', 'cheezburger.com', 'reddit.com/r/funny',
            'imgur.com', 'giphy.com', 'tenor.com', 'ifunny.co',
            'bbkivines.com', 'bbkivines.co', 'carryminati.com',
            'bhuvanbam.com', 'ashishchanchlani.com', 'round2hell.com',
            'mumbikernikal', 'nischaymalhan', 'triggeredinsaan'
        ];
        
        // YouTube is handled separately - don't block youtube.com directly
        if (url.includes('youtube.com')) {
            return false;
        }
        
        try {
            const domain = new URL(url).hostname.toLowerCase();
            return distractingDomains.some(d => domain.includes(d) || domain.includes(d.replace('.com', '')));
        } catch (error) {
            return false;
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
        // DISABLED: Use local analysis only to avoid CORS issues
        console.log('📊 Using local analysis to avoid CORS issues');
        return this.localYouTubeAnalysis(tab, content);
        
        // Original backend code commented out to prevent CORS errors
        /*
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
        */
    }

    localYouTubeAnalysis(tab, content) {
        const url = tab.url.toLowerCase();
        const title = content.title.toLowerCase();
        const text = content.text.toLowerCase();

        console.log('📊 Analyzing YouTube video:', { title: title.substring(0, 100) });

        // Educational keywords (EXPANDED)
        const educationalKeywords = [
            'tutorial', 'learn', 'course', 'lecture', 'education', 'study',
            'math', 'mathematics', 'algebra', 'geometry', 'calculus', 'statistics',
            'science', 'physics', 'chemistry', 'biology', 'programming',
            'coding', 'computer science', 'algorithm', 'data structure',
            'khan academy', 'coursera', 'edx', 'mit', 'stanford',
            '3blue1brown', 'crash course', 'ted ed', 'national geographic',
            'documentary', 'explain', 'how to', 'guide', 'lesson',
            'indian education', 'jee', 'neet', 'iit', 'unacademy',
            'byju\'s', 'physics wallah', 'khan academy', 'vedantu',
            'chemistry wallah', 'biology wallah', 'math wallah',
            'jee main', 'jee advanced', 'neet pg', 'upsc',
            'gate', 'cat', 'sat', 'gre', 'ielts', 'toefl',
            'engineering', 'medical', 'commerce', 'arts',
            'university', 'college', 'school', 'academy',
            'online course', 'free course', 'certification',
            'skill development', 'professional', 'training',
            'workshop', 'seminar', 'conference', 'webinar',
            'mit opencourseware', 'mit course', 'mit lecture', 'mit class',
            'stanford university', 'stanford lecture', 'stanford course',
            'mit opencourseware', 'mit free courses', 'mit online courses',
            'stanford online', 'stanford free courses', 'stanford classes',
            'mit lectures', 'mit classes', 'mit free education'
        ];

        // Distracting keywords (EXPANDED but more specific)
        const distractingKeywords = [
            'music video', 'song video', 'dance video', 'funny video', 'meme compilation', 'prank video', 'comedy video',
            'gaming video', 'gameplay video', 'stream video', 'vlog video', 'challenge video', 'trend video',
            'celebrity gossip', 'news update', 'politics news', 'sports highlights', 'entertainment video',
            'movie trailer', 'movie review', 'unboxing video', 'fashion haul', 'makeup tutorial',
            'lifestyle vlog', 'food recipe', 'travel vlog', 'vacation video',
            'bb ki vines', 'carryminati', 'bhuvan bam', 'ashish chanchlani',
            'roast video', 'parody video', 'bollywood movie', 'hollywood movie', 'netflix series', 'amazon prime',
            'tiktok video', 'instagram reel', 'facebook post', 'twitter tweet', 'reddit post', 'discord chat',
            'stand up comedy', 'jokes video', 'funny moments', 'epic fails', 'try not to laugh',
            'viral trends', 'challenge videos', 'life hacks', 'product review', 'tech review',
            'makeup tutorial', 'fashion haul', 'cooking video', 'travel vlog', 'daily vlog',
            'reaction video', 'commentary video', 'rant video', 'drama video', 'controversy video',
            'reality show', 'talk show', 'interview video', 'podcast video', 'live stream',
            'concert video', 'festival video', 'event coverage', 'celebrity gossip', 'sports highlight',
            'game highlights', 'funny animals', 'cute videos', 'viral video', 'trending video',
            'entertainment clip', 'funny clip', 'comedy sketch', 'prank video'
        ];

        // Count keyword matches
        let educationalScore = 0;
        let distractionScore = 0;

        educationalKeywords.forEach(keyword => {
            if (title.includes(keyword) || text.includes(keyword)) {
                educationalScore++;
                console.log('📚 Found educational keyword:', keyword);
                
                // Give extra weight to high-quality educational channels
                if (keyword === '3blue1brown' || keyword === 'khan academy' || 
                    keyword === 'mit' || keyword === 'stanford' || 
                    keyword === 'crash course' || keyword === 'ted ed' ||
                    keyword === 'mit opencourseware' || keyword === 'mit course' ||
                    keyword === 'mit lecture' || keyword === 'mit class' ||
                    keyword === 'stanford university' || keyword === 'stanford lecture' ||
                    keyword === 'stanford course' || keyword === 'stanford online') {
                    educationalScore += 3; // Extra point for top-tier educational
                    console.log('🎓 Top-tier educational content detected:', keyword, '+2 extra points');
                }
            }
        });

        distractingKeywords.forEach(keyword => {
            if (title.includes(keyword) || text.includes(keyword)) {
                distractionScore++;
                console.log('🚫 Found distracting keyword:', keyword);
            }
        });

        // Determine content type with enhanced logic
        let contentType = 'neutral';
        let isEducational = false;
        let isDistracting = false;

        console.log('📊 Score analysis:', { educationalScore, distractionScore });

        // Enhanced scoring for better accuracy - MORE LENIENT
        if (distractionScore >= 3) {
            // Only block if there are 3+ distracting keywords
            contentType = 'youtube_distracting';
            isDistracting = true;
        } else if (distractionScore >= 2 && educationalScore === 0) {
            // Block if 2+ distracting keywords AND no educational keywords
            contentType = 'youtube_distracting';
            isDistracting = true;
        } else if (educationalScore >= 3) {
            // Allow if 3+ educational keywords
            contentType = 'youtube_educational';
            isEducational = true;
        } else if (educationalScore >= 2 && distractionScore <= 1) {
            // Allow if 2+ educational keywords and at most 1 distracting keyword
            contentType = 'youtube_educational';
            isEducational = true;
        } else if (educationalScore >= 1 && distractionScore === 0) {
            // Allow if single educational keyword with no distracting keywords
            contentType = 'youtube_educational';
            isEducational = true;
        } else if (distractionScore > educationalScore && educationalScore === 0) {
            // Block if more distracting than educational and no educational keywords
            contentType = 'youtube_distracting';
            isDistracting = true;
        } else if (educationalScore > 0) {
            // Allow if any educational keywords
            contentType = 'youtube_educational';
            isEducational = true;
        } else {
            // Neutral if no keywords or equal scores
            contentType = 'neutral';
        }

        console.log('📊 Local analysis result:', {
            contentType: contentType,
            is_educational: isEducational,
            is_distracting: isDistracting,
            educational_score: educationalScore,
            distraction_score: distractionScore
        });

        return {
            is_educational: isEducational,
            is_distracting: isDistracting,
            content_type: contentType,
            educational_score: educationalScore,
            distraction_score: distractionScore
        };
    }

    async showBlockingWarning(tab) {
        try {
            console.log('⚠️ Showing 5-second warning for:', tab.url);
            
            // Set timer to block after 5 seconds
            const timer = setTimeout(async () => {
                await this.blockTab(tab);
                this.blockingTimers.delete(tab.id);
            }, 5000);
            
            // Store timer for cleanup
            this.blockingTimers.set(tab.id, timer);

        } catch (error) {
            console.log('❌ Failed to show warning:', error);
        }
    }

    async showCountdownOverlay(tab) {
        // DISABLED: Use simple redirect instead of overlay to avoid CSP violations
        console.log('⚠️ Using simple redirect instead of overlay to avoid CSP issues');
        await this.blockTab(tab);
        return;
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
            
            // METHOD 1: Try to redirect to blocked page
            try {
                const blockedUrl = chrome.runtime.getURL('blocked.html') + 
                    '?url=' + encodeURIComponent(tab.url) + 
                    '&reason=' + encodeURIComponent('Distracting content detected');
                
                await chrome.tabs.update(tab.id, { url: blockedUrl });
                console.log(`✅ Successfully redirected: ${domain}`);
                
            } catch (redirectError) {
                console.log(`⚠️ Redirect failed, trying direct close: ${redirectError.message}`);
                
                // METHOD 2: Direct tab close
                try {
                    await chrome.tabs.remove(tab.id);
                    console.log(`✅ Successfully closed tab: ${domain}`);
                    
                } catch (closeError) {
                    console.log(`⚠️ Tab close failed, trying content script: ${closeError.message}`);
                    
                    // METHOD 3: Force close via content script
                    try {
                        await chrome.scripting.executeScript({
                            target: { tabId: tab.id },
                            func: () => {
                                window.close();
                                // Alternative: redirect to blank page
                                window.location.href = 'about:blank';
                            }
                        });
                        console.log(`✅ Force closed tab via content script: ${domain}`);
                        
                    } catch (scriptError) {
                        console.log(`❌ All blocking methods failed: ${scriptError.message}`);
                    }
                }
            }
            
            console.log(`✅ Blocking action completed for: ${domain}`);
            
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
            
            // ONLY START SESSION - No auto-camera
            console.log('🚀 Session started - Tab monitoring active');
            console.log('📹 Camera will start only from website button');
            
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

    // Camera monitoring methods (FULL FUNCTIONALITY)
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
            
            // Inject script to request camera and keep stream open
            const result = await chrome.scripting.executeScript({
                target: { tabId: currentTab.id },
                func: async () => {
                    try {
                        console.log('📹 Requesting camera in content script...');
                        
                        // Request camera access and keep stream open
                        const stream = await navigator.mediaDevices.getUserMedia({
                            video: {
                                width: { ideal: 1280 },
                                height: { ideal: 720 }
                            },
                            audio: false
                        });
                        
                        console.log('✅ Camera access granted in content script');
                        
                        // Store stream globally
                        window.workspaceCameraStream = stream;
                        
                        // Create video element to keep stream active
                        const video = document.createElement('video');
                        video.srcObject = stream;
                        video.play();
                        
                        // Store video element globally
                        window.workspaceVideo = video;
                        
                        // Wait for video to be ready
                        await new Promise(resolve => {
                            video.onloadedmetadata = resolve;
                        });
                        
                        console.log('📹 Camera stream active - no analysis running');
                        
                        return {
                            success: true,
                            message: 'Camera stream established - monitoring only'
                        };
                        
                    } catch (error) {
                        console.log('❌ Camera access denied in content script:', error);
                        return {
                            success: false,
                            error: error.message
                        };
                    }
                }
            });
            
            if (result && result[0] && result[0].result) {
                const cameraResult = result[0].result;
                if (cameraResult.success) {
                    this.cameraMonitoring = true;
                    this.cameraTabId = currentTab.id;
                    console.log('✅ Camera access granted - monitoring only');
                    
                    // NO ANALYSIS - Just keep camera on
                    console.log('📹 Camera is ON - no analysis running');
                } else {
                    console.log('❌ Camera access denied:', cameraResult.error);
                    this.cameraMonitoring = false;
                }
            } else {
                console.log('❌ Failed to get camera response');
                this.cameraMonitoring = false;
            }
            
        } catch (error) {
            console.log('❌ Camera monitoring setup failed:', error);
            this.cameraMonitoring = false;
        }
    }

    async startContinuousFrameCapture() {
        if (!this.cameraMonitoring) return;
        
        // Capture frames every 10 seconds using existing stream
        this.cameraInterval = setInterval(async () => {
            if (this.cameraMonitoring && this.sessionActive) {
                try {
                    const result = await chrome.scripting.executeScript({
                        target: { tabId: this.cameraTabId },
                        func: async () => {
                            try {
                                // Use existing video stream
                                const video = window.workspaceVideo;
                                const stream = window.workspaceCameraStream;
                                
                                if (!video || !stream) {
                                    return {
                                        success: false,
                                        error: 'Camera stream not available'
                                    };
                                }
                                
                                // Create canvas for frame capture
                                const canvas = document.createElement('canvas');
                                canvas.width = video.videoWidth || 1280;
                                canvas.height = video.videoHeight || 720;
                                const ctx = canvas.getContext('2d');
                                
                                // Draw current video frame
                                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                                
                                // Convert to base64
                                const imageData = canvas.toDataURL('image/jpeg', 0.8);
                                
                                return {
                                    success: true,
                                    imageData: imageData,
                                    timestamp: Date.now()
                                };
                                
                            } catch (error) {
                                return {
                                    success: false,
                                    error: error.message
                                };
                            }
                        }
                    });
                    
                    if (result && result[0] && result[0].result) {
                        const frameResult = result[0].result;
                        if (frameResult.success) {
                            // Analyze the frame
                            await this.analyzeCameraFrame(frameResult.imageData);
                        } else {
                            console.log('❌ Frame capture failed:', frameResult.error);
                        }
                    }
                } catch (error) {
                    console.log('❌ Frame capture failed:', error);
                }
            }
        }, 10000);
        
        console.log('📹 Continuous frame capture started - every 10 seconds');
    }

    async analyzeCameraFrame(imageData) {
        try {
            // Mock OpenCV analysis (in real implementation, this would send to backend)
            const timestamp = Date.now();
            
            // Simulate focus score based on time of day and random factors
            const hour = new Date().getHours();
            let focusScore = 70; // Base focus score
            
            // Lower focus during typical distraction times
            if (hour >= 13 && hour <= 15) focusScore -= 15; // Afternoon slump
            if (hour >= 20 && hour <= 22) focusScore -= 20; // Evening entertainment
            if (hour >= 0 && hour <= 6) focusScore -= 10; // Late night
            
            // Add some randomness
            focusScore += Math.random() * 20 - 10;
            focusScore = Math.max(0, Math.min(100, focusScore));
            
            // Simulate posture score
            let postureScore = 75; // Base posture score
            
            // Random posture variations
            const postureFactors = ['slouching', 'leaning', 'good posture', 'hunching'];
            const randomPosture = postureFactors[Math.floor(Math.random() * postureFactors.length)];
            
            switch (randomPosture) {
                case 'good posture':
                    postureScore = 85 + Math.random() * 10;
                    break;
                case 'slouching':
                    postureScore = 45 + Math.random() * 15;
                    break;
                case 'leaning':
                    postureScore = 60 + Math.random() * 10;
                    break;
                case 'hunching':
                    postureScore = 35 + Math.random() * 15;
                    break;
            }
            
            postureScore = Math.max(0, Math.min(100, postureScore));
            
            // Store scores
            this.focusScores.push(Math.round(focusScore));
            this.postureScores.push(Math.round(postureScore));
            
            // Keep only last 30 scores
            if (this.focusScores.length > 30) {
                this.focusScores = this.focusScores.slice(-30);
                this.postureScores = this.postureScores.slice(-30);
            }
            
            console.log('📊 Analysis results:', {
                focus: Math.round(focusScore),
                posture: Math.round(postureScore),
                avgFocus: this.getAverageScore(this.focusScores),
                avgPosture: this.getAverageScore(this.postureScores)
            });
            
        } catch (error) {
            console.log('❌ Camera frame analysis failed:', error);
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
            
            // Force stop camera stream in content script
            if (this.cameraTabId) {
                console.log('📹 Stopping camera stream in tab:', this.cameraTabId);
                
                const result = await chrome.scripting.executeScript({
                    target: { tabId: this.cameraTabId },
                    func: () => {
                        try {
                            console.log('📹 Stopping camera stream in content script...');
                            
                            let stopped = false;
                            
                            // Stop the camera stream with multiple methods
                            if (window.workspaceCameraStream) {
                                console.log('📹 Found camera stream, stopping tracks...');
                                const tracks = window.workspaceCameraStream.getTracks();
                                tracks.forEach(track => {
                                    try {
                                        track.stop();
                                        console.log('📹 Track stopped:', track.kind, track.label, track.readyState);
                                    } catch (e) {
                                        console.log('📹 Error stopping track:', e.message);
                                    }
                                });
                                
                                // Force close the stream
                                try {
                                    window.workspaceCameraStream.getVideoTracks().forEach(track => track.stop());
                                } catch (e) {
                                    console.log('📹 Error force stopping video tracks:', e.message);
                                }
                                
                                window.workspaceCameraStream = null;
                                stopped = true;
                            } else {
                                console.log('📹 No camera stream found');
                            }
                            
                            // Clean up video element
                            if (window.workspaceVideo) {
                                console.log('📹 Cleaning up video element...');
                                try {
                                    window.workspaceVideo.pause();
                                    window.workspaceVideo.srcObject = null;
                                    window.workspaceVideo.remove();
                                } catch (e) {
                                    console.log('📹 Error cleaning up video:', e.message);
                                }
                                window.workspaceVideo = null;
                            }
                            
                            // Clean up any remaining objects
                            delete window.workspaceCameraStream;
                            delete window.workspaceVideo;
                            
                            console.log('📹 Camera cleanup completed. Stopped:', stopped);
                            
                            return {
                                success: true,
                                stopped: stopped,
                                message: stopped ? 'Camera stream stopped successfully' : 'No camera stream was active'
                            };
                            
                        } catch (error) {
                            console.log('❌ Failed to stop camera stream:', error);
                            return {
                                success: false,
                                error: error.message
                            };
                        }
                    }
                });
                
                if (result && result[0] && result[0].result) {
                    const stopResult = result[0].result;
                    console.log('📹 Camera stop result:', stopResult);
                }
            }
            
            // Always set monitoring to false
            this.cameraMonitoring = false;
            this.cameraTabId = null;
            
            console.log('📹 Camera monitoring stopped');
            
            // Clear camera scores
            this.focusScores = [];
            this.postureScores = [];
            
        } catch (error) {
            console.log('❌ Failed to stop camera monitoring:', error);
            // Still set monitoring to false even if cleanup fails
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
