/* ============================================================
   FOCUS MONITORING — Parent Bootstrapper
   Provides rendering and destruction lifecycle entry points.
   ============================================================ */

import { renderFocusMonitoringContainer, destroyFocusMonitoringContainer } from './FocusMonitoringContainer.js';

/**
 * Initializes and renders the Focus Monitoring panel into the container.
 * @param {HTMLElement} container
 * @param {any} status - Unused in Beta V1 (data flows directly from state/service layers)
 */
export function renderFocusMonitoring(container, status) {
    if (!container) return;
    renderFocusMonitoringContainer(container);
}

/**
 * Performs cleanup for the webcam stream and detection loops.
 * Must be called when navigating away or re-rendering components.
 */
export function destroyFocusMonitoring() {
    destroyFocusMonitoringContainer();
}
