/* ============================================================
   TIMETABLE — API Contracts
   Defines standard endpoint contracts for local/cloud synchronization.
   ============================================================ */

/**
 * GET /api/timetable
 *
 * Retrieves the current active timetable.
 *
 * Response (200):
 *   {
 *     id: string,
 *     userId: string,
 *     mode: "template" | "custom",
 *     columns: Array<{
 *       id: string,
 *       label: string,
 *       width?: number
 *     }>,
 *     sessions: Array<{
 *       id: string,
 *       startTime: string,      - "HH:MM"
 *       endTime: string,        - "HH:MM"
 *       breakDuration: number,  - minutes
 *       cells: {
 *         [columnId: string]: {
 *           value: string,
 *           bold?: boolean,
 *           italic?: boolean,
 *           underline?: boolean,
 *           color?: string,      - hex code
 *           background?: string, - hex code
 *           align?: "left" | "center" | "right"
 *         }
 *       }
 *     }>,
 *     lastSaved: string,        - ISO Timestamp
 *     version: number
 *   }
 *
 * Response (404): { error: "No timetable found" }
 * Response (401): { error: "Not authenticated" }
 */
export const TIMETABLE_GET_CONTRACT = {
    method: 'GET',
    path: '/api/timetable',
};

/**
 * POST /api/timetable
 *
 * Saves or updates the user's active timetable.
 *
 * Request:
 *   {
 *     mode: "template" | "custom",
 *     columns: Array<ColumnDef>,
 *     sessions: Array<SessionRow>
 *   }
 *
 * Response (200):
 *   {
 *     id: string,
 *     lastSaved: string,
 *     version: number
 *   }
 *
 * Response (400): { error: "Invalid data", validationErrors: Array<string> }
 * Response (401): { error: "Not authenticated" }
 */
export const TIMETABLE_SAVE_CONTRACT = {
    method: 'POST',
    path: '/api/timetable',
};

/**
 * DELETE /api/timetable/reset
 *
 * Resets the timetable to default template values.
 *
 * Response (200): { success: true }
 */
export const TIMETABLE_RESET_CONTRACT = {
    method: 'DELETE',
    path: '/api/timetable/reset',
};
