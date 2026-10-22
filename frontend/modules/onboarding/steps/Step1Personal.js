/* ============================================================
   ONBOARDING — Step 1: Personal Information
   Prefills from Google auth data. User fills age, college, course.
   ============================================================ */

import { onboardingState } from '../state/onboardingState.js';
import { createFormCard, setFormCardError, clearFormCardError } from '../components/FormCard.js';

/**
 * Renders Step 1 into the given container.
 * @param {HTMLElement} container
 */
export function renderStep1(container) {
    const data = onboardingState.getFormData();

    container.innerHTML = `
        <div class="ob-step" id="obStep1">
            <div class="ob-step-header">
                <span class="ob-step-tag">Step 1 of 4</span>
                <h2 class="ob-step-title">Let's set up your profile</h2>
                <p class="ob-step-sub">We've pre-filled what we know from Google. Just fill in the rest.</p>
            </div>

            <div class="ob-profile-preview" id="obProfilePreview">
                <div class="ob-avatar" id="obAvatar">
                    ${data.photo
                        ? `<img src="${data.photo}" alt="Profile photo" class="ob-avatar-img"/>`
                        : `<span class="ob-avatar-initials">${_getInitials(data.name)}</span>`
                    }
                </div>
                <div class="ob-profile-info">
                    <span class="ob-profile-name">${data.name || 'Your Name'}</span>
                    <span class="ob-profile-email">${data.email || ''}</span>
                </div>
            </div>

            <div class="ob-form-grid" id="obStep1Form">
                <!-- Form fields injected below -->
            </div>
        </div>
    `;

    const form = container.querySelector('#obStep1Form');

    // Name (prefilled, editable)
    const nameField = createFormCard({
        id: 'obName',
        label: 'Full Name',
        placeholder: 'Your full name',
        value: data.name,
        errorMessage: 'Please enter your name.',
        onChange: (val) => {
            onboardingState.updateField('name', val);
            _updateProfilePreview(container, val, data.email);
        },
    });

    // Email (prefilled, read-only)
    const emailField = createFormCard({
        id: 'obEmail',
        label: 'Email Address',
        type: 'email',
        value: data.email,
        readOnly: true,
        errorMessage: '',
    });

    // Age
    const ageField = createFormCard({
        id: 'obAge',
        label: 'Age',
        type: 'number',
        placeholder: 'e.g. 19',
        value: data.age,
        errorMessage: 'Please enter a valid age (13–35).',
        onChange: (val) => onboardingState.updateField('age', val),
    });

    // College / School
    const collegeField = createFormCard({
        id: 'obCollege',
        label: 'College / School',
        placeholder: 'e.g. IIT Delhi, DPS RK Puram',
        value: data.college,
        errorMessage: 'Please enter your institution name.',
        onChange: (val) => onboardingState.updateField('college', val),
    });

    // Course / Class
    const courseField = createFormCard({
        id: 'obCourse',
        label: 'Course / Class',
        placeholder: 'e.g. B.Tech CSE, Class 12 Science',
        value: data.course,
        errorMessage: 'Please enter your course or class.',
        onChange: (val) => onboardingState.updateField('course', val),
    });

    // Academic Year (optional)
    const yearField = createFormCard({
        id: 'obYear',
        label: 'Academic Year (optional)',
        placeholder: 'e.g. 2nd Year, 2023–24',
        value: data.academicYear,
        onChange: (val) => onboardingState.updateField('academicYear', val),
    });

    form.appendChild(nameField);
    form.appendChild(emailField);
    form.appendChild(ageField);
    form.appendChild(collegeField);
    form.appendChild(courseField);
    form.appendChild(yearField);
}

/**
 * Validates Step 1 form fields.
 * @param {HTMLElement} container
 * @returns {boolean} true if valid
 */
export function validateStep1(container) {
    const data = onboardingState.getFormData();
    let valid = true;

    const fields = [
        { id: 'obName', key: 'name', check: v => v.trim().length > 1 },
        { id: 'obAge', key: 'age', check: v => { const n = parseInt(v); return !isNaN(n) && n >= 13 && n <= 35; } },
        { id: 'obCollege', key: 'college', check: v => v.trim().length > 1 },
        { id: 'obCourse', key: 'course', check: v => v.trim().length > 1 },
    ];

    fields.forEach(({ id, key, check }) => {
        const fieldEl = container.querySelector(`#${id}`)?.closest('.ob-form-field');
        if (!fieldEl) return;

        const val = data[key] || container.querySelector(`#${id}`)?.value || '';
        if (!check(val)) {
            setFormCardError(fieldEl);
            valid = false;
        } else {
            clearFormCardError(fieldEl);
        }
    });

    return valid;
}

// ── Helpers ──────────────────────────────────────────────────

function _getInitials(name = '') {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';
}

function _updateProfilePreview(container, name) {
    const nameEl = container.querySelector('.ob-profile-name');
    const initialsEl = container.querySelector('.ob-avatar-initials');
    if (nameEl) nameEl.textContent = name || 'Your Name';
    if (initialsEl) initialsEl.textContent = _getInitials(name);
}
