/* ============================================================
   FOCUS MONITORING — State Store
   Singleton state. UI subscribes to change notifications.
   ============================================================ */

/** @type {import('../contracts/FocusMonitoringContract.js').FocusMonitoringState} */
const _defaults = {
    cameraPermission: 'prompt',
    cameraStatus: 'off',
    faceDetected: false,
    landmarks: [],
    error: null
};

let _state = { ..._defaults };
const _listeners = new Set();

function _notify() {
    const copy = focusMonitoringState.getState();
    _listeners.forEach(fn => fn(copy));
}

export const focusMonitoringState = {
    /**
     * Subscribe to state updates.
     * @param {Function} callback
     * @returns {Function} unsubscribe function
     */
    subscribe(callback) {
        _listeners.add(callback);
        // Fire immediately with current state
        callback(this.getState());
        return () => {
            _listeners.delete(callback);
        };
    },

    /** Returns a deep copy of the current state. */
    getState() {
        return JSON.parse(JSON.stringify(_state));
    },

    /** Sets the camera permission state. */
    setPermission(permission) {
        if (_state.cameraPermission === permission) return;
        _state.cameraPermission = permission;
        _notify();
    },

    /** Sets the camera active status. */
    setStatus(status) {
        if (_state.cameraStatus === status) return;
        _state.cameraStatus = status;
        _notify();
    },

    /** Sets face detection status. */
    setFaceDetected(detected) {
        if (_state.faceDetected === detected) return;
        _state.faceDetected = detected;
        _notify();
    },

    /** Sets the face landmark coordinates. */
    setLandmarks(points) {
        _state.landmarks = points;
        _notify();
    },

    /** Sets global error message. */
    setError(msg) {
        _state.error = msg;
        _state.cameraStatus = 'error';
        _notify();
    },

    /** Clears errors. */
    clearError() {
        _state.error = null;
        _notify();
    },

    /** Resets the monitoring state to default parameters. */
    reset() {
        _state = { ..._defaults };
        _notify();
    }
};
