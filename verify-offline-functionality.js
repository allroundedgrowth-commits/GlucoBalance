// GlucoBalance - Offline Functionality Verification Script
class OfflineFunctionalityVerifier {
    constructor() {
        this.testResults = [];
        this.isRunning = false;
    }

    async runAllTests() {
        if (this.isRunning) {
            console.log('Tests already running...');
            return;
        }

        this.isRunning = true;
        this.testResults = [];
        
        console.log('🧪 Starting Offline Functionality Verification...\n');

        try {
            // Test 1: Service Worker Registration
            await this.testServiceWorkerRegistration();
            
            // Test 2: Offline Manager Initialization
            await this.testOfflineManagerInitialization();
            
            // Test 3: Offline UI Components
            await this.testOfflineUIComponents();
            
            // Test 4: Caching Strategies
            await this.testCachingStrategies();
            
            // Test 5: Offline Data Operations
            await this.testOfflineDataOperations();
            
            // Test 6: Sync Functionality
            await this.testSyncFunctionality();
            
            // Test 7: Conflict Resolution
            await this.testConflictResolution();
            
            // Test 8: AI Fallback Mechanisms
            await this.testAIFallbackMechanisms();
            
            // Test 9: User Feedback and Indicators
            await this.testUserFeedbackIndicators();
            
            // Test 10: Performance and Reliability
            await this.testPerformanceReliability();

            this.generateReport();
        } catch (error) {
            console.error('❌ Test suite failed:', error);
        } finally {
            this.isRunning = false;
        }
    }

    async testServiceWorkerRegistration() {
        console.log('📋 Testing Service Worker Registration...');
        
        try {
            // Check if service worker is supported
            if (!('serviceWorker' in navigator)) {
                this.addResult('Service Worker Support', false, 'Service Worker not supported in this browser');
                return;
            }
            
            // Check if service worker is registered
            const registration = await navigator.serviceWorker.getRegistration();
            if (registration) {
                this.addResult('Service Worker Registration', true, 'Service worker is registered');
                
                // Check if service worker is active
                if (registration.active) {
                    this.addResult('Service Worker Active', true, 'Service worker is active');
                } else {
                    this.addResult('Service Worker Active', false, 'Service worker is not active');
                }
            } else {
                this.addResult('Service Worker Registration', false, 'Service worker is not registered');
            }
            
        } catch (error) {
            this.addResult('Service Worker Registration', false, `Error: ${error.message}`);
        }
    }

    async testOfflineManagerInitialization() {
        console.log('📋 Testing Offline Manager Initialization...');
        
        try {
            // Check if offline manager exists
            if (window.offlineManager) {
                this.addResult('Offline Manager Exists', true, 'Offline manager is available');
                
                // Check if database is initialized
                if (window.offlineManager.db) {
                    this.addResult('Offline Database', true, 'Offline database is initialized');
                } else {
                    this.addResult('Offline Database', false, 'Offline database is not initialized');
                }
                
                // Test queue operations count
                try {
                    const count = await window.offlineManager.getQueuedOperationsCount();
                    this.addResult('Queue Operations Access', true, `Can access queue (${count} operations)`);
                } catch (error) {
                    this.addResult('Queue Operations Access', false, `Cannot access queue: ${error.message}`);
                }
                
            } else {
                this.addResult('Offline Manager Exists', false, 'Offline manager is not available');
            }
            
        } catch (error) {
            this.addResult('Offline Manager Initialization', false, `Error: ${error.message}`);
        }
    }

    async testOfflineUIComponents() {
        console.log('📋 Testing Offline UI Components...');
        
        try {
            // Check if offline UI exists
            if (window.offlineUI) {
                this.addResult('Offline UI Exists', true, 'Offline UI is available');
                
                // Check status bar
                const statusBar = document.getElementById('offline-status-bar');
                if (statusBar) {
                    this.addResult('Status Bar', true, 'Offline status bar is present');
                } else {
                    this.addResult('Status Bar', false, 'Offline status bar is missing');
                }
                
                // Check capabilities panel
                const capabilitiesPanel = document.getElementById('offline-capabilities-panel');
                if (capabilitiesPanel) {
                    this.addResult('Capabilities Panel', true, 'Offline capabilities panel is present');
                } else {
                    this.addResult('Capabilities Panel', false, 'Offline capabilities panel is missing');
                }
                
                // Check sync progress indicator
                const syncProgress = document.getElementById('sync-progress-indicator');
                if (syncProgress) {
                    this.addResult('Sync Progress Indicator', true, 'Sync progress indicator is present');
                } else {
                    this.addResult('Sync Progress Indicator', false, 'Sync progress indicator is missing');
                }
                
            } else {
                this.addResult('Offline UI Exists', false, 'Offline UI is not available');
            }
            
        } catch (error) {
            this.addResult('Offline UI Components', false, `Error: ${error.message}`);
        }
    }

    async testCachingStrategies() {
        console.log('📋 Testing Caching Strategies...');
        
        try {
            // Check if Cache API is supported
            if ('caches' in window) {
                this.addResult('Cache API Support', true, 'Cache API is supported');
                
                // Check for cached resources
                const cacheNames = await caches.keys();
                if (cacheNames.length > 0) {
                    this.addResult('Cache Storage', true, `Found ${cacheNames.length} cache(s): ${cacheNames.join(', ')}`);
                    
                    // Check specific caches
                    const staticCache = await caches.open('glucobalance-static-v1.2');
                    const staticKeys = await staticCache.keys();
                    this.addResult('Static Cache', staticKeys.length > 0, `Static cache has ${staticKeys.length} entries`);
                    
                } else {
                    this.addResult('Cache Storage', false, 'No caches found');
                }
                
            } else {
                this.addResult('Cache API Support', false, 'Cache API is not supported');
            }
            
        } catch (error) {
            this.addResult('Caching Strategies', false, `Error: ${error.message}`);
        }
    }

    async testOfflineDataOperations() {
        console.log('📋 Testing Offline Data Operations...');
        
        try {
            if (window.kiroDb && window.offlineManager) {
                // Test offline user creation
                const testUser = {
                    name: 'Test User Offline',
                    email: 'test.offline@example.com',
                    age: 25,
                    gender: 'other'
                };
                
                try {
                    const user = await window.kiroDb.createUser(testUser);
                    this.addResult('Offline User Creation', true, `Created user with ID: ${user.id}`);
                } catch (error) {
                    this.addResult('Offline User Creation', false, `Failed: ${error.message}`);
                }
                
                // Test offline mood entry
                try {
                    const moodEntry = await window.kiroDb.saveMood(1, new Date().toISOString().split('T')[0], 4, 'Test offline mood');
                    this.addResult('Offline Mood Entry', true, `Saved mood entry with ID: ${moodEntry.id}`);
                } catch (error) {
                    this.addResult('Offline Mood Entry', false, `Failed: ${error.message}`);
                }
                
                // Test queued operations
                try {
                    const queueCount = await window.offlineManager.getQueuedOperationsCount();
                    this.addResult('Operation Queuing', queueCount >= 0, `Queue has ${queueCount} operations`);
                } catch (error) {
                    this.addResult('Operation Queuing', false, `Failed: ${error.message}`);
                }
                
            } else {
                this.addResult('Offline Data Operations', false, 'Required components not available');
            }
            
        } catch (error) {
            this.addResult('Offline Data Operations', false, `Error: ${error.message}`);
        }
    }

    async testSyncFunctionality() {
        console.log('📋 Testing Sync Functionality...');
        
        try {
            if (window.offlineManager) {
                // Test sync metadata
                try {
                    await window.offlineManager.updateSyncMetadata('testKey', 'testValue');
                    const value = await window.offlineManager.getSyncMetadata('testKey');
                    this.addResult('Sync Metadata', value === 'testValue', `Metadata test: ${value}`);
                } catch (error) {
                    this.addResult('Sync Metadata', false, `Failed: ${error.message}`);
                }
                
                // Test background sync registration
                if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
                    this.addResult('Background Sync Support', true, 'Background sync is supported');
                } else {
                    this.addResult('Background Sync Support', false, 'Background sync is not supported');
                }
                
            } else {
                this.addResult('Sync Functionality', false, 'Offline manager not available');
            }
            
        } catch (error) {
            this.addResult('Sync Functionality', false, `Error: ${error.message}`);
        }
    }

    async testConflictResolution() {
        console.log('📋 Testing Conflict Resolution...');
        
        try {
            if (window.offlineManager) {
                // Test conflict resolution strategies
                const clientData = { name: 'Client Version', updatedAt: new Date().toISOString() };
                const serverData = { name: 'Server Version', updatedAt: new Date(Date.now() - 1000).toISOString() };
                
                try {
                    const merged = window.offlineManager.mergeConflictData(clientData, serverData);
                    this.addResult('Conflict Merge', merged.name === 'Client Version', `Merged result: ${merged.name}`);
                } catch (error) {
                    this.addResult('Conflict Merge', false, `Failed: ${error.message}`);
                }
                
                // Test conflict storage
                try {
                    const conflicts = await window.offlineManager.getConflicts();
                    this.addResult('Conflict Storage', Array.isArray(conflicts), `Found ${conflicts.length} conflicts`);
                } catch (error) {
                    this.addResult('Conflict Storage', false, `Failed: ${error.message}`);
                }
                
            } else {
                this.addResult('Conflict Resolution', false, 'Offline manager not available');
            }
            
        } catch (error) {
            this.addResult('Conflict Resolution', false, `Error: ${error.message}`);
        }
    }

    async testAIFallbackMechanisms() {
        console.log('📋 Testing AI Fallback Mechanisms...');
        
        try {
            if (window.offlineManager) {
                // Test AI response caching
                const testResponse = { explanation: 'Test AI response', recommendations: ['Test rec 1', 'Test rec 2'] };
                
                try {
                    await window.offlineManager.cacheAIResponse('test-ai-key', testResponse);
                    const cached = await window.offlineManager.getCachedAIResponse('test-ai-key');
                    this.addResult('AI Response Caching', cached !== null, `Cached response: ${cached ? 'Found' : 'Not found'}`);
                } catch (error) {
                    this.addResult('AI Response Caching', false, `Failed: ${error.message}`);
                }
                
            } else {
                this.addResult('AI Fallback Mechanisms', false, 'Offline manager not available');
            }
            
        } catch (error) {
            this.addResult('AI Fallback Mechanisms', false, `Error: ${error.message}`);
        }
    }

    async testUserFeedbackIndicators() {
        console.log('📋 Testing User Feedback Indicators...');
        
        try {
            if (window.offlineUI) {
                // Test notification system
                try {
                    window.offlineUI.showNotification('Test notification', 'info');
                    this.addResult('Notification System', true, 'Notification displayed successfully');
                } catch (error) {
                    this.addResult('Notification System', false, `Failed: ${error.message}`);
                }
                
                // Test status updates
                try {
                    window.offlineUI.setOnlineStatus(false);
                    window.offlineUI.setOnlineStatus(true);
                    this.addResult('Status Updates', true, 'Status updates work correctly');
                } catch (error) {
                    this.addResult('Status Updates', false, `Failed: ${error.message}`);
                }
                
            } else {
                this.addResult('User Feedback Indicators', false, 'Offline UI not available');
            }
            
        } catch (error) {
            this.addResult('User Feedback Indicators', false, `Error: ${error.message}`);
        }
    }

    async testPerformanceReliability() {
        console.log('📋 Testing Performance and Reliability...');
        
        try {
            // Test IndexedDB performance
            const startTime = Date.now();
            
            if (window.kiroDb) {
                try {
                    // Perform multiple operations to test performance
                    for (let i = 0; i < 5; i++) {
                        await window.kiroDb.saveMood(1, `2024-01-${10 + i}`, Math.floor(Math.random() * 5) + 1, `Performance test ${i}`);
                    }
                    
                    const endTime = Date.now();
                    const duration = endTime - startTime;
                    
                    this.addResult('Database Performance', duration < 1000, `5 operations took ${duration}ms`);
                } catch (error) {
                    this.addResult('Database Performance', false, `Failed: ${error.message}`);
                }
                
                // Test data retrieval
                try {
                    const moods = await window.kiroDb.getUserMoods(1, 30);
                    this.addResult('Data Retrieval', Array.isArray(moods), `Retrieved ${moods.length} mood entries`);
                } catch (error) {
                    this.addResult('Data Retrieval', false, `Failed: ${error.message}`);
                }
                
            } else {
                this.addResult('Performance and Reliability', false, 'Database not available');
            }
            
        } catch (error) {
            this.addResult('Performance and Reliability', false, `Error: ${error.message}`);
        }
    }

    addResult(testName, passed, details) {
        const result = {
            test: testName,
            passed,
            details,
            timestamp: new Date().toISOString()
        };
        
        this.testResults.push(result);
        
        const status = passed ? '✅' : '❌';
        console.log(`${status} ${testName}: ${details}`);
    }

    generateReport() {
        console.log('\n📊 OFFLINE FUNCTIONALITY VERIFICATION REPORT');
        console.log('=' .repeat(50));
        
        const totalTests = this.testResults.length;
        const passedTests = this.testResults.filter(r => r.passed).length;
        const failedTests = totalTests - passedTests;
        const successRate = ((passedTests / totalTests) * 100).toFixed(1);
        
        console.log(`Total Tests: ${totalTests}`);
        console.log(`Passed: ${passedTests}`);
        console.log(`Failed: ${failedTests}`);
        console.log(`Success Rate: ${successRate}%`);
        console.log('');
        
        if (failedTests > 0) {
            console.log('❌ FAILED TESTS:');
            this.testResults
                .filter(r => !r.passed)
                .forEach(result => {
                    console.log(`  • ${result.test}: ${result.details}`);
                });
            console.log('');
        }
        
        console.log('✅ PASSED TESTS:');
        this.testResults
            .filter(r => r.passed)
            .forEach(result => {
                console.log(`  • ${result.test}: ${result.details}`);
            });
        
        console.log('\n🎯 RECOMMENDATIONS:');
        
        if (successRate >= 90) {
            console.log('  • Excellent! Offline functionality is working well.');
        } else if (successRate >= 75) {
            console.log('  • Good! Minor issues need attention.');
        } else if (successRate >= 50) {
            console.log('  • Moderate! Several issues need to be fixed.');
        } else {
            console.log('  • Critical! Major offline functionality issues detected.');
        }
        
        if (failedTests > 0) {
            console.log('  • Review failed tests and fix underlying issues.');
            console.log('  • Test in different browsers and network conditions.');
            console.log('  • Verify service worker registration and caching.');
        }
        
        console.log('  • Test offline functionality regularly during development.');
        console.log('  • Monitor real-world offline usage patterns.');
        
        return {
            totalTests,
            passedTests,
            failedTests,
            successRate,
            results: this.testResults
        };
    }
}

// Initialize and export verifier
window.offlineFunctionalityVerifier = new OfflineFunctionalityVerifier();

// Auto-run tests if in test environment
if (window.location.pathname.includes('test-offline-functionality')) {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            window.offlineFunctionalityVerifier.runAllTests();
        }, 2000); // Wait for other components to initialize
    });
}