/* ============================================
   DASHBOARD MODULE — Waitlist Mock Service
   ============================================ */

export const waitlistService = {
    async submitEmail(email) {
        // Simulates API Request
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({ success: true, email: email, timestamp: Date.now() });
            }, 800);
        });
    }
};

export function initWaitlist() {
    const waitlistForm = document.getElementById('waitlistForm');
    if (!waitlistForm) return;

    waitlistForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const emailInput = document.getElementById('waitlistEmail');
        if (emailInput && emailInput.value) {
            const btn = waitlistForm.querySelector('.btn-amber');
            const originalText = btn.textContent;
            btn.textContent = 'Submitting...';
            btn.disabled = true;

            try {
                const response = await waitlistService.submitEmail(emailInput.value);
                if (response.success) {
                    btn.textContent = "You're In! ✓";
                    btn.style.background = '#059669';
                    btn.style.borderColor = '#059669';
                    btn.style.color = '#fff';
                    emailInput.disabled = true;
                }
            } catch (err) {
                console.error('Waitlist submission error:', err);
                btn.textContent = originalText;
                btn.disabled = false;
            }
        }
    });
}