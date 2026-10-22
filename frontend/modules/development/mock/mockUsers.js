/* ============================================================
   DEVELOPMENT MODULE — Mock Users
   Pre-defined user personas for developer panel auth shortcuts.
   All mock users follow the real authService contract shape.
   ============================================================ */

/**
 * Mock user: New User
 * - Profile incomplete
 * - Triggers onboarding flow when used via devService.loginAsNewUser()
 */
export const MOCK_NEW_USER = Object.freeze({
    name: 'Dev User (New)',
    email: 'dev.new@workspace.local',
    photo: null,                // Will generate initials avatar in auth module
    isNewUser: true,
    accessToken: 'dev_mock_token_new_user',
    _devNote: 'Mock new user — profile incomplete, will trigger onboarding',
});

/**
 * Mock user: Existing User
 * - Profile complete
 * - Navigates to dashboard when used via devService.loginAsExistingUser()
 */
export const MOCK_EXISTING_USER = Object.freeze({
    name: 'Dev User (Existing)',
    email: 'dev.existing@workspace.local',
    photo: null,
    isNewUser: false,
    accessToken: 'dev_mock_token_existing_user',
    _devNote: 'Mock existing user — profile complete, will navigate to dashboard',
});

/**
 * Mock complete profile for the existing user.
 * Written to localStorage by devService.loginAsExistingUser() to simulate
 * a returning user who has completed onboarding.
 */
export const MOCK_COMPLETE_PROFILE = Object.freeze({
    id: 'dev_profile_001',
    name: MOCK_EXISTING_USER.name,
    email: MOCK_EXISTING_USER.email,
    photo: null,
    age: '21',
    college: 'Dev University',
    course: 'B.Tech Computer Science',
    academicYear: '3rd Year',
    examTarget: 'Placements',
    currentStudyHours: '4–6',
    targetStudyHours: '6',
    preferredStudyTime: 'Evening',
    primaryMotivation: 'BuildConsistency',
    createdAt: '2024-01-15T10:00:00.000Z',
    version: 1,
    _devNote: 'Mock profile seeded by Developer Panel',
});
