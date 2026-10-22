/* ============================================================
   ONBOARDING — State Store
   Manages step, form data, validation errors, and draft persistence.
   Auto-saves to localStorage on every field change.
   ============================================================ */

const DRAFT_KEY = 'ws_onboarding_draft';

const _defaults = {
    currentStep: 1,
    totalSteps: 4,
    formData: {
        // Step 1 — Personal
        name: '',
        email: '',
        photo: null,
        age: '',
        college: '',
        course: '',
        academicYear: '',

        // Step 2 — Academic
        examTarget: '',
        currentStudyHours: '',

        // Step 3 — Goals
        targetStudyHours: '',
        preferredStudyTime: '',
        primaryMotivation: '',

        // Step 4 — populated from above
    },
    validationErrors: {},
    isDraft: false,
};

let _state = _loadDraft();

function _loadDraft() {
    try {
        const raw = localStorage.getItem(DRAFT_KEY);
        return raw ? JSON.parse(raw) : { ..._defaults, formData: { ..._defaults.formData } };
    } catch {
        return { ..._defaults, formData: { ..._defaults.formData } };
    }
}

function _saveDraft() {
    try {
        _state.isDraft = true;
        localStorage.setItem(DRAFT_KEY, JSON.stringify(_state));
    } catch {
        // storage not available
    }
}

export const onboardingState = {
    /** Returns a copy of the full state. */
    getState() {
        return {
            ..._state,
            formData: { ..._state.formData },
            validationErrors: { ..._state.validationErrors },
        };
    },

    /** Returns the current step number (1-based). */
    getCurrentStep() {
        return _state.currentStep;
    },

    /** Returns a copy of all form data. */
    getFormData() {
        return { ..._state.formData };
    },

    /** Seeds initial user data (from Google auth) into Step 1 fields. */
    seedUserData(user) {
        _state.formData.name = user.name || '';
        _state.formData.email = user.email || '';
        _state.formData.photo = user.photo || null;
        _saveDraft();
    },

    /**
     * Updates a single form field and auto-saves draft.
     * @param {string} field - field name
     * @param {*} value - new value
     */
    updateField(field, value) {
        _state.formData[field] = value;
        // Clear validation error for this field on update
        delete _state.validationErrors[field];
        _saveDraft();
    },

    /** Sets multiple fields at once. */
    updateFields(updates) {
        Object.assign(_state.formData, updates);
        Object.keys(updates).forEach(k => delete _state.validationErrors[k]);
        _saveDraft();
    },

    /** Sets validation errors for a step. */
    setErrors(errors) {
        _state.validationErrors = { ..._state.validationErrors, ...errors };
    },

    /** Clears all validation errors. */
    clearErrors() {
        _state.validationErrors = {};
    },

    /** Returns validation errors. */
    getErrors() {
        return { ..._state.validationErrors };
    },

    /** Moves to the next step. */
    nextStep() {
        if (_state.currentStep < _state.totalSteps) {
            _state.currentStep++;
            _saveDraft();
        }
    },

    /** Moves to the previous step. */
    prevStep() {
        if (_state.currentStep > 1) {
            _state.currentStep--;
            _saveDraft();
        }
    },

    /** Jumps to a specific step (1-based). */
    goToStep(step) {
        if (step >= 1 && step <= _state.totalSteps) {
            _state.currentStep = step;
            _saveDraft();
        }
    },

    /** Clears the draft from localStorage and resets state. */
    clearDraft() {
        _state = { ..._defaults, formData: { ..._defaults.formData } };
        try {
            localStorage.removeItem(DRAFT_KEY);
        } catch {
            // noop
        }
    },

    /** Returns true if a saved draft exists. */
    hasDraft() {
        return _state.isDraft;
    },
};
