// Button Functionality Verification Script
console.log('🧪 Starting Button Functionality Verification...');

// Wait for DOM to be ready
function waitForDOM() {
    return new Promise(resolve => {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', resolve);
        } else {
            resolve();
        }
    });
}

// Wait for LandingPageManager to be initialized
function waitForManager() {
    return new Promise(resolve => {
        const checkManager = () => {
            if (window.landingPageManager) {
                resolve(window.landingPageManager);
            } else {
                setTimeout(checkManager, 100);
            }
        };
        checkManager();
    });
}

async function verifyButtonFunctionality() {
    await waitForDOM();
    console.log('✅ DOM is ready');

    const manager = await waitForManager();
    console.log('✅ LandingPageManager is initialized');

    const results = {
        passed: 0,
        failed: 0,
        tests: []
    };

    function test(name, condition, details = '') {
        const passed = Boolean(condition);
        results.tests.push({ name, passed, details });
        if (passed) {
            results.passed++;
            console.log(`✅ ${name}: PASS ${details ? `(${details})` : ''}`);
        } else {
            results.failed++;
            console.log(`❌ ${name}: FAIL ${details ? `(${details})` : ''}`);
        }
    }

    // Test 1: Check DOM elements exist
    console.log('\n📋 Testing DOM Elements...');
    test('Navigation Dashboard Button', document.getElementById('nav-dashboard-btn'), 'Button found in DOM');
    test('Navigation Signup Button', document.getElementById('nav-signup-btn'), 'Button found in DOM');
    test('Hero Risk Assessment Button', document.querySelector('.hero-btn.primary'), 'Primary hero button found');
    test('Hero Explore Features Button', document.querySelector('.hero-btn.secondary'), 'Secondary hero button found');
    test('Mobile Menu Toggle', document.getElementById('mobile-menu-toggle'), 'Mobile toggle found');
    test('Mobile Dashboard Button', document.getElementById('mobile-dashboard-btn'), 'Mobile dashboard button found');

    // Test 2: Check feature cards
    console.log('\n🎯 Testing Feature Cards...');
    const featureCards = document.querySelectorAll('.feature-card.clickable');
    test('Feature Cards Count', featureCards.length === 4, `Found ${featureCards.length} cards`);
    
    const expectedFeatures = ['risk-assessment', 'nutrition', 'mental-health', 'progress'];
    expectedFeatures.forEach(feature => {
        const card = document.querySelector(`[data-feature="${feature}"]`);
        test(`${feature} Card`, card, card ? 'Card found with correct data-feature' : 'Card missing');
    });

    // Test 3: Check footer links
    console.log('\n🔗 Testing Footer Links...');
    const footerLinks = ['help-center-link', 'privacy-policy-link', 'terms-link', 'contact-link'];
    footerLinks.forEach(linkId => {
        const link = document.getElementById(linkId);
        test(`Footer ${linkId}`, link, link ? 'Link found' : 'Link missing');
    });

    // Test 4: Check modal elements
    console.log('\n📱 Testing Modal Elements...');
    test('Feature Modal', document.getElementById('feature-modal'), 'Modal container found');
    test('Modal Close Button', document.getElementById('modal-close'), 'Close button found');
    test('Modal Action Button', document.getElementById('modal-action'), 'Action button found');

    // Test 5: Check manager methods
    console.log('\n⚙️ Testing Manager Methods...');
    const requiredMethods = [
        'showDashboard', 'showSignup', 'handleFeatureCardClick', 
        'showModal', 'closeModal', 'checkUserAuthentication',
        'showSignupPage', 'hideLandingPage', 'showPage'
    ];
    
    requiredMethods.forEach(method => {
        const hasMethod = typeof manager[method] === 'function';
        test(`Method: ${method}`, hasMethod, hasMethod ? 'Method exists' : 'Method missing');
    });

    // Test 6: Test event listeners by checking if they're attached
    console.log('\n👆 Testing Event Listeners...');
    
    // Test navigation buttons
    const navDashboardBtn = document.getElementById('nav-dashboard-btn');
    const navSignupBtn = document.getElementById('nav-signup-btn');
    
    if (navDashboardBtn) {
        // Check if clicking triggers expected behavior
        let dashboardCalled = false;
        const originalShowDashboard = manager.showDashboard;
        manager.showDashboard = function() {
            dashboardCalled = true;
            console.log('🎯 Dashboard method called via click');
            // Don't actually execute to avoid navigation during test
        };
        
        navDashboardBtn.click();
        test('Dashboard Button Click Handler', dashboardCalled, 'Click triggered showDashboard method');
        
        // Restore original method
        manager.showDashboard = originalShowDashboard;
    }

    if (navSignupBtn) {
        let signupCalled = false;
        const originalShowSignup = manager.showSignup;
        manager.showSignup = function() {
            signupCalled = true;
            console.log('📝 Signup method called via click');
            // Don't actually execute to avoid navigation during test
        };
        
        navSignupBtn.click();
        test('Signup Button Click Handler', signupCalled, 'Click triggered showSignup method');
        
        // Restore original method
        manager.showSignup = originalShowSignup;
    }

    // Test feature card clicks
    const riskCard = document.querySelector('[data-feature="risk-assessment"]');
    if (riskCard) {
        let featureHandlerCalled = false;
        const originalHandler = manager.handleFeatureCardClick;
        manager.handleFeatureCardClick = function(feature) {
            featureHandlerCalled = true;
            console.log(`🎯 Feature handler called for: ${feature}`);
            // Don't actually execute to avoid modal during test
        };
        
        riskCard.click();
        test('Feature Card Click Handler', featureHandlerCalled, 'Click triggered handleFeatureCardClick method');
        
        // Restore original method
        manager.handleFeatureCardClick = originalHandler;
    }

    // Test 7: Check CSS classes and styling
    console.log('\n🎨 Testing Styling and Classes...');
    featureCards.forEach((card, index) => {
        const hasClickableClass = card.classList.contains('clickable');
        const hasFeatureData = card.hasAttribute('data-feature');
        test(`Feature Card ${index + 1} Styling`, hasClickableClass && hasFeatureData, 
            `Clickable: ${hasClickableClass}, Data-feature: ${hasFeatureData}`);
    });

    // Test 8: Check accessibility attributes
    console.log('\n♿ Testing Accessibility...');
    featureCards.forEach((card, index) => {
        const hasTabIndex = card.hasAttribute('tabindex');
        const hasRole = card.hasAttribute('role');
        const hasAriaLabel = card.hasAttribute('aria-label');
        test(`Feature Card ${index + 1} Accessibility`, hasTabIndex || hasRole || hasAriaLabel, 
            `Tabindex: ${hasTabIndex}, Role: ${hasRole}, Aria-label: ${hasAriaLabel}`);
    });

    // Final results
    console.log('\n📊 Test Results Summary:');
    console.log(`✅ Passed: ${results.passed}`);
    console.log(`❌ Failed: ${results.failed}`);
    console.log(`📈 Success Rate: ${((results.passed / (results.passed + results.failed)) * 100).toFixed(1)}%`);

    if (results.failed > 0) {
        console.log('\n❌ Failed Tests:');
        results.tests.filter(t => !t.passed).forEach(test => {
            console.log(`   • ${test.name}: ${test.details}`);
        });
    }

    return results;
}

// Auto-run verification
if (typeof window !== 'undefined') {
    window.verifyButtonFunctionality = verifyButtonFunctionality;
    
    // Run automatically after a short delay
    setTimeout(() => {
        verifyButtonFunctionality().then(results => {
            console.log('🏁 Button functionality verification complete!');
            
            // Store results globally for inspection
            window.buttonTestResults = results;
        }).catch(error => {
            console.error('❌ Verification failed:', error);
        });
    }, 2000);
} else {
    // Node.js environment
    module.exports = { verifyButtonFunctionality };
}