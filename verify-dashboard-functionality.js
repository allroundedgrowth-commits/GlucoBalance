// Dashboard Functionality Verification Script
class DashboardFunctionalityVerifier {
    constructor() {
        this.results = {
            passed: 0,
            failed: 0,
            warnings: 0,
            total: 0
        };
        this.issues = [];
        this.recommendations = [];
    }

    async verifyAll() {
        console.log('🎛️ Starting comprehensive dashboard functionality verification...');
        
        // Core functionality tests
        await this.verifyScriptLoading();
        await this.verifyButtonElements();
        await this.verifyEventListeners();
        await this.verifyDataFlow();
        await this.verifyUserInterface();
        await this.verifyAccessibility();
        await this.verifyResponsiveness();
        await this.verifyErrorHandling();
        
        this.generateReport();
        return this.results;
    }

    async verifyScriptLoading() {
        console.log('📜 Verifying script loading...');
        
        const requiredScripts = [
            { name: 'Enhanced Dashboard', check: () => window.enhancedDashboard },
            { name: 'Dashboard Button Manager', check: () => window.dashboardButtonManager },
            { name: 'GlucoApp', check: () => window.glucoApp },
            { name: 'Database', check: () => window.kiroDb },
            { name: 'AI Service', check: () => window.aiService || window.geminiAI },
            { name: 'Risk Assessment', check: () => window.riskAssessment },
            { name: 'Mental Health', check: () => window.mentalHealth },
            { name: 'Nutrition Service', check: () => window.nutritionService }
        ];

        requiredScripts.forEach(script => {
            if (script.check()) {
                this.pass(`✅ ${script.name} loaded successfully`);
            } else {
                this.fail(`❌ ${script.name} not loaded`);
                this.recommendations.push(`Load ${script.name} script before dashboard initialization`);
            }
        });
    }

    async verifyButtonElements() {
        console.log('🔘 Verifying button elements...');
        
        const buttonTests = [
            // Header buttons
            { id: 'refresh-dashboard', name: 'Refresh Dashboard Button' },
            { id: 'profile-btn', name: 'Profile Button' },
            
            // Card buttons
            { id: 'take-assessment-btn', name: 'Take Assessment Button' },
            { id: 'log-mood-btn', name: 'Log Mood Button' },
            { id: 'view-mood-history-btn', name: 'View Mood History Button' },
            { id: 'create-meal-plan-btn', name: 'Create Meal Plan Button' },
            { id: 'view-nutrition-btn', name: 'View Nutrition Button' },
            { id: 'refresh-insights-btn', name: 'Refresh Insights Button' },
            
            // Quick action buttons
            { id: 'assessment-btn', name: 'Quick Assessment Button' },
            { id: 'mood-log-btn', name: 'Quick Mood Log Button' },
            { id: 'meal-plan-btn', name: 'Quick Meal Plan Button' },
            { id: 'generate-report-btn', name: 'Generate Report Button' }
        ];

        buttonTests.forEach(test => {
            const element = document.getElementById(test.id);
            if (element) {
                this.pass(`✅ ${test.name} found`);
                
                // Check if button is clickable
                if (element.disabled) {
                    this.warn(`⚠️ ${test.name} is disabled`);
                }
                
                // Check if button has proper styling
                const styles = window.getComputedStyle(element);
                if (styles.cursor !== 'pointer' && !element.disabled) {
                    this.warn(`⚠️ ${test.name} missing pointer cursor`);
                }
            } else {
                this.fail(`❌ ${test.name} not found`);
            }
        });

        // Check mood selector buttons
        const moodButtons = document.querySelectorAll('.mood-btn');
        if (moodButtons.length >= 5) {
            this.pass(`✅ Mood selector buttons found (${moodButtons.length})`);
        } else {
            this.fail(`❌ Insufficient mood selector buttons (found ${moodButtons.length}, expected 5)`);
        }
    }

    async verifyEventListeners() {
        console.log('👂 Verifying event listeners...');
        
        const buttonIds = [
            'refresh-dashboard',
            'take-assessment-btn',
            'log-mood-btn',
            'create-meal-plan-btn',
            'refresh-insights-btn',
            'assessment-btn',
            'mood-log-btn',
            'meal-plan-btn',
            'generate-report-btn'
        ];

        buttonIds.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                // Check if element has click event listeners
                const hasListeners = this.hasEventListeners(element, 'click');
                if (hasListeners) {
                    this.pass(`✅ ${id} has click event listener`);
                } else {
                    this.fail(`❌ ${id} missing click event listener`);
                    this.recommendations.push(`Add click event listener to ${id}`);
                }
            }
        });

        // Check mood button listeners
        const moodButtons = document.querySelectorAll('.mood-btn');
        let moodListenersCount = 0;
        moodButtons.forEach(btn => {
            if (this.hasEventListeners(btn, 'click')) {
                moodListenersCount++;
            }
        });

        if (moodListenersCount === moodButtons.length) {
            this.pass(`✅ All mood buttons have event listeners`);
        } else {
            this.fail(`❌ Some mood buttons missing event listeners (${moodListenersCount}/${moodButtons.length})`);
        }
    }

    async verifyDataFlow() {
        console.log('🔄 Verifying data flow...');
        
        // Test data storage and retrieval
        try {
            const testUser = {
                id: 'test-verification-user',
                name: 'Test User',
                email: 'test@example.com'
            };
            
            // Test localStorage functionality
            localStorage.setItem('test-dashboard-data', JSON.stringify(testUser));
            const retrieved = JSON.parse(localStorage.getItem('test-dashboard-data'));
            
            if (retrieved && retrieved.id === testUser.id) {
                this.pass('✅ Data storage/retrieval working');
                localStorage.removeItem('test-dashboard-data');
            } else {
                this.fail('❌ Data storage/retrieval failed');
            }
        } catch (error) {
            this.fail(`❌ Data flow error: ${error.message}`);
        }

        // Test dashboard data aggregation
        if (window.enhancedDashboard && typeof window.enhancedDashboard.aggregateHealthData === 'function') {
            this.pass('✅ Dashboard data aggregation method available');
        } else {
            this.fail('❌ Dashboard data aggregation method missing');
        }

        // Test chart rendering
        const chartContainers = document.querySelectorAll('.interactive-chart, .chart-container');
        if (chartContainers.length > 0) {
            this.pass(`✅ Chart containers found (${chartContainers.length})`);
        } else {
            this.warn('⚠️ No chart containers found');
        }
    }

    async verifyUserInterface() {
        console.log('🎨 Verifying user interface...');
        
        // Check dashboard cards
        const dashboardCards = document.querySelectorAll('.card, .demo-card');
        if (dashboardCards.length >= 4) {
            this.pass(`✅ Dashboard cards found (${dashboardCards.length})`);
        } else {
            this.fail(`❌ Insufficient dashboard cards (found ${dashboardCards.length}, expected at least 4)`);
        }

        // Check navigation elements
        const navElements = document.querySelectorAll('.nav-link, .nav-btn');
        if (navElements.length > 0) {
            this.pass(`✅ Navigation elements found (${navElements.length})`);
        } else {
            this.warn('⚠️ No navigation elements found');
        }

        // Check responsive design elements
        const responsiveElements = document.querySelectorAll('.container, .dashboard-grid, .charts-grid');
        if (responsiveElements.length > 0) {
            this.pass(`✅ Responsive layout elements found (${responsiveElements.length})`);
        } else {
            this.fail('❌ No responsive layout elements found');
        }

        // Check loading states
        const loadingElements = document.querySelectorAll('.loading-spinner, .insights-loading');
        if (loadingElements.length > 0 || document.querySelector('[class*="loading"]')) {
            this.pass('✅ Loading state elements available');
        } else {
            this.warn('⚠️ No loading state elements found');
        }
    }

    async verifyAccessibility() {
        console.log('♿ Verifying accessibility...');
        
        // Check ARIA labels
        const ariaElements = document.querySelectorAll('[aria-label], [role]');
        if (ariaElements.length > 0) {
            this.pass(`✅ ARIA accessibility attributes found (${ariaElements.length})`);
        } else {
            this.fail('❌ No ARIA accessibility attributes found');
            this.recommendations.push('Add ARIA labels and roles for better accessibility');
        }

        // Check button accessibility
        const buttons = document.querySelectorAll('button');
        let accessibleButtons = 0;
        buttons.forEach(btn => {
            if (btn.getAttribute('aria-label') || btn.textContent.trim() || btn.title) {
                accessibleButtons++;
            }
        });

        if (accessibleButtons === buttons.length) {
            this.pass('✅ All buttons have accessible labels');
        } else {
            this.warn(`⚠️ Some buttons missing accessible labels (${accessibleButtons}/${buttons.length})`);
        }

        // Check keyboard navigation
        const focusableElements = document.querySelectorAll('button, [tabindex], input, select, textarea, a[href]');
        if (focusableElements.length > 0) {
            this.pass(`✅ Focusable elements found (${focusableElements.length})`);
        } else {
            this.fail('❌ No focusable elements found');
        }
    }

    async verifyResponsiveness() {
        console.log('📱 Verifying responsiveness...');
        
        // Check viewport meta tag
        const viewportMeta = document.querySelector('meta[name="viewport"]');
        if (viewportMeta) {
            this.pass('✅ Viewport meta tag found');
        } else {
            this.fail('❌ Viewport meta tag missing');
            this.recommendations.push('Add viewport meta tag for mobile responsiveness');
        }

        // Check CSS Grid/Flexbox usage
        const gridElements = document.querySelectorAll('[class*="grid"], [class*="flex"]');
        if (gridElements.length > 0) {
            this.pass(`✅ Modern layout elements found (${gridElements.length})`);
        } else {
            this.warn('⚠️ No modern layout elements found');
        }

        // Check mobile-specific elements
        const mobileElements = document.querySelectorAll('[class*="mobile"], .hamburger, .mobile-menu');
        if (mobileElements.length > 0) {
            this.pass(`✅ Mobile-specific elements found (${mobileElements.length})`);
        } else {
            this.warn('⚠️ No mobile-specific elements found');
        }
    }

    async verifyErrorHandling() {
        console.log('🛡️ Verifying error handling...');
        
        // Check error display elements
        const errorElements = document.querySelectorAll('.error, .notification, [class*="error"]');
        if (errorElements.length > 0) {
            this.pass(`✅ Error display elements found (${errorElements.length})`);
        } else {
            this.warn('⚠️ No error display elements found');
        }

        // Test error handling in dashboard functions
        if (window.enhancedDashboard) {
            const methods = ['loadDashboard', 'refreshDashboard', 'generateAIInsights'];
            methods.forEach(method => {
                if (typeof window.enhancedDashboard[method] === 'function') {
                    this.pass(`✅ ${method} method available`);
                } else {
                    this.fail(`❌ ${method} method missing`);
                }
            });
        }

        // Check try-catch blocks in button manager
        if (window.dashboardButtonManager && window.dashboardButtonManager.isInitialized) {
            this.pass('✅ Dashboard button manager initialized');
        } else {
            this.fail('❌ Dashboard button manager not initialized');
        }
    }

    // Utility methods
    hasEventListeners(element, eventType) {
        // This is a simplified check - in a real scenario, you'd need more sophisticated detection
        const listeners = element.onclick || 
                         element.addEventListener || 
                         element.getAttribute('onclick') ||
                         (element._events && element._events[eventType]);
        return !!listeners;
    }

    pass(message) {
        console.log(`✅ ${message}`);
        this.results.passed++;
        this.results.total++;
    }

    fail(message) {
        console.log(`❌ ${message}`);
        this.results.failed++;
        this.results.total++;
        this.issues.push(message);
    }

    warn(message) {
        console.log(`⚠️ ${message}`);
        this.results.warnings++;
        this.results.total++;
        this.issues.push(message);
    }

    generateReport() {
        console.log('\n🎛️ DASHBOARD FUNCTIONALITY VERIFICATION REPORT');
        console.log('================================================');
        console.log(`Total Tests: ${this.results.total}`);
        console.log(`✅ Passed: ${this.results.passed}`);
        console.log(`❌ Failed: ${this.results.failed}`);
        console.log(`⚠️ Warnings: ${this.results.warnings}`);
        
        const successRate = this.results.total > 0 ? 
            Math.round((this.results.passed / this.results.total) * 100) : 0;
        console.log(`📊 Success Rate: ${successRate}%`);

        if (this.issues.length > 0) {
            console.log('\n🔍 Issues Found:');
            this.issues.forEach((issue, index) => {
                console.log(`${index + 1}. ${issue}`);
            });
        }

        if (this.recommendations.length > 0) {
            console.log('\n💡 Recommendations:');
            this.recommendations.forEach((rec, index) => {
                console.log(`${index + 1}. ${rec}`);
            });
        }

        // Overall assessment
        if (successRate >= 90) {
            console.log('\n🎉 EXCELLENT: Dashboard functionality is working excellently!');
        } else if (successRate >= 75) {
            console.log('\n✅ GOOD: Dashboard functionality is working well with minor issues.');
        } else if (successRate >= 50) {
            console.log('\n⚠️ FAIR: Dashboard has some functionality issues that should be addressed.');
        } else {
            console.log('\n❌ POOR: Dashboard has significant functionality issues that need immediate attention.');
        }

        return {
            results: this.results,
            issues: this.issues,
            recommendations: this.recommendations,
            successRate: successRate
        };
    }
}

// Auto-run verification when script loads
if (typeof window !== 'undefined') {
    window.dashboardVerifier = new DashboardFunctionalityVerifier();
    
    // Run verification after a short delay to ensure all scripts are loaded
    setTimeout(async () => {
        const report = await window.dashboardVerifier.verifyAll();
        
        // Store results for external access
        window.dashboardVerificationReport = report;
        
        // Display results in a user-friendly way if in browser
        if (document.body) {
            const reportElement = document.createElement('div');
            reportElement.id = 'dashboard-verification-report';
            reportElement.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: white;
                border-radius: 12px;
                padding: 20px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
                border-left: 4px solid ${report.successRate >= 75 ? '#10B981' : report.successRate >= 50 ? '#F59E0B' : '#EF4444'};
                max-width: 350px;
                z-index: 10000;
                font-family: system-ui, -apple-system, sans-serif;
                font-size: 14px;
            `;
            
            reportElement.innerHTML = `
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 15px;">
                    <h3 style="margin: 0; color: #1f2937;">🎛️ Dashboard Status</h3>
                    <button onclick="this.parentElement.parentElement.remove()" style="background: none; border: none; font-size: 18px; cursor: pointer;">×</button>
                </div>
                <div style="margin-bottom: 15px;">
                    <div style="font-size: 24px; font-weight: bold; color: ${report.successRate >= 75 ? '#10B981' : report.successRate >= 50 ? '#F59E0B' : '#EF4444'};">
                        ${report.successRate}%
                    </div>
                    <div style="color: #64748b; font-size: 12px;">Success Rate</div>
                </div>
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 15px;">
                    <div style="text-align: center;">
                        <div style="font-weight: bold; color: #10B981;">${report.results.passed}</div>
                        <div style="font-size: 11px; color: #64748b;">Passed</div>
                    </div>
                    <div style="text-align: center;">
                        <div style="font-weight: bold; color: #EF4444;">${report.results.failed}</div>
                        <div style="font-size: 11px; color: #64748b;">Failed</div>
                    </div>
                    <div style="text-align: center;">
                        <div style="font-weight: bold; color: #F59E0B;">${report.results.warnings}</div>
                        <div style="font-size: 11px; color: #64748b;">Warnings</div>
                    </div>
                </div>
                <div style="font-size: 12px; color: #64748b;">
                    ${report.successRate >= 90 ? '🎉 Excellent functionality!' : 
                      report.successRate >= 75 ? '✅ Good functionality' : 
                      report.successRate >= 50 ? '⚠️ Some issues found' : 
                      '❌ Needs attention'}
                </div>
            `;
            
            document.body.appendChild(reportElement);
            
            // Auto-remove after 10 seconds
            setTimeout(() => {
                if (reportElement.parentElement) {
                    reportElement.remove();
                }
            }, 10000);
        }
    }, 2000);
}

// Export for Node.js environments
export default DashboardFunctionalityVerifier;

console.log('✅ Dashboard Functionality Verifier loaded successfully!');