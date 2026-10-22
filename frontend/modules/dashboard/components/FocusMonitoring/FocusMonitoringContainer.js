/* ============================================================
   FOCUS MONITORING — Container Coordinator
   Coordinates camera activation, detector processing, state changes,
   and mounts subcomponents.
   ============================================================ */

import { focusMonitoringState } from '../../state/focusMonitoringState.js';
import { cameraService } from '../../services/cameraService.js';
import { faceDetectionService } from '../../services/faceDetectionService.js';
import { renderWebcamPreview, destroyWebcamPreview } from './WebcamPreview.js';
import { renderFaceLandmarkOverlay } from './FaceLandmarkOverlay.js';

let _unsubscribe = null;
let _container = null;

/**
 * Bootstraps the visual framework and starts the camera stream.
 * @param {HTMLElement} container
 */
export function renderFocusMonitoringContainer(container) {
    if (!container) return;
    _container = container;

    // Renders component card wrapper structure
    container.innerHTML = `
        <section class="fm-container" aria-label="Focus Monitoring Center">
            <h3 class="fm-title">Focus Monitoring</h3>
            
            <div class="fm-preview-wrapper">
                <div id="fmWebcamMount"></div>
                <div id="fmOverlayMount"></div>
            </div>
        </section>
    `;

    // 1. Initialise MediaPipe model resolve asynchronously
    faceDetectionService.init().catch(() => {});

    // 2. Subscribe to focus state store
    if (_unsubscribe) _unsubscribe();
    _unsubscribe = focusMonitoringState.subscribe((state) => {
        _handleStateUpdate(state);
    });

    // 3. Attempt camera autostart
    _startFlow();
}

/**
 * Handles cleanup when component unmounts.
 */
export function destroyFocusMonitoringContainer() {
    if (_unsubscribe) {
        _unsubscribe();
        _unsubscribe = null;
    }
    faceDetectionService.stopDetection();
    cameraService.stopCamera();
    destroyWebcamPreview();
    _container = null;
}

// ── Private ──────────────────────────────────────────────────

async function _startFlow() {
    try {
        const stream = await cameraService.startCamera();
        const video = document.getElementById('fmVideo');
        if (video && stream) {
            video.srcObject = stream;
            // Play video stream
            await video.play();
            faceDetectionService.startDetection(video);
        }
    } catch (err) {
        // Handled via state errors block
        console.warn('[FocusMonitoringContainer] Start camera failed: user interaction may be required.');
    }
}

/**
 * Handles state updates and triggers subcomponent renders.
 * @param {import('../../contracts/FocusMonitoringContract.js').FocusMonitoringState} state
 */
function _handleStateUpdate(state) {
    if (!_container) return;

    // Renders WebcamPreview overlay, spinner, or video tag
    renderWebcamPreview(
        _container.querySelector('#fmWebcamMount'),
        state,
        {
            onRetry: () => _startFlow()
        }
    );

    // Renders FaceLandmarkOverlay Canvas mesh on top
    const video = _container.querySelector('#fmVideo');
    renderFaceLandmarkOverlay(
        _container.querySelector('#fmOverlayMount'),
        state.landmarks,
        state.faceDetected,
        video
    );
}
