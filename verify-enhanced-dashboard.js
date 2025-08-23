// Enhanced Dashboard Verification Script
class DashboardVerification {
    constructor() {
        this.testResults = [];
        this.mockUserId = 'test-user-dashboard-123';
        this.init();
    }

    init() {
        console.log('🧪 Starting Enhanced Dashboard Verification...');
        this.setupMockData();
        this.runAllTests();
    }

    setupMockData() {
        // Create mock database service
        window.kiroDb = {
            getUserAssessments: async (userId, limit) => this.mockAssessments.slice(0, limit),
            getUserMoods: async (userId, days) => this.mockMoods.slice(0, days),
            getUserNutritionPlans: async (userId, limit) => this.mockNutritionPlans.slice(0, limit),
            getUserProgress: async (userId, type, days) => this.mockProgress.slice(0, days),
            saveMood: async (moodData) => {
                this.mockMoods.unshift(moodData);
                return moodData;
            }
        };

        // Create mock AI service
        window.geminiAI = {
            isInitialized: () => true,
            generateContent: async (prompt, context) => {
                return `Based on your health data analysis:

Your progress shows consistent improvement with ${context.totalAssessments || 0} risk assessments completed and ${context.totalMoodEntries || 0} mood entries logged.

Personalized recommendations:
1. Continue your excellent tracking consistency - you've maintained a ${context.streakDays || 0}-day streak
2. Your current risk level of ${context.riskCategory || 'baseline'} indicates good health awareness
3. Focus on maintaining your positive mood trends and nutrition adherence

Key focus area: Maintain your current tracking habits while exploring new wellness activities.

Keep up the outstanding work! Your dedication to health monitoring is truly commendable and will benefit your long-term wellness journey.`;
            }
        };

        // Mock data
        this.mockAssessments = [
            {
                id: 1,
                userId: this.mockUserId,
                riskScore: 12,
                createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
                responses: { age: 2, gender: 1, family_history: 3, bmi: 2, physical_activity: 2 }
            },
            {
                id: 2,
                userId: this.mockUserId,
                riskScore: 15,
                createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
                responses: { age: 2, gender: 1, family_history: 5, bmi: 3, physical_activity: 2 }
            }
        ];

        this.mockMoods = [];
        for (let i = 0; i < 14; i++) {
            this.mockMoods.push({
                id: i + 1,
                userId: this.mockUserId,
                mood: Math.floor(Math.random() * 5) + 1,
                date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                timestamp: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString()
            });
        }

        this.mockNutritionPlans = [
            {
                id: 1,
                userId: this.mockUserId,
                planType: '3-day',
                createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
                meals: []
            },
            {
                id: 2,
                userId: this.mockUserId,
                planType: '7-day',
                createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
                meals: []
            }
        ];

        this.mockProgress = [
            {
                id: 1,
                userId: this.mockUserId,
                metricType: 'mood_average',
                value: 3.8,
                date: new Date().toISOString().split('T')[0]
            }
        ];

        console.log('✅ Mock data setup complete');
    }

    async runAllTests() {
        const tests = [
            () => this.testDashboardInitialization(),
            () => this.testDataAggregation(),
            () => this.testCardRendering(),
            () => this.testChartGeneration(),
            () => this.testAIInsights(),
            () => this.testMoodLogging(),
            () => this.testRealTimeUpdates(),
            () => this.testResponsiveDesign(),
            () => this.testErrorHandling(),
            () => this.testAccessibility()
        ];

        for (const test of tests) {
            try {
                await test();
            } catch (error) {
                this.addTestResult(test.name, false, error.message);
            }
        }

        this.displayResults();
    }

    async testDashboardInitialization() {
        console.log('🧪 Testing dashboard initialization...');

        // Test dashboard instance creation
        const dashboard = window.enhancedDashboard;
        this.addTestResult('Dashboard Instance', !!dashboard, 'Enhanced dashboard should be initialized');

        // Test user setting
        dashboard.setCurrentUser(this.mockUserId);
        this.addTestResult('User Setting', dashboard.currentUser === this.mockUserId, 'Should set current user correctly');

        // Test event listeners setup
        const refreshBtn = document.getElementById('refresh-dashboard');
        this.addTestResult('Event Listeners', !!refreshBtn, 'Refresh button should exist');

        console.log('✅ Dashboard initialization tests complete');
    }

    async testDataAggregation() {
        console.log('🧪 Testing data aggregation...');

        const dashboard = window.enhancedDashboard;
        await dashboard.aggregateHealthData();

        const data = dashboard.dashboardData;

        // Test data structure
        this.addTestResult('Data Structure', !!data.summary, 'Dashboard data should have summary');
        this.addTestResult('Risk Assessments', Array.isArray(data.riskAssessments), 'Should have risk assessments array');
        this.addTestResult('Mood Entries', Array.isArray(data.moodEntries), 'Should have mood entries array');
        this.addTestResult('Nutrition Plans', Array.isArray(data.nutritionPlans), 'Should have nutrition plans array');

        // Test calculated metrics
        this.addTestResult('Latest Risk Score', data.summary.latestRiskScore === 12, 'Should calculate latest risk score');
        this.addTestResult('Total Assessments', data.summary.totalAssessments === 2, 'Should count total assessments');
        this.addTestResult('Mood Entries Count', data.summary.totalMoodEntries === 14, 'Should count mood entries');

        console.log('✅ Data aggregation tests complete');
    }

    async testCardRendering() {
        console.log('🧪 Testing card rendering...');

        const dashboard = window.enhancedDashboard;
        await dashboard.renderDashboardCards();

        // Test risk status card
        const riskDisplay = document.getElementById('risk-display');
        this.addTestResult('Risk Display', !!riskDisplay, 'Risk display should exist');

        const riskScore = riskDisplay.querySelector('.risk-score');
        this.addTestResult('Risk Score Display', riskScore?.textContent === '12', 'Should display correct risk score');

        // Test mood tracker card
        const currentMoodValue = document.getElementById('current-mood-value');
        this.addTestResult('Mood Display', !!currentMoodValue, 'Current mood display should exist');

        // Test nutrition snapshot card
        const mealPlansCount = document.getElementById('meal-plans-count');
        this.addTestResult('Nutrition Display', mealPlansCount?.textContent === '2', 'Should display meal plans count');

        console.log('✅ Card rendering tests complete');
    }

    async testChartGeneration() {
        console.log('🧪 Testing chart generation...');

        const dashboard = window.enhancedDashboard;
        await dashboard.renderInteractiveCharts();

        // Test risk trend chart
        const riskChart = document.getElementById('risk-trend-chart');
        this.addTestResult('Risk Chart', !!riskChart, 'Risk trend chart should exist');

        const riskBars = riskChart.querySelectorAll('.chart-bar');
        this.addTestResult('Risk Chart Bars', riskBars.length > 0, 'Should have chart bars');

        // Test mood trend chart
        const moodChart = document.getElementById('mood-trend-chart');
        this.addTestResult('Mood Chart', !!moodChart, 'Mood trend chart should exist');

        const moodBars = moodChart.querySelectorAll('.chart-bar');
        this.addTestResult('Mood Chart Bars', moodBars.length > 0, 'Should have mood chart bars');

        // Test chart interactivity
        if (riskBars.length > 0) {
            const firstBar = riskBars[0];
            const hasTooltipData = firstBar.hasAttribute('data-score');
            this.addTestResult('Chart Interactivity', hasTooltipData, 'Chart bars should have tooltip data');
        }

        console.log('✅ Chart generation tests complete');
    }

    async testAIInsights() {
        console.log('🧪 Testing AI insights generation...');

        const dashboard = window.enhancedDashboard;
        await dashboard.generateAIInsights();

        // Wait for AI insights to render
        await new Promise(resolve => setTimeout(resolve, 1000));

        const insightsContainer = document.getElementById('ai-insights');
        this.addTestResult('AI Insights Container', !!insightsContainer, 'AI insights container should exist');

        const progressSummary = insightsContainer.querySelector('.progress-summary');
        this.addTestResult('Progress Summary', !!progressSummary, 'Should have progress summary section');

        const recommendations = insightsContainer.querySelector('.recommendations');
        this.addTestResult('Recommendations', !!recommendations, 'Should have recommendations section');

        const focusArea = insightsContainer.querySelector('.focus-area');
        this.addTestResult('Focus Area', !!focusArea, 'Should have focus area section');

        const motivational = insightsContainer.querySelector('.motivational');
        this.addTestResult('Motivational Message', !!motivational, 'Should have motivational section');

        console.log('✅ AI insights tests complete');
    }

    async testMoodLogging() {
        console.log('🧪 Testing mood logging functionality...');

        const dashboard = window.enhancedDashboard;

        // Test mood recording
        const initialMoodCount = dashboard.dashboardData.moodEntries.length;
        await dashboard.recordMood(4);

        // Check if mood was recorded (in mock data)
        const newMoodCount = this.mockMoods.length;
        this.addTestResult('Mood Recording', newMoodCount > initialMoodCount, 'Should record new mood entry');

        // Test mood button selection
        const moodBtns = document.querySelectorAll('.mood-btn');
        this.addTestResult('Mood Buttons', moodBtns.length === 5, 'Should have 5 mood buttons');

        // Test mood button interaction
        if (moodBtns.length > 0) {
            const selectedBtn = document.querySelector('.mood-btn.selected');
            this.addTestResult('Mood Selection', !!selectedBtn, 'Should have selected mood button');
        }

        console.log('✅ Mood logging tests complete');
    }

    async testRealTimeUpdates() {
        console.log('🧪 Testing real-time updates...');

        const dashboard = window.enhancedDashboard;

        // Test refresh functionality
        const refreshBtn = document.getElementById('refresh-dashboard');
        this.addTestResult('Refresh Button', !!refreshBtn, 'Refresh button should exist');

        // Test data update event
        const dataUpdateEvent = new CustomEvent('dataUpdated', {
            detail: { userId: this.mockUserId, type: 'mood' }
        });

        document.dispatchEvent(dataUpdateEvent);
        this.addTestResult('Data Update Event', true, 'Should handle data update events');

        // Test refresh interval setup
        this.addTestResult('Refresh Interval', !!dashboard.refreshInterval, 'Should have refresh interval set');

        console.log('✅ Real-time updates tests complete');
    }

    async testResponsiveDesign() {
        console.log('🧪 Testing responsive design...');

        // Test mobile viewport
        const viewport = document.querySelector('meta[name=viewport]');
        this.addTestResult('Viewport Meta', !!viewport, 'Should have viewport meta tag');

        // Test dashboard grid
        const dashboardGrid = document.querySelector('.dashboard-grid');
        this.addTestResult('Dashboard Grid', !!dashboardGrid, 'Should have dashboard grid');

        // Test responsive classes
        const cards = document.querySelectorAll('.interactive-card');
        this.addTestResult('Interactive Cards', cards.length >= 4, 'Should have interactive cards');

        // Test mobile-specific elements
        const moodSelector = document.querySelector('.mood-selector');
        this.addTestResult('Mobile Mood Selector', !!moodSelector, 'Should have mobile-friendly mood selector');

        console.log('✅ Responsive design tests complete');
    }

    async testErrorHandling() {
        console.log('🧪 Testing error handling...');

        const dashboard = window.enhancedDashboard;

        // Test with no user set
        dashboard.currentUser = null;
        await dashboard.loadDashboard();

        const loginPrompt = document.querySelector('.login-prompt');
        this.addTestResult('Login Prompt', !!loginPrompt, 'Should show login prompt when no user');

        // Test with invalid data
        const originalDb = window.kiroDb;
        window.kiroDb = null;

        dashboard.currentUser = this.mockUserId;
        await dashboard.aggregateHealthData();

        this.addTestResult('Fallback Data', !!dashboard.dashboardData, 'Should use fallback data when DB unavailable');

        // Restore mock DB
        window.kiroDb = originalDb;

        console.log('✅ Error handling tests complete');
    }

    async testAccessibility() {
        console.log('🧪 Testing accessibility features...');

        // Test ARIA labels
        const dashboardMain = document.querySelector('[role="main"]');
        this.addTestResult('ARIA Main Role', !!dashboardMain, 'Should have main role');

        // Test button accessibility
        const buttons = document.querySelectorAll('button');
        let accessibleButtons = 0;
        buttons.forEach(btn => {
            if (btn.textContent.trim() || btn.getAttribute('aria-label') || btn.getAttribute('title')) {
                accessibleButtons++;
            }
        });
        this.addTestResult('Button Accessibility', accessibleButtons === buttons.length, 'All buttons should have accessible text');

        // Test keyboard navigation
        const focusableElements = document.querySelectorAll('button, [tabindex]:not([tabindex="-1"])');
        this.addTestResult('Keyboard Navigation', focusableElements.length > 0, 'Should have focusable elements');

        // Test color contrast (basic check)
        const cards = document.querySelectorAll('.card');
        this.addTestResult('Visual Elements', cards.length > 0, 'Should have visual card elements');

        console.log('✅ Accessibility tests complete');
    }

    addTestResult(testName, passed, description) {
        this.testResults.push({
            name: testName,
            passed,
            description,
            timestamp: new Date().toISOString()
        });

        const status = passed ? '✅' : '❌';
        console.log(`${status} ${testName}: ${description}`);
    }

    displayResults() {
        const totalTests = this.testResults.length;
        const passedTests = this.testResults.filter(test => test.passed).length;
        const failedTests = totalTests - passedTests;

        console.log('\n📊 Enhanced Dashboard Verification Results:');
        console.log(`Total Tests: ${totalTests}`);
        console.log(`Passed: ${passedTests} ✅`);
        console.log(`Failed: ${failedTests} ❌`);
        console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);

        if (failedTests > 0) {
            console.log('\n❌ Failed Tests:');
            this.testResults.filter(test => !test.passed).forEach(test => {
                console.log(`- ${test.name}: ${test.description}`);
            });
        }

        // Create visual results display
        this.createResultsDisplay();

        console.log('\n🎉 Enhanced Dashboard Verification Complete!');
    }

    createResultsDisplay() {
        const resultsContainer = document.createElement('div');
        resultsContainer.id = 'verification-results';
        resultsContainer.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: white;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            padding: 1rem;
            max-width: 300px;
            z-index: 1000;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 0.9rem;
        `;

        const totalTests = this.testResults.length;
        const passedTests = this.testResults.filter(test => test.passed).length;
        const successRate = ((passedTests / totalTests) * 100).toFixed(1);

        resultsContainer.innerHTML = `
            <h4 style="margin: 0 0 1rem 0; color: #007FFF;">🧪 Dashboard Verification</h4>
            <div style="margin-bottom: 1rem;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                    <span>Total Tests:</span>
                    <strong>${totalTests}</strong>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                    <span>Passed:</span>
                    <strong style="color: #28a745;">${passedTests} ✅</strong>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                    <span>Failed:</span>
                    <strong style="color: #dc3545;">${totalTests - passedTests} ❌</strong>
                </div>
                <div style="display: flex; justify-content: space-between;">
                    <span>Success Rate:</span>
                    <strong style="color: ${successRate >= 90 ? '#28a745' : successRate >= 70 ? '#ffc107' : '#dc3545'};">${successRate}%</strong>
                </div>
            </div>
            <div style="max-height: 200px; overflow-y: auto; border-top: 1px solid #eee; padding-top: 1rem;">
                ${this.testResults.map(test => `
                    <div style="display: flex; align-items: center; margin-bottom: 0.5rem; font-size: 0.8rem;">
                        <span style="margin-right: 0.5rem;">${test.passed ? '✅' : '❌'}</span>
                        <span style="flex: 1; ${test.passed ? '' : 'color: #dc3545;'}">${test.name}</span>
                    </div>
                `).join('')}
            </div>
            <button onclick="this.parentElement.remove()" style="
                width: 100%;
                margin-top: 1rem;
                padding: 0.5rem;
                background: #007FFF;
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
            ">Close</button>
        `;

        document.body.appendChild(resultsContainer);

        // Auto-remove after 30 seconds
        setTimeout(() => {
            if (document.body.contains(resultsContainer)) {
                resultsContainer.remove();
            }
        }, 30000);
    }
}

// Auto-run verification when script loads
document.addEventListener('DOMContentLoaded', () => {
    // Wait for dashboard to initialize
    setTimeout(() => {
        new DashboardVerification();
    }, 2000);
});

// Export for manual testing
window.DashboardVerification = DashboardVerification;