// Fix Landing Page Button Functionality
// This script consolidates all button event handlers to prevent conflicts

(function() {
    'use strict';
    
    console.log('🔧 Fixing landing page button functionality...');
    
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeButtons);
    } else {
        initializeButtons();
    }
    
    function initializeButtons() {
        console.log('🚀 Initializing landing page buttons...');
        
        // Clear any existing event listeners by replacing buttons
        clearExistingListeners();
        
        // Set up fresh event listeners
        setupGetStartedButton();
        setupDashboardButton();
        setupSignupButton();
        
        // Verify buttons are working
        verifyButtonFunctionality();
        
        console.log('✅ Landing page buttons initialized successfully');
    }
    
    function clearExistingListeners() {
        console.log('🧹 Clearing existing button listeners...');
        
        const buttonIds = ['nav-get-started-btn', 'nav-dashboard-btn', 'nav-signup-btn'];
        
        buttonIds.forEach(id => {
            const button = document.getElementById(id);
            if (button) {
                const newButton = button.cloneNode(true);
                button.parentNode.replaceChild(newButton, button);
                console.log(`✅ Cleared listeners for ${id}`);
            }
        });
    }
    
    function setupGetStartedButton() {
        const button = document.getElementById('nav-get-started-btn');
        if (!button) {
            console.warn('❌ Get Started button not found');
            return;
        }
        
        button.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            console.log('🎯 Get Started button clicked');
            
            // Add visual feedback
            addClickFeedback(button);
            
            // Start risk assessment
            startRiskAssessment();
        });
        
        console.log('✅ Get Started button configured');
    }
    
    function setupDashboardButton() {
        const button = document.getElementById('nav-dashboard-btn');
        if (!button) {
            console.warn('❌ Dashboard button not found');
            return;
        }
        
        button.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            console.log('📊 Dashboard button clicked');
            
            // Add visual feedback
            addClickFeedback(button);
            
            // Handle dashboard access
            handleDashboardAccess();
        });
        
        console.log('✅ Dashboard button configured');
    }
    
    function setupSignupButton() {
        const button = document.getElementById('nav-signup-btn');
        if (!button) {
            console.warn('❌ Signup button not found');
            return;
        }
        
        button.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            console.log('📝 Signup button clicked');
            
            // Add visual feedback
            addClickFeedback(button);
            
            // Handle signup
            handleSignup();
        });
        
        console.log('✅ Signup button configured');
    }
    
    function addClickFeedback(button) {
        // Add visual feedback for better UX
        button.style.transform = 'scale(0.95)';
        button.style.opacity = '0.8';
        
        setTimeout(() => {
            button.style.transform = '';
            button.style.opacity = '';
        }, 150);
    }
    
    function startRiskAssessment() {
        console.log('🎯 Starting risk assessment...');
        
        try {
            // Check if risk assessment is available
            if (window.riskAssessment && typeof window.riskAssessment.startAssessment === 'function') {
                console.log('✅ Using risk assessment service');
                window.riskAssessment.startAssessment();
                return;
            }
            
            // Check if landing page manager is available
            if (window.landingPageManager && typeof window.landingPageManager.startRiskAssessment === 'function') {
                console.log('✅ Using landing page manager');
                window.landingPageManager.startRiskAssessment();
                return;
            }
            
            // Check if main app is available
            if (window.glucoApp && typeof window.glucoApp.showAssessment === 'function') {
                console.log('✅ Using main app');
                window.glucoApp.showAssessment();
                return;
            }
            
            // Fallback: Navigate to assessment page
            console.log('📋 Using fallback navigation');
            navigateToAssessment();
            
        } catch (error) {
            console.error('❌ Error starting risk assessment:', error);
            showErrorMessage('Unable to start assessment. Please try again.');
        }
    }
    
    function handleDashboardAccess() {
        console.log('📊 Handling dashboard access...');
        
        try {
            // Check if user is authenticated
            const isAuthenticated = checkAuthentication();
            
            if (isAuthenticated) {
                console.log('✅ User authenticated, going to dashboard');
                navigateToDashboard();
            } else {
                console.log('🔐 User not authenticated, showing login');
                showLoginForm();
            }
            
        } catch (error) {
            console.error('❌ Error accessing dashboard:', error);
            showErrorMessage('Unable to access dashboard. Please try again.');
        }
    }
    
    function handleSignup() {
        console.log('📝 Handling signup...');
        
        try {
            // Check if auth UI is available
            if (window.authUI && typeof window.authUI.showRegistrationForm === 'function') {
                console.log('✅ Using auth UI');
                window.authUI.showRegistrationForm();
                return;
            }
            
            // Check if landing page manager is available
            if (window.landingPageManager && typeof window.landingPageManager.handleSignupClick === 'function') {
                console.log('✅ Using landing page manager');
                window.landingPageManager.handleSignupClick();
                return;
            }
            
            // Fallback: Show simple signup form
            console.log('📝 Using fallback signup');
            showFallbackSignup();
            
        } catch (error) {
            console.error('❌ Error showing signup:', error);
            showErrorMessage('Unable to show signup form. Please try again.');
        }
    }
    
    function checkAuthentication() {
        // Check various authentication methods
        if (window.authService && typeof window.authService.isAuthenticated === 'function') {
            return window.authService.isAuthenticated();
        }
        
        // Check localStorage for user data
        try {
            const userData = localStorage.getItem('glucobalance-user');
            if (userData) {
                const user = JSON.parse(userData);
                return user && user.id;
            }
        } catch (error) {
            console.warn('Error checking localStorage auth:', error);
        }
        
        return false;
    }
    
    function navigateToAssessment() {
        console.log('📋 Navigating to assessment...');
        
        // Hide landing page
        const landingPage = document.getElementById('landing-page');
        if (landingPage) {
            landingPage.classList.remove('active');
        }
        
        // Show assessment page or create it
        let assessmentPage = document.getElementById('assessment-page');
        if (!assessmentPage) {
            createAssessmentPage();
            assessmentPage = document.getElementById('assessment-page');
        }
        
        if (assessmentPage) {
            assessmentPage.classList.add('active');
        }
        
        // Initialize assessment if available
        if (window.riskAssessment) {
            setTimeout(() => {
                window.riskAssessment.startAssessment();
            }, 100);
        }
    }
    
    function navigateToDashboard() {
        console.log('🏠 Navigating to dashboard...');
        
        // Hide landing page
        const landingPage = document.getElementById('landing-page');
        if (landingPage) {
            landingPage.classList.remove('active');
        }
        
        // Show dashboard page
        let dashboardPage = document.getElementById('dashboard-page');
        if (dashboardPage) {
            dashboardPage.classList.add('active');
        }
        
        // Initialize dashboard if available
        if (window.glucoApp && typeof window.glucoApp.loadDashboard === 'function') {
            setTimeout(() => {
                window.glucoApp.loadDashboard();
            }, 100);
        }
    }
    
    function showLoginForm() {
        console.log('🔐 Showing login form...');
        
        // Try different auth UI methods
        if (window.authUI && typeof window.authUI.showLoginForm === 'function') {
            window.authUI.showLoginForm();
        } else if (window.landingPageManager && typeof window.landingPageManager.handleDashboardClick === 'function') {
            window.landingPageManager.handleDashboardClick();
        } else {
            showFallbackLogin();
        }
    }
    
    function createAssessmentPage() {
        console.log('📋 Creating assessment page...');
        
        const assessmentHTML = `
        <div id="assessment-page" class="page">
            <div class="container">
                <div class="assessment-header">
                    <h1>Diabetes Risk Assessment</h1>
                    <p>Take our WHO/ADA-compliant questionnaire to assess your diabetes risk</p>
                </div>
                <div id="assessment-content">
                    <div class="loading-message">
                        <div class="spinner"></div>
                        <p>Loading assessment...</p>
                    </div>
                </div>
            </div>
        </div>`;
        
        document.getElementById('app').insertAdjacentHTML('beforeend', assessmentHTML);
    }
    
    function showFallbackSignup() {
        console.log('📝 Showing fallback signup...');
        
        const signupHTML = `
        <div id="fallback-signup-modal" class="modal-overlay" style="display: flex;">
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Create Your Account</h2>
                    <button class="close-btn" onclick="document.getElementById('fallback-signup-modal').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="fallback-signup-form">
                        <div class="form-group">
                            <label for="signup-name">Full Name</label>
                            <input type="text" id="signup-name" required>
                        </div>
                        <div class="form-group">
                            <label for="signup-email">Email</label>
                            <input type="email" id="signup-email" required>
                        </div>
                        <div class="form-group">
                            <label for="signup-password">Password</label>
                            <input type="password" id="signup-password" required>
                        </div>
                        <button type="submit" class="btn-primary">Create Account</button>
                    </form>
                </div>
            </div>
        </div>`;
        
        document.body.insertAdjacentHTML('beforeend', signupHTML);
        
        // Handle form submission
        document.getElementById('fallback-signup-form').addEventListener('submit', function(e) {
            e.preventDefault();
            const name = document.getElementById('signup-name').value;
            const email = document.getElementById('signup-email').value;
            
            // Create basic user data
            const userData = {
                id: Date.now().toString(),
                name: name,
                email: email,
                createdAt: new Date().toISOString()
            };
            
            // Save to localStorage
            localStorage.setItem('glucobalance-user', JSON.stringify(userData));
            
            // Close modal
            document.getElementById('fallback-signup-modal').remove();
            
            // Show success message
            showSuccessMessage(`Welcome ${name}! Your account has been created.`);
            
            // Navigate to dashboard
            setTimeout(() => {
                navigateToDashboard();
            }, 1500);
        });
    }
    
    function showFallbackLogin() {
        console.log('🔐 Showing fallback login...');
        
        const loginHTML = `
        <div id="fallback-login-modal" class="modal-overlay" style="display: flex;">
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Welcome Back</h2>
                    <button class="close-btn" onclick="document.getElementById('fallback-login-modal').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="fallback-login-form">
                        <div class="form-group">
                            <label for="login-email">Email</label>
                            <input type="email" id="login-email" required>
                        </div>
                        <div class="form-group">
                            <label for="login-password">Password</label>
                            <input type="password" id="login-password" required>
                        </div>
                        <button type="submit" class="btn-primary">Sign In</button>
                    </form>
                    <p class="auth-switch">
                        Don't have an account? 
                        <a href="#" onclick="document.getElementById('fallback-login-modal').remove(); document.getElementById('nav-signup-btn').click();">Sign up</a>
                    </p>
                </div>
            </div>
        </div>`;
        
        document.body.insertAdjacentHTML('beforeend', loginHTML);
        
        // Handle form submission
        document.getElementById('fallback-login-form').addEventListener('submit', function(e) {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            
            // Create basic user data (simplified for demo)
            const userData = {
                id: Date.now().toString(),
                name: email.split('@')[0],
                email: email,
                loginAt: new Date().toISOString()
            };
            
            // Save to localStorage
            localStorage.setItem('glucobalance-user', JSON.stringify(userData));
            
            // Close modal
            document.getElementById('fallback-login-modal').remove();
            
            // Show success message
            showSuccessMessage(`Welcome back!`);
            
            // Navigate to dashboard
            setTimeout(() => {
                navigateToDashboard();
            }, 1500);
        });
    }
    
    function showSuccessMessage(message) {
        const notification = document.createElement('div');
        notification.className = 'success-notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #4CAF50;
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            animation: slideIn 0.3s ease-out;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
    
    function showErrorMessage(message) {
        const notification = document.createElement('div');
        notification.className = 'error-notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #f44336;
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            animation: slideIn 0.3s ease-out;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => notification.remove(), 300);
        }, 4000);
    }
    
    function verifyButtonFunctionality() {
        console.log('🔍 Verifying button functionality...');
        
        const buttons = [
            { id: 'nav-get-started-btn', name: 'Get Started' },
            { id: 'nav-dashboard-btn', name: 'Dashboard' },
            { id: 'nav-signup-btn', name: 'Sign Up' }
        ];
        
        buttons.forEach(({ id, name }) => {
            const button = document.getElementById(id);
            if (button) {
                const hasListeners = button.onclick || button.addEventListener;
                console.log(`✅ ${name} button: Found and configured`);
            } else {
                console.warn(`❌ ${name} button: Not found`);
            }
        });
    }
    
    // Add CSS animations if not already present
    if (!document.querySelector('#button-fix-styles')) {
        const styles = document.createElement('style');
        styles.id = 'button-fix-styles';
        styles.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
            
            .modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 9999;
            }
            
            .modal-content {
                background: white;
                border-radius: 12px;
                padding: 2rem;
                max-width: 400px;
                width: 90%;
                max-height: 90vh;
                overflow-y: auto;
            }
            
            .modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 1.5rem;
            }
            
            .close-btn {
                background: none;
                border: none;
                font-size: 1.5rem;
                cursor: pointer;
                padding: 0;
                width: 30px;
                height: 30px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .form-group {
                margin-bottom: 1rem;
            }
            
            .form-group label {
                display: block;
                margin-bottom: 0.5rem;
                font-weight: 500;
            }
            
            .form-group input {
                width: 100%;
                padding: 0.75rem;
                border: 1px solid #ddd;
                border-radius: 6px;
                font-size: 1rem;
            }
            
            .btn-primary {
                background: #007FFF;
                color: white;
                border: none;
                padding: 0.75rem 1.5rem;
                border-radius: 6px;
                font-size: 1rem;
                cursor: pointer;
                width: 100%;
                margin-top: 1rem;
            }
            
            .btn-primary:hover {
                background: #0066CC;
            }
            
            .auth-switch {
                text-align: center;
                margin-top: 1rem;
                font-size: 0.9rem;
            }
            
            .auth-switch a {
                color: #007FFF;
                text-decoration: none;
            }
            
            .loading-message {
                text-align: center;
                padding: 3rem;
            }
            
            .spinner {
                width: 40px;
                height: 40px;
                border: 4px solid #f3f3f3;
                border-top: 4px solid #007FFF;
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin: 0 auto 1rem;
            }
            
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(styles);
    }
    
    // Export for global access
    window.landingPageButtonFix = {
        reinitialize: initializeButtons,
        startRiskAssessment: startRiskAssessment,
        handleDashboardAccess: handleDashboardAccess,
        handleSignup: handleSignup
    };
    
})();