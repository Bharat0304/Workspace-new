/* ============================================================
   ONBOARDING — Step 4: Review & Create Workspace
   Displays all collected data. "Edit" buttons jump to steps.
   "Create Workspace" triggers profile creation + loading overlay.
   ============================================================ */

import { onboardingState } from '../state/onboardingState.js';
import { createReviewCard } from '../components/ReviewCard.js';
import { showLoadingOverlay } from '../components/LoadingOverlay.js';
import { profileService } from '../services/profileService.js';
import { authState } from '../../authentication/state/authState.js';

/**
 * Renders Step 4 into the given container.
 * @param {HTMLElement} container
 * @param {{ onNavigate: (step: number) => void }} options
 */
export function renderStep4(container, { onNavigate } = {}) {
    const data = onboardingState.getFormData();

    container.innerHTML = `
        <div class="ob-step" id="obStep4">
            <div class="ob-step-header">
                <span class="ob-step-tag">Step 4 of 4</span>
                <h2 class="ob-step-title">Review your setup</h2>
                <p class="ob-step-sub">Everything look good? Hit Create to launch your WorkSpace.</p>
            </div>

            <div class="ob-review-sections" id="obReviewSections">
                <!-- Review cards injected below -->
            </div>

            <div class="ob-create-block">
                <button class="ob-create-btn" id="obCreateBtn" type="button">
                    <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5">
                        <path d="M10 2v16M2 10h16" stroke-linecap="round"/>
                    </svg>
                    Create Workspace
                </button>
                <p class="ob-create-note">
                    Your settings can be updated anytime from Preferences.
                </p>
            </div>
        </div>
    `;

    const sectionsEl = container.querySelector('#obReviewSections');

    // Personal info card
    sectionsEl.appendChild(createReviewCard({
        title: 'Personal Info',
        items: [
            { label: 'Name', value: data.name },
            { label: 'Email', value: data.email },
            { label: 'Age', value: data.age },
            { label: 'Institution', value: data.college },
            { label: 'Course', value: data.course },
            { label: 'Academic Year', value: data.academicYear },
        ],
        editStep: 1,
        onEdit: onNavigate,
    }));

    // Academic profile card
    sectionsEl.appendChild(createReviewCard({
        title: 'Academic Profile',
        items: [
            { label: 'Preparing For', value: data.examTarget },
            { label: 'Current Study Hours', value: data.currentStudyHours ? `${data.currentStudyHours} hrs/day` : '' },
        ],
        editStep: 2,
        onEdit: onNavigate,
    }));

    // Goals card
    sectionsEl.appendChild(createReviewCard({
        title: 'Goals',
        items: [
            { label: 'Target Hours', value: data.targetStudyHours ? `${data.targetStudyHours} hrs/day` : '' },
            { label: 'Preferred Time', value: data.preferredStudyTime },
            { label: 'Motivation', value: _formatMotivation(data.primaryMotivation) },
        ],
        editStep: 3,
        onEdit: onNavigate,
    }));

    // Wire Create Workspace button
    container.querySelector('#obCreateBtn').addEventListener('click', () => {
        _handleCreate(container);
    });
}

// ── Private ──────────────────────────────────────────────────

async function _handleCreate(container) {
    const createBtn = container.querySelector('#obCreateBtn');
    if (createBtn) {
        createBtn.disabled = true;
        createBtn.textContent = 'Creating…';
    }

    const overlay = showLoadingOverlay();
    const data = onboardingState.getFormData();

    // Resolve target study hours to a float value for the service layer
    const profilePayload = { ...data };
    if (profilePayload.targetStudyHours) {
        const parsed = parseFloat(profilePayload.targetStudyHours);
        if (!isNaN(parsed)) {
            profilePayload.targetStudyHours = parsed;
        }
    }

    try {
        await profileService.createProfile(profilePayload, (stageIndex) => {
            overlay.completeStage(stageIndex);
        });

        authState.setProfileComplete(true);
        onboardingState.clearDraft();

        // Small pause after all stages complete
        await _delay(600);
        overlay.dismiss();

        // Navigate to dashboard
        await _delay(500);
        _showDashboardPlaceholder();

    } catch (err) {
        overlay.dismiss();
        if (createBtn) {
            createBtn.disabled = false;
            createBtn.textContent = 'Create Workspace';
        }
        // Show error
        const errEl = document.createElement('p');
        errEl.style.cssText = 'color:#EF4444;font-size:0.82rem;margin-top:0.5rem;text-align:center;';
        errEl.textContent = 'Something went wrong. Please try again.';
        container.querySelector('.ob-create-block')?.appendChild(errEl);
    }
}

function _showDashboardPlaceholder() {
    // Remove the onboarding overlay
    document.getElementById('obOverlay')?.remove();

    // Redirect to Dashboard feature workspace
    const isSubfolder = window.location.pathname.includes('/pages/') || window.location.pathname.includes('/modules/');
    const prefix = isSubfolder ? '../../../' : '';
    window.location.href = `${prefix}modules/dashboard/pages/dashboard.html`;
}

function _formatMotivation(val) {
    const map = {
        CrackExam: 'Crack Exam',
        ImproveGrades: 'Improve Grades',
        BuildConsistency: 'Build Consistency',
        SkillDev: 'Skill Development',
        Other: 'Other',
    };
    return map[val] || val;
}

function _delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
