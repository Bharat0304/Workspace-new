/* ============================================================
   DASHBOARD — Session Timer Component
   Purely informational: displays an automated countdown clock, SVG circular progress
   ring, and top-right expand icon. Countdown runs automatically when active.
   ============================================================ */

import { dashboardService } from '../services/dashboardService.js';

let _timerInterval = null;

/**
 * Renders the Session Timer panel.
 * @param {HTMLElement} container
 * @param {import('../contracts/DashboardContracts.js').TimerState} timerState
 * @param {Function} onTick - Optional callback
 */
export function renderSessionTimer(container, timerState, onTick) {
    if (!container) return;

    // Clean up any running intervals first
    destroySessionTimer();

    const total = timerState?.totalSeconds ?? 90 * 60;
    const remaining = timerState?.remainingSeconds ?? 0;
    const isRunning = timerState?.isRunning ?? false;

    // Render visual layout
    _renderSkeleton(container, remaining, total);

    if (!isRunning || remaining <= 0) {
        return;
    }

    // Start ticks countdown loop automatically
    _timerInterval = setInterval(() => {
        dashboardService.tickTimer();
        const current = dashboardService.getTimer();
        if (current) {
            _updateUI(container, current.remainingSeconds, total);
            if (onTick) onTick();
            if (current.remainingSeconds <= 0) {
                destroySessionTimer();
                _updateUI(container, 0, total);
            }
        }
    }, 1000);
}

/** Clears timer intervals to avoid leaks. */
export function destroySessionTimer() {
    if (_timerInterval !== null) {
        clearInterval(_timerInterval);
        _timerInterval = null;
    }
}

// ── Private ──────────────────────────────────────────────────

const RADIUS = 80;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS; // ~502.65

function _renderSkeleton(container, remaining, total) {
    const timeStr = _formatTime(remaining);
    const ratio = total > 0 ? remaining / total : 0;
    const strokeOffset = CIRCUMFERENCE * (1 - ratio);
    const isCompleted = remaining <= 0;

    container.innerHTML = `
        <section class="db-section db-timer" aria-label="Session Timer">
            <div class="db-timer-header">
                <span class="db-timer-title">SESSION TIMER</span>
                <!-- Expand icon only in top right -->
                <svg class="db-timer-expand-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
                </svg>
            </div>
            
            <div class="db-timer-circle-wrapper">
                <svg class="db-timer-svg" width="200" height="200" viewBox="0 0 200 200">
                    <!-- Inactive background circle track -->
                    <circle
                        cx="100" cy="100" r="${RADIUS}"
                        class="db-timer-track"
                        stroke-width="8"
                    />
                    <!-- Active animated progress overlay -->
                    <circle
                        cx="100" cy="100" r="${RADIUS}"
                        class="db-timer-progress"
                        stroke-width="8"
                        stroke-linecap="round"
                        stroke-dasharray="${CIRCUMFERENCE}"
                        stroke-dashoffset="${strokeOffset}"
                        transform="rotate(-90 100 100)"
                        id="dbTimerProgressCircle"
                    />
                </svg>

                <!-- Center textual content -->
                <div class="db-timer-content">
                    <span class="db-timer-digits" id="dbTimerDigits">${isCompleted ? 'Complete ✓' : timeStr}</span>
                    <span class="db-timer-sub" id="dbTimerSub">${isCompleted ? 'FINISHED' : 'REMAINING'}</span>
                </div>
            </div>

            <!-- Reminder bell chip below -->
            <div class="db-timer-chip-container">
                <div class="db-timer-chip">
                    <svg class="db-timer-chip-bell" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" />
                    </svg>
                    <span>13:56</span>
                </div>
            </div>
        </section>
    `;
}

function _updateUI(container, remaining, total) {
    const digits = container.querySelector('#dbTimerDigits');
    const sub = container.querySelector('#dbTimerSub');
    const circle = container.querySelector('#dbTimerProgressCircle');

    const isCompleted = remaining <= 0;

    if (digits) {
        digits.textContent = isCompleted ? 'Complete ✓' : _formatTime(remaining);
    }
    if (sub) {
        sub.textContent = isCompleted ? 'FINISHED' : 'REMAINING';
    }
    if (circle) {
        const ratio = total > 0 ? remaining / total : 0;
        const strokeOffset = CIRCUMFERENCE * (1 - ratio);
        circle.style.strokeDashoffset = strokeOffset;
    }
}

function _formatTime(seconds) {
    if (seconds <= 0) return '00:00:00';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;

    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}
