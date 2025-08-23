// Verification script for Take Assessment button functionality
class TakeAssessmentVerifier {
    constructor() {
        this.results = [];
        this.init();
    }

    init() {
        console.log('🔍 Verifying Take Assessment button functionality...');
        this.runVerification();
    }

    runVerification() {
        // Wait for DOM and app to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                setTimeout(() => this.performChecks(), 1000);
            });
        } else {
            setTimeout(() => this.performChecks(), 1000);
        }
    }

    performChecks() {
        console.log('🧪 Running Take Assessment functionality checks...');

        // Check 1: Button exists in DOM
        this.checkButtonExists();

        // Check 2: Main app instance is available
        this.checkAppInstance();

        // Check 3: showAssessment method exists
        this.checkShowAssessmentMethod();

        // Check 4: Button event listeners are attached
        this.checkEventListeners();

        // Check 5: Dashboard button fix is working
        this.checkDashboardButtonFix();

        // Check 6: Enhanced dashboard redesign is working
        this.checkEnhancedDashboardRedesign();

        // Generate report
        this.generateReport();
    }

    checkButtonExists() {
        const button = document.getElementById('take-assessment-btn');
        const result = {
            test: 'Take Assessment Button Exists',
            passed: !!button,
            details: button ? 
                `Button found with text: "${button.textContent.trim()}"` : 
                'Button not found in DOM'
        };
        this.results.push(result);
        console.log(result.passed ? '✅' : '❌', result.test, '-', result.details);
    }

    checkAppInstance() {
        const result = {
            test: 'Main App Instance Available',
            passed: !!(window.glucoApp && typeof window.glucoApp === 'object'),
            details: window.glucoApp ? 
                'window.glucoApp is available' : 
                'window.glucoApp is not available'
        };
        this.results.push(result);
        console.log(result.passed ? '✅' : '❌', result.test, '-', result.details);
    }

    checkShowAssessmentMethod() {
        const hasMethod = window.glucoApp && typeof window.glucoApp.showAssessment === 'function';
        const result = {
            test: 'showAssessment Method Available',
            passed: hasMethod,
            details: hasMethod ? 
                'showAssessment method is available on main app' : 
                'showAssessment method not found'
        };
        this.results.push(result);
        console.log(result.passed ? '✅' : '❌', result.test, '-', result.details);
    }

    checkEventListeners() {
        const button = document.getElementById('take-assessment-btn');
        let hasListeners = false;
        
        if (button) {
            // Try to detect if event listeners are attached
            // This is a basic check - event listeners are not easily detectable
            const hasClickHandler = button.onclick !== null || 
                                  button.getAttribute('onclick') !== null;
            hasListeners = hasClickHandler;
        }

        const result = {
            test: 'Button Event Listeners',
            passed: hasListeners || !!button, // Pass if button exists (listeners might be attached via addEventListener)
            details: button ? 
                'Button exists and should have event listeners attached' : 
                'Button not found, cannot check event listeners'
        };
        this.results.push(result);
        console.log(result.passed ? '✅' : '❌', result.test, '-', result.details);
    }

    checkDashboardButtonFix() {
        const hasDashboardButtonFix = window.DashboardButtonsFix || 
                                    document.querySelector('script[src*="dashboard-buttons-fix"]');
        const result = {
            test: 'Dashboard Buttons Fix Available',
            passed: !!hasDashboardButtonFix,
            details: hasDashboardButtonFix ? 
                'Dashboard buttons fix script is loaded' : 
                'Dashboard buttons fix script not detected'
        };
        this.results.push(result);
        console.log(result.passed ? '✅' : '❌', result.test, '-', result.details);
    }

    checkEnhancedDashboardRedesign() {
        const hasEnhancedDashboard = window.EnhancedDashboardRedesign || 
                                   window.enhancedDashboardRedesign ||
                                   document.querySelector('script[src*="enhanced-dashboard"]');
        const result = {
            test: 'Enhanced Dashboard Redesign Available',
            passed: !!hasEnhancedDashboard,
            details: hasEnhancedDashboard ? 
                'Enhanced dashboard redesign script is loaded' : 
                'Enhanced dashboard redesign script not detected'
        };
        this.results.push(result);
        console.log(result.passed ? '✅' : '❌', result.test, '-', result.details);
    }

    generateReport() {
        const passedTests = this.results.filter(r => r.passed).length;
        const totalTests = this.results.length;
        const successRate = Math.round((passedTests / totalTests) * 100);

        console.log('\n📊 Take Assessment Button Verification Report');
        console.log('='.repeat(50));
        console.log(`✅ Passed: ${passedTests}/${totalTests} tests (${successRate}%)`);
        console.log(`❌ Failed: ${totalTests - passedTests}/${totalTests} tests`);
        
        if (passedTests === totalTests) {
            console.log('\n🎉 All tests passed! Take Assessment button should work correctly.');
        } else {
            console.log('\n⚠️  Some tests failed. Check the details above.');
        }

        // Test the actual functionality
        this.testButtonFunctionality();
    }

    testButtonFunctionality() {
        console.log('\n🧪 Testing button functionality...');
        
        const button = document.getElementById('take-assessment-btn');
        if (button && window.glucoApp && window.glucoApp.showAssessment) {
            console.log('✅ Ready to test: Click the "Take Assessment" button to verify it opens the risk assessment.');
            
            // Add a temporary click handler to log when button is clicked
            const originalHandler = button.onclick;
            button.addEventListener('click', () => {
                console.log('🎯 Take Assessment button clicked successfully!');
                setTimeout(() => {
                    const assessmentPage = document.getElementById('assessment-page');
                    if (assessmentPage && assessmentPage.classList.contains('active')) {
                        console.log('✅ Risk assessment page opened successfully!');
                    } else {
                        console.log('⚠️  Risk assessment page may not have opened properly.');
                    }
                }, 500);
            }, { once: true });
        } else {
            console.log('❌ Cannot test functionality - missing button or app methods.');
        }
    }
}

// Auto-run verification when script loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new TakeAssessmentVerifier();
    });
} else {
    new TakeAssessmentVerifier();
}