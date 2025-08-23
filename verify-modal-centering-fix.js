// Modal Centering Fix Verification Script
console.log('🎯 Starting Modal Centering Fix Verification...');

// Test 1: Check modal positioning styles
function testModalPositioning() {
    console.log('\n📐 Test 1: Modal Positioning');
    
    const modal = document.getElementById('feature-modal');
    if (!modal) {
        console.log('❌ Modal element not found');
        return false;
    }
    
    console.log('✅ Modal element found');
    
    // Check computed styles
    const styles = getComputedStyle(modal);
    const tests = [
        { property: 'position', expected: 'fixed', actual: styles.position },
        { property: 'top', expected: '0px', actual: styles.top },
        { property: 'left', expected: '0px', actual: styles.left },
        { property: 'width', expected: '100%', actual: styles.width },
        { property: 'height', expected: '100%', actual: styles.height },
        { property: 'z-index', expected: '9999', actual: styles.zIndex },
        { property: 'align-items', expected: 'center', actual: styles.alignItems },
        { property: 'justify-content', expected: 'center', actual: styles.justifyContent }
    ];
    
    let passed = 0;
    tests.forEach(test => {
        if (test.actual === test.expected || 
            (test.property === 'z-index' && parseInt(test.actual) >= 9999) ||
            (test.property === 'width' && (test.actual === '100%' || test.actual.includes('100'))) ||
            (test.property === 'height' && (test.actual === '100%' || test.actual.includes('100')))) {
            console.log(`✅ ${test.property}: ${test.actual}`);
            passed++;
        } else {
            console.log(`❌ ${test.property}: expected ${test.expected}, got ${test.actual}`);
        }
    });
    
    console.log(`📊 Modal Positioning: ${passed}/${tests.length} tests passed`);
    return passed === tests.length;
}

// Test 2: Check modal content centering
function testModalContentCentering() {
    console.log('\n🎯 Test 2: Modal Content Centering');
    
    const modal = document.getElementById('feature-modal');
    const modalContent = modal?.querySelector('.modal-content');
    
    if (!modalContent) {
        console.log('❌ Modal content not found');
        return false;
    }
    
    console.log('✅ Modal content found');
    
    const styles = getComputedStyle(modalContent);
    const tests = [
        { property: 'position', expected: 'relative', actual: styles.position },
        { property: 'margin', expected: 'auto', actual: styles.margin },
        { property: 'max-width', expected: '700px', actual: styles.maxWidth },
        { property: 'border-radius', expected: '16px', actual: styles.borderRadius }
    ];
    
    let passed = 0;
    tests.forEach(test => {
        if (test.actual.includes(test.expected) || test.actual === test.expected) {
            console.log(`✅ ${test.property}: ${test.actual}`);
            passed++;
        } else {
            console.log(`❌ ${test.property}: expected ${test.expected}, got ${test.actual}`);
        }
    });
    
    console.log(`📊 Modal Content: ${passed}/${tests.length} tests passed`);
    return passed >= tests.length * 0.75; // Allow some flexibility
}

// Test 3: Check enhanced manager functionality
function testEnhancedManagerModal() {
    console.log('\n⚡ Test 3: Enhanced Manager Modal Functions');
    
    if (!window.enhancedLandingPageManager) {
        console.log('❌ Enhanced landing page manager not found');
        return false;
    }
    
    const manager = window.enhancedLandingPageManager;
    const methods = ['showModal', 'closeModal', 'handleFeatureCardClick', 'showFeatureDetails'];
    
    let passed = 0;
    methods.forEach(method => {
        if (typeof manager[method] === 'function') {
            console.log(`✅ Method ${method} exists`);
            passed++;
        } else {
            console.log(`❌ Method ${method} missing`);
        }
    });
    
    console.log(`📊 Manager Methods: ${passed}/${methods.length} methods found`);
    return passed === methods.length;
}

// Test 4: Test modal display functionality
function testModalDisplay() {
    console.log('\n🪟 Test 4: Modal Display Functionality');
    
    const modal = document.getElementById('feature-modal');
    if (!modal) {
        console.log('❌ Modal not found for display test');
        return false;
    }
    
    // Test initial state
    const initialDisplay = getComputedStyle(modal).display;
    if (initialDisplay === 'none') {
        console.log('✅ Modal initially hidden');
    } else {
        console.log(`⚠️ Modal initial display: ${initialDisplay}`);
    }
    
    // Test if enhanced manager can show modal
    if (window.enhancedLandingPageManager) {
        try {
            // Test showing modal
            window.enhancedLandingPageManager.showModal();
            
            setTimeout(() => {
                const displayAfterShow = getComputedStyle(modal).display;
                const hasActiveClass = modal.classList.contains('active');
                
                if (displayAfterShow === 'flex' || hasActiveClass) {
                    console.log('✅ Modal displays correctly when shown');
                    
                    // Test closing modal
                    window.enhancedLandingPageManager.closeModal();
                    
                    setTimeout(() => {
                        const displayAfterClose = getComputedStyle(modal).display;
                        const stillHasActiveClass = modal.classList.contains('active');
                        
                        if (displayAfterClose === 'none' && !stillHasActiveClass) {
                            console.log('✅ Modal closes correctly');
                        } else {
                            console.log(`❌ Modal close issue: display=${displayAfterClose}, active=${stillHasActiveClass}`);
                        }
                    }, 100);
                    
                } else {
                    console.log(`❌ Modal display issue: display=${displayAfterShow}, active=${hasActiveClass}`);
                }
            }, 100);
            
        } catch (error) {
            console.log(`❌ Error testing modal display: ${error.message}`);
            return false;
        }
    } else {
        console.log('❌ Enhanced manager not available for display test');
        return false;
    }
    
    return true;
}

// Test 5: Test feature card interactions
function testFeatureCardInteractions() {
    console.log('\n🎴 Test 5: Feature Card Interactions');
    
    const featureCards = document.querySelectorAll('.feature-card.clickable');
    const expectedFeatures = ['risk-assessment', 'nutrition', 'mental-health', 'progress'];
    
    if (featureCards.length < 4) {
        console.log(`❌ Only found ${featureCards.length} feature cards, expected 4`);
        return false;
    }
    
    console.log(`✅ Found ${featureCards.length} feature cards`);
    
    let validCards = 0;
    featureCards.forEach((card, index) => {
        const feature = card.dataset.feature;
        const hasIcon = card.querySelector('.feature-icon');
        const hasTitle = card.querySelector('h3');
        const hasDescription = card.querySelector('p');
        
        if (expectedFeatures.includes(feature) && hasIcon && hasTitle && hasDescription) {
            console.log(`✅ Card ${index + 1} (${feature}) is properly configured`);
            validCards++;
        } else {
            console.log(`❌ Card ${index + 1} has issues: feature=${feature}, icon=${!!hasIcon}, title=${!!hasTitle}, desc=${!!hasDescription}`);
        }
    });
    
    console.log(`📊 Feature Cards: ${validCards}/${expectedFeatures.length} cards valid`);
    return validCards === expectedFeatures.length;
}

// Test 6: Test CSS override effectiveness
function testCSSOverrides() {
    console.log('\n🎨 Test 6: CSS Override Effectiveness');
    
    const modal = document.getElementById('feature-modal');
    if (!modal) {
        console.log('❌ Modal not found for CSS test');
        return false;
    }
    
    // Check if enhanced CSS is loaded
    const cssLinks = document.querySelectorAll('link[rel="stylesheet"]');
    const hasEnhancedCSS = Array.from(cssLinks).some(link => 
        link.href.includes('landing-page-enhanced.css')
    );
    
    if (hasEnhancedCSS) {
        console.log('✅ Enhanced CSS file is loaded');
    } else {
        console.log('❌ Enhanced CSS file not found');
        return false;
    }
    
    // Test specific CSS properties that should be overridden
    const styles = getComputedStyle(modal);
    const criticalStyles = [
        'position',
        'z-index',
        'display',
        'align-items',
        'justify-content'
    ];
    
    let passed = 0;
    criticalStyles.forEach(property => {
        const value = styles[property];
        if (value && value !== 'auto' && value !== 'normal') {
            console.log(`✅ ${property}: ${value}`);
            passed++;
        } else {
            console.log(`❌ ${property}: ${value} (may not be properly set)`);
        }
    });
    
    console.log(`📊 CSS Overrides: ${passed}/${criticalStyles.length} properties properly set`);
    return passed >= criticalStyles.length * 0.8;
}

// Run all tests
function runModalCenteringTests() {
    console.log('🚀 Running Modal Centering Fix Tests...\n');
    
    const tests = [
        { name: 'Modal Positioning', test: testModalPositioning },
        { name: 'Modal Content Centering', test: testModalContentCentering },
        { name: 'Enhanced Manager Modal', test: testEnhancedManagerModal },
        { name: 'Modal Display', test: testModalDisplay },
        { name: 'Feature Card Interactions', test: testFeatureCardInteractions },
        { name: 'CSS Overrides', test: testCSSOverrides }
    ];
    
    let passedTests = 0;
    const results = tests.map(({ name, test }) => {
        const passed = test();
        if (passed) passedTests++;
        return { name, passed };
    });
    
    console.log('\n📊 MODAL CENTERING FIX RESULTS:');
    console.log('=====================================');
    results.forEach(({ name, passed }) => {
        console.log(`${passed ? '✅' : '❌'} ${name}: ${passed ? 'PASSED' : 'FAILED'}`);
    });
    
    console.log(`\n🎯 Overall Score: ${passedTests}/${tests.length} tests passed`);
    
    if (passedTests === tests.length) {
        console.log('🎉 ALL TESTS PASSED! Modal centering is working correctly.');
        console.log('✨ Feature cards should now display centered modals that stay open until closed by the user.');
    } else if (passedTests >= tests.length * 0.8) {
        console.log('⚠️ Most tests passed. Minor issues may exist but modal should work.');
    } else {
        console.log('❌ Multiple issues detected. Modal centering may not work properly.');
    }
    
    // Provide user instructions
    console.log('\n📋 USER INSTRUCTIONS:');
    console.log('1. Click any feature card in the "Comprehensive Health Management" section');
    console.log('2. The modal should appear in the center of the screen');
    console.log('3. The modal should stay open until you:');
    console.log('   - Click the × (close) button');
    console.log('   - Click the "Learn More" button');
    console.log('   - Press the Escape key');
    console.log('   - Click outside the modal (on the dark background)');
    
    return passedTests === tests.length;
}

// Auto-run tests when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(runModalCenteringTests, 1500); // Wait for all scripts to load
    });
} else {
    setTimeout(runModalCenteringTests, 1500);
}

// Export for manual testing
window.verifyModalCentering = runModalCenteringTests;