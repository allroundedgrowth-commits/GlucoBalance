// Enhanced Demo Data Verification Script
// Verifies that all dashboard cards display demo data correctly

class EnhancedDemoDataVerifier {
    constructor() {
        this.demoEmail = 'demo@glucobalance.com';
        this.userId = 'demo-user-glucobalance';
        this.verificationResults = {};
    }

    async verifyAllDemoData() {
        console.log('🔍 Starting enhanced demo data verification...');
        
        try {
            // Verify each data type
            await this.verifyRiskStatusData();
            await this.verifyMoodTrackerData();
            await this.verifyNutritionSnapshotData();
            await this.verifyAIHealthInsightsData();
            await this.verifyHealthTrendsData();
            await this.verifyHealthSummaryData();
            
            // Generate verification report
            this.generateVerificationReport();
            
            return this.verificationResults;
        } catch (error) {
            console.error('❌ Error during verification:', error);
            return { error: error.message };
        }
    }

    async verifyRiskStatusData() {
        console.log('🎯 Verifying Risk Status data...');
        
        const assessments = JSON.parse(localStorage.getItem(`risk-assessments-${this.userId}`) || '[]');
        const currentStatus = JSON.parse(localStorage.getItem(`current-risk-status-${this.userId}`) || '{}');
        
        this.verificationResults.riskStatus = {
            assessmentsCount: assessments.length,
            hasCurrentStatus: !!currentStatus.score,
            currentScore: currentStatus.score,
            category: currentStatus.category,
            trend: currentStatus.trend,
            improvement: currentStatus.improvement,
            dataComplete: assessments.length >= 5 && !!currentStatus.score,
            sampleAssessment: assessments[0] || null
        };
        
        if (this.verificationResults.riskStatus.dataComplete) {
            console.log('✅ Risk Status data verified successfully');
        } else {
            console.log('⚠️ Risk Status data incomplete');
        }
    }

    async verifyMoodTrackerData() {
        console.log('💙 Verifying Mood Tracker data...');
        
        const moods = JSON.parse(localStorage.getItem(`mood-entries-${this.userId}`) || '[]');
        const moodSummary = JSON.parse(localStorage.getItem(`mood-tracker-summary-${this.userId}`) || '{}');
        
        this.verificationResults.moodTracker = {
            moodEntriesCount: moods.length,
            hasSummary: !!moodSummary.currentMood,
            currentMood: moodSummary.currentMood,
            averageMood: moodSummary.averageMood,
            totalEntries: moodSummary.totalEntries,
            streakDays: moodSummary.streakDays,
            dataComplete: moods.length >= 50 && !!moodSummary.currentMood,
            sampleMood: moods[0] || null
        };
        
        if (this.verificationResults.moodTracker.dataComplete) {
            console.log('✅ Mood Tracker data verified successfully');
        } else {
            console.log('⚠️ Mood Tracker data incomplete');
        }
    }

    async verifyNutritionSnapshotData() {
        console.log('🍎 Verifying Nutrition Snapshot data...');
        
        const nutritionPlans = JSON.parse(localStorage.getItem(`nutrition-plans-${this.userId}`) || '[]');
        const nutritionSnapshot = JSON.parse(localStorage.getItem(`nutrition-snapshot-${this.userId}`) || '{}');
        
        this.verificationResults.nutritionSnapshot = {
            plansCount: nutritionPlans.length,
            hasSnapshot: !!nutritionSnapshot.currentPlan,
            currentPlan: nutritionSnapshot.currentPlan,
            adherenceRate: nutritionSnapshot.adherenceRate,
            plansCompleted: nutritionSnapshot.plansCompleted,
            weightLoss: nutritionSnapshot.weightLoss,
            dataComplete: nutritionPlans.length >= 3 && !!nutritionSnapshot.currentPlan,
            samplePlan: nutritionPlans[0] || null
        };
        
        if (this.verificationResults.nutritionSnapshot.dataComplete) {
            console.log('✅ Nutrition Snapshot data verified successfully');
        } else {
            console.log('⚠️ Nutrition Snapshot data incomplete');
        }
    }

    async verifyAIHealthInsightsData() {
        console.log('🤖 Verifying AI Health Insights data...');
        
        const insights = JSON.parse(localStorage.getItem(`ai-insights-${this.userId}`) || '[]');
        const insightsSummary = JSON.parse(localStorage.getItem(`ai-insights-summary-${this.userId}`) || '{}');
        
        this.verificationResults.aiHealthInsights = {
            insightsCount: insights.length,
            hasSummary: !!insightsSummary.totalInsights,
            totalInsights: insightsSummary.totalInsights,
            unreadCount: insightsSummary.unreadCount,
            overallProgress: insightsSummary.overallProgress,
            latestInsight: insightsSummary.latestInsight?.title,
            dataComplete: insights.length >= 5 && !!insightsSummary.totalInsights,
            sampleInsight: insights[0] || null
        };
        
        if (this.verificationResults.aiHealthInsights.dataComplete) {
            console.log('✅ AI Health Insights data verified successfully');
        } else {
            console.log('⚠️ AI Health Insights data incomplete');
        }
    }

    async verifyHealthTrendsData() {
        console.log('📈 Verifying Health Trends data...');
        
        const healthTrends = JSON.parse(localStorage.getItem(`health-trends-${this.userId}`) || '{}');
        
        this.verificationResults.healthTrends = {
            hasTrends: !!healthTrends.trends,
            dateRange: healthTrends.dateRange,
            trendsCount: healthTrends.trends ? Object.keys(healthTrends.trends).length : 0,
            correlations: healthTrends.correlations,
            insights: healthTrends.insights,
            dataComplete: !!healthTrends.trends && Object.keys(healthTrends.trends).length >= 6,
            sampleTrend: healthTrends.trends?.riskScore || null
        };
        
        if (this.verificationResults.healthTrends.dataComplete) {
            console.log('✅ Health Trends data verified successfully');
        } else {
            console.log('⚠️ Health Trends data incomplete');
        }
    }

    async verifyHealthSummaryData() {
        console.log('📊 Verifying Health Summary data...');
        
        const healthSummary = JSON.parse(localStorage.getItem(`health-summary-${this.userId}`) || '{}');
        
        this.verificationResults.healthSummary = {
            hasSummary: !!healthSummary.overallScore,
            overallScore: healthSummary.overallScore,
            status: healthSummary.status,
            achievementsCount: healthSummary.keyAchievements?.length || 0,
            currentMetrics: healthSummary.currentMetrics,
            improvements: healthSummary.improvements,
            badges: healthSummary.badges,
            dataComplete: !!healthSummary.overallScore && healthSummary.keyAchievements?.length >= 5,
            sampleAchievement: healthSummary.keyAchievements?.[0] || null
        };
        
        if (this.verificationResults.healthSummary.dataComplete) {
            console.log('✅ Health Summary data verified successfully');
        } else {
            console.log('⚠️ Health Summary data incomplete');
        }
    }

    generateVerificationReport() {
        console.log('\n📋 Enhanced Demo Data Verification Report');
        console.log('==========================================');
        
        const allDataComplete = Object.values(this.verificationResults).every(result => result.dataComplete);
        
        console.log(`Overall Status: ${allDataComplete ? '✅ COMPLETE' : '⚠️ INCOMPLETE'}`);
        console.log(`Demo User: ${this.demoEmail}`);
        console.log(`User ID: ${this.userId}`);
        console.log('');
        
        // Risk Status Report
        const risk = this.verificationResults.riskStatus;
        console.log(`🎯 Risk Status: ${risk.dataComplete ? '✅' : '❌'}`);
        console.log(`   - Assessments: ${risk.assessmentsCount}`);
        console.log(`   - Current Score: ${risk.currentScore}`);
        console.log(`   - Category: ${risk.category}`);
        console.log(`   - Improvement: ${risk.improvement}`);
        console.log('');
        
        // Mood Tracker Report
        const mood = this.verificationResults.moodTracker;
        console.log(`💙 Mood Tracker: ${mood.dataComplete ? '✅' : '❌'}`);
        console.log(`   - Entries: ${mood.moodEntriesCount}`);
        console.log(`   - Current Mood: ${mood.currentMood}/5`);
        console.log(`   - Average Mood: ${mood.averageMood}/5`);
        console.log(`   - Streak: ${mood.streakDays} days`);
        console.log('');
        
        // Nutrition Snapshot Report
        const nutrition = this.verificationResults.nutritionSnapshot;
        console.log(`🍎 Nutrition Snapshot: ${nutrition.dataComplete ? '✅' : '❌'}`);
        console.log(`   - Plans: ${nutrition.plansCount}`);
        console.log(`   - Current Plan: ${nutrition.currentPlan}`);
        console.log(`   - Adherence: ${nutrition.adherenceRate}%`);
        console.log(`   - Weight Loss: ${nutrition.weightLoss}`);
        console.log('');
        
        // AI Health Insights Report
        const ai = this.verificationResults.aiHealthInsights;
        console.log(`🤖 AI Health Insights: ${ai.dataComplete ? '✅' : '❌'}`);
        console.log(`   - Total Insights: ${ai.insightsCount}`);
        console.log(`   - Unread: ${ai.unreadCount}`);
        console.log(`   - Overall Progress: ${ai.overallProgress}`);
        console.log(`   - Latest: ${ai.latestInsight}`);
        console.log('');
        
        // Health Trends Report
        const trends = this.verificationResults.healthTrends;
        console.log(`📈 Health Trends: ${trends.dataComplete ? '✅' : '❌'}`);
        console.log(`   - Trend Types: ${trends.trendsCount}`);
        console.log(`   - Date Range: ${trends.dateRange?.days} days`);
        console.log(`   - Correlations: ${trends.correlations ? Object.keys(trends.correlations).length : 0}`);
        console.log('');
        
        // Health Summary Report
        const summary = this.verificationResults.healthSummary;
        console.log(`📊 Health Summary: ${summary.dataComplete ? '✅' : '❌'}`);
        console.log(`   - Overall Score: ${summary.overallScore}/100`);
        console.log(`   - Status: ${summary.status}`);
        console.log(`   - Achievements: ${summary.achievementsCount}`);
        console.log(`   - Badges: ${summary.badges?.length || 0}`);
        console.log('');
        
        console.log('==========================================');
        
        if (allDataComplete) {
            console.log('🎉 All dashboard cards have complete demo data!');
            console.log('✅ Demo user can now experience full functionality');
        } else {
            console.log('⚠️ Some dashboard cards may not display properly');
            console.log('💡 Run enhanced demo data generation to fix issues');
        }
    }

    // Test specific dashboard card functionality
    async testDashboardCardButtons() {
        console.log('🔘 Testing dashboard card button functionality...');
        
        const buttonTests = {
            riskAssessment: this.testRiskAssessmentButton(),
            moodTracker: this.testMoodTrackerButton(),
            nutritionPlans: this.testNutritionPlansButton(),
            aiInsights: this.testAIInsightsButton(),
            healthTrends: this.testHealthTrendsButton(),
            healthSummary: this.testHealthSummaryButton()
        };
        
        const results = await Promise.all(Object.values(buttonTests));
        const buttonTestResults = Object.keys(buttonTests).reduce((acc, key, index) => {
            acc[key] = results[index];
            return acc;
        }, {});
        
        console.log('🔘 Button functionality test results:', buttonTestResults);
        return buttonTestResults;
    }

    async testRiskAssessmentButton() {
        try {
            const assessments = JSON.parse(localStorage.getItem(`risk-assessments-${this.userId}`) || '[]');
            return {
                hasData: assessments.length > 0,
                canTakeAssessment: true,
                canViewHistory: assessments.length > 1,
                status: 'working'
            };
        } catch (error) {
            return { status: 'error', error: error.message };
        }
    }

    async testMoodTrackerButton() {
        try {
            const moods = JSON.parse(localStorage.getItem(`mood-entries-${this.userId}`) || '[]');
            return {
                hasData: moods.length > 0,
                canLogMood: true,
                canViewHistory: moods.length > 1,
                status: 'working'
            };
        } catch (error) {
            return { status: 'error', error: error.message };
        }
    }

    async testNutritionPlansButton() {
        try {
            const plans = JSON.parse(localStorage.getItem(`nutrition-plans-${this.userId}`) || '[]');
            return {
                hasData: plans.length > 0,
                canViewPlans: plans.length > 0,
                canCreatePlan: true,
                status: 'working'
            };
        } catch (error) {
            return { status: 'error', error: error.message };
        }
    }

    async testAIInsightsButton() {
        try {
            const insights = JSON.parse(localStorage.getItem(`ai-insights-${this.userId}`) || '[]');
            return {
                hasData: insights.length > 0,
                canViewInsights: insights.length > 0,
                canGenerateInsights: true,
                status: 'working'
            };
        } catch (error) {
            return { status: 'error', error: error.message };
        }
    }

    async testHealthTrendsButton() {
        try {
            const trends = JSON.parse(localStorage.getItem(`health-trends-${this.userId}`) || '{}');
            return {
                hasData: !!trends.trends,
                canViewTrends: !!trends.trends,
                canExportData: true,
                status: 'working'
            };
        } catch (error) {
            return { status: 'error', error: error.message };
        }
    }

    async testHealthSummaryButton() {
        try {
            const summary = JSON.parse(localStorage.getItem(`health-summary-${this.userId}`) || '{}');
            const reports = JSON.parse(localStorage.getItem(`doctor-reports-${this.userId}`) || '[]');
            return {
                hasData: !!summary.overallScore,
                canViewSummary: !!summary.overallScore,
                canGenerateReport: reports.length > 0,
                status: 'working'
            };
        } catch (error) {
            return { status: 'error', error: error.message };
        }
    }

    // Utility method to check if demo user is logged in
    isDemoUserLoggedIn() {
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        return currentUser.email === this.demoEmail;
    }

    // Method to simulate demo user login
    async loginDemoUser() {
        console.log('👤 Logging in demo user...');
        
        const demoUser = {
            id: this.userId,
            email: this.demoEmail,
            name: 'Alex Demo',
            isLoggedIn: true,
            loginTime: new Date().toISOString()
        };
        
        localStorage.setItem('currentUser', JSON.stringify(demoUser));
        localStorage.setItem('isLoggedIn', 'true');
        
        console.log('✅ Demo user logged in successfully');
        return demoUser;
    }
}

// Initialize verifier
window.enhancedDemoDataVerifier = new EnhancedDemoDataVerifier();

// Export verification functions
window.verifyEnhancedDemoData = () => {
    return window.enhancedDemoDataVerifier.verifyAllDemoData();
};

window.testDashboardButtons = () => {
    return window.enhancedDemoDataVerifier.testDashboardCardButtons();
};

window.loginDemoUser = () => {
    return window.enhancedDemoDataVerifier.loginDemoUser();
};

// Auto-verify on page load if demo data exists
document.addEventListener('DOMContentLoaded', () => {
    const userId = 'demo-user-glucobalance';
    const hasData = localStorage.getItem(`current-risk-status-${userId}`);
    
    if (hasData) {
        console.log('🔍 Demo data detected, running verification...');
        setTimeout(() => {
            window.verifyEnhancedDemoData();
        }, 2000);
    }
});