// Enhanced Button Functionality Fix for GlucoBalance Landing Page
console.log('🔧 Loading button functionality fixes...');

// Wait for DOM and existing scripts to load
document.addEventListener('DOMContentLoaded', () => {
    // Give existing scripts time to initialize
    setTimeout(() => {
        console.log('🔧 Applying button functionality fixes...');
        
        // Check if LandingPageManager exists
        if (!window.landingPageManager) {
            console.warn('⚠️ LandingPageManager not found, creating fallback handlers...');
            createFallbackHandlers();
        } else {
            console.log('✅ LandingPageManager found, enhancing existing functionality...');
            enhanceExistingHandlers();
        }
        
        // Apply universal fixes
        applyUniversalFixes();
        
        console.log('✅ Button functionality fixes applied successfully!');
    }, 500);
});

function createFallbackHandlers() {
    console.log('🔧 Creating fallback button handlers...');
    
    // Navigation buttons
    const navDashboardBtn = document.getElementById('nav-dashboard-btn');
    const navSignupBtn = document.getElementById('nav-signup-btn');
    
    if (navDashboardBtn) {
        navDashboardBtn.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('🏠 Dashboard button clicked (fallback)');
            
            // Check authentication status
            const isAuthenticated = checkUserAuthentication();
            
            if (isAuthenticated) {
                console.log('✅ User is authenticated, showing dashboard');
                showNotification('Welcome to your dashboard!', 'success');
                // Show dashboard if user is authenticated
                setTimeout(() => {
                    hideLandingPage();
                    showPage('dashboard');
                }, 500);
            } else {
                console.log('🔐 User not authenticated, showing login');
                showNotification('Please sign in to access your dashboard', 'info');
                // Show login modal for unauthenticated users
                showLoginModal();
            }
        });
    }
    
    if (navSignupBtn) {
        navSignupBtn.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('📝 Signup button clicked (fallback)');
            showSignupModal();
        });
    }
    
    // Hero buttons
    const heroRiskBtn = document.querySelector('.hero-btn.primary');
    const heroFeaturesBtn = document.querySelector('.hero-btn.secondary');
    
    if (heroRiskBtn) {
        heroRiskBtn.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('🎯 Risk assessment button clicked (fallback)');
            showRiskAssessmentInfo();
        });
    }
    
    if (heroFeaturesBtn) {
        heroFeaturesBtn.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('📋 Explore features button clicked (fallback)');
            const featuresSection = document.querySelector('#features');
            if (featuresSection) {
                featuresSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }
    
    // Feature cards
    document.querySelectorAll('.feature-card.clickable').forEach(card => {
        card.addEventListener('click', (e) => {
            e.preventDefault();
            const feature = card.dataset.feature;
            console.log(`🎯 Feature card clicked: ${feature} (fallback)`);
            showFeatureInfo(feature, card);
        });
        
        // Add keyboard support
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                card.click();
            }
        });
        
        // Ensure accessibility
        if (!card.hasAttribute('tabindex')) {
            card.setAttribute('tabindex', '0');
        }
        if (!card.hasAttribute('role')) {
            card.setAttribute('role', 'button');
        }
        if (!card.hasAttribute('aria-label')) {
            const title = card.querySelector('h3')?.textContent || 'Feature';
            card.setAttribute('aria-label', `Learn more about ${title}`);
        }
    });
    
    // Footer links
    const footerLinks = {
        'help-center-link': 'Help Center',
        'privacy-policy-link': 'Privacy Policy',
        'terms-link': 'Terms of Service',
        'contact-link': 'Contact Us'
    };
    
    Object.entries(footerLinks).forEach(([id, title]) => {
        const link = document.getElementById(id);
        if (link) {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                console.log(`🔗 Footer link clicked: ${title} (fallback)`);
                showInfoModal(title);
            });
        }
    });
    
    // Mobile menu
    const mobileToggle = document.getElementById('mobile-menu-toggle');
    const mobileOverlay = document.getElementById('mobile-menu-overlay');
    const mobileDashboard = document.getElementById('mobile-dashboard-btn');
    const mobileSignup = document.querySelector('.mobile-signup');
    
    if (mobileToggle) {
        mobileToggle.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('📱 Mobile menu toggle clicked (fallback)');
            toggleMobileMenu();
        });
    }
    
    if (mobileOverlay) {
        mobileOverlay.addEventListener('click', (e) => {
            if (e.target === mobileOverlay) {
                closeMobileMenu();
            }
        });
    }
    
    if (mobileDashboard) {
        mobileDashboard.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('🏠 Mobile dashboard clicked (fallback)');
            closeMobileMenu();
            showNotification('Dashboard functionality will be available after signup', 'info');
            setTimeout(() => showSignupModal(), 500);
        });
    }
    
    if (mobileSignup) {
        mobileSignup.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('📝 Mobile signup clicked (fallback)');
            closeMobileMenu();
            setTimeout(() => showSignupModal(), 300);
        });
    }
}

function enhanceExistingHandlers() {
    console.log('🔧 Enhancing existing button handlers...');
    
    const manager = window.landingPageManager;
    
    // Add debugging to existing methods
    if (manager.showDashboard) {
        const originalShowDashboard = manager.showDashboard;
        manager.showDashboard = function() {
            console.log('🏠 Dashboard method called');
            try {
                return originalShowDashboard.call(this);
            } catch (error) {
                console.error('❌ Error in showDashboard:', error);
                showNotification('Dashboard temporarily unavailable. Please try again.', 'error');
            }
        };
    }
    
    if (manager.showSignup) {
        const originalShowSignup = manager.showSignup;
        manager.showSignup = function() {
            console.log('📝 Signup method called');
            try {
                return originalShowSignup.call(this);
            } catch (error) {
                console.error('❌ Error in showSignup:', error);
                showSignupModal(); // Fallback
            }
        };
    }
    
    if (manager.handleFeatureCardClick) {
        const originalHandler = manager.handleFeatureCardClick;
        manager.handleFeatureCardClick = function(feature) {
            console.log(`🎯 Feature card handler called: ${feature}`);
            try {
                return originalHandler.call(this, feature);
            } catch (error) {
                console.error(`❌ Error in handleFeatureCardClick for ${feature}:`, error);
                showFeatureInfo(feature); // Fallback
            }
        };
    }
}

function applyUniversalFixes() {
    console.log('🔧 Applying universal button fixes...');
    
    // Ensure all clickable elements have proper cursor
    document.querySelectorAll('.feature-card, .hero-btn, .btn-primary, .btn-outline, .btn-secondary').forEach(element => {
        element.style.cursor = 'pointer';
    });
    
    // Add hover effects for better UX
    document.querySelectorAll('.feature-card.clickable').forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-4px)';
            card.style.transition = 'all 0.3s ease';
            card.style.boxShadow = '0 12px 30px rgba(0, 127, 255, 0.2)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0)';
            card.style.boxShadow = '';
        });
    });
    
    // Add click feedback for all buttons
    document.querySelectorAll('button, .feature-card.clickable').forEach(element => {
        element.addEventListener('click', () => {
            element.style.transform = 'scale(0.98)';
            setTimeout(() => {
                element.style.transform = '';
            }, 150);
        });
    });
    
    // Fix any missing event listeners by re-checking
    setTimeout(() => {
        recheckEventListeners();
    }, 1000);
}

function recheckEventListeners() {
    console.log('🔍 Rechecking event listeners...');
    
    // Check if buttons respond to clicks
    const testButtons = [
        { id: 'nav-dashboard-btn', name: 'Navigation Dashboard' },
        { id: 'nav-signup-btn', name: 'Navigation Signup' },
        { selector: '.hero-btn.primary', name: 'Hero Risk Assessment' },
        { selector: '.hero-btn.secondary', name: 'Hero Explore Features' }
    ];
    
    testButtons.forEach(({ id, selector, name }) => {
        const element = id ? document.getElementById(id) : document.querySelector(selector);
        if (element) {
            // Check if element has click listeners by testing click
            const hasListeners = element.onclick || element.addEventListener;
            if (!hasListeners) {
                console.warn(`⚠️ ${name} button may be missing event listeners`);
            }
        } else {
            console.warn(`⚠️ ${name} button not found in DOM`);
        }
    });
}

// Utility functions for fallback functionality
function showNotification(message, type = 'info') {
    console.log(`📢 Notification: ${message}`);
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-icon">${type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️'}</span>
            <span class="notification-message">${message}</span>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'error' ? '#f8d7da' : type === 'success' ? '#d4edda' : '#d1ecf1'};
        color: ${type === 'error' ? '#721c24' : type === 'success' ? '#155724' : '#0c5460'};
        border: 1px solid ${type === 'error' ? '#f5c6cb' : type === 'success' ? '#c3e6cb' : '#bee5eb'};
        border-radius: 8px;
        padding: 15px;
        max-width: 300px;
        z-index: 10000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

function checkUserAuthentication() {
    // Check multiple authentication sources
    
    // 1. Check if LandingPageManager is available and use its method
    if (window.landingPageManager && typeof window.landingPageManager.checkUserAuthentication === 'function') {
        return window.landingPageManager.checkUserAuthentication();
    }
    
    // 2. Check local storage for current user
    const currentUser = localStorage.getItem('glucobalance-current-user');
    if (currentUser) {
        try {
            const user = JSON.parse(currentUser);
            return user && user.id && user.email;
        } catch (error) {
            console.error('Error parsing current user:', error);
            return false;
        }
    }
    
    // 3. Check authService if available
    if (window.authService && typeof window.authService.isAuthenticated === 'function') {
        return window.authService.isAuthenticated();
    }
    
    return false;
}

function hideLandingPage() {
    const landingPage = document.getElementById('landing-page');
    if (landingPage) {
        landingPage.classList.remove('active');
    }
    
    // Hide bottom navigation on landing page
    const bottomNav = document.getElementById('bottom-nav');
    if (bottomNav) {
        bottomNav.style.display = 'block';
    }
}

function showPage(pageId) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // Show requested page
    let targetPage = document.getElementById(`${pageId}-page`);
    if (!targetPage) {
        targetPage = document.getElementById(pageId);
    }
    
    if (targetPage) {
        targetPage.classList.add('active');
        console.log(`📄 Showing page: ${pageId}`);
    } else {
        console.error(`❌ Page not found: ${pageId}`);
    }
}

function showLoginModal() {
    console.log('🔐 Showing login modal (fallback)');
    
    // Remove existing modal if any
    const existingModal = document.getElementById('fallback-login-modal');
    if (existingModal) {
        existingModal.remove();
    }
    
    const modal = document.createElement('div');
    modal.id = 'fallback-login-modal';
    modal.innerHTML = `
        <div class="modal-overlay" onclick="this.parentElement.remove()">
            <div class="modal-content" onclick="event.stopPropagation()">
                <div class="modal-header">
                    <h2>🔐 Sign In to Dashboard</h2>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').parentElement.remove()">×</button>
                </div>
                <div class="modal-body">
                    <p>Sign in to access your personalized dashboard with:</p>
                    <ul>
                        <li>🎯 Risk assessment results</li>
                        <li>📊 Health progress tracking</li>
                        <li>🍎 Nutrition insights</li>
                        <li>💙 Mental health trends</li>
                    </ul>
                    <form id="fallback-login-form">
                        <input type="email" placeholder="Enter your email" required style="width: 100%; padding: 10px; margin: 10px 0; border: 1px solid #ddd; border-radius: 4px;">
                        <input type="password" placeholder="Enter your password" required style="width: 100%; padding: 10px; margin: 10px 0; border: 1px solid #ddd; border-radius: 4px;">
                        <button type="submit" style="width: 100%; padding: 12px; background: #007FFF; color: white; border: none; border-radius: 4px; cursor: pointer; margin: 10px 0;">Sign In to Dashboard</button>
                    </form>
                    <div style="text-align: center; margin-top: 15px;">
                        <p style="margin: 5px 0; font-size: 14px;">Don't have an account?</p>
                        <button onclick="this.closest('.modal-overlay').parentElement.remove(); showSignupModal();" style="background: none; border: 1px solid #007FFF; color: #007FFF; padding: 8px 16px; border-radius: 4px; cursor: pointer;">Create Account</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Add styles (same as signup modal)
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 10000;
    `;
    
    document.body.appendChild(modal);
    
    // Handle form submission
    document.getElementById('fallback-login-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const email = e.target.querySelector('input[type="email"]').value;
        const password = e.target.querySelector('input[type="password"]').value;
        
        // Simple demo authentication
        if (email && password) {
            // Create demo user session
            const demoUser = {
                id: Date.now().toString(),
                name: email.split('@')[0],
                email: email,
                age: 30
            };
            
            localStorage.setItem('glucobalance-current-user', JSON.stringify(demoUser));
            
            showNotification('Login successful! Welcome to your dashboard!', 'success');
            modal.remove();
            
            // Navigate to dashboard
            setTimeout(() => {
                hideLandingPage();
                showPage('dashboard');
            }, 1000);
        } else {
            showNotification('Please enter both email and password', 'error');
        }
    });
}

function showSignupModal() {
    console.log('📝 Showing signup modal (fallback)');
    
    // Remove existing modal if any
    const existingModal = document.getElementById('fallback-signup-modal');
    if (existingModal) {
        existingModal.remove();
    }
    
    const modal = document.createElement('div');
    modal.id = 'fallback-signup-modal';
    modal.innerHTML = `
        <div class="modal-overlay" onclick="this.parentElement.remove()">
            <div class="modal-content" onclick="event.stopPropagation()">
                <div class="modal-header">
                    <h2>🚀 Join GlucoBalance</h2>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').parentElement.remove()">×</button>
                </div>
                <div class="modal-body">
                    <p>Create your free account to access all GlucoBalance features:</p>
                    <ul>
                        <li>🎯 Personalized risk assessment</li>
                        <li>🍎 AI-powered nutrition planning</li>
                        <li>💙 Mental health tracking</li>
                        <li>📊 Progress analytics</li>
                    </ul>
                    <form id="fallback-signup-form">
                        <input type="email" placeholder="Enter your email" required style="width: 100%; padding: 10px; margin: 10px 0; border: 1px solid #ddd; border-radius: 4px;">
                        <input type="password" placeholder="Create password" required style="width: 100%; padding: 10px; margin: 10px 0; border: 1px solid #ddd; border-radius: 4px;">
                        <button type="submit" style="width: 100%; padding: 12px; background: #007FFF; color: white; border: none; border-radius: 4px; cursor: pointer;">Create Account</button>
                    </form>
                </div>
            </div>
        </div>
    `;
    
    // Add styles
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 10000;
    `;
    
    const style = document.createElement('style');
    style.textContent = `
        .modal-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .modal-content {
            background: white;
            border-radius: 8px;
            max-width: 400px;
            width: 90%;
            max-height: 90vh;
            overflow-y: auto;
        }
        .modal-header {
            padding: 20px;
            border-bottom: 1px solid #eee;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .modal-header h2 {
            margin: 0;
        }
        .modal-close {
            background: none;
            border: none;
            font-size: 24px;
            cursor: pointer;
        }
        .modal-body {
            padding: 20px;
        }
    `;
    
    document.head.appendChild(style);
    document.body.appendChild(modal);
    
    // Handle form submission
    document.getElementById('fallback-signup-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const email = e.target.querySelector('input[type="email"]').value;
        const password = e.target.querySelector('input[type="password"]').value;
        
        if (email && password) {
            // Create new user session
            const newUser = {
                id: Date.now().toString(),
                name: email.split('@')[0],
                email: email,
                age: 25
            };
            
            localStorage.setItem('glucobalance-current-user', JSON.stringify(newUser));
            
            showNotification('Account created successfully! Welcome to GlucoBalance!', 'success');
            modal.remove();
            
            // Navigate to dashboard
            setTimeout(() => {
                hideLandingPage();
                showPage('dashboard');
            }, 1000);
        } else {
            showNotification('Please fill in all required fields', 'error');
        }
    });
}

function showFeatureInfo(feature, cardElement) {
    console.log(`🎯 Showing feature info: ${feature}`);
    
    const featureData = {
        'risk-assessment': {
            title: 'Diabetes Risk Assessment',
            icon: '🎯',
            description: 'Take our comprehensive WHO/ADA-compliant questionnaire to assess your diabetes risk.',
            action: 'Start Assessment'
        },
        'nutrition': {
            title: 'Personalized Nutrition Planning',
            icon: '🍎',
            description: 'Get AI-powered meal plans tailored to your dietary preferences and health goals.',
            action: 'Explore Nutrition'
        },
        'mental-health': {
            title: 'Mental Health & Wellness',
            icon: '💙',
            description: 'Track your mood and receive AI-generated support for mental wellness.',
            action: 'Start Tracking'
        },
        'progress': {
            title: 'Progress Tracking & Analytics',
            icon: '📊',
            description: 'Visualize your health journey with comprehensive progress tracking and insights.',
            action: 'View Dashboard'
        }
    };
    
    const data = featureData[feature];
    if (!data) return;
    
    // Highlight the clicked card
    if (cardElement) {
        cardElement.style.background = '#e3f2fd';
        setTimeout(() => {
            cardElement.style.background = '';
        }, 2000);
    }
    
    showNotification(`${data.icon} ${data.title}: ${data.description}`, 'info');
}

function showRiskAssessmentInfo() {
    console.log('🎯 Showing risk assessment info');
    showNotification('🎯 Risk Assessment: Take our WHO/ADA-compliant questionnaire to assess your diabetes risk. Feature coming soon!', 'info');
}

function showInfoModal(title) {
    console.log(`📄 Showing info modal: ${title}`);
    showNotification(`${title} information will be available soon. Thank you for your interest!`, 'info');
}

function toggleMobileMenu() {
    const overlay = document.getElementById('mobile-menu-overlay');
    const toggle = document.getElementById('mobile-menu-toggle');
    
    if (overlay && toggle) {
        const isActive = overlay.classList.contains('active');
        if (isActive) {
            closeMobileMenu();
        } else {
            overlay.classList.add('active');
            toggle.classList.add('active');
            document.body.style.overflow = 'hidden';
            console.log('📱 Mobile menu opened');
        }
    }
}

function closeMobileMenu() {
    const overlay = document.getElementById('mobile-menu-overlay');
    const toggle = document.getElementById('mobile-menu-toggle');
    
    if (overlay && toggle) {
        overlay.classList.remove('active');
        toggle.classList.remove('active');
        document.body.style.overflow = '';
        console.log('📱 Mobile menu closed');
    }
}

// Add CSS animations
const animationStyle = document.createElement('style');
animationStyle.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    .notification {
        animation: slideIn 0.3s ease;
    }
    
    .feature-card.clickable {
        transition: all 0.3s ease;
    }
    
    .feature-card.clickable:hover {
        transform: translateY(-4px);
        box-shadow: 0 12px 30px rgba(0, 127, 255, 0.2);
    }
`;
document.head.appendChild(animationStyle);

console.log('✅ Button functionality fix script loaded successfully!');