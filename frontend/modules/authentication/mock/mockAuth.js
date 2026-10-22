/* ============================================================
   AUTHENTICATION MODULE — Mock Google + Email Auth
   Simulates realistic network delay and returns user object.
   ============================================================ */

const MOCK_USERS = {
    'returning@example.com': {
        name: 'Aryan Mehta',
        email: 'returning@example.com',
        photo: null,
        isNewUser: false,
    },
};

/**
 * Generates an initials-based avatar data URL (amber on black).
 * @param {string} name
 * @returns {string} data URL
 */
function generateAvatar(name) {
    const initials = name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    const canvas = document.createElement('canvas');
    canvas.width = 80;
    canvas.height = 80;
    const ctx = canvas.getContext('2d');

    // Background
    ctx.fillStyle = '#111111';
    ctx.beginPath();
    ctx.arc(40, 40, 40, 0, Math.PI * 2);
    ctx.fill();

    // Amber ring
    ctx.strokeStyle = '#D97706';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(40, 40, 38, 0, Math.PI * 2);
    ctx.stroke();

    // Initials
    ctx.fillStyle = '#D97706';
    ctx.font = 'bold 26px "Outfit", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(initials, 40, 41);

    return canvas.toDataURL();
}

/**
 * Simulates Google OAuth. Always succeeds (no real OAuth).
 * Checks MOCK_USERS to determine isNewUser.
 * @returns {Promise<{name, email, photo, isNewUser, accessToken}>}
 */
export async function mockGoogleLogin() {
    await _delay(1200 + Math.random() * 400);

    // For demo: simulate a new user ~70% of the time
    // (override: if email matches MOCK_USERS key, treat as returning)
    const isNew = Math.random() > 0.3;
    const mockEmail = isNew ? `user_${Date.now()}@gmail.com` : 'returning@example.com';
    const mockName = isNew ? _pickRandomName() : 'Aryan Mehta';

    const user = {
        name: mockName,
        email: mockEmail,
        photo: generateAvatar(mockName),
        isNewUser: isNew,
        accessToken: `mock_token_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    };

    return user;
}

/**
 * Simulates email/password login.
 * Always treats email login as returning user for demo simplicity.
 * Rejects with error if password is 'wrong'.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{name, email, photo, isNewUser, accessToken}>}
 */
export async function mockEmailLogin(email, password) {
    await _delay(900 + Math.random() * 300);

    if (password === 'wrong') {
        throw new Error('Invalid email or password. Please try again.');
    }

    const name = email.split('@')[0]
        .replace(/[._]/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase());

    return {
        name,
        email,
        photo: generateAvatar(name),
        isNewUser: false,
        accessToken: `mock_token_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    };
}

// ─── Helpers ────────────────────────────────────────────────

function _delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function _pickRandomName() {
    const names = [
        'Priya Sharma', 'Rahul Gupta', 'Sneha Iyer', 'Karthik Nair',
        'Ananya Singh', 'Dev Patel', 'Riya Kapoor', 'Vikram Bose',
    ];
    return names[Math.floor(Math.random() * names.length)];
}
