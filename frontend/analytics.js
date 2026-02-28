// Analytics Dashboard JavaScript
class AnalyticsDashboard {
    constructor() {
        this.sessionData = [];
        this.currentSession = null;
        this.focusChart = null;
        this.fatigueChart = null;
        this.breakTimer = null;
        this.musicTimer = null;
        this.fatigueThreshold = 70; // Trigger AI assistant at 70% fatigue
        
        this.init();
    }

    init() {
        this.loadSessionData();
        this.setupCharts();
        this.startRealTimeUpdates();
        this.loadSchedule();
        this.checkFatigueLevel();
    }

    // Load session data from localStorage
    loadSessionData() {
        const stored = localStorage.getItem('workspaceSessionData');
        if (stored) {
            this.sessionData = JSON.parse(stored);
            this.updateSessionHistory();
        }
    }

    // Save session data to localStorage
    saveSessionData() {
        localStorage.setItem('workspaceSessionData', JSON.stringify(this.sessionData));
    }

    // Setup charts
    setupCharts() {
        // Focus Chart
        const focusCtx = document.getElementById('focusChart').getContext('2d');
        this.focusChart = new Chart(focusCtx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Focus Score',
                    data: [],
                    borderColor: 'rgb(59, 130, 246)',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100
                    }
                }
            }
        });

        // Fatigue Chart
        const fatigueCtx = document.getElementById('fatigueChart').getContext('2d');
        this.fatigueChart = new Chart(fatigueCtx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Fatigue Level',
                    data: [],
                    borderColor: 'rgb(251, 146, 60)',
                    backgroundColor: 'rgba(251, 146, 60, 0.1)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100
                    }
                }
            }
        });
    }

    // Start real-time updates
    startRealTimeUpdates() {
        // Update every 5 seconds
        setInterval(() => {
            this.updateCurrentSession();
            this.checkFatigueLevel();
        }, 5000);

        // Update session duration every second
        setInterval(() => {
            this.updateSessionDuration();
        }, 1000);
    }

    // Update current session data
    async updateCurrentSession() {
        try {
            const response = await chrome.runtime.sendMessage({
                action: 'get_status'
            });

            if (response && response.camera) {
                const { camera } = response;
                
                // Update current values
                document.getElementById('currentFocus').textContent = 
                    camera.focusScores.length > 0 ? 
                    camera.focusScores[camera.focusScores.length - 1] : '--';
                
                document.getElementById('avgFocus').textContent = camera.avgFocus || '--';
                
                // Calculate fatigue (inverse of focus + posture)
                const fatigue = this.calculateFatigue(camera.avgFocus, camera.avgPosture);
                document.getElementById('currentFatigue').innerHTML = 
                    `<span class="${this.getFatigueColor(fatigue)}">${fatigue}%</span>`;
                document.getElementById('fatigueStatus').textContent = this.getFatigueStatus(fatigue);
                
                // Update blocked count
                document.getElementById('blockedCount').textContent = response.blockedCount || 0;

                // Update charts
                this.updateCharts(camera.focusScores, this.calculateFatigueScores(camera.focusScores, camera.postureScores));
            }
        } catch (error) {
            console.log('Failed to update session data:', error);
        }
    }

    // Update session duration
    updateSessionDuration() {
        try {
            chrome.runtime.sendMessage({ action: 'get_status' }, (response) => {
                if (response && response.active && response.startTime) {
                    const duration = Date.now() - response.startTime;
                    const hours = Math.floor(duration / 3600000);
                    const minutes = Math.floor((duration % 3600000) / 60000);
                    const seconds = Math.floor((duration % 60000) / 1000);
                    
                    document.getElementById('sessionDuration').textContent = 
                        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
                }
            });
        } catch (error) {
            console.log('Failed to update duration:', error);
        }
    }

    // Calculate fatigue score
    calculateFatigue(focusScore, postureScore) {
        if (!focusScore || !postureScore) return 0;
        
        // Fatigue is inverse of average focus and posture
        const avgScore = (focusScore + postureScore) / 2;
        return Math.max(0, Math.min(100, 100 - avgScore));
    }

    // Calculate fatigue scores array
    calculateFatigueScores(focusScores, postureScores) {
        if (!focusScores || !postureScores || focusScores.length === 0) return [];
        
        return focusScores.map((focus, index) => {
            const posture = postureScores[index] || 50;
            return this.calculateFatigue(focus, posture);
        });
    }

    // Get fatigue color class
    getFatigueColor(fatigue) {
        if (fatigue >= 70) return 'text-red-600';
        if (fatigue >= 40) return 'text-orange-500';
        return 'text-green-600';
    }

    // Get fatigue status text
    getFatigueStatus(fatigue) {
        if (fatigue >= 70) return 'High Fatigue';
        if (fatigue >= 40) return 'Moderate Fatigue';
        return 'Low Fatigue';
    }

    // Update charts with new data
    updateCharts(focusScores, fatigueScores) {
        const now = new Date();
        const timeLabel = now.toLocaleTimeString();

        // Keep only last 20 data points
        if (this.focusChart.data.labels.length > 20) {
            this.focusChart.data.labels.shift();
            this.focusChart.data.datasets[0].data.shift();
        }

        if (this.fatigueChart.data.labels.length > 20) {
            this.fatigueChart.data.labels.shift();
            this.fatigueChart.data.datasets[0].data.shift();
        }

        // Add new data
        if (focusScores && focusScores.length > 0) {
            this.focusChart.data.labels.push(timeLabel);
            this.focusChart.data.datasets[0].data.push(focusScores[focusScores.length - 1]);
            this.focusChart.update();
        }

        if (fatigueScores && fatigueScores.length > 0) {
            this.fatigueChart.data.labels.push(timeLabel);
            this.fatigueChart.data.datasets[0].data.push(fatigueScores[fatigueScores.length - 1]);
            this.fatigueChart.update();
        }
    }

    // Check fatigue level and show AI assistant
    checkFatigueLevel() {
        const fatigueElement = document.getElementById('currentFatigue');
        if (!fatigueElement) return;

        const fatigueText = fatigueElement.textContent;
        const fatigueValue = parseInt(fatigueText.replace('%', '').replace('--', '0'));

        if (fatigueValue >= this.fatigueThreshold) {
            this.showAIAssistant();
        } else {
            this.hideAIAssistant();
        }
    }

    // Show AI assistant
    showAIAssistant() {
        const section = document.getElementById('aiAssistantSection');
        if (section && section.classList.contains('hidden')) {
            section.classList.remove('hidden');
            this.generateAIMessage();
        }
    }

    // Hide AI assistant
    hideAIAssistant() {
        const section = document.getElementById('aiAssistantSection');
        if (section && !section.classList.contains('hidden')) {
            section.classList.add('hidden');
        }
    }

    // Generate AI message based on fatigue
    generateAIMessage() {
        const messages = [
            "I notice you're feeling quite fatigued. Taking a short break can help you stay productive!",
            "Your energy levels seem low. How about a 5-minute break to recharge?",
            "Fatigue is affecting your focus. Let's take a quick break together!",
            "You've been working hard! A short rest will help you maintain quality work.",
            "Your body is telling you it needs a break. Let's listen to it!"
        ];

        const randomMessage = messages[Math.floor(Math.random() * messages.length)];
        document.getElementById('aiMessage').innerHTML = `
            <div class="flex items-start space-x-3">
                <i class="fas fa-robot text-2xl mt-1"></i>
                <div>
                    <p class="text-lg">${randomMessage}</p>
                    <p class="text-sm mt-2 opacity-80">Choose an option below to help you recharge:</p>
                </div>
            </div>
        `;
    }

    // Update session history table
    updateSessionHistory() {
        const tbody = document.getElementById('sessionHistory');
        if (!tbody) return;

        tbody.innerHTML = '';

        this.sessionData.slice(-10).reverse().forEach(session => {
            const row = document.createElement('tr');
            row.className = 'border-b hover:bg-gray-50';
            row.innerHTML = `
                <td class="py-3 px-4">${new Date(session.date).toLocaleDateString()}</td>
                <td class="py-3 px-4">${this.formatDuration(session.duration)}</td>
                <td class="py-3 px-4">
                    <span class="text-green-600 font-semibold">${session.avgFocus}%</span>
                </td>
                <td class="py-3 px-4">
                    <span class="text-orange-600 font-semibold">${session.avgFatigue}%</span>
                </td>
                <td class="py-3 px-4">
                    <span class="text-red-600 font-semibold">${session.blockedSites}</span>
                </td>
                <td class="py-3 px-4">
                    <button onclick="viewSessionDetails('${session.id}')" class="text-blue-600 hover:text-blue-800">
                        <i class="fas fa-eye mr-1"></i>View
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    // Format duration
    formatDuration(milliseconds) {
        const hours = Math.floor(milliseconds / 3600000);
        const minutes = Math.floor((milliseconds % 3600000) / 60000);
        return `${hours}h ${minutes}m`;
    }

    // Load schedule
    loadSchedule() {
        const stored = localStorage.getItem('workspaceSchedule');
        if (stored) {
            this.schedule = JSON.parse(stored);
        } else {
            this.schedule = [];
        }
    }

    // Save current session when it ends
    saveCurrentSession() {
        chrome.runtime.sendMessage({ action: 'get_status' }, (response) => {
            if (response && response.active && response.startTime) {
                const session = {
                    id: Date.now().toString(),
                    date: new Date().toISOString(),
                    duration: Date.now() - response.startTime,
                    avgFocus: response.camera.avgFocus || 0,
                    avgFatigue: this.calculateFatigue(response.camera.avgFocus, response.camera.avgPosture),
                    blockedSites: response.blockedCount || 0,
                    focusScores: response.camera.focusScores || [],
                    postureScores: response.camera.postureScores || []
                };

                this.sessionData.push(session);
                this.saveSessionData();
                this.updateSessionHistory();
            }
        });
    }
}

// Global functions
let dashboard;

function openScheduleModal() {
    document.getElementById('scheduleModal').classList.remove('hidden');
}

function closeScheduleModal() {
    document.getElementById('scheduleModal').classList.add('hidden');
}

function saveSchedule() {
    const fileInput = document.getElementById('scheduleFile');
    const textInput = document.getElementById('scheduleText');
    
    let schedule = [];
    
    if (fileInput.files.length > 0) {
        const file = fileInput.files[0];
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                schedule = JSON.parse(e.target.result);
                localStorage.setItem('workspaceSchedule', JSON.stringify(schedule));
                alert('Schedule uploaded successfully!');
                closeScheduleModal();
            } catch (error) {
                alert('Error parsing schedule file. Please check the format.');
            }
        };
        reader.readAsText(file);
    } else if (textInput.value.trim()) {
        // Parse manual schedule
        const lines = textInput.value.trim().split('\n');
        lines.forEach(line => {
            const match = line.match(/(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2}):\s*(.+)/);
            if (match) {
                schedule.push({
                    start: match[1],
                    end: match[2],
                    activity: match[3]
                });
            }
        });
        
        localStorage.setItem('workspaceSchedule', JSON.stringify(schedule));
        alert('Schedule saved successfully!');
        closeScheduleModal();
    } else {
        alert('Please upload a file or enter schedule manually.');
    }
}

function closeAIAssistant() {
    document.getElementById('aiAssistantSection').classList.add('hidden');
}

function playSoothingMusic() {
    const audio = document.getElementById('soothingMusic');
    audio.play();
    
    // Auto-stop after 5 minutes
    setTimeout(() => {
        audio.pause();
        audio.currentTime = 0;
        alert('Music session completed! Ready to get back to work?');
    }, 5 * 60 * 1000);
    
    // Update AI message
    document.getElementById('aiMessage').innerHTML += `
        <div class="mt-4 p-3 bg-white bg-opacity-20 rounded-lg">
            <i class="fas fa-music mr-2"></i>Playing soothing music for 5 minutes...
        </div>
    `;
}

function startBreakTimer() {
    let minutes = 10;
    let seconds = 0;
    
    const timerDisplay = document.createElement('div');
    timerDisplay.className = 'mt-4 p-4 bg-white bg-opacity-20 rounded-lg text-center';
    timerDisplay.innerHTML = `
        <div class="text-3xl font-bold mb-2">${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}</div>
        <div class="text-sm">Break time remaining</div>
    `;
    
    document.getElementById('aiMessage').appendChild(timerDisplay);
    
    const interval = setInterval(() => {
        if (seconds === 0) {
            if (minutes === 0) {
                clearInterval(interval);
                timerDisplay.innerHTML = `
                    <div class="text-2xl font-bold text-green-300">Break Complete!</div>
                    <div class="text-sm mt-2">Ready to continue studying?</div>
                `;
                return;
            }
            minutes--;
            seconds = 59;
        } else {
            seconds--;
        }
        
        timerDisplay.querySelector('.text-3xl').textContent = 
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }, 1000);
    
    // Update AI message
    document.getElementById('aiMessage').innerHTML += `
        <div class="mt-4 p-3 bg-white bg-opacity-20 rounded-lg">
            <i class="fas fa-coffee mr-2"></i>10-minute break timer started!
        </div>
    `;
}

function viewSessionDetails(sessionId) {
    const session = dashboard.sessionData.find(s => s.id === sessionId);
    if (session) {
        alert(`Session Details:\n\nDate: ${new Date(session.date).toLocaleString()}\nDuration: ${dashboard.formatDuration(session.duration)}\nAverage Focus: ${session.avgFocus}%\nAverage Fatigue: ${session.avgFatigue}%\nBlocked Sites: ${session.blockedSites}`);
    }
}

function goToDashboard() {
    window.location.href = 'dashboard.html';
}

// Initialize dashboard when page loads
document.addEventListener('DOMContentLoaded', () => {
    dashboard = new AnalyticsDashboard();
    
    // Save session data when page is unloaded
    window.addEventListener('beforeunload', () => {
        dashboard.saveCurrentSession();
    });
});
