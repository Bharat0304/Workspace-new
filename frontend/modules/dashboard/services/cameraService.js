/* ============================================================
   FOCUS MONITORING — Camera Service
   Manages webcam request permissions and streams lifecycle.
   ============================================================ */

import { focusMonitoringState } from '../state/focusMonitoringState.js';

let _activeStream = null;

export const cameraService = {
    /**
     * Requests user permissions and starts the user webcam feed.
     * Updates focusMonitoringState with loading status/error states.
     * @returns {Promise<MediaStream>}
     */
    async startCamera() {
        focusMonitoringState.setStatus('loading');
        focusMonitoringState.clearError();

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 640 },
                    height: { ideal: 360 }, // 16:9 aspect ratio
                    facingMode: 'user'
                },
                audio: false
            });

            _activeStream = stream;
            focusMonitoringState.setPermission('granted');
            focusMonitoringState.setStatus('active');
            return stream;
        } catch (err) {
            console.error('[CameraService] Failed to start camera:', err);
            if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                focusMonitoringState.setPermission('denied');
                focusMonitoringState.setError('Camera permission denied. Please allow access in browser settings.');
            } else {
                focusMonitoringState.setError('Camera resource unavailable or could not be initialized.');
            }
            throw err;
        }
    },

    /**
     * Stops the active webcam track stream and cleans up state values.
     */
    stopCamera() {
        if (_activeStream) {
            _activeStream.getTracks().forEach(track => track.stop());
            _activeStream = null;
        }
        focusMonitoringState.setStatus('off');
        focusMonitoringState.setFaceDetected(false);
        focusMonitoringState.setLandmarks([]);
    },

    /** Returns the active media stream object. */
    getActiveStream() {
        return _activeStream;
    }
};
