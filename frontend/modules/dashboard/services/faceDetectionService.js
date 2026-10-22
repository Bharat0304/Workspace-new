/* ============================================================
   FOCUS MONITORING — Face Detection Service
   Wraps the MediaPipe Face Landmarker library loading and processes
   webcam frames inside a requestAnimationFrame loop.
   ============================================================ */

import { focusMonitoringState } from '../state/focusMonitoringState.js';

let _faceLandmarker = null;
let _animId = null;
let _isInitializing = false;

export const faceDetectionService = {
    /**
     * Loads FaceLandmarker files and WASM resolver modules dynamically from CDN.
     * Safe to call multiple times (idempotent).
     * @returns {Promise<any>}
     */
    async init() {
        if (_faceLandmarker) return _faceLandmarker;
        if (_isInitializing) {
            // Wait for existing initialization to resolve
            while (_isInitializing) {
                await new Promise(resolve => setTimeout(resolve, 50));
            }
            return _faceLandmarker;
        }

        _isInitializing = true;
        try {
            const { FaceLandmarker, FilesetResolver } = await import(
                "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/vision_bundle.mjs"
            );

            const vision = await FilesetResolver.forVisionTasks(
                "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm"
            );

            _faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
                baseOptions: {
                    modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
                    delegate: "GPU"
                },
                runningMode: "VIDEO",
                numFaces: 1
            });

            console.info('[FaceDetectionService] FaceLandmarker loaded successfully.');
        } catch (err) {
            console.error('[FaceDetectionService] MediaPipe initialization error:', err);
            focusMonitoringState.setError('Failed to load face detection modules.');
            throw err;
        } finally {
            _isInitializing = false;
        }

        return _faceLandmarker;
    },

    /**
     * Starts processing webcam video frames to compute facial landmarks.
     * @param {HTMLVideoElement} videoElement
     */
    startDetection(videoElement) {
        this.stopDetection();

        if (!_faceLandmarker) {
            this.init().then(() => {
                if (videoElement && !videoElement.paused) {
                    this.startDetection(videoElement);
                }
            });
            return;
        }

        let lastVideoTime = -1;

        const detectionLoop = () => {
            if (videoElement.paused || videoElement.ended) {
                _animId = requestAnimationFrame(detectionLoop);
                return;
            }

            try {
                // Read frame only when enough frame data is decoded by the browser
                if (videoElement.readyState >= 2) {
                    const now = performance.now();
                    if (videoElement.currentTime !== lastVideoTime) {
                        lastVideoTime = videoElement.currentTime;
                        const result = _faceLandmarker.detectForVideo(videoElement, now);

                        if (result && result.faceLandmarks && result.faceLandmarks.length > 0) {
                            focusMonitoringState.setFaceDetected(true);
                            focusMonitoringState.setLandmarks(result.faceLandmarks[0]);
                        } else {
                            focusMonitoringState.setFaceDetected(false);
                            focusMonitoringState.setLandmarks([]);
                        }
                    }
                }
            } catch (err) {
                console.error('[FaceDetectionService] Detection frame error:', err);
            }

            _animId = requestAnimationFrame(detectionLoop);
        };

        _animId = requestAnimationFrame(detectionLoop);
    },

    /**
     * Stops the active frame processing loop and resets landmarks state.
     */
    stopDetection() {
        if (_animId) {
            cancelAnimationFrame(_animId);
            _animId = null;
        }
        focusMonitoringState.setFaceDetected(false);
        focusMonitoringState.setLandmarks([]);
    }
};
