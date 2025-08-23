// Quick Dashboard Button Verification Script
console.log('🔍 Starting quick dashboard button verification...');

function quickVerifyDashboardButtons() {
    const results = {
        services: {},
        buttons: {},
        overall: 'unknown'
    };

    // Check Services
    console.log('🔧 Checking services...');
    results.services.dashboardButtonsFix = !!window.dashboardButtonsFix;
    results.services.navigationManager = !!window.navigationManager;
    results.services.demoDataGenerator = !!window.demoDataGenerator;
    results.services.dashboardDiagnostics = !!window.dashboardDiagnostics;

    console.log('Services status:', results.services);

    // Check Critical Buttons
    console.log('🔘 Checking critical buttons...');
    const criticalButtons = [
        'take-assessment-btn',
        'log-mood-btn',
        'create-meal-plan-btn',
        'view-nutrition-btn',
        'get-started-insights-btn',
        'nav-logout-btn'
    ];

    let foundButtons = 0;
    criticalButtons.forEach(buttonId => {
        const button = document.getElementById(buttonId);
        results.buttons[buttonId] = !!button;
        if (button) {
            foundButtons++;
            console.log(`✅ ${buttonId}: Found`);
        } else {
            console.log(`❌ ${buttonId}: Missing`);
        }
    });

    // Overall Assessment
    const serviceScore = Object.values(results.services).filter(Boolean).length / Object.keys(results.services).length;
    const buttonScore = foundButtons / criticalButtons.length;
    const overallScore = (serviceScore + buttonScore) / 2;

    if (overallScore >= 0.9) {
        results.overall = 'excellent';
        console.log('✅ Dashboard buttons are working excellently!');
    } else if (overallScore >= 0.7) {
        results.overall = 'good';
        console.log('⚠️ Dashboard buttons are mostly working, minor issues detected');
    } else {
        results.overall = 'needs_attention';
        console.log('❌ Dashboard buttons need attention, multiple issues detected');
    }

    // Auto-fix if needed
    if (results.overall !== 'excellent') {
        console.log('🔧 Attempting auto-fix...');
        
        // Initialize missing services
        if (!window.dashboardButtonsFix) {
            try {
                window.dashboardButtonsFix = new DashboardButtonsFix();
                console.log('✅ Created DashboardButtonsFix instance');
            } catch (error) {
                console.log('❌ Failed to create DashboardButtonsFix:', error);
            }
        }

        // Force setup buttons
        if (window.dashboardButtonsFix && !window.dashboardButtonsFix.isInitialized) {
            try {
                window.dashboardButtonsFix.setupAllButtons();
                console.log('✅ Force initialized dashboard buttons');
            } catch (error) {
                console.log('❌ Failed to initialize buttons:', error);
            }
        }

        // Use diagnostics if available
        if (window.dashboardDiagnostics) {
            try {
                window.dashboardDiagnostics.forceInitializeButtons();
                console.log('✅ Applied diagnostic fixes');
            } catch (error) {
                console.log('❌ Failed to apply diagnostic fixes:', error);
            }
        }
    }

    console.log('📊 Quick verification completed');
    return results;
}

// Run verification when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(quickVerifyDashboardButtons, 1000);
    });
} else {
    setTimeout(quickVerifyDashboardButtons, 1000);
}

// Export for manual testing
window.quickVerifyDashboardButtons = quickVerifyDashboardButtons;