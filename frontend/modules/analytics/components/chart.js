/* ============================================
   ANALYTICS MODULE — Study Capacity Growth Chart
   ============================================ */

export function initGrowthChart() {
    const chartArea = document.getElementById('chartArea');
    if (!chartArea) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Animate bars with progressive stagger
                const groups = chartArea.querySelectorAll('.chart-bar-group');
                groups.forEach((group, i) => {
                    setTimeout(() => {
                        group.classList.add('animated');
                    }, i * 200);
                });

                // Animate the dashed trend curve overlay
                setTimeout(() => {
                    chartArea.classList.add('animated');
                }, groups.length * 200 + 300);

                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 });

    observer.observe(chartArea);
}