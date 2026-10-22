/* ============================================================
   AUTHENTICATION — API Contracts
   Placeholder API shapes. No backend implementation.
   These define the contract the UI service layer expects.
   ============================================================ */

/**
 * POST /api/auth/google
 *
 * Request:
 *   { code: string }           — Google OAuth authorization code
 *
 * Response (200):
 *   {
 *     user: {
 *       name: string,
 *       email: string,
 *       photo: string | null,   — URL to Google profile photo
 *       isNewUser: boolean,
 *     },
 *     accessToken: string,      — JWT issued by backend
 *     expiresIn: number,        — seconds
 *   }
 *
 * Response (401): { error: "Authentication failed" }
 */
export const AUTH_GOOGLE_CONTRACT = {
    method: 'POST',
    path: '/api/auth/google',
};

/**
 * POST /api/auth/email
 *
 * Request:
 *   { email: string, password: string }
 *
 * Response (200):
 *   {
 *     user: { name, email, photo, isNewUser },
 *     accessToken: string,
 *     expiresIn: number,
 *   }
 *
 * Response (401): { error: "Invalid credentials" }
 * Response (422): { error: "Validation failed", fields: { email?, password? } }
 */
export const AUTH_EMAIL_CONTRACT = {
    method: 'POST',
    path: '/api/auth/email',
};

/**
 * POST /api/auth/logout
 *
 * Request:
 *   {}  (token in Authorization header)
 *
 * Response (200): { success: true }
 * Response (401): { error: "Not authenticated" }
 */
export const AUTH_LOGOUT_CONTRACT = {
    method: 'POST',
    path: '/api/auth/logout',
};
