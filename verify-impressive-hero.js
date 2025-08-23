// Verification script for impressive hero section
console.log('🎨 Starting Impressive Hero Section Verification...');

// Test 1: Check if hero section exists and has proper styling
function testHeroSection() {
    const heroSection = document.querySelector('.hero-section');
    if (!heroSection) {
        console.error('❌ Hero section not found');
        return false;
    }
    
    const computedStyle = window.getComputedStyle(heroSection);
    const hasGradient = computedStyle.background.includes('gradient') || 
                       computedStyle.backgroundImage.includes('gradient');
    
    console.log(hasGradient ? '✅ Hero section has gradient background' : '❌ Hero section missing gradient');
    return hasGradient;
}

// Test 2: Verify text colors (white and light blue only)
function testTextColors() {
    const titleWords = document.querySelectorAll('.title-word');
    let correctColors = true;
    
    titleWords.forEach((word, index) => {
        const computedStyle = window.getComputedStyle(word);
        const color = computedStyle.color;
        
        // Check for white (rgb(255, 255, 255)) or light blue variations
        const isWhite = color.includes('255, 255, 255') || color.includes('white');
        const isLightBlue = color.includes('64, 224, 255') || color.includes('#40E0FF') || 
                           color.includes('40E0FF') || color.includes('rgb(64, 224, 255)');
        
        if (!isWhite && !isLightBlue) {
            console.error(`❌ Title word ${index + 1} has incorrect color: ${color}`);
            correctColors = false;
        } else {
            console.log(`✅ Title word ${index + 1} has correct color: ${color}`);
        }
    });
    
    return correctColors;
}

// Test 3: Verify single line layout
function testSingleLineTitle() {
    const titleLine = document.querySelector('.title-line');
    if (!titleLine) {
        console.error('❌ Title line element not found');
        return false;
    }
    
    const computedStyle = window.getComputedStyle(titleLine);
    const whiteSpace = computedStyle.whiteSpace;
    
    if (whiteSpace === 'nowrap') {
        console.log('✅ Title line set to nowrap for single line display');
        return true;
    } else {
        console.error(`❌ Title line whitespace is ${whiteSpace}, should be nowrap`);
        return false;
    }
}

// Test 4: Verify no icons in hero section
function testNoIcons() {
    const heroSection = document.querySelector('.hero-section');
    const iconSelectors = [
        '.icon', '.fa', '.fas', '.far', '.fab', '.material-icons',
        '[class*="icon-"]', '[class*="fa-"]'
    ];
    
    let iconCount = 0;
    iconSelectors.forEach(selector => {
        const icons = heroSection.querySelectorAll(selector);
        iconCount += icons.length;
    });
    
    // Also check for emoji or symbol characters that might be icons
    const textContent = heroSection.textContent;
    const hasEmojiIcons = /[🎯🍎💙📊🔥⚡🌟💡🚀🎨🔬📈]/g.test(textContent);
    
    if (iconCount === 0 && !hasEmojiIcons) {
        console.log('✅ No icons found in hero section');
        return true;
    } else {
        console.error(`❌ Found ${iconCount} icon elements and emoji icons: ${hasEmojiIcons}`);
        return false;
    }
}

// Test 5: Check visual effects and animations
function testVisualEffects() {
    const heroBackground = document.querySelector('.hero-background');
    const heroGradient = document.querySelector('.hero-gradient');
    const heroPattern = document.querySelector('.hero-pattern');
    const pulseRings = document.querySelectorAll('.pulse-ring');
    
    let effectsPresent = true;
    
    if (!heroBackground) {
        console.error('❌ Hero background element missing');
        effectsPresent = false;
    }
    
    if (!heroGradient) {
        console.error('❌ Hero gradient element missing');
        effectsPresent = false;
    }
    
    if (!heroPattern) {
        console.error('❌ Hero pattern element missing');
        effectsPresent = false;
    }
    
    if (pulseRings.length === 0) {
        console.error('❌ Pulse ring animations missing');
        effectsPresent = false;
    } else {
        console.log(`✅ Found ${pulseRings.length} pulse ring animations`);
    }
    
    return effectsPresent;
}

// Test 6: Verify responsive behavior
function testResponsive() {
    const heroTitle = document.querySelector('.hero-title');
    const titleLine = document.querySelector('.title-line');
    
    if (!heroTitle || !titleLine) {
        console.error('❌ Hero title elements missing');
        return false;
    }
    
    // Test at different viewport widths
    const originalWidth = window.innerWidth;
    
    // Simulate mobile width
    Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375
    });
    
    // Trigger resize event
    window.dispatchEvent(new Event('resize'));
    
    // Check if title is still readable
    const rect = titleLine.getBoundingClientRect();
    const isVisible = rect.width > 0 && rect.height > 0;
    
    // Restore original width
    Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: originalWidth
    });
    
    window.dispatchEvent(new Event('resize'));
    
    if (isVisible) {
        console.log('✅ Title remains visible on mobile viewport');
        return true;
    } else {
        console.error('❌ Title not visible on mobile viewport');
        return false;
    }
}

// Run all tests
function runAllTests() {
    console.log('\n🧪 Running Impressive Hero Section Tests...\n');
    
    const tests = [
        { name: 'Hero Section Styling', test: testHeroSection },
        { name: 'Text Colors (White & Light Blue)', test: testTextColors },
        { name: 'Single Line Title', test: testSingleLineTitle },
        { name: 'No Icons Present', test: testNoIcons },
        { name: 'Visual Effects & Animations', test: testVisualEffects },
        { name: 'Responsive Design', test: testResponsive }
    ];
    
    let passedTests = 0;
    const totalTests = tests.length;
    
    tests.forEach((testCase, index) => {
        console.log(`\n${index + 1}. Testing ${testCase.name}...`);
        try {
            const result = testCase.test();
            if (result) {
                passedTests++;
                console.log(`   ✅ PASSED`);
            } else {
                console.log(`   ❌ FAILED`);
            }
        } catch (error) {
            console.error(`   ❌ ERROR: ${error.message}`);
        }
    });
    
    console.log(`\n📊 Test Results: ${passedTests}/${totalTests} tests passed`);
    
    if (passedTests === totalTests) {
        console.log('🎉 All tests passed! Impressive hero section is working correctly.');
    } else {
        console.log('⚠️  Some tests failed. Please review the implementation.');
    }
    
    return passedTests === totalTests;
}

// Auto-run tests when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runAllTests);
} else {
    runAllTests();
}

// Export for manual testing
window.verifyImpressiveHero = runAllTests;