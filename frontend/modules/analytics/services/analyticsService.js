/* ============================================
   ANALYTICS MODULE — Mock Database Services
   ============================================ */

export const analyticsService = {
    async getGrowthStats() {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    focusScore: 72,
                    weeklyTrend: 18,
                    studyHours: [2.3, 3.8, 5.0, 6.1],
                    baseTargetHours: [2.0, 2.5, 3.0, 3.5]
                });
            }, 300);
        });
    }
};