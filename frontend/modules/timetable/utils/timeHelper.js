/* ============================================================
   TIMETABLE — Time Helpers
   Utilities to parse, format, and validate times and durations.
   ============================================================ */

/**
 * Parses a time string (e.g., "09:00", "9:30", "14:15", "02:15 PM") into minutes since midnight.
 * Supports both 24-hour and 12-hour formats.
 * @param {string} str
 * @returns {number|null} minutes since midnight, or null if invalid
 */
export function parseTimeToMinutes(str) {
    if (!str) return null;
    const clean = str.trim().toUpperCase();
    
    // Check 12-hour format with AM/PM
    const ampmMatch = clean.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/);
    if (ampmMatch) {
        let hours = parseInt(ampmMatch[1], 10);
        const minutes = parseInt(ampmMatch[2], 10);
        const ampm = ampmMatch[3];
        
        if (hours < 1 || hours > 12 || minutes < 0 || minutes > 59) return null;
        
        if (ampm === 'PM' && hours < 12) hours += 12;
        if (ampm === 'AM' && hours === 12) hours = 0;
        
        return hours * 60 + minutes;
    }
    
    // Check 24-hour format
    const match = clean.match(/^(\d{1,2}):(\d{2})$/);
    if (match) {
        const hours = parseInt(match[1], 10);
        const minutes = parseInt(match[2], 10);
        
        if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;
        return hours * 60 + minutes;
    }
    
    return null;
}

/**
 * Formats minutes since midnight into a 24-hour "HH:MM" string.
 * @param {number} totalMinutes
 * @returns {string}
 */
export function formatMinutesToTime(totalMinutes) {
    if (totalMinutes === null || totalMinutes === undefined || isNaN(totalMinutes)) return '';
    const hours = Math.floor(totalMinutes / 60) % 24;
    const minutes = totalMinutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

/**
 * Validates a start and end time range.
 * @param {string} startStr
 * @param {string} endStr
 * @returns {{valid: boolean, error?: string}}
 */
export function validateTimeRange(startStr, endStr) {
    const start = parseTimeToMinutes(startStr);
    const end = parseTimeToMinutes(endStr);
    
    if (start === null) return { valid: false, error: 'Invalid start time format' };
    if (end === null) return { valid: false, error: 'Invalid end time format' };
    
    if (start >= end) {
        return { valid: false, error: 'Start time must be before end time' };
    }
    
    return { valid: true };
}

/**
 * Computes duration between two time strings in minutes.
 * @param {string} startStr
 * @param {string} endStr
 * @returns {number|null}
 */
export function getDurationMinutes(startStr, endStr) {
    const start = parseTimeToMinutes(startStr);
    const end = parseTimeToMinutes(endStr);
    if (start === null || end === null) return null;
    return end - start;
}
