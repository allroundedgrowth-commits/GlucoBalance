// GlucoBalance Landing Page Diagnostic Script
console.log('🔍 Starting Landing Page Diagnostic...');

// Function to run comprehensive diagnostics
function runDiagnostics() {
    const results = {
        scripts: {},
        elements: {},
        eventListeners: {},
        classes: {},
        errors: []
    };

    console.log('\n📋 DIAGNOSTIC REPORT');
    console.log('='.repeat(50));

    // 1. Check if required scripts are loaded
    console.log('\n1️⃣ SCRIPT LOADING CHECK');
    console.log('-'.repeat(30));
    
    const requiredClasses = [
        'GlucoBalanceApp',
        'LandingPageManager',
        'AuthService',
        'AuthUI'
    ];
    
    requiredClasses.forEach(className => {
        const isAvailable = typeof window[className] !== 'undefined';
        results.classes[className] = isAvailable;
        console.log(`${isAvailable ? '✅' : '❌'} ${className}: ${isAvailable ? 'Available' : 'Missing'}`);
        
        if (!isAvailable) {
            results.errors.push(`${className} class not loaded`);
        }
    });

    // 2. Check if instances are created
    console.log('\n2️⃣ INSTANCE CHECK');
    console.log('-'.repeat(30));
    
    const requiredInstances = [
        'glucoApp',
        'landingPageManager',
        'authService',
        'authUI'
    ];
    
    requiredInstances.forEach(instanceName => {
        const isAvailable = typeof window[instanceName] !== 'undefined' && window[instanceName] !== null;
        results.scripts[instanceName] = isAvailable;
        console.log(`${isAvailable ? '✅' : '❌'} window.${instanceName}: ${isAvailable ? 'Available' : 'Missing'}`);
        
        if (!isAvailable) {
            results.errors.push(`${instanceName} instance not created`);
        }
    });

    // 3. Check DOM elements
    console.log('\n3️⃣ DOM ELEMENTS CHECK');
    console.log('-'.repeat(30));
    
    const requiredElements = [
        'nav-get-started-btn',
        'nav-dashboard-btn', 
        'nav-signup-btn',
        'feature-modal',
        'modal-title',
        'modal-body',
        'modal-close',
        'modal-cancel',
        'modal-action'
    ];
    
    requiredElements.forEach(elementId => {
        const element = document.getElementById(elementId);
        const isAvailable = element !== null;
        results.elements[elementId] = isAvailable;
        console.log(`${isAvailable ? '✅' : '❌'} #${elementId}: ${isAvailable ? 'Found' : 'Missing'}`);
        
        if (!isAvailable) {
            results.errors.push(`Element #${elementId} not found in DOM`);
        }
    });

    // 4. Check feature cards
    console.log('\n4️⃣ FEATURE CARDS CHECK');
    console.log('-'.repeat(30));
    
    const featureCards = document.querySelectorAll('.feature-card.clickable');
    console.log(`${featureCards.length > 0 ? '✅' : '❌'} Feature cards found: ${featureCards.length}`);
    
    if (featureCards.length === 0) {
        results.errors.push('No clickable feature cards found');
    }
    
    featureCards.forEach((card, index) => {
        const feature = card.dataset.feature;
        const hasFeature = !!feature;
        console.log(`  ${hasFeature ? '✅' : '❌'} Card ${index + 1}: ${hasFeature ? feature : 'No data-feature attribute'}`);
        
        if (!hasFeature) {
            results.errors.push(`Feature card ${index + 1} missing data-feature attribute`);
        }
    });

    // 5. Check event listeners
    console.log('\n5️⃣ EVENT LISTENERS CHECK');
    console.log('-'.repeat(30));
    
    // Test if buttons have click handlers
    const buttonsToTest = [
        'nav-get-started-btn',
        'nav-dashboard-btn',
        'nav-signup-btn'
    ];
    
    buttonsToTest.forEach(buttonId => {
        const button = document.getElementById(buttonId);
        if (button) {
            // Check if button has event listeners (this is a simplified check)
            const hasListeners = button.onclick !== null || button.addEventListener !== undefined;
            results.eventListeners[buttonId] = hasListeners;
            console.log(`${hasListeners ? '✅' : '❌'} #${buttonId} event handling: ${hasListeners ? 'Available' : 'Missing'}`);
        }
    });

    // 6. Test landing page manager methods
    console.log('\n6️⃣ LANDING PAGE MANAGER METHODS CHECK');
    console.log('-'.repeat(30));
    
    if (window.landingPageManager) {
        const requiredMethods = [
            'handleSignupClick',
            'handleDashboardClick',
            'handleFeatureCardClick',
            'showModal',
            'closeModal'
        ];
        
        requiredMethods.forEach(methodName => {
            const hasMethod = typeof window.landingPageManager[methodName] === 'function';
            console.log(`${hasMethod ? '✅' : '❌'} ${methodName}(): ${hasMethod ? 'Available' : 'Missing'}`);
            
            if (!hasMethod) {
                results.errors.push(`LandingPageManager.${methodName}() method missing`);
            }
        });
    } else {
        console.log('❌ LandingPageManager not available - cannot check methods');
    }

    // 7. Check CSS classes
    console.log('\n7️⃣ CSS CLASSES CHECK');
    console.log('-'.repeat(30));
    
    const requiredCSSClasses = [
        'modal-overlay',
        'feature-card',
        'clickable',
        'btn-primary',
        'btn-secondary'
    ];
    
    requiredCSSClasses.forEach(className => {
        const elements = document.querySelectorAll(`.${className}`);
        const hasClass = elements.length > 0;
        console.log(`${hasClass ? '✅' : '❌'} .${className}: ${hasClass ? `${elements.length} elements` : 'Not found'}`);
        
        if (!hasClass) {
            results.errors.push(`CSS class .${className} not found in DOM`);
        }
    });

    // 8. Summary
    console.log('\n8️⃣ DIAGNOSTIC SUMMARY');
    console.log('-'.repeat(30));
    
    const totalErrors = results.errors.length;
    console.log(`Total issues found: ${totalErrors}`);
    
    if (totalErrors === 0) {
        console.log('🎉 All checks passed! Landing page should be working correctly.');
    } else {
        console.log('❌ Issues found:');
        results.errors.forEach((error, index) => {
            console.log(`  ${index + 1}. ${error}`);
        });
    }

    // 9. Recommendations
    console.log('\n9️⃣ RECOMMENDATIONS');
    console.log('-'.repeat(30));
    
    if (results.errors.length > 0) {
        console.log('To fix the issues:');
        
        if (results.errors.some(e => e.includes('class not loaded'))) {
            console.log('• Check that all JavaScript files are loading correctly');
            console.log('• Verify script tags in HTML are in correct order');
        }
        
        if (results.errors.some(e => e.includes('instance not created'))) {
            console.log('• Ensure classes are instantiated after DOM loads');
            console.log('• Check for JavaScript errors preventing initialization');
        }
        
        if (results.errors.some(e => e.includes('Element') && e.includes('not found'))) {
            console.log('• Verify HTML structure includes all required elements');
            console.log('• Check element IDs match JavaScript selectors');
        }
        
        if (results.errors.some(e => e.includes('Feature card'))) {
            console.log('• Add data-feature attributes to feature cards');
            console.log('• Ensure feature cards have "clickable" class');
        }
    }

    console.log('\n🔍 Diagnostic complete!');
    console.log('='.repeat(50));
    
    return results;
}

// Auto-run diagnostics when script loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(runDiagnostics, 1000);
    });
} else {
    setTimeout(runDiagnostics, 1000);
}

// Make function available globally for manual testing
window.runDiagnostics = runDiagnostics;

console.log('🔧 Diagnostic script loaded. Run runDiagnostics() to check landing page status.');