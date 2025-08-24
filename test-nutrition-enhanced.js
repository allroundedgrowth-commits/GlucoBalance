// GlucoBalance - Enhanced Nutrition Test Suite
// Testing adherence tracking, lifestyle recommendations, and analytics dashboard

class EnhancedNutritionTestSuite {
    constructor() {
        this.testResults = [];
        this.nutritionService = null;
        this.nutritionUI = null;
        this.testPlanId = 'test-enhanced-plan-' + Date.now();
        this.init();
    }

    async init() {
        console.log('🧪 Starting Enhanced Nutrition Test Suite...');
        await this.waitForServices();
        await this.runEnhancedTests();
        this.displayResults();
    }

    async waitForServices() {
        let attempts = 0;
        while ((!window.nutritionService || !window.nutritionUI) && attempts < 20) {
            await new Promise(resolve => setTimeout(resolve, 500));
            attempts++;
        }
        
        if (window.nutritionService && window.nutritionUI) {
            this.nutritionService = window.nutritionService;
            this.nutritionUI = window.nutritionUI;
            this.nutritionService.setCurrentUser('test-enhanced-user-123');
            console.log('✅ Services initialized successfully');
        } else {
            console.error('❌ Failed to initialize services');
            this.addTestResult('Service Initialization', false, 'Enhanced nutrition services not available');
        }
    }

    async runEnhancedTests() {
        console.log('🔬 Running enhanced nutrition tests...');

        // Test 1: Enhanced Adherence Tracking with Percentages
        await this.testEnhancedAdherenceTracking();

        // Test 2: Adherence Analytics Dashboard
        await this.testAdherenceAnalytics();

        // Test 3: Personalized Lifestyle Recommendations
        await this.testPersonalizedLifestyleRecommendations();

        // Test 4: Enhanced Motivational Support
        await this.testEnhancedMotivationalSupport();

        // Test 5: Nutrition Analytics Visualization
        await this.testNutritionAnalyticsVisualization();

        // Test 6: Cultural Alternatives Generation
        await this.testCulturalAlternatives();

        // Test 7: Adherence Insights Generation
        await this.testAdherenceInsights();

        console.log('✅ Enhanced nutrition tests completed');
    }

    async testEnhancedAdherenceTracking() {
        try {
            console.log('Testing enhanced adherence tracking...');
            
            // Test logging adherence with different percentages
            const testCases = [
                { day: 1, meal: 'breakfast', percentage: 100 },
                { day: 1, meal: 'lunch', percentage: 75 },
                { day: 1, meal: 'dinner', percentage: 50 },
                { day: 2, meal: 'breakfast', percentage: 25 },
                { day: 2, meal: 'lunch', percentage: 0 }
            ];

            let allSuccessful = true;
            for (const testCase of testCases) {
                const result = await this.nutritionService.logMealAdherence(
                    this.testPlanId, 
                    testCase.day, 
                    testCase.meal, 
                    testCase.percentage,
                    `Test adherence for ${testCase.meal}`
                );
                
                if (!result.success) {
                    allSuccessful = false;
                    break;
                }
            }

            // Verify adherence data retrieval
            const adherenceData = await this.nutritionService.getMealAdherence(this.testPlanId);
            const hasCorrectStructure = adherenceData && 
                                       adherenceData.day1 && 
                                       adherenceData.day1.breakfast &&
                                       adherenceData.day1.breakfast.adherencePercentage === 100;

            const passed = allSuccessful && hasCorrectStructure;
            this.addTestResult(
                'Enhanced Adherence Tracking',
                passed,
                passed ? 'Successfully logged and retrieved adherence with percentages' : 'Failed to track adherence percentages'
            );
        } catch (error) {
            this.addTestResult('Enhanced Adherence Tracking', false, error.message);
        }
    }

    async testAdherenceAnalytics() {
        try {
            console.log('Testing adherence analytics...');
            
            const analytics = await this.nutritionService.getAdherenceAnalytics(this.testPlanId);
            
            const hasRequiredProperties = analytics &&
                                        typeof analytics.currentAdherence === 'number' &&
                                        analytics.dailyBreakdown &&
                                        analytics.mealTypeBreakdown &&
                                        Array.isArray(analytics.insights);

            // Test specific analytics calculations
            const dailyBreakdown = analytics.dailyBreakdown;
            const hasDay1Data = dailyBreakdown['1'] && 
                               typeof dailyBreakdown['1'].completionRate === 'number' &&
                               typeof dailyBreakdown['1'].averageAdherence === 'number';

            const passed = hasRequiredProperties && hasDay1Data;
            this.addTestResult(
                'Adherence Analytics',
                passed,
                passed ? 'Analytics calculations working correctly' : 'Analytics calculations failed'
            );
        } catch (error) {
            this.addTestResult('Adherence Analytics', false, error.message);
        }
    }

    async testPersonalizedLifestyleRecommendations() {
        try {
            console.log('Testing personalized lifestyle recommendations...');
            
            const userProfile = {
                preferredCuisine: 'mediterranean',
                dietaryRestrictions: ['vegetarian'],
                currentPlanId: this.testPlanId,
                healthGoals: ['diabetes_prevention', 'heart_health']
            };

            const adherenceData = await this.nutritionService.getMealAdherence(this.testPlanId);
            const recommendations = await this.nutritionService.generatePersonalizedLifestyleTips(
                userProfile, 
                adherenceData
            );

            const hasValidStructure = recommendations &&
                                    Array.isArray(recommendations.recommendations) &&
                                    Array.isArray(recommendations.categories) &&
                                    typeof recommendations.aiGenerated === 'boolean';

            // Test categorization
            const hasNutritionCategory = recommendations.categories.includes('nutrition');
            const hasActivityCategory = recommendations.categories.includes('physical_activity');

            const passed = hasValidStructure && hasNutritionCategory && hasActivityCategory;
            this.addTestResult(
                'Personalized Lifestyle Recommendations',
                passed,
                passed ? 'Generated categorized lifestyle recommendations' : 'Failed to generate proper recommendations'
            );
        } catch (error) {
            this.addTestResult('Personalized Lifestyle Recommendations', false, error.message);
        }
    }

    async testEnhancedMotivationalSupport() {
        try {
            console.log('Testing enhanced motivational support...');
            
            const adherenceData = await this.nutritionService.getMealAdherence(this.testPlanId);
            const culturalPreferences = { cuisine: 'mediterranean' };
            const userProfile = { healthGoals: ['diabetes_prevention'] };

            const support = await this.nutritionService.generateEnhancedMotivationalSupport(
                adherenceData,
                culturalPreferences,
                userProfile
            );

            const hasValidStructure = support &&
                                    typeof support.message === 'string' &&
                                    Array.isArray(support.actionableTips) &&
                                    typeof support.encouragement === 'string';

            // Test that actionable tips are provided for low adherence
            const hasActionableTips = support.actionableTips.length > 0;

            const passed = hasValidStructure && hasActionableTips;
            this.addTestResult(
                'Enhanced Motivational Support',
                passed,
                passed ? 'Generated comprehensive motivational support' : 'Failed to generate proper motivational content'
            );
        } catch (error) {
            this.addTestResult('Enhanced Motivational Support', false, error.message);
        }
    }

    async testNutritionAnalyticsVisualization() {
        try {
            console.log('Testing nutrition analytics visualization...');
            
            // Test if UI methods exist and can be called
            const hasRenderMethods = typeof this.nutritionUI.renderDailyBreakdownChart === 'function' &&
                                   typeof this.nutritionUI.renderMealTypeChart === 'function' &&
                                   typeof this.nutritionUI.renderTrendChart === 'function';

            // Test chart rendering with sample data
            const sampleDailyBreakdown = {
                '1': { completionRate: 75, averageAdherence: 80, mealsCompleted: 3, totalMeals: 4 },
                '2': { completionRate: 50, averageAdherence: 60, mealsCompleted: 2, totalMeals: 4 }
            };

            const chartHTML = this.nutritionUI.renderDailyBreakdownChart(sampleDailyBreakdown);
            const hasValidChart = typeof chartHTML === 'string' && chartHTML.includes('day-bar');

            const passed = hasRenderMethods && hasValidChart;
            this.addTestResult(
                'Nutrition Analytics Visualization',
                passed,
                passed ? 'Chart rendering methods working correctly' : 'Chart rendering failed'
            );
        } catch (error) {
            this.addTestResult('Nutrition Analytics Visualization', false, error.message);
        }
    }

    async testCulturalAlternatives() {
        try {
            console.log('Testing cultural alternatives generation...');
            
            const culturalPreferences = { cuisine: 'asian' };
            const alternatives = await this.nutritionService.generateCulturalAlternatives(culturalPreferences);

            const hasValidAlternatives = Array.isArray(alternatives) && 
                                       alternatives.length > 0 &&
                                       alternatives.every(alt => typeof alt === 'string');

            const passed = hasValidAlternatives;
            this.addTestResult(
                'Cultural Alternatives Generation',
                passed,
                passed ? `Generated ${alternatives.length} cultural alternatives` : 'Failed to generate cultural alternatives'
            );
        } catch (error) {
            this.addTestResult('Cultural Alternatives Generation', false, error.message);
        }
    }

    async testAdherenceInsights() {
        try {
            console.log('Testing adherence insights generation...');
            
            const analytics = await this.nutritionService.getAdherenceAnalytics(this.testPlanId);
            const insights = analytics.insights;

            const hasValidInsights = Array.isArray(insights) &&
                                   insights.every(insight => 
                                       insight.type && 
                                       insight.message && 
                                       insight.icon
                                   );

            // Test that insights are contextual
            const hasContextualInsights = insights.some(insight => 
                insight.type === 'success' || 
                insight.type === 'warning' || 
                insight.type === 'info'
            );

            const passed = hasValidInsights && hasContextualInsights;
            this.addTestResult(
                'Adherence Insights Generation',
                passed,
                passed ? `Generated ${insights.length} contextual insights` : 'Failed to generate proper insights'
            );
        } catch (error) {
            this.addTestResult('Adherence Insights Generation', false, error.message);
        }
    }

    addTestResult(testName, passed, message) {
        this.testResults.push({
            name: testName,
            passed: passed,
            message: message,
            timestamp: new Date().toISOString()
        });
        
        const status = passed ? '✅' : '❌';
        console.log(`${status} ${testName}: ${message}`);
    }

    displayResults() {
        const passedTests = this.testResults.filter(r => r.passed).length;
        const totalTests = this.testResults.length;
        const successRate = Math.round((passedTests / totalTests) * 100);

        console.log('\n📊 Enhanced Nutrition Test Results:');
        console.log(`${passedTests}/${totalTests} tests passed (${successRate}% success rate)`);
        
        console.log('\n📋 Detailed Results:');
        this.testResults.forEach(result => {
            const status = result.passed ? '✅' : '❌';
            console.log(`${status} ${result.name}`);
            console.log(`   ${result.message}`);
        });

        // Display summary in DOM if available
        const summaryElement = document.getElementById('enhanced-test-summary');
        if (summaryElement) {
            summaryElement.innerHTML = `
                <div class="test-summary enhanced">
                    <h3>Enhanced Nutrition Tests: ${passedTests}/${totalTests} Passed</h3>
                    <div class="test-score ${passedTests === totalTests ? 'all-passed' : 'some-failed'}">
                        ${successRate}% Success Rate
                    </div>
                    <div class="test-details">
                        ${this.testResults.map(result => `
                            <div class="test-result ${result.passed ? 'passed' : 'failed'}">
                                <span class="test-icon">${result.passed ? '✅' : '❌'}</span>
                                <span class="test-name">${result.name}</span>
                                <span class="test-message">${result.message}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        // Provide recommendations based on test results
        this.provideTestRecommendations();
    }

    provideTestRecommendations() {
        const failedTests = this.testResults.filter(r => !r.passed);
        
        if (failedTests.length === 0) {
            console.log('\n🎉 All enhanced nutrition features are working correctly!');
            console.log('✨ The adherence tracking, analytics, and lifestyle recommendations are fully functional.');
        } else {
            console.log('\n⚠️  Some enhanced features need attention:');
            failedTests.forEach(test => {
                console.log(`   • ${test.name}: ${test.message}`);
            });
            
            console.log('\n💡 Recommendations:');
            console.log('   • Check AI service integration for personalized features');
            console.log('   • Verify database connectivity for analytics');
            console.log('   • Ensure all UI components are properly initialized');
        }
    }
}

// Auto-run tests when script loads
if (typeof window !== 'undefined') {
    // Browser environment
    document.addEventListener('DOMContentLoaded', () => {
        // Wait a bit for all services to initialize
        setTimeout(() => {
            new EnhancedNutritionTestSuite();
        }, 2000);
    });
}

// Export for ES modules
export default EnhancedNutritionTestSuite;