/* ============================================================
   ONBOARDING — Step 3: Goals
   Three groups of option cards — target hours, study time, motivation.
   ============================================================ */

import { onboardingState } from '../state/onboardingState.js';
import { createOptionCardGroup } from '../components/OptionCard.js';

const TARGET_HOURS = [
    { label: '2 hours', value: '2' },
    { label: '4 hours', value: '4' },
    { label: '6 hours', value: '6' },
    { label: '8 hours', value: '8' },
    { label: 'Custom', value: 'Custom' },
];

const STUDY_TIME = [
    { label: 'Morning', value: 'Morning', emoji: '🌅' },
    { label: 'Afternoon', value: 'Afternoon', emoji: '☀️' },
    { label: 'Evening', value: 'Evening', emoji: '🌆' },
    { label: 'Night', value: 'Night', emoji: '🌙' },
    { label: 'Flexible', value: 'Flexible', emoji: '⚡' },
];

const MOTIVATION = [
    { label: 'Crack Exam', value: 'CrackExam', emoji: '🏆' },
    { label: 'Improve Grades', value: 'ImproveGrades', emoji: '📈' },
    { label: 'Build Consistency', value: 'BuildConsistency', emoji: '🔄' },
    { label: 'Skill Development', value: 'SkillDev', emoji: '🛠️' },
    { label: 'Other', value: 'Other', emoji: '✨' },
];

const PREDEFINED_HOURS = ['2', '4', '6', '8'];
const PREDEFINED_MOTIVATIONS = ['CrackExam', 'ImproveGrades', 'BuildConsistency', 'SkillDev'];

/**
 * Renders Step 3 into the given container.
 * @param {HTMLElement} container
 */
export function renderStep3(container) {
    const data = onboardingState.getFormData();

    // Heuristics: check if saved study hours is custom (i.e. not predefined)
    const isCustomSelected = data.targetStudyHours && !PREDEFINED_HOURS.includes(data.targetStudyHours);
    const initialSelectedHours = isCustomSelected ? 'Custom' : data.targetStudyHours;
    const initialCustomHoursVal = (isCustomSelected && data.targetStudyHours !== 'Custom') ? data.targetStudyHours : '';

    // Heuristics: check if saved motivation is other (i.e. not predefined)
    const isOtherMotivationSelected = data.primaryMotivation && !PREDEFINED_MOTIVATIONS.includes(data.primaryMotivation);
    const initialSelectedMotivation = isOtherMotivationSelected ? 'Other' : data.primaryMotivation;
    const initialOtherMotivationVal = (isOtherMotivationSelected && data.primaryMotivation !== 'Other') ? data.primaryMotivation : '';

    container.innerHTML = `
        <div class="ob-step" id="obStep3">
            <div class="ob-step-header">
                <span class="ob-step-tag">Step 3 of 4</span>
                <h2 class="ob-step-title">Set your goals</h2>
                <p class="ob-step-sub">WorkSpace will calibrate your discipline engine around these targets.</p>
            </div>

            <div class="ob-question-block">
                <h3 class="ob-question">Target daily study hours</h3>
                <div class="ob-question-error" id="targetHoursError">Please select your target.</div>
                <div id="targetHoursGroup"></div>
                <div id="targetHoursCustomContainer" class="ob-custom-input-container" style="display: ${isCustomSelected ? 'block' : 'none'}; margin-top: 1.2rem; max-width: 360px;">
                    <div class="ob-form-field">
                        <input
                            type="number"
                            id="targetHoursCustomInput"
                            class="ob-form-input"
                            placeholder="e.g. 5.5"
                            value="${initialCustomHoursVal}"
                            min="1"
                            max="16"
                            step="any"
                            autocomplete="off"
                        />
                        <span class="ob-form-error" id="targetHoursCustomError" role="alert">Please enter a valid study target (1–16 hours).</span>
                    </div>
                </div>
            </div>

            <div class="ob-question-block">
                <h3 class="ob-question">Preferred study time</h3>
                <div class="ob-question-error" id="studyTimeError">Please select a preferred time.</div>
                <div id="studyTimeGroup"></div>
            </div>

            <div class="ob-question-block">
                <h3 class="ob-question">What's your primary motivation?</h3>
                <div class="ob-question-error" id="motivationError">Please select your motivation.</div>
                <div id="motivationGroup"></div>
                <div id="motivationOtherContainer" class="ob-custom-input-container" style="display: ${isOtherMotivationSelected ? 'block' : 'none'}; margin-top: 1.2rem; max-width: 360px;">
                    <div class="ob-form-field">
                        <input
                            type="text"
                            id="motivationOtherInput"
                            class="ob-form-input"
                            placeholder="Please specify (e.g. Career Transition, Self Improvement)"
                            value="${initialOtherMotivationVal}"
                            autocomplete="off"
                        />
                        <span class="ob-form-error" id="motivationOtherError" role="alert">Please specify your motivation.</span>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Target hours group
    const hoursGroup = createOptionCardGroup({
        choices: TARGET_HOURS,
        selected: initialSelectedHours,
        groupName: 'Target study hours',
        onSelect: (val) => {
            const customContainer = container.querySelector('#targetHoursCustomContainer');
            const customInput = container.querySelector('#targetHoursCustomInput');
            const customError = container.querySelector('#targetHoursCustomError');

            container.querySelector('#targetHoursError')?.classList.remove('visible');

            if (val === 'Custom') {
                customContainer.style.display = 'block';
                onboardingState.updateField('targetStudyHours', customInput.value.trim() || 'Custom');
                customInput.focus();
            } else {
                customContainer.style.display = 'none';
                customInput.value = '';
                customInput.classList.remove('error');
                customError?.classList.remove('visible');
                onboardingState.updateField('targetStudyHours', val);
            }
        },
    });
    container.querySelector('#targetHoursGroup').appendChild(hoursGroup);

    // Watch custom input typing
    const customInput = container.querySelector('#targetHoursCustomInput');
    customInput.addEventListener('input', () => {
        const val = customInput.value.trim();
        onboardingState.updateField('targetStudyHours', val || 'Custom');
        customInput.classList.remove('error');
        container.querySelector('#targetHoursCustomError')?.classList.remove('visible');
    });

    // Preferred study time
    const timeGroup = createOptionCardGroup({
        choices: STUDY_TIME,
        selected: data.preferredStudyTime,
        groupName: 'Preferred study time',
        onSelect: (val) => {
            onboardingState.updateField('preferredStudyTime', val);
            container.querySelector('#studyTimeError')?.classList.remove('visible');
        },
    });
    container.querySelector('#studyTimeGroup').appendChild(timeGroup);

    // Motivation
    const motivationGroup = createOptionCardGroup({
        choices: MOTIVATION,
        selected: initialSelectedMotivation,
        groupName: 'Primary motivation',
        onSelect: (val) => {
            const otherContainer = container.querySelector('#motivationOtherContainer');
            const otherInput = container.querySelector('#motivationOtherInput');
            const otherError = container.querySelector('#motivationOtherError');

            container.querySelector('#motivationError')?.classList.remove('visible');

            if (val === 'Other') {
                otherContainer.style.display = 'block';
                onboardingState.updateField('primaryMotivation', otherInput.value.trim() || 'Other');
                otherInput.focus();
            } else {
                otherContainer.style.display = 'none';
                otherInput.value = '';
                otherInput.classList.remove('error');
                otherError?.classList.remove('visible');
                onboardingState.updateField('primaryMotivation', val);
            }
        },
    });
    container.querySelector('#motivationGroup').appendChild(motivationGroup);

    // Watch custom "Other" motivation input typing
    const motivationOtherInput = container.querySelector('#motivationOtherInput');
    motivationOtherInput.addEventListener('input', () => {
        const val = motivationOtherInput.value.trim();
        onboardingState.updateField('primaryMotivation', val || 'Other');
        motivationOtherInput.classList.remove('error');
        container.querySelector('#motivationOtherError')?.classList.remove('visible');
    });
}

/**
 * Validates Step 3 selections.
 * @param {HTMLElement} container
 * @returns {boolean}
 */
export function validateStep3(container) {
    const data = onboardingState.getFormData();
    let valid = true;

    if (!data.targetStudyHours) {
        container.querySelector('#targetHoursError')?.classList.add('visible');
        valid = false;
    } else {
        const hoursGroup = container.querySelector('#targetHoursGroup');
        const customCard = hoursGroup?.querySelector('[data-value="Custom"]');
        if (customCard && customCard.classList.contains('selected')) {
            const customInput = container.querySelector('#targetHoursCustomInput');
            const customValStr = customInput ? customInput.value.trim() : '';
            const customVal = parseFloat(customValStr);
            if (!customValStr || isNaN(customVal) || customVal < 1 || customVal > 16) {
                const customError = container.querySelector('#targetHoursCustomError');
                if (customError) customError.classList.add('visible');
                if (customInput) customInput.classList.add('error');
                valid = false;
            }
        }
    }

    if (!data.preferredStudyTime) {
        container.querySelector('#studyTimeError')?.classList.add('visible');
        valid = false;
    }
    if (!data.primaryMotivation) {
        container.querySelector('#motivationError')?.classList.add('visible');
        valid = false;
    } else {
        const motivationGroup = container.querySelector('#motivationGroup');
        const otherCard = motivationGroup?.querySelector('[data-value="Other"]');
        if (otherCard && otherCard.classList.contains('selected')) {
            const otherInput = container.querySelector('#motivationOtherInput');
            const otherVal = otherInput ? otherInput.value.trim() : '';
            if (!otherVal || otherVal === 'Other') {
                const otherError = container.querySelector('#motivationOtherError');
                if (otherError) otherError.classList.add('visible');
                if (otherInput) otherInput.classList.add('error');
                valid = false;
            }
        }
    }

    return valid;
}
