// Navigation Fix Verification Script
console.log('🔧 Starting navigation fix verification...');

function verifyNavigationFix() {
    const results = {
        navigationExists: false,
        navigationVisible: false,
        navigationFixed: false,
        navigationOutsidePages: false,
        heroSectionMargin: false
    };

    // Check if navigation exists
    const nav = document.querySelector('.top-nav');
    results.navigationExists = !!nav;
    console.log('✅ Navigation exists:', results.navigationExists);

    if (nav) {
        // Check if navigation is visible
        const navRect = nav.getBoundingClientRect();
        results.navigationVisible = navRect.width > 0 && navRect.height > 0;
        console.log('✅ Navigation visible:', results.navigationVisible);

        // Check if navigation is fixed positioned
        const navStyles = window.getComputedStyle(nav);
        results.navigationFixed = navStyles.position === 'fixed';
        console.log('✅ Navigation fixed position:', results.navigationFixed);

        // Check if navigation is at top
        const isAtTop = navRect.top === 0 || navRect.top < 5; // Allow small margin
        console.log('✅ Navigation at top:', isAtTop);

        // Check z-index
        const zIndex = parseInt(navStyles.zIndex);
        console.log('✅ Navigation z-index:', zIndex, '(should be >= 1000)');
    }

    // Check if navigation is outside page containers
    const landingPage = document.getElementById('landing-page');
    const navInsideLanding = landingPage && landingPage.contains(nav);
    results.navigationOutsidePages = !navInsideLanding;
    console.log('✅ Navigation outside page containers:', results.navigationOutsidePages);

    // Check hero section margin
    const heroSection = document.querySelector('.hero-section');
    if (heroSection) {
        const heroStyles = window.getComputedStyle(heroSection);
        const marginTop = parseInt(heroStyles.marginTop);
        results.heroSectionMargin = marginTop >= 70;
        console.log('✅ Hero section margin-top:', marginTop + 'px', '(should be >= 70px)');
    }

    // Test page switching
    console.log('🔄 Testing page switching...');
    
    // Simulate hiding landing page
    if (landingPage) {
        landingPage.classList.remove('active');
        setTimeout(() => {
            const navAfterHide = document.querySelector('.top-nav');
            const navStillVisible = navAfterHide && navAfterHide.getBoundingClientRect().width > 0;
            console.log('✅ Navigation still visible after hiding landing page:', navStillVisible);
            
            // Restore landing page
            landingPage.classList.add('active');
        }, 100);
    }

    // Overall result
    const allPassed = Object.values(results).every(result => result === true);
    console.log('🎯 Navigation fix verification:', allPassed ? 'PASSED' : 'FAILED');
    console.log('📊 Results:', results);

    return results;
}

// Run verification when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', verifyNavigationFix);
} else {
    verifyNavigationFix();
}

// Export for manual testing
window.verifyNavigationFix = verifyNavigationFix;

// Add visual indicator
function addNavigationIndicator() {
    const indicator = document.createElement('div');
    indicator.id = 'nav-fix-indicator';
    indicator.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        background: #007FFF;
        color: white;
        padding: 10px 15px;
        border-radius: 8px;
        z-index: 2000;
        font-size: 12px;
        font-weight: bold;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        transition: all 0.3s ease;
    `;
    indicator.textContent = 'Navigation Fixed ✅';
    document.body.appendChild(indicator);

    // Auto-hide after 3 seconds
    setTimeout(() => {
        indicator.style.opacity = '0';
        indicator.style.transform = 'translateX(100%)';
        setTimeout(() => indicator.remove(), 300);
    }, 3000);
}

// Add indicator when verification passes
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        const results = verifyNavigationFix();
        const allPassed = Object.values(results).every(result => result === true);
        if (allPassed) {
            addNavigationIndicator();
        }
    }, 500);
});