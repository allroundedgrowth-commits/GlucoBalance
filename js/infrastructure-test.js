// Infrastructure Test Suite for GlucoBalance
class InfrastructureTest {
    constructor() {
        this.results = [];
        this.testCount = 0;
        this.passCount = 0;
    }

    async runAllTests() {
        console.log('🧪 Starting Infrastructure Tests...');
        
        await this.testErrorHandler();
        await this.testDatabase();
        await this.testOfflineCapability();
        await this.testServiceWorker();
        
        this.displayResults();
        return this.results;
    }

    async testErrorHandler() {
        console.log('Testing Error Handler...');
        
        try {
            // Test error handler initialization
            this.assert(window.errorHandler instanceof ErrorHandler, 'Error handler initialized');
            
            // Test error logging
            const testError = new Error('Test error');
            const errorEntry = await window.errorHandler.handleError('TEST_ERROR', testError);
            this.assert(errorEntry.type === 'TEST_ERROR', 'Error logging works');
            
            // Test user-friendly messages
            const message = window.errorHandler.getUserFriendlyMessage('DATABASE_ERROR');
            this.assert(typeof message === 'string' && message.length > 0, 'User-friendly messages work');
            
            // Test health check
            const healthCheck = await window.errorHandler.performHealthCheck();
            this.assert(typeof healthCheck === 'object', 'Health check works');
            
            console.log('✅ Error Handler tests passed');
        } catch (error) {
            console.error('❌ Error Handler tests failed:', error);
            this.assert(false, 'Error Handler test suite failed');
        }
    }

    async testDatabase() {
        console.log('Testing Database...');
        
        try {
            // Test database initialization
            this.assert(window.kiroDb instanceof KiroDatabase, 'Database initialized');
            this.assert(window.dbService instanceof DatabaseService, 'Database service initialized');
            
            // Test user creation
            const testUser = {
                name: 'Test User',
                email: 'test@example.com',
                age: 30,
                gender: 'other'
            };
            
            const createdUser = await window.dbService.createUser(testUser);
            this.assert(createdUser && createdUser.id, 'User creation works');
            
            // Test user retrieval
            const retrievedUser = await window.dbService.getUser(createdUser.id);
            this.assert(retrievedUser && retrievedUser.email === testUser.email, 'User retrieval works');
            
            // Test assessment saving
            const testAssessment = {
                score: 15,
                category: 'Increased',
                responses: [{ questionId: '1', value: 1, text: 'Test' }],
                explanation: 'Test explanation'
            };
            
            const savedAssessment = await window.dbService.saveAssessment(createdUser.id, testAssessment);
            this.assert(savedAssessment && savedAssessment.id, 'Assessment saving works');
            
            // Test mood saving
            const today = new Date().toISOString().split('T')[0];
            const savedMood = await window.dbService.saveMood(createdUser.id, today, 4, 'Test mood');
            this.assert(savedMood && savedMood.mood === 4, 'Mood saving works');
            
            console.log('✅ Database tests passed');
        } catch (error) {
            console.error('❌ Database tests failed:', error);
            this.assert(false, 'Database test suite failed');
        }
    }

    async testOfflineCapability() {
        console.log('Testing Offline Capability...');
        
        try {
            // Test localStorage availability
            localStorage.setItem('test-offline', 'test');
            const retrieved = localStorage.getItem('test-offline');
            localStorage.removeItem('test-offline');
            this.assert(retrieved === 'test', 'localStorage works');
            
            // Test IndexedDB availability
            this.assert('indexedDB' in window, 'IndexedDB available');
            
            // Test service worker registration
            this.assert('serviceWorker' in navigator, 'Service Worker supported');
            
            console.log('✅ Offline capability tests passed');
        } catch (error) {
            console.error('❌ Offline capability tests failed:', error);
            this.assert(false, 'Offline capability test suite failed');
        }
    }

    async testServiceWorker() {
        console.log('Testing Service Worker...');
        
        try {
            if ('serviceWorker' in navigator) {
                const registration = await navigator.serviceWorker.getRegistration();
                this.assert(!!registration, 'Service Worker registered');
                
                // Test cache availability
                if ('caches' in window) {
                    const cacheNames = await caches.keys();
                    this.assert(Array.isArray(cacheNames), 'Cache API works');
                }
            } else {
                this.assert(false, 'Service Worker not supported');
            }
            
            console.log('✅ Service Worker tests passed');
        } catch (error) {
            console.error('❌ Service Worker tests failed:', error);
            this.assert(false, 'Service Worker test suite failed');
        }
    }

    assert(condition, message) {
        this.testCount++;
        if (condition) {
            this.passCount++;
            this.results.push({ status: 'PASS', message });
        } else {
            this.results.push({ status: 'FAIL', message });
        }
    }

    displayResults() {
        console.log('\n📊 Test Results:');
        console.log(`Total Tests: ${this.testCount}`);
        console.log(`Passed: ${this.passCount}`);
        console.log(`Failed: ${this.testCount - this.passCount}`);
        console.log(`Success Rate: ${((this.passCount / this.testCount) * 100).toFixed(1)}%`);
        
        console.log('\nDetailed Results:');
        this.results.forEach((result, index) => {
            const icon = result.status === 'PASS' ? '✅' : '❌';
            console.log(`${icon} ${index + 1}. ${result.message}`);
        });
        
        if (this.passCount === this.testCount) {
            console.log('\n🎉 All infrastructure tests passed! System is ready.');
        } else {
            console.log('\n⚠️ Some tests failed. Please check the implementation.');
        }
    }
}

// Auto-run tests when page loads (for development)
if (window.location.search.includes('test=true')) {
    window.addEventListener('load', async () => {
        // Wait for all systems to initialize
        setTimeout(async () => {
            const tester = new InfrastructureTest();
            await tester.runAllTests();
        }, 1000);
    });
}

// Export for manual testing
window.InfrastructureTest = InfrastructureTest;