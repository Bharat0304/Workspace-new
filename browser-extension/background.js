// WorkSpace AI Simple Tab Monitor - Based on your reference
const API_BASE = 'https://backend-workspace-vccb.onrender.com'; // AI backend (Render)
// Use a simple emoji instead of problematic icon URL
const ICON_DATA_URL = '🚫';

class WorkSpaceMonitor {
    constructor() {
        this.sessionActive = false;
        this.lastBlockAt = 0;
        this.currentTab = null;
        this.startTime = null;
        this.blockedCount = 0;
        this.blockingTimers = new Map(); // Track countdown timers

        // Educational sites (auto-allowed) — YouTube is NOT here, gets special handling
        this.educationalSites = new Set([
            'khanacademy.org', 'coursera.org', 'edx.org', 'udacity.com',
            'pluralsight.com', 'brilliant.org', 'w3schools.com',
            'stackoverflow.com', 'github.com', 'gitlab.com', 'codecademy.com',
            'freecodecamp.org', 'theodinproject.com', 'leetcode.com',
            'hackerrank.com', 'codewars.com', 'topcoder.com'
        ]);

        this.init();
    }

    init() {
        console.log('🚀 WorkSpace Tab Monitor initialized');

        // Set up tab monitoring
        this.setupTabMonitoring();

        // Set up message listeners
        this.setupMessageListeners();

        // Set up polling
        this.setupPolling();

        // Check current tab on startup
        this.checkCurrentTab();
    }

    setupTabMonitoring() {
        // Monitor tab changes
        chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
            if (changeInfo.status === 'complete' && tab.url) {
                console.log('🔄 Tab updated:', tab.url);
                this.handleTabChange(tab);
            }
        });

        // Monitor tab activation
        chrome.tabs.onActivated.addListener((activeInfo) => {
            chrome.tabs.get(activeInfo.tabId, (tab) => {
                if (tab && tab.url) {
                    console.log('🔄 Tab activated:', tab.url);
                    this.handleTabChange(tab);
                }
            });
        });
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
                case 'stop_session':
                case 'session_stopped':
                    this.stopSession();
                    sendResponse({ success: true });
                    break;
                case 'get_status':
                    sendResponse({
                        active: this.sessionActive,
                        startTime: this.startTime,
                        blockedCount: this.blockedCount
                    });
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
                    console.log('⚠️ Unknown message type:', message.type || message.action);
                    sendResponse({ success: false, error: 'Unknown action' });
            }
        });
    }

    setupPolling() {
        // Poll every 5 seconds when session is active
        chrome.alarms.create('workspace-tab-check', { periodInMinutes: 0.083 });
        chrome.alarms.onAlarm.addListener((alarm) => {
            if (alarm.name === 'workspace-tab-check' && this.sessionActive) {
                this.checkCurrentTab();
            }
        });
    }

    async handleTabChange(tab) {
        if (!this.sessionActive) return;

        // Ignore internal Chrome pages
        if (tab.url.startsWith('chrome://') ||
            tab.url.startsWith('chrome-extension://') ||
            tab.url.startsWith('moz-extension://') ||
            tab.url.startsWith('edge://') ||
            tab.url.startsWith('about:')) {
            console.log('⏭️ Skipping internal page:', tab.url);
            return;
        }

        this.currentTab = tab;

        try {
            const url = new URL(tab.url);
            const domain = url.hostname;

            // Handle Instagram - immediate block without redirect
            if (domain.includes('instagram.com')) {
                console.log('🚫 Instagram detected - blocking immediately');
                await this.blockTabDirectly(tab, 'Instagram');
                return;
            }

            // Handle YouTube - smart content monitoring
            if (domain.includes('youtube.com') || domain.includes('youtu.be')) {
                console.log('🎬 YouTube detected - analyzing content');
                await this.monitorYouTubeContent(tab);
                return;
            }

            // Handle other educational sites
            if (this.educationalSites.has(domain)) {
                console.log('✅ Educational site detected:', domain);
                this.notifyEducational(tab);
                return;
            }

            // Analyze other tabs with AI backend
            await this.analyzeTab(tab);

        } catch (error) {
            console.log('❌ Error handling tab change:', error);
        }
    }

    async monitorYouTubeContent(tab) {
        // Clear any existing timer for this tab
        if (this.blockingTimers.has(tab.id)) {
            clearTimeout(this.blockingTimers.get(tab.id));
            this.blockingTimers.delete(tab.id);
        }

        // Allow YouTube homepage (user is browsing, not watching)
        const urlPath = new URL(tab.url).pathname;
        if (urlPath === '/' || urlPath === '') {
            console.log('🏠 YouTube homepage - allowing');
            return;
        }

        // Allow YouTube search results
        if (urlPath === '/results') {
            console.log('🔍 YouTube search - allowing');
            return;
        }

        try {
            console.log('🎬 Analyzing YouTube content:', tab.title);

            // Try AI backend first using the correct /analyze/tab endpoint
            let analysis;
            try {
                const response = await fetch(`${API_BASE}/analyze/tab`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        url: tab.url,
                        title: tab.title
                    })
                });

                if (!response.ok) {
                    throw new Error(`Analysis failed: ${response.status}`);
                }

                const result = await response.json();
                // Extract the nested result from the backend response
                analysis = result.result || result;
                console.log('🧠 YouTube AI Analysis:', analysis);

            } catch (backendError) {
                console.log('❌ Backend not available, using local YouTube analysis:', backendError.message);
                analysis = this.localYouTubeAnalysis(tab);
            }

            // Check if YouTube content is distracting
            const isDistracting = this.isYouTubeDistracting(analysis, tab);

            if (isDistracting) {
                console.log('🚫 Distracting YouTube content detected - blocking:', tab.title);
                await this.showBlockingWarning(tab, 'YouTube');
            } else {
                console.log('✅ Educational YouTube content allowed:', tab.title);
                this.notifyEducational(tab);
            }

        } catch (error) {
            console.log('❌ YouTube monitoring failed:', error);
            // On error, default to blocking for safety
            await this.showBlockingWarning(tab, 'YouTube');
        }

        // Schedule next check in 10 seconds
        setTimeout(() => {
            if (this.sessionActive) {
                this.monitorYouTubeContent(tab);
            }
        }, 10000);
    }

    localYouTubeAnalysis(tab) {
        const title = tab.title.toLowerCase();
        const url = tab.url.toLowerCase();

        let distractionScore = 0;
        let contentType = 'neutral';

        // ===== EDUCATIONAL WHITELIST (must match to be allowed) =====
        const educationalKeywords = [
            // General education
            'tutorial', 'learn', 'course', 'lecture', 'education', 'educational',
            'study', 'studying', 'academic', 'university', 'college', 'professor',
            'explained', 'explanation', 'guide', 'how to',
            'introduction', 'basics', 'fundamentals', 'concepts',

            // Math
            'math', 'mathematics', 'calculus', 'algebra', 'geometry', 'trigonometry',
            'derivative', 'integral', 'equation', 'theorem', 'proof',
            'linear algebra', 'vector', 'matrix', 'statistics', 'probability',

            // Science
            'physics', 'chemistry', 'biology', 'quantum', 'thermodynamics',
            'electromagnetism', 'neuroscience', 'genetics', 'astronomy',
            'organic chemistry', 'inorganic chemistry',

            // Computer science
            'programming', 'coding', 'computer science', 'algorithm', 'data structure',
            'python tutorial', 'javascript tutorial', 'machine learning', 'neural network',
            'artificial intelligence', 'software engineering',
            'web development', 'app development', 'react tutorial', 'node.js',

            // Educational channels
            '3blue1brown', 'khan academy', 'crash course', 'veritasium',
            'numberphile', 'minutephysics', 'ted-ed', 'ted ed', 'scishow',
            'smarter every day', 'vsauce', 'kurzgesagt', 'computerphile',
            'mark rober', 'tom scott', 'freecodecamp',

            // Indian education (JEE/NEET/UPSC)
            'unacademy', "byju's", 'vedantu', 'physics wallah', 'pw',
            'jee', 'neet', 'iit', 'cbse', 'ncert', 'icse',
            'electrostatics', 'magnetism', 'optics', 'mechanics',
            'botany', 'zoology', 'coordinate geometry',
            'upsc', 'gate', 'cat preparation'
        ];

        // ===== DISTRACTION BLACKLIST (explicitly block) =====
        const distractingKeywords = [
            // General entertainment
            'funny', 'meme', 'memes', 'prank', 'pranks', 'challenge', 'challenges',
            'vlog', 'vlogs', 'reaction', 'reactions', 'drama', 'celebrity',
            'trending', 'viral', 'gossip', 'entertainment', 'compilation',
            'try not to laugh', 'funny moments', 'epic fail', 'fails', 'fail',
            'satisfying', 'asmr', 'oddly satisfying',

            // Music and dance
            'music video', 'official video', 'official audio', 'dance',
            'song', 'album', 'remix', 'concert', 'lyrics', 'lyrical',
            'cover song', 'dance challenge', 'reels', 'shorts',
            'full album', 'playlist', 'jukebox', 'audio jukebox',

            // Gaming
            'gaming', 'gameplay', 'lets play', 'let\'s play', 'playthrough',
            'esports', 'tournament', 'live stream', 'livestream', 'gamer',
            'fortnite', 'minecraft', 'gta', 'pubg', 'free fire', 'valorant',
            'bgmi', 'call of duty', 'among us', 'roblox',

            // Comedy and skits
            'comedy', 'parody', 'roast', 'stand up', 'sketch', 'skit',
            'funny videos', 'vine', 'vines', 'jokes', 'standup',

            // ====== INDIAN ENTERTAINMENT YOUTUBERS ======
            'bb ki vines', 'bhuvan bam', 'titu talks', 'titu mama',
            'carryminati', 'carry minati', 'ajey nagar',
            'ashish chanchlani', 'harsh beniwal', 'amit bhadana',
            'round2hell', 'r2h', 'zayn saifi', 'nazim ahmed',
            'triggered insaan', 'nischay malhan', 'fukra insaan',
            'sourav joshi', 'sourav joshi vlogs', 'piyush joshi',
            'mumbiker nikhil', 'flying beast', 'gaurav taneja',
            'total gaming', 'ajju bhai',
            'dynamo gaming', 'hydra dynamo',
            'mortal', 'naman mathur', 'soul mortal',
            'scout', 'tanmay singh',
            'jonathan gaming', 'jonathan jojo',
            'lakshay chaudhary', 'elvish yadav',
            'uk07 rider', 'aman dancer real',
            'thugesh', 'slayy point', 'saiman says',
            'tanmay bhat', 'samay raina',
            'mythpat', 'mithilesh patankar',
            'live insaan', 'be younick',
            'manoj dey', 'mr indian hacker', 'dilraj singh',
            'crazy xyz', 'amit sharma',
            'techno gamerz', 'ujjwal',
            'total gaming', 'carry is live',
            'desi gamers', 'amitbhai',
            'two side gamers', 'jash dhoka',
            'the rawknee', 'rawknee games',
            'neon man', 'triggered insaan shorts',
            'kapil sharma', 'the kapil sharma show', 'tkss',
            'bigg boss', 'koffee with karan',
            'the lallantop', 'dhruv rathee vlog',

            // ====== INTERNATIONAL ENTERTAINMENT YOUTUBERS ======
            'mr beast', 'mrbeast', 'mr. beast',
            'jake paul', 'logan paul', 'ksi',
            'david dobrik', 'emma chamberlain',
            'pewdiepie', 'markiplier', 'jacksepticeye',
            'dude perfect', 'dream', 'tommyinnit',
            'sidemen', 'beta squad', 'speed',
            'ishowspeed', 'adin ross', 'kai cenat',
            'nickmercs', 'xqc', 'pokimane',

            // Bollywood / Indian entertainment
            'bollywood', 'movie clip', 'movie scene', 'trailer',
            'teaser', 'web series', 'tv show', 'serial',
            'full movie', 'movie review', 'film review',

            // Sports entertainment
            'cricket highlights', 'football highlights', 'ipl',
            'best plays', 'top 10', 'top 5', 'best of', 'worst of',

            // Lifestyle / non-educational
            'haul', 'lookbook', 'fashion', 'beauty', 'makeup',
            'grwm', 'get ready with me', 'daily routine',
            'mukbang', 'food challenge', 'unboxing', 'drop test',
            'what i eat in a day', 'room tour', 'house tour',

            // Shorts / viral content
            'shorts', '#shorts', 'short video', 'tiktok',
            'instagram reels', 'viral video', 'trending now'
        ];

        const isEducational = educationalKeywords.some(keyword => title.includes(keyword));
        const isDistracting = distractingKeywords.some(keyword => title.includes(keyword));

        if (isEducational && !isDistracting) {
            // Only allow if educational AND not also matching distraction keywords
            distractionScore = 10;
            contentType = 'educational';
        } else if (isDistracting) {
            // Explicit distraction match — high confidence block
            distractionScore = 90;
            contentType = 'high_distraction';
        } else {
            // DEFAULT: Unknown YouTube content is treated as distracting
            // "Guilty until proven educational" approach
            distractionScore = 75;
            contentType = 'high_distraction';
        }

        console.log(`🎬 YouTube local analysis: title="${tab.title}", score=${distractionScore}, type=${contentType}`);

        return {
            content_type: contentType,
            distraction_score: distractionScore,
            is_distraction: distractionScore > 50,
            recommended_action: distractionScore > 50 ? 'close_tab' : 'none',
            url: tab.url,
            title: tab.title,
            domain: 'youtube.com'
        };
    }

    isYouTubeDistracting(analysis, tab) {
        const distractionScore = analysis.distraction_score || 0;
        const contentType = (analysis.content_type || '').toLowerCase();

        // WHITELIST approach: only allow if explicitly educational with low score
        if (contentType === 'educational' && distractionScore < 30) {
            return false; // Proven educational — allow
        }

        // Block if high distraction score
        if (distractionScore > 50) return true;

        // Block if distracting content type
        if (contentType === 'distraction' || contentType === 'entertainment' || contentType === 'high_distraction') return true;

        // Default: block unknown YouTube content during active session
        return true;
    }

    async showBlockingWarning(tab, siteName) {
        // Clear any existing timer
        if (this.blockingTimers.has(tab.id)) {
            clearTimeout(this.blockingTimers.get(tab.id));
        }

        // Show countdown warning
        await this.showCountdownOverlay(tab, siteName);

        // Set timer to block after 5 seconds
        const timer = setTimeout(async () => {
            await this.blockTabDirectly(tab, siteName);
            this.blockingTimers.delete(tab.id);
        }, 5000);

        this.blockingTimers.set(tab.id, timer);
    }

    async showCountdownOverlay(tab, siteName) {
        const overlayHtml = `
            <div id="workspace-warning-overlay" style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: linear-gradient(135deg, rgba(239, 68, 68, 0.95) 0%, rgba(185, 28, 28, 0.95) 100%);
                z-index: 999999;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                color: white;
                backdrop-filter: blur(10px);
            ">
                <div style="
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 20px;
                    padding: 40px;
                    text-align: center;
                    backdrop-filter: blur(20px);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
                    max-width: 500px;
                ">
                    <div style="
                        font-size: 48px;
                        margin-bottom: 20px;
                        animation: pulse 1s infinite;
                    ">⚠️</div>
                    <h2 style="
                        font-size: 28px;
                        font-weight: 700;
                        margin: 0 0 15px 0;
                        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
                    ">Distraction Detected!</h2>
                    <p style="
                        font-size: 18px;
                        margin: 0 0 25px 0;
                        opacity: 0.9;
                        line-height: 1.5;
                    ">${siteName} content appears to be non-educational. This tab will be blocked in:</p>
                    <div id="countdown" style="
                        font-size: 72px;
                        font-weight: 700;
                        color: #fbbf24;
                        text-shadow: 0 4px 8px rgba(0, 0, 0, 0.4);
                        margin: 20px 0;
                        animation: countdown 1s infinite;
                    ">5</div>
                    <p style="
                        font-size: 16px;
                        opacity: 0.8;
                        margin: 20px 0 0 0;
                    ">Stay focused on your learning goals! 🎯</p>
                </div>
                <style>
                    @keyframes pulse {
                        0%, 100% { transform: scale(1); }
                        50% { transform: scale(1.1); }
                    }
                    @keyframes countdown {
                        0%, 100% { transform: scale(1); opacity: 1; }
                        50% { transform: scale(1.05); opacity: 0.8; }
                    }
                </style>
            </div>
        `;

        try {
            await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: (html) => {
                    // Remove existing overlay
                    const existing = document.getElementById('workspace-warning-overlay');
                    if (existing) existing.remove();

                    // Add new overlay
                    document.body.insertAdjacentHTML('beforeend', html);

                    // Start countdown
                    let count = 5;
                    const countdownEl = document.getElementById('countdown');
                    const interval = setInterval(() => {
                        count--;
                        if (countdownEl) countdownEl.textContent = count;
                        if (count <= 0) {
                            clearInterval(interval);
                        }
                    }, 1000);
                },
                args: [overlayHtml]
            });
        } catch (error) {
            console.log('❌ Failed to show warning overlay:', error);
        }
    }

    async blockTabDirectly(tab, siteName) {
        console.log(`🚫 Blocking ${siteName} tab:`, tab.url);
        this.lastBlockAt = Date.now();
        this.blockedCount++;

        try {
            // Remove the warning overlay
            await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: () => {
                    const overlay = document.getElementById('workspace-warning-overlay');
                    if (overlay) overlay.remove();
                }
            });

            // Close the tab (no redirect)
            await chrome.tabs.remove(tab.id);

            // Show notification without problematic icon
            try {
                await chrome.notifications.create({
                    type: 'basic',
                    title: 'WorkSpace AI',
                    message: `${siteName} blocked - Stay focused on your learning!`,
                    silent: false
                });
            } catch (notificationError) {
                console.log('⚠️ Notification failed, but tab was blocked:', notificationError.message);
            }

        } catch (error) {
            console.log('❌ Failed to block tab:', error);
        }
    }

    async analyzeTab(tab) {
        try {
            console.log('🔍 Analyzing tab:', tab.url);

            // Try to send to AI backend using /analyze/tab
            let analysis;
            try {
                const response = await fetch(`${API_BASE}/analyze/tab`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        url: tab.url,
                        title: tab.title
                    })
                });

                if (!response.ok) {
                    throw new Error(`Analysis failed: ${response.status}`);
                }

                const result = await response.json();
                analysis = result.result || result;
                console.log('🧠 AI Analysis:', analysis);

            } catch (backendError) {
                console.log('❌ Backend not available, using local analysis:', backendError.message);
                // Fall back to local analysis based on URL and title
                analysis = this.localAnalysis(tab);
            }

            // Determine if should block
            const shouldBlock = this.shouldBlockTab(analysis);

            if (shouldBlock) {
                await this.blockTab(tab, analysis);
            } else {
                this.notifyEducational(tab);
            }

        } catch (error) {
            console.log('❌ Tab analysis failed:', error);
        }
    }

    localAnalysis(tab) {
        // Local analysis when backend is not available
        const url = new URL(tab.url);
        const domain = url.hostname;
        const title = tab.title.toLowerCase();

        console.log(`🧠 Local analysis: domain=${domain}, title=${title}`);

        let distractionScore = 0;
        let contentType = 'neutral';

        // Check if it's an educational site
        if (this.educationalSites.has(domain)) {
            distractionScore = 10;
            contentType = 'educational';
            console.log('✅ Educational site detected');
        }
        // Check if it's a distracting site (more aggressive)
        else if (this.isDistractingSite(domain, title)) {
            distractionScore = 90; // High score to ensure blocking
            contentType = 'distraction';
            console.log('🚫 Distracting site detected');
        }
        // Check for productive keywords
        else if (this.isProductiveSite(domain, title)) {
            distractionScore = 25;
            contentType = 'productive';
            console.log('💼 Productive site detected');
        }
        // Default to slightly distracting for unknown sites
        else {
            distractionScore = 40;
            contentType = 'neutral';
            console.log('❓ Unknown site, using neutral score');
        }

        const analysis = {
            content_type: contentType,
            distraction_score: distractionScore,
            url: tab.url,
            title: tab.title,
            domain: domain
        };

        console.log(`🧠 Analysis result:`, analysis);
        return analysis;
    }

    isDistractingSite(domain, title) {
        const distractingKeywords = [
            'instagram', 'facebook', 'twitter', 'tiktok',
            'netflix', 'twitch', 'reddit', 'discord', 'spotify',
            'snapchat', 'pinterest'
        ];

        return distractingKeywords.some(keyword =>
            domain.includes(keyword) || title.includes(keyword)
        );
    }

    isProductiveSite(domain, title) {
        const productiveKeywords = [
            'github', 'gitlab', 'stackoverflow', 'codepen', 'figma',
            'notion', 'trello', 'slack', 'microsoft', 'google docs'
        ];

        return productiveKeywords.some(keyword =>
            domain.includes(keyword) || title.includes(keyword)
        );
    }

    async getTabContent(tab) {
        try {
            // Try to capture tab screenshot (video frame)
            const dataUrl = await chrome.tabs.captureVisibleTab(tab.windowId, {
                format: 'png'
            });

            return {
                screenshot: dataUrl,
                url: tab.url,
                title: tab.title
            };
        } catch (error) {
            console.log('📷 Tab capture failed, will retry:', error.message);
            // Return null screenshot to indicate retry needed
            return {
                screenshot: null,
                url: tab.url,
                title: tab.title
            };
        }
    }

    getDummyScreenshot() {
        // Return a minimal 1x1 transparent PNG
        return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=';
    }

    shouldBlockTab(analysis) {
        // More aggressive blocking criteria
        const distractionScore = analysis.distraction_score || 0;
        const contentType = analysis.content_type || '';
        const domain = analysis.domain || '';

        console.log(`🔍 Blocking decision: score=${distractionScore}, type=${contentType}, domain=${domain}`);

        // Block if high distraction score
        if (distractionScore > 50) {
            console.log('🚫 Blocking: High distraction score');
            return true;
        }

        // Block if distracting content type
        if (contentType === 'entertainment' || contentType === 'social' || contentType === 'distraction' || contentType === 'high_distraction') {
            console.log('🚫 Blocking: Distracting content type');
            return true;
        }

        // Block known distracting domains
        const distractingDomains = [
            'instagram.com', 'facebook.com', 'twitter.com', 'tiktok.com',
            'netflix.com', 'twitch.tv', 'reddit.com',
            'discord.com', 'spotify.com', 'snapchat.com'
        ];

        if (distractingDomains.some(d => domain.includes(d))) {
            console.log('🚫 Blocking: Known distracting domain');
            return true;
        }

        console.log('✅ Not blocking: Safe content');
        return false;
    }

    async blockTab(tab, analysis) {
        console.log('🚫 Blocking tab:', tab.url);
        this.lastBlockAt = Date.now();
        this.blockedCount++;

        try {
            // Close the distracting tab (no redirect)
            await chrome.tabs.remove(tab.id);

            // Show notification without problematic icon
            try {
                await chrome.notifications.create({
                    type: 'basic',
                    title: 'WorkSpace AI',
                    message: 'Distracting site blocked. Stay focused on your learning!',
                    silent: false
                });
            } catch (notificationError) {
                console.log('⚠️ Notification failed, but tab was blocked:', notificationError.message);
            }

        } catch (error) {
            console.log('❌ Failed to block tab:', error);
        }
    }

    notifyEducational(tab) {
        console.log('✅ Educational content allowed:', tab.url);

        // Optional: Show encouragement notification without problematic icon
        try {
            chrome.notifications.create({
                type: 'basic',
                title: 'WorkSpace AI',
                message: 'Great choice! Keep focused on your learning.',
                silent: true
            });
        } catch (notificationError) {
            console.log('⚠️ Educational notification failed:', notificationError.message);
        }
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
        if (!this.sessionActive) return;

        try {
            const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
            if (tabs && tabs.length > 0) {
                await this.handleTabChange(tabs[0]);
            }
        } catch (error) {
            console.log('❌ Failed to check current tab:', error);
        }
    }

    startSession() {
        this.sessionActive = true;
        this.startTime = Date.now();
        this.blockedCount = 0;
        console.log('🚀 Session started - Tab monitoring active');

        // Check current tab immediately
        this.checkCurrentTab();

        // Start polling
        chrome.alarms.create('workspace-tab-check', { periodInMinutes: 0.083 });
    }

    stopSession() {
        this.sessionActive = false;
        this.startTime = null;
        console.log('⏹️ Session stopped - Tab monitoring inactive');

        // Clear polling
        chrome.alarms.clear('workspace-tab-check');
    }
}

// Initialize the monitor
new WorkSpaceMonitor();
