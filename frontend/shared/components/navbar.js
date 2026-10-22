/* ============================================
   SHARED COMPONENT — NAVBAR
   ============================================ */

export function initNavbar() {
    const navbar = document.getElementById('navbar');
    const hamburger = document.getElementById('hamburger');
    const mobileOverlay = document.getElementById('mobileOverlay');

    function handleNavScroll() {
        if (!navbar) return;
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }

    function toggleMobile() {
        if (!hamburger || !mobileOverlay) return;
        hamburger.classList.toggle('active');
        mobileOverlay.classList.toggle('active');
        document.body.style.overflow = mobileOverlay.classList.contains('active') ? 'hidden' : '';
    }

    if (hamburger) {
        hamburger.addEventListener('click', toggleMobile);
    }

    // Intercept clicks on links inside overlay to close it
    if (mobileOverlay) {
        mobileOverlay.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                if (mobileOverlay.classList.contains('active')) {
                    toggleMobile();
                }
            });
        });
    }

    window.addEventListener('scroll', handleNavScroll, { passive: true });
    handleNavScroll(); // Initial check
}