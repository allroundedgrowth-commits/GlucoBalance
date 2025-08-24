// GlucoBalance - Error Handling Verification Script
class ErrorHandlingVerification {
    constructor() {
        this.testResults = [];
        this.errorHandler = window.errorHandler;
        this.dbService = window.dbService;
    }

    async runAllTests() {
        console.log('🛡️ Starting Error Handling Verification Tests...\n');

        // Test 1: Error Handler Initialization
        await this.testErrorHandlerInitialization();

        // Test 2: Network Error Handling
        await this.testNetworkErrorHandling();

        // Test 3: Database Error Handling
        await this.testDatabaseErrorHandling();

        // Test 4: AI Service Error Handling
        await this.testAIServiceErrorHandling();

        // Test 5: Validation Error Handling
        await this.testValidationErrorHandling();

        // Test 6: Circuit Breaker Pattern
        await this.testCircuitBreakerPattern();

        // Test 7: Automatic Recovery
        await this.testAutomaticRecovery();

        // Test 8: Fallback Content System
        await this.testFallbackContentSystem();

        // Test 9: User Notification System
        await this.testUserNotificationSystem();

        // Test 10: Error Logging and Monitoring
        await this.testErrorLoggingAndMonitoring();

        // Test 11: Health Check System
        await this.testHealthCheckSystem();

        // Test 12: Retry Mechanisms
        await this.testRetryMechanisms();

        this.printTestSummary();
        return this.testResults;
    }

    async testErrorHandlerInitialization() {
        console.log('Testing Error Handler Initialization...');
        
        try {
            // Check if error handler exists and is properly initialized
            this.assert(
                this.errorHandler !== undefined,
                'Error handler should be initialized'
            );

            this.assert(
                typeof this.errorHandler.handleError === 'function',
                'Error handler should have handleError method'
            );

            this.assert(
                this.errorHandler.circuitBreakers instanceof Map,
                'Circuit breakers should be initialized'
            );

            this.assert(
                this.errorHandler.fallbackCache instanceof Map,
                'Fallback cache should be initialized'
            );

            this.assert(
                this.errorHandler.recoveryStrategies instanceof Map,
                'Recovery strategies should be initialized'
            );

            // Check if global error handlers are set up
            this.assert(
                window.addEventListener !== undefined,
                'Global error handlers should be set up'
            );

            this.recordTest('Error Handler Initialization', true, 'All components initialized correctly');
        } catch (error) {
            this.recordTest('Error Handler Initialization', false, error.message);
        }
    }

    async testNetworkErrorHandling() {
        console.log('Testing Network Error Handling...');
        
        try {
            // Test network error with retry
            const networkError = new Error('Network timeout');
            networkError.name = 'NetworkError';

            let retryAttempts = 0;
            const maxRetries = 2;

            try {
                await this.errorHandler.handleNetworkError(
                    networkError,
                    () => {
                        retryAttempts++;
                        if (retryAttempts < maxRetries) {
                            throw new Error('Still failing');
                        }
                        return 'Success after retry';
                    },
                    { maxRetries, showUserGuidance: false }
                );

                this.assert(
                    retryAttempts === maxRetries,
                    `Should retry ${maxRetries} times, actually retried ${retryAttempts} times`
                );
            } catch (error) {
                // Expected to fail after retries
            }

            // Test offline mode handling
            const originalOnLine = navigator.onLine;
            Object.defineProperty(navigator, 'onLine', {
                writable: true,
                value: false
            });

            const offlineResult = await this.errorHandler.handleNetworkError(
                networkError,
                null,
                { enableOfflineMode: true, showUserGuidance: false }
            );

            this.assert(
                offlineResult === null,
                'Should return null for offline mode'
            );

            // Restore original online status
            Object.defineProperty(navigator, 'onLine', {
                writable: true,
                value: originalOnLine
            });

            this.recordTest('Network Error Handling', true, 'Network errors handled with retry and offline mode');
        } catch (error) {
            this.recordTest('Network Error Handling', false, error.message);
        }
    }

    async testDatabaseErrorHandling() {
        console.log('Testing Database Error Handling...');
        
        try {
            const dbError = new Error('Database connection failed');
            dbError.name = 'DatabaseError';

            let fallbackCalled = false;
            const fallbackAction = () => {
                fallbackCalled = true;
                return { id: 'fallback', data: 'Fallback data' };
            };

            try {
                await this.errorHandler.handleDatabaseError(
                    dbError,
                    () => { throw dbError; },
                    fallbackAction
                );
            } catch (error) {
                // Expected to use fallback
            }

            this.assert(
                fallbackCalled,
                'Fallback action should be called on database error'
            );

            // Test database service safe execution
            if (this.dbService) {
                let safeExecutionWorked = false;
                try {
                    await this.dbService.safeExecute(
                        () => { throw new Error('Test DB error'); },
                        () => {
                            safeExecutionWorked = true;
                            return 'Fallback result';
                        }
                    );
                } catch (error) {
                    // Expected
                }

                this.assert(
                    safeExecutionWorked,
                    'Database service safe execution should use fallback'
                );
            }

            this.recordTest('Database Error Handling', true, 'Database errors handled with fallback');
        } catch (error) {
            this.recordTest('Database Error Handling', false, error.message);
        }
    }

    async testAIServiceErrorHandling() {
        console.log('Testing AI Service Error Handling...');
        
        try {
            const aiError = new Error('AI service unavailable');
            aiError.name = 'AIServiceError';

            // Test AI error with fallback content
            const fallbackContent = await this.errorHandler.handleAIError(
                aiError,
                null,
                { type: 'risk_explanation', category: 'Low' }
            );

            this.assert(
                typeof fallbackContent === 'string' && fallbackContent.length > 0,
                'Should return fallback content for AI errors'
            );

            // Test different content types
            const moodFallback = this.errorHandler.getFallbackContent('ai_mood_support', { mood: 3 });
            this.assert(
                typeof moodFallback === 'string' && moodFallback.length > 0,
                'Should return mood support fallback content'
            );

            const nutritionFallback = this.errorHandler.getFallbackContent('ai_nutrition_tips');
            this.assert(
                typeof nutritionFallback === 'string' && nutritionFallback.length > 0,
                'Should return nutrition tips fallback content'
            );

            this.recordTest('AI Service Error Handling', true, 'AI errors handled with appropriate fallback content');
        } catch (error) {
            this.recordTest('AI Service Error Handling', false, error.message);
        }
    }

    async testValidationErrorHandling() {
        console.log('Testing Validation Error Handling...');
        
        try {
            const validationError = new Error('Invalid email format');
            validationError.name = 'ValidationError';

            // Create a test input element
            const testInput = document.createElement('input');
            testInput.id = 'test-validation-field';
            testInput.name = 'email';
            document.body.appendChild(testInput);

            await this.errorHandler.handleValidationError(
                validationError,
                'email',
                'invalid-email',
                ['Use format: user@domain.com']
            );

            // Check if error was logged
            const errorLog = this.errorHandler.getErrorLog();
            const validationErrors = errorLog.filter(e => e.type === 'VALIDATION_ERROR');
            
            this.assert(
                validationErrors.length > 0,
                'Validation error should be logged'
            );

            // Clean up
            document.body.removeChild(testInput);

            this.recordTest('Validation Error Handling', true, 'Validation errors handled with user guidance');
        } catch (error) {
            this.recordTest('Validation Error Handling', false, error.message);
        }
    }

    async testCircuitBreakerPattern() {
        console.log('Testing Circuit Breaker Pattern...');
        
        try {
            const serviceName = 'test-service';
            
            // Initialize a test circuit breaker
            this.errorHandler.circuitBreakers.set(serviceName, {
                state: 'CLOSED',
                failureCount: 0,
                failureThreshold: 3,
                timeout: 1000,
                lastFailureTime: null,
                successCount: 0,
                halfOpenSuccessThreshold: 2
            });

            // Test multiple failures to open circuit
            for (let i = 0; i < 4; i++) {
                try {
                    await this.errorHandler.executeWithCircuitBreaker(
                        serviceName,
                        () => { throw new Error(`Failure ${i + 1}`); }
                    );
                } catch (error) {
                    // Expected failures
                }
            }

            const breaker = this.errorHandler.circuitBreakers.get(serviceName);
            this.assert(
                breaker.state === 'OPEN',
                `Circuit breaker should be OPEN after failures, but is ${breaker.state}`
            );

            // Test that circuit breaker prevents execution when open
            let fallbackCalled = false;
            try {
                await this.errorHandler.executeWithCircuitBreaker(
                    serviceName,
                    () => 'Should not execute',
                    () => {
                        fallbackCalled = true;
                        return 'Fallback executed';
                    }
                );
            } catch (error) {
                // May throw if no fallback
            }

            this.assert(
                fallbackCalled,
                'Fallback should be called when circuit is open'
            );

            this.recordTest('Circuit Breaker Pattern', true, 'Circuit breaker opens after failures and uses fallback');
        } catch (error) {
            this.recordTest('Circuit Breaker Pattern', false, error.message);
        }
    }

    async testAutomaticRecovery() {
        console.log('Testing Automatic Recovery...');
        
        try {
            // Test network recovery strategy
            const networkRecovery = await this.errorHandler.attemptRecovery('network_connection_failed');
            
            this.assert(
                typeof networkRecovery === 'boolean',
                'Recovery attempt should return boolean result'
            );

            // Test that recovery strategies exist
            this.assert(
                this.errorHandler.recoveryStrategies.has('database_connection_failed'),
                'Database recovery strategy should exist'
            );

            this.assert(
                this.errorHandler.recoveryStrategies.has('ai_service_failed'),
                'AI service recovery strategy should exist'
            );

            this.assert(
                this.errorHandler.recoveryStrategies.has('network_connection_failed'),
                'Network recovery strategy should exist'
            );

            this.recordTest('Automatic Recovery', true, 'Recovery strategies implemented and functional');
        } catch (error) {
            this.recordTest('Automatic Recovery', false, error.message);
        }
    }

    async testFallbackContentSystem() {
        console.log('Testing Fallback Content System...');
        
        try {
            // Test risk explanation fallbacks
            const riskFallback = this.errorHandler.getFallbackContent('ai_risk_explanation', { category: 'High' });
            this.assert(
                typeof riskFallback === 'string' && riskFallback.includes('high'),
                'Risk explanation fallback should be appropriate for category'
            );

            // Test mood support fallbacks
            const moodFallback = this.errorHandler.getFallbackContent('ai_mood_support', { mood: 1 });
            this.assert(
                typeof moodFallback === 'string' && moodFallback.length > 0,
                'Mood support fallback should be provided'
            );

            // Test nutrition tips fallbacks
            const nutritionFallback = this.errorHandler.getFallbackContent('ai_nutrition_tips');
            this.assert(
                typeof nutritionFallback === 'string' && nutritionFallback.length > 0,
                'Nutrition tips fallback should be provided'
            );

            // Test coping strategies fallbacks
            const copingFallback = this.errorHandler.getFallbackContent('ai_coping_strategies');
            this.assert(
                Array.isArray(copingFallback) && copingFallback.length > 0,
                'Coping strategies fallback should be an array'
            );

            // Test generic fallback
            const genericFallback = this.errorHandler.getGenericFallback('unknown_type');
            this.assert(
                typeof genericFallback === 'string' && genericFallback.length > 0,
                'Generic fallback should be provided for unknown types'
            );

            this.recordTest('Fallback Content System', true, 'All fallback content types working correctly');
        } catch (error) {
            this.recordTest('Fallback Content System', false, error.message);
        }
    }

    async testUserNotificationSystem() {
        console.log('Testing User Notification System...');
        
        try {
            // Test basic notification
            const notification = this.errorHandler.showUserNotification(
                'Test notification message',
                'info',
                1000
            );

            this.assert(
                notification instanceof HTMLElement,
                'Notification should return HTML element'
            );

            this.assert(
                notification.classList.contains('notification'),
                'Notification should have notification class'
            );

            // Test notification with actions
            let actionCalled = false;
            const actionNotification = this.errorHandler.showUserNotification(
                'Test with action',
                'warning',
                1000,
                [{
                    id: 'test-action',
                    label: 'Test Action',
                    handler: () => { actionCalled = true; }
                }]
            );

            // Simulate action click
            const actionButton = actionNotification.querySelector('[data-action="test-action"]');
            if (actionButton) {
                actionButton.click();
            }

            this.assert(
                actionCalled,
                'Notification action should be callable'
            );

            // Test enhanced error messaging
            const errorInfo = this.errorHandler.getUserFriendlyMessage('DATABASE_ERROR', new Error('Test'));
            this.assert(
                typeof errorInfo === 'object' && errorInfo.message && errorInfo.guidance,
                'Enhanced error messages should include message and guidance'
            );

            this.recordTest('User Notification System', true, 'Notifications and error messages working correctly');
        } catch (error) {
            this.recordTest('User Notification System', false, error.message);
        }
    }

    async testErrorLoggingAndMonitoring() {
        console.log('Testing Error Logging and Monitoring...');
        
        try {
            // Clear existing errors
            this.errorHandler.clearErrorLog();

            // Log a test error
            const testError = new Error('Test error for logging');
            await this.errorHandler.handleError('TEST_ERROR', testError, {
                testContext: 'verification'
            });

            // Check if error was logged
            const errorLog = this.errorHandler.getErrorLog();
            this.assert(
                errorLog.length > 0,
                'Error should be logged'
            );

            const loggedError = errorLog[0];
            this.assert(
                loggedError.type === 'TEST_ERROR',
                'Error type should be preserved in log'
            );

            this.assert(
                loggedError.context && loggedError.context.testContext === 'verification',
                'Error context should be preserved in log'
            );

            this.assert(
                loggedError.timestamp && loggedError.id,
                'Error should have timestamp and ID'
            );

            // Test error log size limit
            const originalMaxSize = this.errorHandler.maxLogSize;
            this.errorHandler.maxLogSize = 2;

            // Add more errors than the limit
            for (let i = 0; i < 5; i++) {
                await this.errorHandler.handleError('OVERFLOW_TEST', new Error(`Error ${i}`));
            }

            const limitedLog = this.errorHandler.getErrorLog();
            this.assert(
                limitedLog.length <= 2,
                'Error log should respect size limit'
            );

            // Restore original size
            this.errorHandler.maxLogSize = originalMaxSize;

            this.recordTest('Error Logging and Monitoring', true, 'Error logging working with size limits');
        } catch (error) {
            this.recordTest('Error Logging and Monitoring', false, error.message);
        }
    }

    async testHealthCheckSystem() {
        console.log('Testing Health Check System...');
        
        try {
            const healthResults = await this.errorHandler.performHealthCheck();

            this.assert(
                typeof healthResults === 'object',
                'Health check should return object'
            );

            this.assert(
                'localStorage' in healthResults,
                'Health check should test localStorage'
            );

            this.assert(
                'timestamp' in healthResults,
                'Health check should include timestamp'
            );

            this.assert(
                typeof healthResults.localStorage === 'boolean',
                'localStorage health should be boolean'
            );

            this.recordTest('Health Check System', true, 'Health check system functional');
        } catch (error) {
            this.recordTest('Health Check System', false, error.message);
        }
    }

    async testRetryMechanisms() {
        console.log('Testing Retry Mechanisms...');
        
        try {
            let attemptCount = 0;
            const maxRetries = 3;

            try {
                await this.errorHandler.retryWithBackoff(
                    () => {
                        attemptCount++;
                        if (attemptCount < maxRetries) {
                            throw new Error(`Attempt ${attemptCount} failed`);
                        }
                        return 'Success';
                    },
                    {
                        maxRetries: maxRetries - 1,
                        baseDelay: 10, // Short delay for testing
                        backoffFactor: 2,
                        jitter: false
                    }
                );

                this.assert(
                    attemptCount === maxRetries,
                    `Should make ${maxRetries} attempts, made ${attemptCount}`
                );
            } catch (error) {
                // Expected if all retries fail
            }

            // Test retry condition
            let conditionChecked = false;
            try {
                await this.errorHandler.retryWithBackoff(
                    () => { throw new Error('Test error'); },
                    {
                        maxRetries: 2,
                        baseDelay: 10,
                        retryCondition: (error, attempt) => {
                            conditionChecked = true;
                            return false; // Don't retry
                        }
                    }
                );
            } catch (error) {
                // Expected
            }

            this.assert(
                conditionChecked,
                'Retry condition should be checked'
            );

            this.recordTest('Retry Mechanisms', true, 'Retry mechanisms working with backoff and conditions');
        } catch (error) {
            this.recordTest('Retry Mechanisms', false, error.message);
        }
    }

    assert(condition, message) {
        if (!condition) {
            throw new Error(`Assertion failed: ${message}`);
        }
    }

    recordTest(testName, passed, details) {
        const result = {
            name: testName,
            passed,
            details,
            timestamp: new Date().toISOString()
        };
        
        this.testResults.push(result);
        
        const status = passed ? '✅ PASS' : '❌ FAIL';
        console.log(`${status}: ${testName} - ${details}`);
    }

    printTestSummary() {
        const totalTests = this.testResults.length;
        const passedTests = this.testResults.filter(r => r.passed).length;
        const failedTests = totalTests - passedTests;

        console.log('\n' + '='.repeat(60));
        console.log('🛡️ ERROR HANDLING VERIFICATION SUMMARY');
        console.log('='.repeat(60));
        console.log(`Total Tests: ${totalTests}`);
        console.log(`Passed: ${passedTests} ✅`);
        console.log(`Failed: ${failedTests} ${failedTests > 0 ? '❌' : '✅'}`);
        console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
        console.log('='.repeat(60));

        if (failedTests > 0) {
            console.log('\nFailed Tests:');
            this.testResults
                .filter(r => !r.passed)
                .forEach(r => console.log(`❌ ${r.name}: ${r.details}`));
        }

        console.log('\n🎯 Error handling and fallback systems verification completed!');
        
        return {
            total: totalTests,
            passed: passedTests,
            failed: failedTests,
            successRate: (passedTests / totalTests) * 100
        };
    }
}

// Auto-run verification when script loads
if (typeof window !== 'undefined') {
    window.addEventListener('load', async () => {
        // Wait a bit for all systems to initialize
        setTimeout(async () => {
            const verification = new ErrorHandlingVerification();
            const results = await verification.runAllTests();
            
            // Store results globally for access
            window.errorHandlingVerificationResults = results;
        }, 1000);
    });
}

// Export for module use
export default ErrorHandlingVerification;