/* ============================================================
   TIMETABLE — Unit Tests
   Runs testing assertions against helpers, state, and services.
   ============================================================ */

import { parseTimeToMinutes, validateTimeRange } from '../utils/timeHelper.js';
import { timetableState } from '../state/timetableState.js';
import { timetableService } from '../services/timetableService.js';

export function runTests(reporter) {
    reporter.group('Time Helpers', () => {
        // Parse time to minutes
        reporter.assert(parseTimeToMinutes('09:00') === 540, 'Parses 24h morning time');
        reporter.assert(parseTimeToMinutes('14:30') === 870, 'Parses 24h afternoon time');
        reporter.assert(parseTimeToMinutes('09:00 AM') === 540, 'Parses 12h AM time');
        reporter.assert(parseTimeToMinutes('02:30 PM') === 870, 'Parses 12h PM time');
        reporter.assert(parseTimeToMinutes('12:00 PM') === 720, 'Parses 12:00 PM as noon');
        reporter.assert(parseTimeToMinutes('12:00 AM') === 0, 'Parses 12:00 AM as midnight');
        reporter.assert(parseTimeToMinutes('invalid') === null, 'Returns null on malformed strings');

        // Validate range
        reporter.assert(validateTimeRange('09:00', '10:30').valid === true, 'Accepts valid start/end times');
        reporter.assert(validateTimeRange('10:30', '09:00').valid === false, 'Rejects start time after end time');
        reporter.assert(validateTimeRange('09:00', '09:00').valid === false, 'Rejects equal start/end times');
    });

    reporter.group('Timetable State Store', () => {
        timetableState.reset();
        const initial = timetableState.getState();
        reporter.assert(initial.sessions.length === 0, 'Initial state contains no rows');
        
        // Add row
        const row = timetableState.addRow(null, {
            id: 'test_row',
            startTime: '10:00',
            endTime: '11:00',
            breakDuration: 15,
            cells: { work: { value: 'Chemistry' } }
        });
        let state = timetableState.getState();
        reporter.assert(state.sessions.length === 1, 'Correctly appends row to state');
        reporter.assert(state.sessions[0].id === 'test_row', 'Appended row retains correct ID');
        reporter.assert(state.hasUnsavedChanges === true, 'Adding row marks state as dirty');

        // Update cell
        timetableState.updateCell(0, 'work', 'Organic Chemistry');
        state = timetableState.getState();
        reporter.assert(state.sessions[0].cells.work.value === 'Organic Chemistry', 'Correctly updates cell value in state');

        // Move row
        timetableState.addRow(null, { id: 'test_row_2', startTime: '11:00', endTime: '12:00', cells: {} });
        timetableState.moveRow(1, 0);
        state = timetableState.getState();
        reporter.assert(state.sessions[0].id === 'test_row_2', 'Row position correctly swapped');
        
        // Delete row
        timetableState.deleteRow(0);
        state = timetableState.getState();
        reporter.assert(state.sessions.length === 1 && state.sessions[0].id === 'test_row', 'Row correctly removed');
    });

    reporter.group('Validation Rules (Service Layer)', () => {
        // Build mock state
        const invalidState = {
            columns: [
                { id: 'session', label: 'Session / Break' },
                { id: 'work', label: 'Work' }
            ],
            sessions: [
                {
                    id: 'row_1',
                    startTime: '12:00',
                    endTime: '11:00', // Invalid time range
                    breakDuration: -5, // Invalid break
                    cells: {}
                }
            ]
        };

        const errors = timetableService.validateTimetable(invalidState);
        reporter.assert(errors.length === 2, 'Validation captures invalid time range and negative break');
        reporter.assert(errors.some(err => err.includes('Start time must be before end time')), 'Validation returns correct range message');
        reporter.assert(errors.some(err => err.includes('Break duration must be a valid positive number')), 'Validation returns correct break duration message');
    });
}
