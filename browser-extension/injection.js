// WorkSpace AI Extension - Content Script for UI Injection
class WorkSpaceUI {
    static showOverlay(options) {
        // Remove existing overlays
        this.removeOverlay();

        const overlay = document.createElement('div');
        overlay.id = 'workspace-overlay';
        overlay.style.cssText = `
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
            color: white;
        `;

        const content = document.createElement('div');
        content.style.cssText = `
            background: linear-gradient(135deg, #1a1a2e 0%, #2d3748 100%);
            padding: 2rem;
            border-radius: 1rem;
            text-align: center;
            max-width: 500px;
            margin: 1rem;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        `;

        let message = '';
        let icon = '';
        let buttons = '';

        switch (options.type) {
            case 'block':
                message = options.message || '🚫 This site is distracting. Focus on your goals!';
                icon = '🛑';
                buttons = `
                    <button onclick="window.workspace.continueWork()" style="
                        background: #22c55e;
                        color: white;
                        border: none;
                        padding: 0.75rem 1.5rem;
                        border-radius: 0.5rem;
                        margin: 0.5rem;
                        cursor: pointer;
                        font-weight: 500;
                    ">
                        🎯 Continue Working
                    </button>
                    <button onclick="window.workspace.takeBreak()" style="
                        background: #ef4444;
                        color: white;
                        border: none;
                        padding: 0.75rem 1.5rem;
                        border-radius: 0.5rem;
                        margin: 0.5rem;
                        cursor: pointer;
                        font-weight: 500;
                    ">
                        ☕ Take Break
                    </button>
                `;
                break;
                
            case 'encourage':
                message = options.message || '📚 Great choice! Keep up the excellent work!';
                icon = '🌟';
                buttons = `
                    <button onclick="window.workspace.closeEncouragement()" style="
                        background: #22c55e;
                        color: white;
                        border: none;
                        padding: 0.75rem 1.5rem;
                        border-radius: 0.5rem;
                        margin: 0.5rem;
                        cursor: pointer;
                        font-weight: 500;
                    ">
                        💪 Thanks!
                    </button>
                `;
                break;
                
            case 'focus_reminder':
                message = options.message || '🎯 Remember your goals! Stay focused!';
                icon = '⏰';
                buttons = `
                    <button onclick="window.workspace.closeReminder()" style="
                        background: #3b82f6;
                        color: white;
                        border: none;
                        padding: 0.75rem 1.5rem;
                        border-radius: 0.5rem;
                        margin: 0.5rem;
                        cursor: pointer;
                        font-weight: 500;
                    ">
                        Got it!
                    </button>
                `;
                break;
        }

        content.innerHTML = `
            <div style="font-size: 3rem; margin-bottom: 1rem;">${icon}</div>
            <h2 style="margin: 0 0 1rem 0; font-size: 1.5rem;">WorkSpace AI</h2>
            <p style="margin: 0 0 1.5rem 0; font-size: 1.1rem; opacity: 0.9;">${message}</p>
            <div style="display: flex; gap: 1rem; justify-content: center;">
                ${buttons}
            </div>
            <div style="position: absolute; top: 1rem; right: 1rem;">
                <button onclick="window.workspace.closeOverlay()" style="
                    background: rgba(255, 255, 255, 0.1);
                    color: white;
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    padding: 0.5rem;
                    border-radius: 0.25rem;
                    cursor: pointer;
                    font-size: 0.875rem;
                ">✕</button>
            </div>
        `;

        overlay.appendChild(content);
        document.body.appendChild(overlay);

        // Add global functions
        window.workspace = {
            continueWork: () => {
                this.removeOverlay();
                chrome.runtime.sendMessage({ type: 'continue_work' });
            },
            takeBreak: () => {
                this.removeOverlay();
                chrome.runtime.sendMessage({ type: 'take_break' });
            },
            closeEncouragement: () => {
                this.removeOverlay();
            },
            closeReminder: () => {
                this.removeOverlay();
            },
            closeOverlay: () => {
                this.removeOverlay();
            }
        };
    }

    static removeOverlay() {
        const overlay = document.getElementById('workspace-overlay');
        if (overlay) {
            overlay.remove();
        }
    }
}

// Handle injection from background script
if (typeof window.workspaceOptions !== 'undefined') {
    WorkSpaceUI.showOverlay(window.workspaceOptions);
}
