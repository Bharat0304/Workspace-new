/* ============================================================
   ONBOARDING — API Contracts
   Placeholder API shapes for the profile service.
   No backend implementation — contracts only.
   ============================================================ */

/**
 * POST /api/profile
 *
 * Creates a new user profile after onboarding completes.
 *
 * Request:
 *   {
 *     name: string,
 *     email: string,
 *     photo: string | null,
 *     age: number,
 *     college: string,
 *     course: string,
 *     academicYear: string | null,
 *     examTarget: string,          — e.g. "JEE" | "NEET" | ...
 *     currentStudyHours: string,   — e.g. "<1" | "1–2" | ...
 *     targetStudyHours: string,    — e.g. "4" | "6" | "Custom"
 *     preferredStudyTime: string,  — e.g. "Morning" | "Evening" | ...
 *     primaryMotivation: string,   — e.g. "Crack Exam" | ...
 *   }
 *
 * Response (201):
 *   {
 *     id: string,
 *     ...profile,
 *     createdAt: string,  — ISO timestamp
 *     version: number,
 *   }
 *
 * Response (422): { error: "Validation failed", fields: { [field]: string } }
 * Response (409): { error: "Profile already exists" }
 */
export const PROFILE_CREATE_CONTRACT = {
    method: 'POST',
    path: '/api/profile',
};

/**
 * GET /api/profile
 *
 * Retrieves the authenticated user's profile.
 *
 * Response (200):
 *   { id, name, email, photo, age, college, course, ... }
 *
 * Response (404): { error: "Profile not found" }
 * Response (401): { error: "Not authenticated" }
 */
export const PROFILE_GET_CONTRACT = {
    method: 'GET',
    path: '/api/profile',
};

/**
 * PATCH /api/profile
 *
 * Partially updates the authenticated user's profile.
 *
 * Request:
 *   { [any profile field]: value }
 *
 * Response (200): { ...updatedProfile, updatedAt: string }
 * Response (401): { error: "Not authenticated" }
 */
export const PROFILE_UPDATE_CONTRACT = {
    method: 'PATCH',
    path: '/api/profile',
};
