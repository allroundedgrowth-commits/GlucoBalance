// Navigation Visibility Fix
class NavigationVisibilityFixer {
    constructor() {
        this.init();
    }

    init() {
        console.log('🧭 Initializing Navigation Visibility Fixer...');
        
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.applyFixes());
        } else {
            this.applyFixes();
        }
    }

    applyFixes() {
        console.log('🔧 Applying navigation visibility fixes...');
        
        this.fixNavigationZIndex();
        this.fixScrollBehavior();
        this.addScrollListener();
        this.fixMobileNavigation();
        this.ensureNavigationAlwaysVisible();
        this.addNavigationStyles();
        
        console.log('✅ Navigation visibility fixes applied successfully');
    }

    fixNavigationZIndex() {
        const topNav = document.querySelector('.top-nav');
        if (topNav) {
            // Ensure navigation has the highest z-index
            topNav.style.zIndex = '9999';
            topNav.style.position = 'fixed';
            topNav.style.top = '0';
            topNav.style.left = '0';
            topNav.style.right = '0';
            topNav.style.width = '100%';
            
            console.log('✅ Navigation z-index fixed');
        } else {
            console.warn('⚠️ Top navigation element not found');
        }
    }

    fixScrollBehavior() {
        // Fix smooth scrolling to account for fixed navigation
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                
                const targetId = anchor.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    const navHeight = this.getNavigationHeight();
                    const targetPosition = targetElement.offsetTop - navHeight - 20; // Extra padding
                    
                    window.scrollTo({
                        top: Math.max(0, targetPosition),
                        behavior: 'smooth'
                    });
                    
                    console.log(`📍 Scrolled to ${targetId} with nav offset`);
                }
            });
        });
        
        console.log('✅ Scroll behavior fixed');
    }

    addScrollListener() {
        let lastScrollY = window.scrollY;
        let ticking = false;

        const updateNavigation = () => {
            const topNav = document.querySelector('.top-nav');
            if (!topNav) return;

            const currentScrollY = window.scrollY;
            
            // Add scrolled class for styling
            if (currentScrollY > 50) {
                topNav.classList.add('scrolled');
            } else {
                topNav.classList.remove('scrolled');
            }
            
            // Ensure navigation is always visible (no hiding on scroll)
            topNav.style.transform = 'translateY(0)';
            topNav.style.opacity = '1';
            topNav.style.visibility = 'visible';
            topNav.style.display = 'block';
            
            lastScrollY = currentScrollY;
            ticking = false;
        };

        const requestTick = () => {
            if (!ticking) {
                requestAnimationFrame(updateNavigation);
                ticking = true;
            }
        };

        window.addEventListener('scroll', requestTick, { passive: true });
        
        // Initial call
        updateNavigation();
        
        console.log('✅ Scroll listener added');
    }

    fixMobileNavigation() {
        const mobileToggle = document.getElementById('mobile-menu-toggle');
        const mobileOverlay = document.getElementById('mobile-menu-overlay');
        
        if (mobileToggle && mobileOverlay) {
            // Ensure mobile menu has proper z-index
            mobileOverlay.style.zIndex = '9998';
            
            // Fix mobile menu toggle
            mobileToggle.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const isActive = mobileOverlay.classList.contains('active');
                
                if (isActive) {
                    this.closeMobileMenu();
                } else {
                    this.openMobileMenu();
                }
            });
            
            // Close mobile menu when clicking overlay
            mobileOverlay.addEventListener('click', (e) => {
                if (e.target === mobileOverlay) {
                    this.closeMobileMenu();
                }
            });
            
            console.log('✅ Mobile navigation fixed');
        }
    }

    openMobileMenu() {
        const mobileOverlay = document.getElementById('mobile-menu-overlay');
        const mobileToggle = document.getElementById('mobile-menu-toggle');
        
        if (mobileOverlay) {
            mobileOverlay.classList.add('active');
            mobileOverlay.style.display = 'flex';
            mobileOverlay.style.opacity = '1';
            mobileOverlay.style.visibility = 'visible';
        }
        
        if (mobileToggle) {
            mobileToggle.classList.add('active');
        }
        
        // Prevent body scrolling
        document.body.style.overflow = 'hidden';
    }

    closeMobileMenu() {
        const mobileOverlay = document.getElementById('mobile-menu-overlay');
        const mobileToggle = document.getElementById('mobile-menu-toggle');
        
        if (mobileOverlay) {
            mobileOverlay.classList.remove('active');
            mobileOverlay.style.display = 'none';
        }
        
        if (mobileToggle) {
            mobileToggle.classList.remove('active');
        }
        
        // Restore body scrolling
        document.body.style.overflow = '';
    }

    ensureNavigationAlwaysVisible() {
        // Create a mutation observer to watch for changes that might hide the navigation
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                    const topNav = document.querySelector('.top-nav');
                    if (topNav && mutation.target === topNav) {
                        // Ensure navigation is always visible
                        if (topNav.style.display === 'none' || 
                            topNav.style.visibility === 'hidden' || 
                            topNav.style.opacity === '0') {
                            
                            topNav.style.display = 'block';
                            topNav.style.visibility = 'visible';
                            topNav.style.opacity = '1';
                            
                            console.log('🔧 Navigation visibility restored');
                        }
                    }
                }
            });
        });

        const topNav = document.querySelector('.top-nav');
        if (topNav) {
            observer.observe(topNav, {
                attributes: true,
                attributeFilter: ['style', 'class']
            });
        }

        // Periodic check to ensure navigation is visible
        setInterval(() => {
            const topNav = document.querySelector('.top-nav');
            if (topNav) {
                const computedStyle = window.getComputedStyle(topNav);
                if (computedStyle.display === 'none' || 
                    computedStyle.visibility === 'hidden' || 
                    computedStyle.opacity === '0') {
                    
                    topNav.style.display = 'block';
                    topNav.style.visibility = 'visible';
                    topNav.style.opacity = '1';
                    topNav.style.zIndex = '9999';
                    
                    console.log('🔧 Navigation visibility restored (periodic check)');
                }
            }
        }, 2000);

        console.log('✅ Navigation visibility monitoring enabled');
    }

    addNavigationStyles() {
        // Add CSS to ensure navigation is always visible
        const style = document.createElement('style');
        style.id = 'navigation-visibility-fix';
        style.textContent = `
            /* Navigation Visibility Fix */
            .top-nav {
                position: fixed !important;
                top: 0 !important;
                left: 0 !important;
                right: 0 !important;
                z-index: 9999 !important;
                display: block !important;
                visibility: visible !important;
                opacity: 1 !important;
                background: rgba(255, 255, 255, 0.95) !important;
                backdrop-filter: blur(10px) !important;
                -webkit-backdrop-filter: blur(10px) !important;
                border-bottom: 1px solid rgba(0, 127, 255, 0.1) !important;
                transition: all 0.3s ease !important;
                margin: 0 !important;
                padding: 0 !important;
                width: 100% !important;
                box-sizing: border-box !important;
            }

            .top-nav.scrolled {
                background: rgba(255, 255, 255, 0.98) !important;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1) !important;
            }

            /* Ensure nav container is properly styled */
            .nav-container {
                display: flex !important;
                align-items: center !important;
                justify-content: space-between !important;
                padding: 1rem 2rem !important;
                max-width: 1200px !important;
                margin: 0 auto !important;
                width: 100% !important;
                box-sizing: border-box !important;
            }

            /* Logo styling */
            .nav-container .logo {
                flex-shrink: 0 !important;
            }

            .nav-container .logo h1 {
                color: var(--azure-blue, #007FFF) !important;
                font-size: 1.5rem !important;
                font-weight: 700 !important;
                margin: 0 !important;
            }

            /* Navigation menu */
            .nav-menu {
                display: flex !important;
                list-style: none !important;
                margin: 0 !important;
                padding: 0 !important;
                gap: 2rem !important;
            }

            .nav-menu li {
                margin: 0 !important;
            }

            .nav-link {
                color: var(--text-primary, #323130) !important;
                text-decoration: none !important;
                font-weight: 500 !important;
                transition: color 0.3s ease !important;
                padding: 0.5rem 0 !important;
            }

            .nav-link:hover {
                color: var(--azure-blue, #007FFF) !important;
            }

            /* Navigation actions */
            .nav-actions {
                display: flex !important;
                gap: 1rem !important;
                align-items: center !important;
            }

            /* Button styles */
            .btn-outline, .btn-primary {
                padding: 0.5rem 1rem !important;
                border-radius: 6px !important;
                font-weight: 600 !important;
                text-decoration: none !important;
                transition: all 0.3s ease !important;
                cursor: pointer !important;
                border: none !important;
                font-size: 0.9rem !important;
            }

            .btn-outline {
                background: transparent !important;
                color: var(--azure-blue, #007FFF) !important;
                border: 2px solid var(--azure-blue, #007FFF) !important;
            }

            .btn-outline:hover {
                background: var(--azure-blue, #007FFF) !important;
                color: white !important;
            }

            .btn-primary {
                background: var(--azure-blue, #007FFF) !important;
                color: white !important;
            }

            .btn-primary:hover {
                background: var(--azure-dark, #005A9E) !important;
            }

            /* Mobile menu toggle */
            .mobile-menu-toggle {
                display: none !important;
                flex-direction: column !important;
                background: none !important;
                border: none !important;
                cursor: pointer !important;
                padding: 0.5rem !important;
                gap: 4px !important;
            }

            .hamburger-line {
                width: 25px !important;
                height: 3px !important;
                background: var(--text-primary, #323130) !important;
                transition: all 0.3s ease !important;
                border-radius: 2px !important;
            }

            /* Mobile menu overlay */
            .mobile-menu-overlay {
                position: fixed !important;
                top: 0 !important;
                left: 0 !important;
                width: 100% !important;
                height: 100% !important;
                background: rgba(0, 0, 0, 0.8) !important;
                backdrop-filter: blur(5px) !important;
                z-index: 9998 !important;
                display: none !important;
                align-items: center !important;
                justify-content: center !important;
                opacity: 0 !important;
                visibility: hidden !important;
                transition: all 0.3s ease !important;
            }

            .mobile-menu-overlay.active {
                display: flex !important;
                opacity: 1 !important;
                visibility: visible !important;
            }

            /* Responsive design */
            @media (max-width: 768px) {
                .nav-menu,
                .nav-actions {
                    display: none !important;
                }

                .mobile-menu-toggle {
                    display: flex !important;
                }

                .nav-container {
                    padding: 0.75rem 1rem !important;
                }

                .nav-container .logo h1 {
                    font-size: 1.3rem !important;
                }
            }

            @media (max-width: 480px) {
                .nav-container {
                    padding: 0.75rem 1rem !important;
                }
            }

            /* Ensure content doesn't overlap with fixed navigation */
            body {
                padding-top: 70px !important;
            }

            .hero-section {
                margin-top: 0 !important;
                padding-top: 4rem !important;
            }

            /* Fix for landing page enhanced styles */
            .page {
                padding-top: 0 !important;
            }

            .page.active {
                display: block !important;
            }
        `;

        // Remove existing style if present
        const existingStyle = document.getElementById('navigation-visibility-fix');
        if (existingStyle) {
            existingStyle.remove();
        }

        document.head.appendChild(style);
        console.log('✅ Navigation visibility styles added');
    }

    getNavigationHeight() {
        const topNav = document.querySelector('.top-nav');
        return topNav ? topNav.offsetHeight : 70;
    }

    // Public methods for external use
    showNavigation() {
        const topNav = document.querySelector('.top-nav');
        if (topNav) {
            topNav.style.display = 'block';
            topNav.style.visibility = 'visible';
            topNav.style.opacity = '1';
            topNav.style.transform = 'translateY(0)';
        }
    }

    hideNavigation() {
        // Note: This method exists but we generally don't want to hide navigation
        console.warn('⚠️ Navigation hiding is disabled to ensure always-visible navigation');
    }

    refreshNavigation() {
        this.fixNavigationZIndex();
        this.showNavigation();
        console.log('🔄 Navigation refreshed');
    }
}

// Initialize the navigation visibility fixer
window.navigationVisibilityFixer = new NavigationVisibilityFixer();

// Expose methods globally for debugging
window.showNavigation = () => window.navigationVisibilityFixer.showNavigation();
window.refreshNavigation = () => window.navigationVisibilityFixer.refreshNavigation();

console.log('✅ Navigation Visibility Fixer loaded and initialized!');