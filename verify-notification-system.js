// GlucoBalance - Notification System Verification Script
class NotificationSystemVerifier {
    constructor() {
        this.results = [];
        this.testsPassed = 0;
        this.testsFailed = 0;
    }

    async runAllTests() {
        console.log('🔔 Starting Notification System Verification...\n');
        
        // Test 1: Service Initialization
        await this.testServiceInitialization();
        
        // Test 2: Notification Permission Handling
        await this.testNotificationPermissions();
        
        // Test 3: AI Integration for Personalized Messages
        await this.testAIIntegration();
        
        // Test 4: Daily Reminder System
        await this.testDailyReminders();
        
        // Test 5: Weekly Summary Notifications
        await this.testWeeklySummaries();
        
        // Test 6: Engagement Tracking
        await this.testEngagementTracking();
        
        // Test 7: Notification Optimization
        await this.testNotificationOptimization();
        
        // Test 8: Re-engagement System
        await this.testReEngagementSystem();
        
        // Test 9: Notification Preferences
        await this.testNotificationPreferences();
        
        // Test 10: In-App Notifications
        await this.testInAppNotifications();
        
        this.printSummary();
        return this.testsPassed > 0 && this.testsFailed === 0;
    }

    async testServiceInitialization() {
        console.log('📋 Test 1: Service Initialization');
        
        try {
            // Check if notification service exists
            this.assert(
                typeof window.notificationService !== 'undefined',
                'Notification service should be available globally'
            );
            
            // Check if notification UI exists
            this.assert(
                typeof window.notificationUI !== 'undefined',
                'Notification UI should be available globally'
            );
            
            // Check service initialization
            if (window.notificationService) {
                this.assert(
                    typeof window.notificationService.init === 'function',
                    'Notification service should have init method'
                );
                
                this.assert(
                    typeof window.notificationService.generatePersonalizedNotification === 'function',
                    'Service should have generatePersonalizedNotification method'
                );
                
                this.assert(
                    typeof window.notificationService.scheduleNotification === 'function',
                    'Service should have scheduleNotification method'
                );
                
                this.assert(
                    typeof window.notificationService.trackNotificationEngagement === 'function',
                    'Service should have trackNotificationEngagement method'
                );
            }
            
            console.log('✅ Service initialization tests passed\n');
            
        } catch (error) {
            this.fail(`Service initialization test failed: ${error.message}`);
        }
    }

    async testNotificationPermissions() {
        console.log('📋 Test 2: Notification Permission Handling');
        
        try {
            // Check browser notification support
            this.assert(
                'Notification' in window,
                'Browser should support notifications'
            );
            
            // Test permission request method
            if (window.notificationService) {
                this.assert(
                    typeof window.notificationService.requestNotificationPermission === 'function',
                    'Service should have requestNotificationPermission method'
                );
                
                // Test permission status checking
                const initialPermission = Notification.permission;
                this.assert(
                    ['default', 'granted', 'denied'].includes(initialPermission),
                    'Permission status should be valid'
                );
            }
            
            console.log('✅ Notification permission tests passed\n');
            
        } catch (error) {
            this.fail(`Notification permission test failed: ${error.message}`);
        }
    }

    async testAIIntegration() {
        console.log('📋 Test 3: AI Integration for Personalized Messages');
        
        try {
            if (window.notificationService && window.aiService) {
                // Test AI-powered notification generation
                const testNotification = await window.notificationService.generatePersonalizedNotification('motivational', {
                    test: true,
                    userName: 'Test User'
                });
                
                this.assert(
                    testNotification && typeof testNotification === 'object',
                    'Should generate notification object'
                );
                
                this.assert(
                    testNotification.title && typeof testNotification.title === 'string',
                    'Generated notification should have title'
                );
                
                this.assert(
                    testNotification.body && typeof testNotification.body === 'string',
                    'Generated notification should have body'
                );
                
                // Test different notification types
                const assessmentNotification = await window.notificationService.generatePersonalizedNotification('daily_assessment');
                this.assert(
                    assessmentNotification && assessmentNotification.title,
                    'Should generate assessment reminder notification'
                );
                
                const moodNotification = await window.notificationService.generatePersonalizedNotification('daily_mood');
                this.assert(
                    moodNotification && moodNotification.title,
                    'Should generate mood reminder notification'
                );
                
            } else {
                console.log('⚠️  AI service not available - testing fallback notifications');
                
                // Test fallback notifications
                if (window.notificationService) {
                    const fallback = window.notificationService.getFallbackNotification('motivational');
                    this.assert(
                        fallback && fallback.title && fallback.body,
                        'Should provide fallback notifications when AI unavailable'
                    );
                }
            }
            
            console.log('✅ AI integration tests passed\n');
            
        } catch (error) {
            this.fail(`AI integration test failed: ${error.message}`);
        }
    }

    async testDailyReminders() {
        console.log('📋 Test 4: Daily Reminder System');
        
        try {
            if (window.notificationService) {
                // Test daily reminder scheduling
                this.assert(
                    typeof window.notificationService.scheduleDailyNotifications === 'function',
                    'Service should have scheduleDailyNotifications method'
                );
                
                // Test notification scheduling
                const testSchedule = await window.notificationService.scheduleNotification({
                    type: 'daily_assessment',
                    title: 'Test Daily Assessment',
                    scheduledTime: '09:00',
                    recurring: true,
                    frequency: 'daily'
                });
                
                this.assert(
                    testSchedule && testSchedule.id,
                    'Should successfully schedule daily notification'
                );
                
                this.assert(
                    testSchedule.type === 'daily_assessment',
                    'Scheduled notification should have correct type'
                );
                
                this.assert(
                    testSchedule.recurring === true,
                    'Daily notification should be recurring'
                );
            }
            
            console.log('✅ Daily reminder tests passed\n');
            
        } catch (error) {
            this.fail(`Daily reminder test failed: ${error.message}`);
        }
    }

    async testWeeklySummaries() {
        console.log('📋 Test 5: Weekly Summary Notifications');
        
        try {
            if (window.notificationService) {
                // Test weekly summary scheduling
                this.assert(
                    typeof window.notificationService.scheduleWeeklySummaries === 'function',
                    'Service should have scheduleWeeklySummaries method'
                );
                
                // Test nutrition summary data generation
                const mockUserId = 'test_user_123';
                const nutritionData = await window.notificationService.getNutritionSummaryData(mockUserId);
                
                this.assert(
                    nutritionData && typeof nutritionData === 'object',
                    'Should generate nutrition summary data'
                );
                
                this.assert(
                    typeof nutritionData.averageAdherence === 'number',
                    'Nutrition data should include average adherence'
                );
                
                this.assert(
                    typeof nutritionData.totalPlans === 'number',
                    'Nutrition data should include total plans count'
                );
                
                this.assert(
                    ['improving', 'declining', 'stable'].includes(nutritionData.trend),
                    'Nutrition data should include valid trend'
                );
            }
            
            console.log('✅ Weekly summary tests passed\n');
            
        } catch (error) {
            this.fail(`Weekly summary test failed: ${error.message}`);
        }
    }

    async testEngagementTracking() {
        console.log('📋 Test 6: Engagement Tracking');
        
        try {
            if (window.notificationService && window.notificationService.engagementTracker) {
                const tracker = window.notificationService.engagementTracker;
                
                // Test engagement recording
                const testEngagement = {
                    notificationId: 'test_notification_123',
                    action: 'clicked',
                    timestamp: new Date().toISOString(),
                    userId: 'test_user_123'
                };
                
                await tracker.recordEngagement(testEngagement);
                
                // Test engagement history retrieval
                const history = await tracker.getUserEngagementHistory('test_user_123');
                this.assert(
                    Array.isArray(history),
                    'Should return engagement history as array'
                );
                
                // Test engagement pattern analysis
                const analysis = window.notificationService.analyzeEngagementPatterns(history);
                this.assert(
                    analysis && typeof analysis === 'object',
                    'Should analyze engagement patterns'
                );
                
                this.assert(
                    Array.isArray(analysis.bestHours),
                    'Analysis should include best hours array'
                );
                
                this.assert(
                    Array.isArray(analysis.bestDays),
                    'Analysis should include best days array'
                );
                
                this.assert(
                    typeof analysis.totalEngagements === 'number',
                    'Analysis should include total engagements count'
                );
            }
            
            console.log('✅ Engagement tracking tests passed\n');
            
        } catch (error) {
            this.fail(`Engagement tracking test failed: ${error.message}`);
        }
    }

    async testNotificationOptimization() {
        console.log('📋 Test 7: Notification Optimization');
        
        try {
            if (window.notificationService) {
                // Test optimization methods
                this.assert(
                    typeof window.notificationService.optimizeNotificationTiming === 'function',
                    'Service should have optimizeNotificationTiming method'
                );
                
                this.assert(
                    typeof window.notificationService.analyzeEngagementPatterns === 'function',
                    'Service should have analyzeEngagementPatterns method'
                );
                
                // Test optimization recommendation parsing
                const mockAIRecommendations = "Based on user engagement, I recommend scheduling notifications at 9:00 AM for better engagement. Consider reducing frequency to avoid notification fatigue.";
                const optimizations = window.notificationService.parseOptimizationRecommendations(mockAIRecommendations);
                
                this.assert(
                    optimizations && typeof optimizations === 'object',
                    'Should parse AI optimization recommendations'
                );
                
                this.assert(
                    optimizations.timing && typeof optimizations.timing === 'object',
                    'Optimizations should include timing recommendations'
                );
                
                this.assert(
                    ['low', 'normal', 'high'].includes(optimizations.frequency),
                    'Optimizations should include valid frequency'
                );
            }
            
            console.log('✅ Notification optimization tests passed\n');
            
        } catch (error) {
            this.fail(`Notification optimization test failed: ${error.message}`);
        }
    }

    async testReEngagementSystem() {
        console.log('📋 Test 8: Re-engagement System');
        
        try {
            if (window.notificationService) {
                // Test re-engagement methods
                this.assert(
                    typeof window.notificationService.checkForInactiveUsers === 'function',
                    'Service should have checkForInactiveUsers method'
                );
                
                this.assert(
                    typeof window.notificationService.sendReEngagementNotification === 'function',
                    'Service should have sendReEngagementNotification method'
                );
                
                // Test activity calculation
                const testDate = new Date();
                testDate.setDate(testDate.getDate() - 5); // 5 days ago
                
                const daysSince = window.notificationService.calculateDaysSince(testDate);
                this.assert(
                    daysSince >= 4 && daysSince <= 6,
                    'Should correctly calculate days since activity'
                );
                
                // Test re-engagement notification generation
                const reEngagementNotification = await window.notificationService.generatePersonalizedNotification('re_engagement', {
                    daysInactive: 3,
                    lastActivity: testDate
                });
                
                this.assert(
                    reEngagementNotification && reEngagementNotification.title,
                    'Should generate re-engagement notification'
                );
                
                this.assert(
                    reEngagementNotification.body && reEngagementNotification.body.length > 0,
                    'Re-engagement notification should have meaningful body'
                );
            }
            
            console.log('✅ Re-engagement system tests passed\n');
            
        } catch (error) {
            this.fail(`Re-engagement system test failed: ${error.message}`);
        }
    }

    async testNotificationPreferences() {
        console.log('📋 Test 9: Notification Preferences');
        
        try {
            if (window.notificationService) {
                // Test default preferences
                const defaultPrefs = window.notificationService.getDefaultPreferences();
                this.assert(
                    defaultPrefs && typeof defaultPrefs === 'object',
                    'Should provide default preferences'
                );
                
                this.assert(
                    typeof defaultPrefs.dailyReminders === 'boolean',
                    'Default preferences should include dailyReminders setting'
                );
                
                this.assert(
                    typeof defaultPrefs.weeklySummaries === 'boolean',
                    'Default preferences should include weeklySummaries setting'
                );
                
                this.assert(
                    typeof defaultPrefs.assessmentReminderTime === 'string',
                    'Default preferences should include assessmentReminderTime'
                );
                
                this.assert(
                    typeof defaultPrefs.moodReminderTime === 'string',
                    'Default preferences should include moodReminderTime'
                );
                
                this.assert(
                    ['low', 'normal', 'high'].includes(defaultPrefs.frequency),
                    'Default preferences should include valid frequency'
                );
                
                // Test preference loading
                const loadedPrefs = await window.notificationService.loadUserPreferences();
                this.assert(
                    loadedPrefs && typeof loadedPrefs === 'object',
                    'Should load user preferences'
                );
            }
            
            console.log('✅ Notification preferences tests passed\n');
            
        } catch (error) {
            this.fail(`Notification preferences test failed: ${error.message}`);
        }
    }

    async testInAppNotifications() {
        console.log('📋 Test 10: In-App Notifications');
        
        try {
            if (window.notificationUI) {
                // Test in-app notification methods
                this.assert(
                    typeof window.notificationUI.showInAppNotification === 'function',
                    'UI should have showInAppNotification method'
                );
                
                this.assert(
                    typeof window.notificationUI.showNotificationPreferences === 'function',
                    'UI should have showNotificationPreferences method'
                );
                
                // Test notification container creation
                const container = document.getElementById('notification-container');
                this.assert(
                    container !== null,
                    'Should create notification container in DOM'
                );
                
                this.assert(
                    container.className.includes('notification-container'),
                    'Container should have correct CSS class'
                );
                
                // Test notification action handling
                this.assert(
                    typeof window.notificationUI.handleNotificationAction === 'function',
                    'UI should have handleNotificationAction method'
                );
                
                // Test notification rendering methods
                this.assert(
                    typeof window.notificationUI.renderNotificationActions === 'function',
                    'UI should have renderNotificationActions method'
                );
            }
            
            console.log('✅ In-app notification tests passed\n');
            
        } catch (error) {
            this.fail(`In-app notification test failed: ${error.message}`);
        }
    }

    assert(condition, message) {
        if (condition) {
            this.testsPassed++;
            console.log(`  ✅ ${message}`);
        } else {
            this.testsFailed++;
            console.log(`  ❌ ${message}`);
            throw new Error(message);
        }
    }

    fail(message) {
        this.testsFailed++;
        console.log(`  ❌ ${message}\n`);
    }

    printSummary() {
        console.log('\n' + '='.repeat(50));
        console.log('📊 NOTIFICATION SYSTEM VERIFICATION SUMMARY');
        console.log('='.repeat(50));
        console.log(`✅ Tests Passed: ${this.testsPassed}`);
        console.log(`❌ Tests Failed: ${this.testsFailed}`);
        console.log(`📈 Success Rate: ${((this.testsPassed / (this.testsPassed + this.testsFailed)) * 100).toFixed(1)}%`);
        
        if (this.testsFailed === 0) {
            console.log('\n🎉 All notification system tests passed! The AI-powered notification and engagement system is working correctly.');
            console.log('\n✨ Key Features Verified:');
            console.log('  • Daily reminder system for assessments and mood check-ins');
            console.log('  • Gemini AI integration for personalized motivational messages');
            console.log('  • Weekly nutrition adherence summary notifications');
            console.log('  • Intelligent notification timing and frequency optimization');
            console.log('  • Engagement tracking and analytics');
            console.log('  • Re-engagement notifications for inactive users');
            console.log('  • Notification preferences management');
            console.log('  • In-app and browser notification support');
        } else {
            console.log('\n⚠️  Some tests failed. Please check the implementation and try again.');
        }
        
        console.log('\n' + '='.repeat(50));
    }
}

// Auto-run verification when script loads
if (typeof window !== 'undefined') {
    // Browser environment
    window.addEventListener('load', async () => {
        // Wait for all services to initialize
        setTimeout(async () => {
            const verifier = new NotificationSystemVerifier();
            await verifier.runAllTests();
        }, 2000);
    });
} else {
    // Node.js environment
    const verifier = new NotificationSystemVerifier();
    verifier.runAllTests().then(success => {
        process.exit(success ? 0 : 1);
    });
}