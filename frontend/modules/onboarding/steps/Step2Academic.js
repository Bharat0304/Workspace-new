/* ============================================================
   ONBOARDING — Step 2: Academic Profile
   Two groups of option cards — exam target + current study hours.
   No text inputs.
   ============================================================ */

import { onboardingState } from '../state/onboardingState.js';
import { createOptionCardGroup } from '../components/OptionCard.js';

const EXAM_CHOICES = [
    { label: 'JEE', value: 'JEE', emoji: '⚛️' },
    { label: 'NEET', value: 'NEET', emoji: '🧬' },
    { label: 'Placements', value: 'Placements', emoji: '💼' },
    { label: 'College', value: 'College', emoji: '🎓' },
    { label: 'UPSC', value: 'UPSC', emoji: '🏛️' },
    { label: 'Govt. Exams', value: 'GovtExams', emoji: '📋' },
    { label: 'Other', value: 'Other', emoji: '✨' },
];

const STUDY_HOURS_CHOICES = [
    { label: 'Less than 1h', value: '<1' },
    { label: '1 – 2 hours', value: '1–2' },
    { label: '2 – 4 hours', value: '2–4' },
    { label: '4 – 6 hours', value: '4–6' },
    { label: '6+ hours', value: '6+' },
];

const PREDEFINED_EXAMS = ['JEE', 'NEET', 'Placements', 'College', 'UPSC', 'GovtExams'];

/**
 * Renders Step 2 into the given container.
 * @param {HTMLElement} container
 */
export function renderStep2(container) {
    const data = onboardingState.getFormData();

    // Heuristics: if we have a custom value saved that is not predefined, select 'Other'
    const isOtherSelected = data.examTarget && !PREDEFINED_EXAMS.includes(data.examTarget);
    const initialSelectedExam = isOtherSelected ? 'Other' : data.examTarget;
    const initialOtherVal = (isOtherSelected && data.examTarget !== 'Other') ? data.examTarget : '';

    container.innerHTML = `
        <div class="ob-step" id="obStep2">
            <div class="ob-step-header">
                <span class="ob-step-tag">Step 2 of 4</span>
                <h2 class="ob-step-title">Your academic profile</h2>
                <p class="ob-step-sub">This helps WorkSpace understand your preparation context.</p>
            </div>

            <div class="ob-question-block" id="examBlock">
                <h3 class="ob-question">What are you preparing for?</h3>
                <div class="ob-question-error" id="examError">Please select one option.</div>
                <div id="examCardGroup"></div>
                <div id="examOtherContainer" class="ob-custom-input-container" style="display: ${isOtherSelected ? 'block' : 'none'}; margin-top: 1.2rem; max-width: 360px;">
                    <div class="ob-form-field">
                        <input
                            type="text"
                            id="examOtherInput"
                            class="ob-form-input"
                            placeholder="Please specify (e.g. CA Foundation, SAT)"
                            value="${initialOtherVal}"
                            autocomplete="off"
                        />
                        <span class="ob-form-error" id="examOtherInputError" role="alert">Please specify your exam target.</span>
                    </div>
                </div>
            </div>

            <div class="ob-question-block" id="hoursBlock">
                <h3 class="ob-question">How many hours do you currently study per day?</h3>
                <div class="ob-question-error" id="hoursError">Please select one option.</div>
                <div id="hoursCardGroup"></div>
            </div>
        </div>
    `;

    // Exam target group
    const examGroup = createOptionCardGroup({
        choices: EXAM_CHOICES,
        selected: initialSelectedExam,
        groupName: 'Exam target',
        onSelect: (val) => {
            const otherContainer = container.querySelector('#examOtherContainer');
            const otherInput = container.querySelector('#examOtherInput');
            const otherError = container.querySelector('#examOtherInputError');

            // Clear main question error
            container.querySelector('#examError')?.classList.remove('visible');

            if (val === 'Other') {
                otherContainer.style.display = 'block';
                onboardingState.updateField('examTarget', otherInput.value.trim() || 'Other');
                otherInput.focus();
            } else {
                otherContainer.style.display = 'none';
                otherInput.value = '';
                otherInput.classList.remove('error');
                otherError?.classList.remove('visible');
                onboardingState.updateField('examTarget', val);
            }
        },
    });
    container.querySelector('#examCardGroup').appendChild(examGroup);

    // Watch custom "Other" input typing
    const otherInput = container.querySelector('#examOtherInput');
    otherInput.addEventListener('input', () => {
        const val = otherInput.value.trim();
        onboardingState.updateField('examTarget', val || 'Other');
        otherInput.classList.remove('error');
        container.querySelector('#examOtherInputError')?.classList.remove('visible');
    });

    // Study hours group
    const hoursGroup = createOptionCardGroup({
        choices: STUDY_HOURS_CHOICES,
        selected: data.currentStudyHours,
        groupName: 'Current study hours',
        onSelect: (val) => {
            onboardingState.updateField('currentStudyHours', val);
            container.querySelector('#hoursError')?.classList.remove('visible');
        },
    });
    container.querySelector('#hoursCardGroup').appendChild(hoursGroup);
}

/**
 * Validates Step 2 selections.
 * @param {HTMLElement} container
 * @returns {boolean}
 */
export function validateStep2(container) {
    const data = onboardingState.getFormData();
    let valid = true;

    if (!data.examTarget) {
        container.querySelector('#examError')?.classList.add('visible');
        valid = false;
    } else {
        const examCardGroup = container.querySelector('#examCardGroup');
        const otherCard = examCardGroup?.querySelector('[data-value="Other"]');
        if (otherCard && otherCard.classList.contains('selected')) {
            const otherInput = container.querySelector('#examOtherInput');
            const otherVal = otherInput ? otherInput.value.trim() : '';
            if (!otherVal || otherVal === 'Other') {
                const otherError = container.querySelector('#examOtherInputError');
                if (otherError) otherError.classList.add('visible');
                if (otherInput) otherInput.classList.add('error');
                valid = false;
            }
        }
    }

    if (!data.currentStudyHours) {
        container.querySelector('#hoursError')?.classList.add('visible');
        valid = false;
    }

    return valid;
}
