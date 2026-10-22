/* ============================================================
   TIMETABLE — Mock Service Data Layer
   Simulates cloud/electron storage with localStorage persistence.

   ROW SCHEMA (v2):
   Every row is an independent timeline block. No row owns another.
   {
     id: string,
     type: 'session' | 'break',
     startTime: string,   // "HH:MM"
     endTime: string,     // "HH:MM"
     cells: { [colId]: { value, bold, italic, ... } }
   }
   ============================================================ */

const TIMETABLE_KEY = 'ws_timetable';

// ── Default Configurations ────────────────────────────────────

export const DEFAULT_TEMPLATE_COLUMNS = [
    { id: 'session', label: 'Session / Break', width: 220 },
    { id: 'work',    label: 'Work',            width: 200 },
    { id: 'description', label: 'Description', width: 300 },
    { id: 'extraWork',   label: 'Extra Work',  width: 200 }
];

export const DEFAULT_TEMPLATE_SESSIONS = [
    {
        id: 'row_1',
        type: 'session',
        startTime: '09:00',
        endTime: '10:30',
        cells: {
            work: { value: 'Mathematics' },
            description: { value: 'Practice Integration' },
            extraWork: { value: '—' }
        }
    },
    {
        id: 'row_2',
        type: 'break',
        startTime: '10:30',
        endTime: '10:45',
        cells: {
            work: { value: '' },
            description: { value: '' },
            extraWork: { value: '' }
        }
    },
    {
        id: 'row_3',
        type: 'session',
        startTime: '10:45',
        endTime: '12:15',
        cells: {
            work: { value: 'Physics' },
            description: { value: 'Chapter 4' },
            extraWork: { value: '—' }
        }
    },
    {
        id: 'row_4',
        type: 'break',
        startTime: '12:15',
        endTime: '12:45',
        cells: {
            work: { value: 'Lunch' },
            description: { value: '' },
            extraWork: { value: '' }
        }
    },
    {
        id: 'row_5',
        type: 'session',
        startTime: '12:45',
        endTime: '14:15',
        cells: {
            work: { value: 'Chemistry' },
            description: { value: 'Organic Revision' },
            extraWork: { value: 'Buy Notebook' }
        }
    },
    {
        id: 'row_6',
        type: 'break',
        startTime: '14:15',
        endTime: '14:30',
        cells: {
            work: { value: '' },
            description: { value: '' },
            extraWork: { value: '' }
        }
    },
    {
        id: 'row_7',
        type: 'session',
        startTime: '14:30',
        endTime: '16:00',
        cells: {
            work: { value: 'Mock Test' },
            description: { value: 'JEE Mock' },
            extraWork: { value: '—' }
        }
    }
];

export const DEFAULT_BLANK_COLUMNS = [
    { id: 'session', label: 'Session / Break', width: 220 },
    { id: 'work',    label: 'Work',            width: 300 }
];

export const DEFAULT_BLANK_SESSIONS = [
    {
        id: 'row_1',
        type: 'session',
        startTime: '09:00',
        endTime: '10:00',
        cells: {
            work: { value: '' }
        }
    }
];

// ── Mock API Methods ──────────────────────────────────────────

/**
 * Fetch the current timetable from localStorage (or null if not created).
 * @returns {Promise<Object|null>}
 */
export async function mockGetTimetable() {
    await _delay(300);
    try {
        const raw = localStorage.getItem(TIMETABLE_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

/**
 * Save/update the timetable configuration.
 * @param {Object} timetableData
 * @returns {Promise<Object>}
 */
export async function mockSaveTimetable(timetableData) {
    await _delay(500);
    const data = {
        ...timetableData,
        id: timetableData.id || `timetable_${Date.now()}`,
        lastSaved: new Date().toISOString(),
        version: (timetableData.version || 0) + 1
    };

    try {
        localStorage.setItem(TIMETABLE_KEY, JSON.stringify(data));
    } catch (err) {
        throw new Error('Storage write failed.');
    }

    return data;
}

/**
 * Resets the timetable in storage.
 * @returns {Promise<boolean>}
 */
export async function mockResetTimetable() {
    await _delay(400);
    try {
        localStorage.removeItem(TIMETABLE_KEY);
        return true;
    } catch {
        return false;
    }
}

function _delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
