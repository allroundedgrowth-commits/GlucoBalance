// Dashboard Diagnostics and Auto-Fix System
class DashboardDiagnostics {
    constructor() {
        this.issues = [];
        this.fixes = [];
        this.isInitialized = false;
        this.init();
    }

    init() {
        console.log('🔍 Dashboard Diagnostics initialized');
        this.isInitialized = true;
    }

    runDiagnostics() {
        console.log('🔍 Running dashboard diagnostics...');
        this.issues = [];
        this.fixes = [];

        this.checkDOMElements();
        this.checkServices();
        this.checkEventListeners();
        this.checkInitialization();

        this.reportResults();
        this.applyFixes();
    }

    checkDOMElements() {
        console.log('📋 Checking DOM elements...');
        
        const requiredButtons = [
            'take-assessment-btn',
            'log-mood-btn', 
            'view-mood-history-btn',
            'create-meal-plan-btn',
            'view-nutrition-btn',
            'get-started-insights-btn',
            'refresh-insights-btn',
            'nav-logout-btn'
        ];

        requiredButtons.forEach(buttonId => {
            const button = document.getElementById(buttonId);
            if (!button) {
                this.issues.push(`❌ Button missing: ${buttonId}`);
            } else {
                console.log(`✅ Button found: ${buttonId}`);
            }
        });

        // Check dashboard page
        const dashboardPage = document.getElementById('dashboard-page');
        if (!dashboardPage) {
            this.issues.push('❌ Dashboard page element missing');
        } else if (!dashboardPage.classList.contains('active')) {
            this.issues.push('⚠️ Dashboard page not active');
        }
    }

    checkServices() {
        console.log('🔧 Checking services...');
        
        if (!window.dashboardButtonsFix) {
            this.issues.push('❌ DashboardButtonsFix service missing');
            this.fixes.push(() => {
                window.dashboardButtonsFix = new DashboardButtonsFix();
                console.log('🔧 Created DashboardButtonsFix instance');
            });
        } else {
            console.log('✅ DashboardButtonsFix service available');
            
            if (!window.dashboardButtonsFix.isInitialized) {
                this.issues.push('⚠️ DashboardButtonsFix not initialized');
                this.fixes.push(() => {
                    window.dashboardButtonsFix.setupAllButtons();
                    console.log('🔧 Initialized DashboardButtonsFix');
                });
            }
        }

        if (!window.navigationManager) {
            this.issues.push('❌ NavigationManager service missing');
        } else {
            console.log('✅ NavigationManager service available');
        }

        if (!window.demoDataGenerator) {
            this.issues.push('⚠️ DemoDataGenerator service missing');
        } else {
            console.log('✅ DemoDataGenerator service available');
        }
    }

    checkEventListeners() {
        console.log('👂 Checking event listeners...');
        
        const buttonsToCheck = [
            'take-assessment-btn',
            'log-mood-btn',
            'create-meal-plan-btn',
            'nav-logout-btn'
        ];

        buttonsToCheck.forEach(buttonId => {
            const button = document.getElementById(buttonId);
            if (button) {
                // Try to detect if event listeners are attached
                const hasListeners = button.onclick || 
                    (button._events && Object.keys(button._events).length > 0) ||
                    button.hasAttribute('data-listener-attached');
                
                if (!hasListeners) {
                    this.issues.push(`⚠️ Button may not have event listeners: ${buttonId}`);
                }
            }
        });
    }

    checkInitialization() {
        console.log('🚀 Checking initialization...');
        
        // Check if scripts are loaded
        const requiredScripts = [
            'dashboard-buttons-fix.js',
            'js/navigation-manager.js'
        ];

        requiredScripts.forEach(scriptSrc => {
            const script = document.querySelector(`script[src*="${scriptSrc}"]`);
            if (!script) {
                this.issues.push(`❌ Script not loaded: ${scriptSrc}`);
            } else {
                console.log(`✅ Script loaded: ${scriptSrc}`);
            }
        });
    }

    reportResults() {
        console.log('\n📊 DIAGNOSTIC RESULTS:');
        console.log('='.repeat(50));
        
        if (this.issues.length === 0) {
            console.log('✅ No issues found! Dashboard should be working correctly.');
        } else {
            console.log(`Found ${this.issues.length} issues:`);
            this.issues.forEach(issue => console.log(issue));
        }
        
        if (this.fixes.length > 0) {
            console.log(`\n🔧 ${this.fixes.length} fixes available`);
        }
        
        console.log('='.repeat(50));
    }

    applyFixes() {
        if (this.fixes.length > 0) {
            console.log('🔧 Applying fixes...');
            this.fixes.forEach((fix, index) => {
                try {
                    fix();
                    console.log(`✅ Fix ${index + 1} applied successfully`);
                } catch (error) {
                    console.log(`❌ Fix ${index + 1} failed:`, error);
                }
            });
        }
    }

    forceInitializeButtons() {
        console.log('🔧 Force initializing all dashboard buttons...');
        
        // Create dashboard buttons fix if missing
        if (!window.dashboardButtonsFix) {
            window.dashboardButtonsFix = new DashboardButtonsFix();
        }
        
        // Force setup
        window.dashboardButtonsFix.setupAllButtons();
        
        // Manually connect critical buttons if needed
        this.manuallyConnectButtons();
        
        console.log('✅ Force initialization complete');
    }

    manuallyConnectButtons() {
        console.log('🔗 Manually connecting critical buttons...');
        
        // Risk Assessment Button
        const takeAssessmentBtn = document.getElementById('take-assessment-btn');
        if (takeAssessmentBtn && window.dashboardButtonsFix) {
            takeAssessmentBtn.onclick = (e) => {
                e.preventDefault();
                window.dashboardButtonsFix.handleTakeAssessment();
            };
            takeAssessmentBtn.setAttribute('data-listener-attached', 'true');
            console.log('✅ Risk assessment button manually connected');
        }

        // Mood Log Button
        const logMoodBtn = document.getElementById('log-mood-btn');
        if (logMoodBtn && window.dashboardButtonsFix) {
            logMoodBtn.onclick = (e) => {
                e.preventDefault();
                window.dashboardButtonsFix.handleLogMood();
            };
            logMoodBtn.setAttribute('data-listener-attached', 'true');
            console.log('✅ Mood log button manually connected');
        }

        // Create Meal Plan Button
        const createMealPlanBtn = document.getElementById('create-meal-plan-btn');
        if (createMealPlanBtn && window.dashboardButtonsFix) {
            createMealPlanBtn.onclick = (e) => {
                e.preventDefault();
                window.dashboardButtonsFix.handleCreateMealPlan();
            };
            createMealPlanBtn.setAttribute('data-listener-attached', 'true');
            console.log('✅ Create meal plan button manually connected');
        }

        // View Nutrition Button
        const viewNutritionBtn = document.getElementById('view-nutrition-btn');
        if (viewNutritionBtn && window.dashboardButtonsFix) {
            viewNutritionBtn.onclick = (e) => {
                e.preventDefault();
                window.dashboardButtonsFix.handleViewNutrition();
            };
            viewNutritionBtn.setAttribute('data-listener-attached', 'true');
            console.log('✅ View nutrition button manually connected');
        }

        // Navigation Logout Button
        const navLogoutBtn = document.getElementById('nav-logout-btn');
        if (navLogoutBtn && window.navigationManager) {
            navLogoutBtn.onclick = (e) => {
                e.preventDefault();
                window.navigationManager.logout();
            };
            navLogoutBtn.setAttribute('data-listener-attached', 'true');
            console.log('✅ Navigation logout button manually connected');
        }

        // AI Insights Button
        const getStartedBtn = document.getElementById('get-started-insights-btn');
        if (getStartedBtn && window.dashboardButtonsFix) {
            getStartedBtn.onclick = (e) => {
                e.preventDefault();
                window.dashboardButtonsFix.handleGetStartedInsights();
            };
            getStartedBtn.setAttribute('data-listener-attached', 'true');
            console.log('✅ AI insights button manually connected');
        }

        // View Mood History Button
        const viewMoodHistoryBtn = document.getElementById('view-mood-history-btn');
        if (viewMoodHistoryBtn && window.dashboardButtonsFix) {
            viewMoodHistoryBtn.onclick = (e) => {
                e.preventDefault();
                window.dashboardButtonsFix.handleViewMoodHistory();
            };
            viewMoodHistoryBtn.setAttribute('data-listener-attached', 'true');
            console.log('✅ View mood history button manually connected');
        }

        // Refresh Insights Button
        const refreshInsightsBtn = document.getElementById('refresh-insights-btn');
        if (refreshInsightsBtn && window.dashboardButtonsFix) {
            refreshInsightsBtn.onclick = (e) => {
                e.preventDefault();
                window.dashboardButtonsFix.handleRefreshInsights();
            };
            refreshInsightsBtn.setAttribute('data-listener-attached', 'true');
            console.log('✅ Refresh insights button manually connected');
        }
    }

    testAllButtons() {
        console.log('🧪 Testing all dashboard buttons...');
        
        const buttons = [
            'take-assessment-btn',
            'log-mood-btn',
            'view-mood-history-btn', 
            'create-meal-plan-btn',
            'view-nutrition-btn',
            'get-started-insights-btn'
        ];

        buttons.forEach(buttonId => {
            const button = document.getElementById(buttonId);
            if (button) {
                console.log(`🔘 Testing ${buttonId}...`);
                try {
                    // Simulate click
                    button.click();
                    console.log(`✅ ${buttonId} responded to click`);
                } catch (error) {
                    console.log(`❌ ${buttonId} failed:`, error);
                }
            } else {
                console.log(`❌ ${buttonId} not found`);
            }
        });
    }
}

// Initialize diagnostics
window.dashboardDiagnostics = new DashboardDiagnostics();

// Auto-run diagnostics when dashboard becomes active
document.addEventListener('DOMContentLoaded', () => {
    // Run initial diagnostics
    setTimeout(() => {
        if (window.dashboardDiagnostics) {
            window.dashboardDiagnostics.runDiagnostics();
        }
    }, 2000);
    
    // Watch for dashboard activation
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                const target = mutation.target;
                if (target.id === 'dashboard-page' && target.classList.contains('active')) {
                    console.log('📊 Dashboard activated, running diagnostics...');
                    setTimeout(() => {
                        if (window.dashboardDiagnostics) {
                            window.dashboardDiagnostics.runDiagnostics();
                            window.dashboardDiagnostics.forceInitializeButtons();
                        }
                    }, 500);
                }
            }
        });
    });
    
    const dashboardPage = document.getElementById('dashboard-page');
    if (dashboardPage) {
        observer.observe(dashboardPage, { attributes: true });
    }
});

console.log('🔍 Dashboard diagnostics system loaded');