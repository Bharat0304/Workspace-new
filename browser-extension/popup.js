// Simple popup for WorkSpace AI Tab Monitor
class PopupController {
    constructor() {
        this.sessionActive = false;
        this.startTime = null;
        this.blockedCount = 0;
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.updateUI();
        this.checkSessionStatus();
    }

    bindEvents() {
        document.getElementById('startBtn').addEventListener('click', () => this.startSession());
        document.getElementById('stopBtn').addEventListener('click', () => this.stopSession());
    }

    async checkSessionStatus() {
        try {
            const response = await chrome.runtime.sendMessage({
                action: 'get_status'
            });
            
            if (response && response.active) {
                this.sessionActive = true;
                this.startTime = response.startTime;
                this.blockedCount = response.blockedCount || 0;
                this.updateUI();
            }
        } catch (error) {
            console.log('Failed to get session status:', error);
        }
    }

    async startSession() {
        try {
            const response = await chrome.runtime.sendMessage({
                action: 'start_session'
            });
            
            if (response.success) {
                this.sessionActive = true;
                this.startTime = Date.now();
                this.blockedCount = 0;
                this.updateUI();
                
                // Update every second
                this.updateInterval = setInterval(() => this.updateTimer(), 1000);
            }
        } catch (error) {
            console.log('Failed to start session:', error);
        }
    }

    async stopSession() {
        try {
            const response = await chrome.runtime.sendMessage({
                action: 'stop_session'
            });
            
            if (response.success) {
                this.sessionActive = false;
                this.startTime = null;
                if (this.updateInterval) {
                    clearInterval(this.updateInterval);
                }
                this.updateUI();
            }
        } catch (error) {
            console.log('Failed to stop session:', error);
        }
    }

    updateUI() {
        const startBtn = document.getElementById('startBtn');
        const stopBtn = document.getElementById('stopBtn');
        const statusEl = document.getElementById('sessionStatus');
        const blockedCountEl = document.getElementById('blockedCount');
        const sessionTimeEl = document.getElementById('sessionTime');

        if (this.sessionActive) {
            startBtn.disabled = true;
            stopBtn.disabled = false;
            statusEl.textContent = 'Session Active';
            statusEl.className = 'status active';
        } else {
            startBtn.disabled = false;
            stopBtn.disabled = true;
            statusEl.textContent = 'Session Inactive';
            statusEl.className = 'status inactive';
        }

        blockedCountEl.textContent = this.blockedCount;
        
        if (this.startTime) {
            const duration = Date.now() - this.startTime;
            const minutes = Math.floor(duration / 60000);
            const seconds = Math.floor((duration % 60000) / 1000);
            sessionTimeEl.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        } else {
            sessionTimeEl.textContent = '0:00';
        }
    }

    updateTimer() {
        if (this.sessionActive && this.startTime) {
            const duration = Date.now() - this.startTime;
            const minutes = Math.floor(duration / 60000);
            const seconds = Math.floor((duration % 60000) / 1000);
            document.getElementById('sessionTime').textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }
    }

    async getCurrentTab() {
        try {
            const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
            if (tabs && tabs.length > 0) {
                const tab = tabs[0];
                const url = new URL(tab.url);
                document.getElementById('currentSite').textContent = url.hostname;
            }
        } catch (error) {
            document.getElementById('currentSite').textContent = 'Unknown';
        }
    }
}

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PopupController();
});
