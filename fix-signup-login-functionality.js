// Fix Signup and Login Button Functionality
// This script ensures that signup and login buttons work correctly

console.log('🔧 Fixing signup and login button functionality...');

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', function() {
    initializeAuthButtons();
});

// Also run immediately in case DOM is already loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeAuthButtons);
} else {
    initializeAuthButtons();
}

function initializeAuthButtons() {
    console.log('🚀 Initializing authentication buttons...');
    
    // Wait for all required services to be available
    const checkServices = () => {
        const authServiceReady = window.authService && typeof window.authService.register === 'function';
        const authUIReady = window.authUI && typeof window.authUI.showRegistrationForm === 'function';
        const landingPageReady = window.landingPageManager;
        
        if (authServiceReady && authUIReady) {
            console.log('✅ All authentication services ready');
            setupButtonEventListeners();
            return true;
        } else {
            console.log('⏳ Waiting for authentication services...', {
                authService: authServiceReady,
                authUI: authUIReady,
                landingPage: landingPageReady
            });
            return false;
        }
    };
    
    // Check immediately
    if (!checkServices()) {
        // If not ready, check every 100ms for up to 5 seconds
        let attempts = 0;
        const maxAttempts = 50;
        
        const interval = setInterval(() => {
            attempts++;
            if (checkServices() || attempts >= maxAttempts) {
                clearInterval(interval);
                if (attempts >= maxAttempts) {
                    console.error('❌ Authentication services failed to load, setting up fallback');
                    setupFallbackButtons();
                }
            }
        }, 100);
    }
}

function setupButtonEventListeners() {
    console.log('🔗 Setting up button event listeners...');
    
    // Navigation Signup Button
    const navSignupBtn = document.getElementById('nav-signup-btn');
    if (navSignupBtn) {
        // Remove any existing listeners
        navSignupBtn.replaceWith(navSignupBtn.cloneNode(true));
        const newNavSignupBtn = document.getElementById('nav-signup-btn');
        
        newNavSignupBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('📝 Nav signup button clicked');
            handleSignupClick();
        });
        
        console.log('✅ Navigation signup button configured');
    } else {
        console.warn('⚠️ Navigation signup button not found');
    }
    
    // Navigation Get Started Button
    const navGetStartedBtn = document.getElementById('nav-get-started-btn');
    if (navGetStartedBtn) {
        // Remove any existing listeners
        navGetStartedBtn.replaceWith(navGetStartedBtn.cloneNode(true));
        const newNavGetStartedBtn = document.getElementById('nav-get-started-btn');
        
        newNavGetStartedBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('🚀 Get started button clicked');
            handleGetStartedClick();
        });
        
        console.log('✅ Get started button configured');
    } else {
        console.warn('⚠️ Get started button not found');
    }
    
    // Navigation Dashboard Button
    const navDashboardBtn = document.getElementById('nav-dashboard-btn');
    if (navDashboardBtn) {
        // Remove any existing listeners
        navDashboardBtn.replaceWith(navDashboardBtn.cloneNode(true));
        const newNavDashboardBtn = document.getElementById('nav-dashboard-btn');
        
        newNavDashboardBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('📊 Dashboard button clicked');
            handleDashboardClick();
        });
        
        console.log('✅ Dashboard button configured');
    } else {
        console.warn('⚠️ Dashboard button not found');
    }
    
    // Navigation Profile Button
    const navProfileBtn = document.getElementById('nav-profile-btn');
    if (navProfileBtn) {
        navProfileBtn.replaceWith(navProfileBtn.cloneNode(true));
        const newNavProfileBtn = document.getElementById('nav-profile-btn');
        
        newNavProfileBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('👤 Profile button clicked');
            handleProfileClick();
        });
        
        console.log('✅ Profile button configured');
    }
    
    // Navigation Logout Button
    const navLogoutBtn = document.getElementById('nav-logout-btn');
    if (navLogoutBtn) {
        navLogoutBtn.replaceWith(navLogoutBtn.cloneNode(true));
        const newNavLogoutBtn = document.getElementById('nav-logout-btn');
        
        newNavLogoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('🚪 Logout button clicked');
            handleLogoutClick();
        });
        
        console.log('✅ Logout button configured');
    }
    
    // Listen for authentication state changes
    document.addEventListener('authStateChanged', function(event) {
        console.log('🔄 Auth state changed:', event.detail);
        updateButtonsForAuthState(event.detail);
    });
    
    // Check current authentication state
    checkCurrentAuthState();
}

function handleSignupClick() {
    console.log('📝 Handling signup click...');
    
    // Remove any existing modal
    const existingModal = document.getElementById('auth-modal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Show registration form
    if (window.authUI && typeof window.authUI.showRegistrationForm === 'function') {
        console.log('✅ Showing registration form');
        window.authUI.showRegistrationForm();
    } else {
        console.error('❌ AuthUI not available');
        showFallbackMessage('Registration system is loading. Please try again in a moment.');
    }
}

function handleGetStartedClick() {
    console.log('🚀 Handling get started click...');
    
    // Check if user is authenticated
    if (window.authService && window.authService.isAuthenticated()) {
        // User is logged in, go to risk assessment
        console.log('✅ User authenticated, starting risk assessment');
        if (window.glucoApp && typeof window.glucoApp.showAssessment === 'function') {
            window.glucoApp.showAssessment();
        } else if (window.riskAssessment && typeof window.riskAssessment.startAssessment === 'function') {
            window.riskAssessment.startAssessment();
        } else {
            console.log('📋 Risk assessment not available, showing signup');
            handleSignupClick();
        }
    } else {
        // User not logged in, show signup form
        console.log('❌ User not authenticated, showing signup');
        handleSignupClick();
    }
}

function handleDashboardClick() {
    console.log('📊 Handling dashboard click...');
    
    // Remove any existing modal
    const existingModal = document.getElementById('auth-modal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Check if user is authenticated
    if (window.authService && window.authService.isAuthenticated()) {
        // User is logged in, go to dashboard
        console.log('✅ User authenticated, going to dashboard');
        if (window.glucoApp && typeof window.glucoApp.showDashboard === 'function') {
            window.glucoApp.showDashboard();
        } else {
            showDashboardPage();
        }
    } else {
        // User not logged in, show login form
        console.log('❌ User not authenticated, showing login form');
        if (window.authUI && typeof window.authUI.showLoginForm === 'function') {
            console.log('✅ Showing login form');
            window.authUI.showLoginForm();
        } else {
            console.error('❌ AuthUI not available');
            showFallbackMessage('Login system is loading. Please try again in a moment.');
        }
    }
}

function handleProfileClick() {
    console.log('👤 Handling profile click...');
    
    if (window.authService && window.authService.isAuthenticated()) {
        if (window.glucoApp && typeof window.glucoApp.showProfile === 'function') {
            window.glucoApp.showProfile();
        } else {
            console.log('Profile page not implemented yet');
        }
    } else {
        handleDashboardClick(); // Redirect to login
    }
}

function handleLogoutClick() {
    console.log('🚪 Handling logout click...');
    
    if (window.authService && typeof window.authService.logout === 'function') {
        window.authService.logout().then(result => {
            if (result.success) {
                console.log('✅ Logout successful');
                // The auth state change event will handle UI updates
            } else {
                console.error('❌ Logout failed:', result.error);
            }
        });
    } else if (window.authUI && typeof window.authUI.logout === 'function') {
        window.authUI.logout();
    } else {
        console.error('❌ No logout method available');
    }
}

function showDashboardPage() {
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // Show dashboard page
    const dashboardPage = document.getElementById('dashboard-page');
    if (dashboardPage) {
        dashboardPage.classList.add('active');
        
        // Show bottom navigation
        const bottomNav = document.getElementById('bottom-nav');
        if (bottomNav) {
            bottomNav.style.display = 'flex';
        }
    }
}

function checkCurrentAuthState() {
    console.log('🔍 Checking current authentication state...');
    
    if (window.authService) {
        const isAuthenticated = window.authService.isAuthenticated();
        const currentUser = window.authService.getCurrentUser();
        
        console.log('Auth state:', { isAuthenticated, user: currentUser });
        
        updateButtonsForAuthState({
            isAuthenticated: isAuthenticated,
            user: currentUser
        });
    }
}

function updateButtonsForAuthState(authState) {
    console.log('🔄 Updating buttons for auth state:', authState);
    
    const navSignupBtn = document.getElementById('nav-signup-btn');
    const navGetStartedBtn = document.getElementById('nav-get-started-btn');
    const navDashboardBtn = document.getElementById('nav-dashboard-btn');
    const navProfileBtn = document.getElementById('nav-profile-btn');
    const navLogoutBtn = document.getElementById('nav-logout-btn');
    
    if (authState.isAuthenticated && authState.user) {
        // User is logged in
        console.log('✅ User authenticated, updating UI');
        
        // Hide signup button, show profile and logout
        if (navSignupBtn) navSignupBtn.style.display = 'none';
        if (navProfileBtn) navProfileBtn.style.display = 'block';
        if (navLogoutBtn) navLogoutBtn.style.display = 'block';
        
        // Update dashboard button text
        if (navDashboardBtn) {
            navDashboardBtn.textContent = 'Dashboard';
            navDashboardBtn.classList.remove('btn-outline');
            navDashboardBtn.classList.add('btn-primary');
        }
        
        // Update get started button
        if (navGetStartedBtn) {
            navGetStartedBtn.textContent = 'Take Assessment';
        }
        
        // Update profile button with user name
        if (navProfileBtn && authState.user.name) {
            const btnText = navProfileBtn.querySelector('.btn-text');
            if (btnText) {
                btnText.textContent = authState.user.name;
            }
        }
        
    } else {
        // User is not logged in
        console.log('❌ User not authenticated, updating UI');
        
        // Show signup button, hide profile and logout
        if (navSignupBtn) navSignupBtn.style.display = 'block';
        if (navProfileBtn) navProfileBtn.style.display = 'none';
        if (navLogoutBtn) navLogoutBtn.style.display = 'none';
        
        // Update dashboard button text
        if (navDashboardBtn) {
            navDashboardBtn.textContent = 'Login';
            navDashboardBtn.classList.remove('btn-primary');
            navDashboardBtn.classList.add('btn-outline');
        }
        
        // Reset get started button
        if (navGetStartedBtn) {
            navGetStartedBtn.textContent = 'Get Started Free';
        }
    }
}

function setupFallbackButtons() {
    console.log('🔧 Setting up fallback buttons...');
    
    const navSignupBtn = document.getElementById('nav-signup-btn');
    const navDashboardBtn = document.getElementById('nav-dashboard-btn');
    const navGetStartedBtn = document.getElementById('nav-get-started-btn');
    
    if (navSignupBtn) {
        navSignupBtn.addEventListener('click', function(e) {
            e.preventDefault();
            showFallbackMessage('Registration system is loading. Please refresh the page and try again.');
        });
    }
    
    if (navDashboardBtn) {
        navDashboardBtn.addEventListener('click', function(e) {
            e.preventDefault();
            showFallbackMessage('Login system is loading. Please refresh the page and try again.');
        });
    }
    
    if (navGetStartedBtn) {
        navGetStartedBtn.addEventListener('click', function(e) {
            e.preventDefault();
            showFallbackMessage('System is loading. Please refresh the page and try again.');
        });
    }
}

function showFallbackMessage(message) {
    // Remove any existing modal
    const existingModal = document.getElementById('auth-modal');
    if (existingModal) {
        existingModal.remove();
    }
    
    const fallbackHTML = `
    <div id="auth-modal" class="modal-overlay">
        <div class="modal-content auth-modal">
            <div class="modal-header">
                <h2>System Loading</h2>
                <button class="close-btn" onclick="document.getElementById('auth-modal').remove()">&times;</button>
            </div>
            <div class="fallback-message">
                <p>🔄 ${message}</p>
                <button class="btn-primary" onclick="window.location.reload()">Refresh Page</button>
                <button class="btn-secondary" onclick="document.getElementById('auth-modal').remove()">Close</button>
            </div>
        </div>
    </div>`;
    
    document.body.insertAdjacentHTML('beforeend', fallbackHTML);
}

// Export functions for global access
window.authButtonManager = {
    handleSignupClick,
    handleDashboardClick,
    handleGetStartedClick,
    handleProfileClick,
    handleLogoutClick,
    updateButtonsForAuthState,
    checkCurrentAuthState
};

console.log('✅ Signup and login button functionality fix loaded');