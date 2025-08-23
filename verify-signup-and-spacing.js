// Verification script for signup button and spacing issues
console.log('🔍 Starting verification of signup button and spacing...');

// Test 1: Check if there's space above the menu bar
function checkSpacingAboveMenu() {
    const nav = document.querySelector('.top-nav');
    if (!nav) {
        console.error('❌ Navigation not found');
        return false;
    }
    
    const navRect = nav.getBoundingClientRect();
    const bodyRect = document.body.getBoundingClientRect();
    
    // Check if navigation starts at the top (allowing for small margins)
    const spaceAbove = navRect.top - bodyRect.top;
    
    if (spaceAbove > 5) {
        console.error(`❌ Space above menu detected: ${spaceAbove}px`);
        return false;
    } else {
        console.log('✅ No unwanted space above menu bar');
        return true;
    }
}

// Test 2: Check if signup button exists and has event listener
function checkSignupButton() {
    const signupBtn = document.getElementById('nav-signup-btn');
    if (!signupBtn) {
        console.error('❌ Signup button not found');
        return false;
    }
    
    console.log('✅ Signup button found');
    
    // Check if LandingPageManager exists
    if (!window.landingPageManager) {
        console.error('❌ LandingPageManager not initialized');
        return false;
    }
    
    console.log('✅ LandingPageManager initialized');
    
    // Check if showSignup method exists
    if (typeof window.landingPageManager.showSignup !== 'function') {
        console.error('❌ showSignup method not found');
        return false;
    }
    
    console.log('✅ showSignup method exists');
    return true;
}

// Test 3: Check if dashboard button exists and has event listener
function checkDashboardButton() {
    const dashboardBtn = document.getElementById('nav-dashboard-btn');
    if (!dashboardBtn) {
        console.error('❌ Dashboard button not found');
        return false;
    }
    
    console.log('✅ Dashboard button found');
    
    // Check if showDashboard method exists
    if (typeof window.landingPageManager.showDashboard !== 'function') {
        console.error('❌ showDashboard method not found');
        return false;
    }
    
    console.log('✅ showDashboard method exists');
    return true;
}

// Test 4: Simulate button clicks
function testButtonClicks() {
    console.log('🧪 Testing button functionality...');
    
    // Test signup button
    try {
        const signupBtn = document.getElementById('nav-signup-btn');
        if (signupBtn) {
            console.log('🔘 Testing signup button click...');
            signupBtn.click();
            
            // Check if signup page was created
            setTimeout(() => {
                const signupPage = document.getElementById('signup-page');
                if (signupPage) {
                    console.log('✅ Signup page created successfully');
                    
                    // Go back to landing page for next test
                    if (window.landingPageManager.showLandingPage) {
                        window.landingPageManager.showLandingPage();
                    }
                } else {
                    console.error('❌ Signup page not created');
                }
            }, 500);
        }
    } catch (error) {
        console.error('❌ Error testing signup button:', error);
    }
    
    // Test dashboard button
    setTimeout(() => {
        try {
            const dashboardBtn = document.getElementById('nav-dashboard-btn');
            if (dashboardBtn) {
                console.log('🔘 Testing dashboard button click...');
                dashboardBtn.click();
                
                // Check if login page was created
                setTimeout(() => {
                    const loginPage = document.getElementById('login-page');
                    if (loginPage) {
                        console.log('✅ Login page created successfully');
                        
                        // Go back to landing page
                        if (window.landingPageManager.showLandingPage) {
                            window.landingPageManager.showLandingPage();
                        }
                    } else {
                        console.error('❌ Login page not created');
                    }
                }, 500);
            }
        } catch (error) {
            console.error('❌ Error testing dashboard button:', error);
        }
    }, 1500);
}

// Run all tests
function runAllTests() {
    console.log('🚀 Running all verification tests...');
    
    const results = {
        spacing: checkSpacingAboveMenu(),
        signupButton: checkSignupButton(),
        dashboardButton: checkDashboardButton()
    };
    
    console.log('📊 Test Results:', results);
    
    const allPassed = Object.values(results).every(result => result);
    
    if (allPassed) {
        console.log('🎉 All basic tests passed! Now testing button clicks...');
        testButtonClicks();
    } else {
        console.error('❌ Some tests failed. Check the issues above.');
    }
    
    return results;
}

// Auto-run tests when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(runAllTests, 1000);
    });
} else {
    setTimeout(runAllTests, 1000);
}

// Export for manual testing
window.verifySignupAndSpacing = {
    runAllTests,
    checkSpacingAboveMenu,
    checkSignupButton,
    checkDashboardButton,
    testButtonClicks
};