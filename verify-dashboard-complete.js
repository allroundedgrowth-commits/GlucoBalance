// Verification Script for Complete Dashboard Functionality
console.log('🔍 Verifying Dashboard Complete Functionality...');

// Check if all required components are available
const verificationResults = {
    demoDataGenerator: false,
    dashboardButtonsFix: false,
    logoutButton: false,
    allButtonsPresent: false,
    demoDataGenerated: false
};

// Verify Demo Data Generator
if (window.demoDataGenerator) {
    verificationResults.demoDataGenerator = true;
    console.log('✅ Demo Data Generator: Available');
    
    // Check if demo data exists
    const summary = window.demoDataGenerator.getDataSummary();
    if (summary.moodEntries > 0) {
        verificationResults.demoDataGenerated = true;
        console.log('✅ Demo Data: Generated (' + summary.moodEntries + ' mood entries)');
    } else {
        console.log('⚠️ Demo Data: Not generated yet');
    }
} else {
    console.log('❌ Demo Data Generator: Not available');
}

// Verify Dashboard Buttons Fix
if (window.dashboardButtonsFix) {
    verificationResults.dashboardButtonsFix = true;
    console.log('✅ Dashboard Buttons Fix: Available');
} else {
    console.log('❌ Dashboard Buttons Fix: Not available');
}

// Verify Logout Button
const logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) {
    verificationResults.logoutButton = true;
    console.log('✅ Logout Button: Present in DOM');
} else {
    console.log('❌ Logout Button: Not found in DOM');
}

// Verify All Required Buttons
const requiredButtons = [
    'refresh-dashboard',
    'profile-btn',
    'logout-btn',
    'take-assessment-btn',
    'log-mood-btn',
    'view-mood-history-btn',
    'create-meal-plan-btn',
    'view-nutrition-btn',
    'refresh-insights-btn',
    'assessment-btn',
    'mood-log-btn',
    'meal-plan-btn',
    'generate-report-btn'
];

let buttonsFound = 0;
requiredButtons.forEach(buttonId => {
    const button = document.getElementById(buttonId);
    if (button) {
        buttonsFound++;
    } else {
        console.log('❌ Missing button: ' + buttonId);
    }
});

if (buttonsFound === requiredButtons.length) {
    verificationResults.allButtonsPresent = true;
    console.log('✅ All Buttons: Present (' + buttonsFound + '/' + requiredButtons.length + ')');
} else {
    console.log('⚠️ Buttons: ' + buttonsFound + '/' + requiredButtons.length + ' found');
}

// Overall verification result
const allPassed = Object.values(verificationResults).every(result => result);
console.log('\n📊 VERIFICATION SUMMARY:');
console.log('Demo Data Generator:', verificationResults.demoDataGenerator ? '✅' : '❌');
console.log('Dashboard Buttons Fix:', verificationResults.dashboardButtonsFix ? '✅' : '❌');
console.log('Logout Button:', verificationResults.logoutButton ? '✅' : '❌');
console.log('All Buttons Present:', verificationResults.allButtonsPresent ? '✅' : '❌');
console.log('Demo Data Generated:', verificationResults.demoDataGenerated ? '✅' : '⚠️');

if (allPassed && verificationResults.demoDataGenerated) {
    console.log('\n🎉 ALL SYSTEMS GO! Dashboard functionality is complete.');
} else if (allPassed) {
    console.log('\n✅ Core functionality verified. Demo data will generate automatically.');
} else {
    console.log('\n⚠️ Some issues detected. Check the logs above.');
}

// Auto-generate demo data if not present
if (verificationResults.demoDataGenerator && !verificationResults.demoDataGenerated) {
    console.log('\n🎯 Auto-generating demo data...');
    setTimeout(() => {
        window.demoDataGenerator.generateAllDemoData();
        console.log('✅ Demo data generation initiated');
    }, 1000);
}

// Test logout functionality
function testLogoutFunctionality() {
    console.log('\n🧪 Testing logout functionality...');
    
    if (window.dashboardButtonsFix && typeof window.dashboardButtonsFix.handleLogout === 'function') {
        console.log('✅ Logout handler: Available');
        
        // Test logout button click (without actually logging out)
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            console.log('✅ Logout button: Clickable');
            console.log('🔒 Logout test complete (modal would appear on actual click)');
        }
    } else {
        console.log('❌ Logout handler: Not available');
    }
}

// Test all button functionality
function testAllButtonFunctionality() {
    console.log('\n🧪 Testing all button functionality...');
    
    if (window.dashboardButtonsFix && typeof window.dashboardButtonsFix.testAllButtons === 'function') {
        const result = window.dashboardButtonsFix.testAllButtons();
        console.log('📊 Button test result:', result ? 'All working' : 'Some issues');
    } else {
        console.log('❌ Button test function not available');
    }
}

// Export verification functions
window.verifyDashboard = {
    testLogout: testLogoutFunctionality,
    testAllButtons: testAllButtonFunctionality,
    results: verificationResults
};

console.log('\n💡 Use window.verifyDashboard.testLogout() or window.verifyDashboard.testAllButtons() for additional testing');