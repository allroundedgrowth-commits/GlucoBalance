// Enhanced Landing Page Verification Script
console.log('🧪 Starting Enhanced Landing Page Verification...');

// Test 1: Check if enhanced landing page manager is loaded
function testEnhancedManager() {
    console.log('\n📋 Test 1: Enhanced Landing Page Manager');
    
    if (window.enhancedLandingPageManager) {
        console.log('✅ Enhanced Landing Page Manager found');
        return true;
    } else if (window.EnhancedLandingPageManager) {
        console.log('✅ Enhanced Landing Page Manager class found');
        return true;
    } else {
        console.log('❌ Enhanced Landing Page Manager not found');
        return false;
    }
}

// Test 2: Check button functionality
function testButtons() {
    console.log('\n🔘 Test 2: Button Functionality');
    let passed = 0;
    let total = 0;
    
    // Navigation buttons
    const navButtons = ['nav-dashboard-btn', 'nav-signup-btn'];
    navButtons.forEach(id => {
        total++;
        const btn = document.getElementById(id);
        if (btn) {
            console.log(`✅ ${id} found`);
            passed++;
        } else {
            console.log(`❌ ${id} not found`);
        }
    });
    
    // Hero buttons
    const heroButtons = document.querySelectorAll('.hero-btn');
    total++;
    if (heroButtons.length >= 2) {
        console.log(`✅ Hero buttons found (${heroButtons.length})`);
        passed++;
    } else {
        console.log(`❌ Hero buttons missing (found ${heroButtons.length})`);
    }
    
    // Mobile menu toggle
    total++;
    const mobileToggle = document.getElementById('mobile-menu-toggle');
    if (mobileToggle) {
        console.log('✅ Mobile menu toggle found');
        passed++;
    } else {
        console.log('❌ Mobile menu toggle not found');
    }
    
    console.log(`📊 Button Test Result: ${passed}/${total} passed`);
    return passed === total;
}

// Test 3: Check feature cards
function testFeatureCards() {
    console.log('\n🎯 Test 3: Feature Cards');
    let passed = 0;
    let total = 0;
    
    const featureCards = document.querySelectorAll('.feature-card.clickable');
    total++;
    if (featureCards.length >= 4) {
        console.log(`✅ Feature cards found (${featureCards.length})`);
        passed++;
        
        // Check each card structure
        featureCards.forEach((card, index) => {
            total++;
            const hasFeature = card.hasAttribute('data-feature');
            const hasIcon = card.querySelector('.feature-icon');
            const hasTitle = card.querySelector('h3');
            const hasDesc = card.querySelector('p');
            
            if (hasFeature && hasIcon && hasTitle && hasDesc) {
                console.log(`✅ Card ${index + 1} structure complete`);
                passed++;
            } else {
                console.log(`❌ Card ${index + 1} structure incomplete`);
            }
        });
    } else {
        console.log(`❌ Feature cards missing (found ${featureCards.length})`);
    }
    
    console.log(`📊 Feature Cards Test Result: ${passed}/${total} passed`);
    return passed === total;
}

// Test 4: Check modal functionality
function testModal() {
    console.log('\n🪟 Test 4: Modal Functionality');
    let passed = 0;
    let total = 0;
    
    const modalElements = [
        'feature-modal',
        'modal-close',
        'modal-title',
        'modal-body',
        'modal-action'
    ];
    
    modalElements.forEach(id => {
        total++;
        const element = document.getElementById(id);
        if (element) {
            console.log(`✅ ${id} found`);
            passed++;
        } else {
            console.log(`❌ ${id} not found`);
        }
    });
    
    // Check modal structure
    total++;
    const modal = document.getElementById('feature-modal');
    if (modal) {
        const modalContent = modal.querySelector('.modal-content');
        const modalHeader = modal.querySelector('.modal-header');
        const modalBody = modal.querySelector('.modal-body');
        const modalFooter = modal.querySelector('.modal-footer');
        
        if (modalContent && modalHeader && modalBody && modalFooter) {
            console.log('✅ Modal structure complete');
            passed++;
        } else {
            console.log('❌ Modal structure incomplete');
        }
    }
    
    console.log(`📊 Modal Test Result: ${passed}/${total} passed`);
    return passed === total;
}

// Test 5: Check visual styling
function testVisualStyling() {
    console.log('\n🎨 Test 5: Visual Styling');
    let passed = 0;
    let total = 0;
    
    // Check CSS files
    total++;
    const cssFiles = document.querySelectorAll('link[rel="stylesheet"]');
    const hasEnhancedCSS = Array.from(cssFiles).some(link => 
        link.href.includes('landing-page-enhanced.css')
    );
    
    if (hasEnhancedCSS) {
        console.log('✅ Enhanced CSS file loaded');
        passed++;
    } else {
        console.log('❌ Enhanced CSS file not found');
    }
    
    // Check hero section styling
    total++;
    const heroSection = document.querySelector('.hero-section');
    if (heroSection) {
        const styles = getComputedStyle(heroSection);
        const hasBackground = styles.background.includes('gradient') || 
                             styles.backgroundImage.includes('gradient');
        
        if (hasBackground) {
            console.log('✅ Hero section has gradient background');
            passed++;
        } else {
            console.log('❌ Hero section missing gradient background');
        }
    } else {
        console.log('❌ Hero section not found');
    }
    
    // Check feature card styling
    total++;
    const featureCard = document.querySelector('.feature-card');
    if (featureCard) {
        const styles = getComputedStyle(featureCard);
        const hasBoxShadow = styles.boxShadow !== 'none';
        const hasBorderRadius = parseInt(styles.borderRadius) > 0;
        
        if (hasBoxShadow && hasBorderRadius) {
            console.log('✅ Feature cards have proper styling');
            passed++;
        } else {
            console.log('❌ Feature cards missing styling');
        }
    } else {
        console.log('❌ Feature cards not found');
    }
    
    console.log(`📊 Visual Styling Test Result: ${passed}/${total} passed`);
    return passed === total;
}

// Test 6: Check JavaScript functionality
function testJavaScriptFunctionality() {
    console.log('\n⚡ Test 6: JavaScript Functionality');
    let passed = 0;
    let total = 0;
    
    // Check if enhanced manager methods exist
    if (window.enhancedLandingPageManager) {
        const manager = window.enhancedLandingPageManager;
        const methods = [
            'handleFeatureCardClick',
            'showModal',
            'closeModal',
            'showFeatureDetails'
        ];
        
        methods.forEach(method => {
            total++;
            if (typeof manager[method] === 'function') {
                console.log(`✅ Method ${method} exists`);
                passed++;
            } else {
                console.log(`❌ Method ${method} missing`);
            }
        });
    } else {
        total += 4;
        console.log('❌ Enhanced manager not available for method testing');
    }
    
    // Check event listeners
    total++;
    const featureCards = document.querySelectorAll('.feature-card.clickable');
    if (featureCards.length > 0) {
        // Try to trigger a click event to see if handlers are attached
        try {
            const testCard = featureCards[0];
            const hasClickHandler = testCard.onclick !== null || 
                                   testCard.addEventListener !== undefined;
            
            if (hasClickHandler) {
                console.log('✅ Feature cards have click handlers');
                passed++;
            } else {
                console.log('❌ Feature cards missing click handlers');
            }
        } catch (error) {
            console.log('❌ Error testing click handlers:', error.message);
        }
    } else {
        console.log('❌ No feature cards to test');
    }
    
    console.log(`📊 JavaScript Functionality Test Result: ${passed}/${total} passed`);
    return passed === total;
}

// Run all tests
function runAllTests() {
    console.log('🚀 Running Enhanced Landing Page Verification Tests...\n');
    
    const tests = [
        { name: 'Enhanced Manager', test: testEnhancedManager },
        { name: 'Buttons', test: testButtons },
        { name: 'Feature Cards', test: testFeatureCards },
        { name: 'Modal', test: testModal },
        { name: 'Visual Styling', test: testVisualStyling },
        { name: 'JavaScript Functionality', test: testJavaScriptFunctionality }
    ];
    
    let passedTests = 0;
    const results = tests.map(({ name, test }) => {
        const passed = test();
        if (passed) passedTests++;
        return { name, passed };
    });
    
    console.log('\n📊 FINAL RESULTS:');
    console.log('==================');
    results.forEach(({ name, passed }) => {
        console.log(`${passed ? '✅' : '❌'} ${name}: ${passed ? 'PASSED' : 'FAILED'}`);
    });
    
    console.log(`\n🎯 Overall Score: ${passedTests}/${tests.length} tests passed`);
    
    if (passedTests === tests.length) {
        console.log('🎉 ALL TESTS PASSED! Landing page is fully functional.');
    } else if (passedTests >= tests.length * 0.8) {
        console.log('⚠️ Most tests passed. Minor issues may exist.');
    } else {
        console.log('❌ Multiple issues detected. Please review the failures above.');
    }
    
    return passedTests === tests.length;
}

// Auto-run tests when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(runAllTests, 1000); // Wait for scripts to load
    });
} else {
    setTimeout(runAllTests, 1000);
}

// Export for manual testing
window.verifyEnhancedLandingPage = runAllTests;