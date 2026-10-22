/* ============================================
   DASHBOARD MODULE — FAQ Accordion
   ============================================ */

export function initFaq() {
    const faqList = document.getElementById('faqList');
    if (!faqList) return;

    faqList.addEventListener('click', (e) => {
        const btn = e.target.closest('.faq-question');
        if (!btn) return;
        const item = btn.parentElement;
        const wasActive = item.classList.contains('active');

        // Close all faq items
        faqList.querySelectorAll('.faq-item').forEach(fi => fi.classList.remove('active'));

        // Toggle clicked item
        if (!wasActive) {
            item.classList.add('active');
        }
    });
}