/**
 * Content Script for WorkSpace AI Extension
 * 
 * This script runs on all web pages and injects the UI overlay
 * for blocking, encouragement, and focus reminders.
 */

console.log('🎯 WorkSpace AI Content Script Loaded');

// Inject the main injection script
const script = document.createElement('script');
script.src = chrome.runtime.getURL('injection.js');
script.onload = function() {
    this.remove();
};
(document.head || document.documentElement).appendChild(script);

// Listen for messages from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('📨 Content script received message:', message);
    
    switch (message.action) {
        case 'show_blocking_overlay':
            showBlockingOverlay(message.data);
            break;
        case 'show_encouragement_overlay':
            showEncouragementOverlay(message.data);
            break;
        case 'show_focus_reminder':
            showFocusReminder(message.data);
            break;
        case 'remove_overlay':
            removeOverlay();
            break;
        case 'get_page_info':
            sendResponse({
                url: window.location.href,
                title: document.title,
                domain: window.location.hostname
            });
            break;
    }
    
    return true; // Keep message channel open for async response
});

// Function to show blocking overlay
function showBlockingOverlay(data) {
    removeOverlay(); // Remove any existing overlay first
    
    const overlay = document.createElement('div');
    overlay.id = 'workspace-ai-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(239, 68, 68, 0.95);
        color: white;
        z-index: 999999;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        backdrop-filter: blur(10px);
    `;
    
    overlay.innerHTML = `
        <div style="text-align: center; max-width: 600px; padding: 40px;">
            <div style="font-size: 72px; margin-bottom: 20px;">🚫</div>
            <h1 style="font-size: 36px; margin-bottom: 20px; font-weight: 600;">
                Site Blocked During Focus Session
            </h1>
            <p style="font-size: 18px; margin-bottom: 30px; opacity: 0.9;">
                This site has been identified as distracting during your work session.
                Stay focused on your educational goals!
            </p>
            <div style="background: rgba(255,255,255,0.2); padding: 20px; border-radius: 12px; margin-bottom: 30px;">
                <h3 style="margin-bottom: 15px;">💡 Suggested Alternative:</h3>
                <p style="font-size: 16px; margin-bottom: 15px;">
                    ${data.alternative || 'Try visiting an educational resource instead'}
                </p>
                <button onclick="window.open('${data.alternativeUrl || 'https://www.khanacademy.org'}', '_blank')" 
                        style="background: white; color: #ef4444; border: none; padding: 12px 24px; border-radius: 8px; font-size: 16px; cursor: pointer; font-weight: 600;">
                    Go to Educational Site
                </button>
            </div>
            <div style="display: flex; gap: 15px; justify-content: center;">
                <button onclick="window.close()" 
                        style="background: rgba(255,255,255,0.2); color: white; border: none; padding: 12px 24px; border-radius: 8px; font-size: 16px; cursor: pointer;">
                    Close Tab
                </button>
                <button onclick="document.getElementById('workspace-ai-overlay').remove()" 
                        style="background: rgba(255,255,255,0.3); color: white; border: none; padding: 12px 24px; border-radius: 8px; font-size: 16px; cursor: pointer;">
                    Continue Anyway (Not Recommended)
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(overlay);
    
    // Send message to background script
    chrome.runtime.sendMessage({
        type: 'to_background',
        action: 'overlay_shown',
        data: { type: 'blocking', url: window.location.href }
    });
}

// Function to show encouragement overlay
function showEncouragementOverlay(data) {
    removeOverlay(); // Remove any existing overlay first
    
    const overlay = document.createElement('div');
    overlay.id = 'workspace-ai-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #10b981, #059669);
        color: white;
        padding: 20px;
        border-radius: 12px;
        z-index: 999998;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        box-shadow: 0 10px 25px rgba(0,0,0,0.2);
        max-width: 350px;
        animation: slideIn 0.5s ease-out;
    `;
    
    overlay.innerHTML = `
        <div style="display: flex; align-items: center; margin-bottom: 10px;">
            <div style="font-size: 24px; margin-right: 10px;">🌟</div>
            <h3 style="margin: 0; font-size: 18px; font-weight: 600;">Great Choice!</h3>
        </div>
        <p style="margin: 0; font-size: 14px; opacity: 0.9; line-height: 1.4;">
            ${data.message || 'Excellent! You are visiting an educational resource that will help you achieve your goals.'}
        </p>
        <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid rgba(255,255,255,0.3);">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-size: 12px; opacity: 0.8;">Focus Time</span>
                <span style="font-size: 14px; font-weight: 600;">${data.focusTime || '0:00'}</span>
            </div>
        </div>
    `;
    
    // Add animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(overlay);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (document.getElementById('workspace-ai-overlay')) {
            overlay.style.animation = 'slideIn 0.5s ease-out reverse';
            setTimeout(() => removeOverlay(), 500);
        }
    }, 5000);
    
    // Send message to background script
    chrome.runtime.sendMessage({
        type: 'to_background',
        action: 'overlay_shown',
        data: { type: 'encouragement', url: window.location.href }
    });
}

// Function to show focus reminder
function showFocusReminder(data) {
    removeOverlay(); // Remove any existing overlay first
    
    const overlay = document.createElement('div');
    overlay.id = 'workspace-ai-overlay';
    overlay.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: linear-gradient(135deg, #6366f1, #8b5cf6);
        color: white;
        padding: 15px 25px;
        border-radius: 50px;
        z-index: 999997;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        box-shadow: 0 10px 25px rgba(0,0,0,0.2);
        display: flex;
        align-items: center;
        gap: 10px;
        animation: slideUp 0.5s ease-out;
    `;
    
    overlay.innerHTML = `
        <div style="font-size: 20px;">🎯</div>
        <div>
            <div style="font-weight: 600; font-size: 14px;">Focus Reminder</div>
            <div style="font-size: 12px; opacity: 0.9;">${data.message || 'Stay focused on your current task!'}</div>
        </div>
        <button onclick="document.getElementById('workspace-ai-overlay').remove()" 
                style="background: rgba(255,255,255,0.2); color: white; border: none; padding: 5px 10px; border-radius: 15px; font-size: 12px; cursor: pointer;">
            ✕
        </button>
    `;
    
    // Add animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideUp {
            from { transform: translate(-50%, 100%); opacity: 0; }
            to { transform: translate(-50%, 0); opacity: 1; }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(overlay);
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
        if (document.getElementById('workspace-ai-overlay')) {
            overlay.style.animation = 'slideUp 0.5s ease-out reverse';
            setTimeout(() => removeOverlay(), 500);
        }
    }, 3000);
}

// Function to remove overlay
function removeOverlay() {
    const overlay = document.getElementById('workspace-ai-overlay');
    if (overlay) {
        overlay.remove();
    }
}

// Send page information to background script when page loads
window.addEventListener('load', () => {
    chrome.runtime.sendMessage({
        type: 'to_background',
        action: 'page_loaded',
        data: {
            url: window.location.href,
            title: document.title,
            domain: window.location.hostname
        }
    });
});

// Monitor URL changes for single-page applications using history API
let currentUrl = window.location.href;
window.addEventListener('popstate', () => {
    if (window.location.href !== currentUrl) {
        currentUrl = window.location.href;
        chrome.runtime.sendMessage({
            type: 'to_background',
            action: 'url_changed',
            data: {
                url: window.location.href,
                title: document.title,
                domain: window.location.hostname
            }
        });
    }
});

// Also monitor pushState/replaceState calls
const originalPushState = history.pushState;
const originalReplaceState = history.replaceState;

history.pushState = function(...args) {
    originalPushState.apply(this, args);
    setTimeout(() => {
        if (window.location.href !== currentUrl) {
            currentUrl = window.location.href;
            chrome.runtime.sendMessage({
                type: 'to_background',
                action: 'url_changed',
                data: {
                    url: window.location.href,
                    title: document.title,
                    domain: window.location.hostname
                }
            });
        }
    }, 0);
};

history.replaceState = function(...args) {
    originalReplaceState.apply(this, args);
    setTimeout(() => {
        if (window.location.href !== currentUrl) {
            currentUrl = window.location.href;
            chrome.runtime.sendMessage({
                type: 'to_background',
                action: 'url_changed',
                data: {
                    url: window.location.href,
                    title: document.title,
                    domain: window.location.hostname
                }
            });
        }
    }, 0);
};
