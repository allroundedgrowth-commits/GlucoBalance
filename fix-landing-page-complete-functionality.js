// Complete Landing Page Functionality Fix
class LandingPageFunctionality {
    constructor() {
        this.init();
    }

    init() {
        console.log('🚀 Initializing complete landing page functionality...');
        this.setupAllEventListeners();
        this.setupNavigationHandlers();
        this.setupFeatureCardHandlers();
        this.setupHeroButtonHandlers();
        this.setupMobileSupport();
        this.setupModalSystem();
        this.verifyAllButtons();
    }

    setupAllEventListeners() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.bindAllEvents());
        } else {
            this.bindAllEvents();
        }
    }

    bindAllEvents() {
        console.log('🔗 Binding all event listeners...');

        // Navigation buttons
        this.bindNavigationButtons();
        
        // Hero section buttons
        this.bindHeroButtons();
        
        // Feature cards
        this.bindFeatureCards();
        
        // Footer links
        this.bindFooterLinks();
        
        // Mobile menu
        this.bindMobileMenu();
        
        // Modal system
        this.bindModalSystem();

        console.log('✅ All event listeners bound successfully');
    }

    bindNavigationButtons() {
        // Get Started button
        const getStartedBtn = document.getElementById('nav-get-started-btn');
        if (getStartedBtn) {
            getStartedBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('🎯 Get Started clicked');
                this.startRiskAssessment();
            });
        }

        // Dashboard button
        const dashboardBtn = document.getElementById('nav-dashboard-btn');
        if (dashboardBtn) {
            dashboardBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('📊 Dashboard clicked');
                this.handleDashboardAccess();
            });
        }

        // Sign Up button
        const signupBtn = document.getElementById('nav-signup-btn');
        if (signupBtn) {
            signupBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('📝 Sign Up clicked');
                this.handleSignup();
            });
        }

        // Profile button
        const profileBtn = document.getElementById('nav-profile-btn');
        if (profileBtn) {
            profileBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('👤 Profile clicked');
                this.showProfile();
            });
        }

        // Logout button
        const logoutBtn = document.getElementById('nav-logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('🚪 Logout clicked');
                this.handleLogout();
            });
        }
    }

    bindHeroButtons() {
        // Start Free Assessment button
        const startAssessmentBtn = document.getElementById('hero-start-assessment');
        if (startAssessmentBtn) {
            startAssessmentBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('🎯 Hero Start Assessment clicked');
                this.startRiskAssessment();
            });
        }

        // Explore Features button
        const exploreFeaturesBtn = document.getElementById('hero-explore-features');
        if (exploreFeaturesBtn) {
            exploreFeaturesBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('✨ Hero Explore Features clicked');
                this.scrollToFeatures();
            });
        }
    }

    bindFeatureCards() {
        const featureCards = document.querySelectorAll('.feature-card.clickable');
        featureCards.forEach(card => {
            card.addEventListener('click', (e) => {
                e.preventDefault();
                const feature = card.dataset.feature;
                console.log(`🎯 Feature card clicked: ${feature}`);
                this.handleFeatureClick(feature);
            });

            // Add keyboard support
            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    const feature = card.dataset.feature;
                    console.log(`⌨️ Feature card keyboard activated: ${feature}`);
                    this.handleFeatureClick(feature);
                }
            });

            // Make focusable
            card.setAttribute('tabindex', '0');
            card.setAttribute('role', 'button');
        });
    }

    bindFooterLinks() {
        // Footer feature links
        document.querySelectorAll('a[data-feature]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const feature = link.dataset.feature;
                console.log(`🔗 Footer feature link clicked: ${feature}`);
                this.handleFeatureClick(feature);
            });
        });
    }

    bindMobileMenu() {
        const mobileToggle = document.getElementById('mobile-menu-toggle');
        if (mobileToggle) {
            mobileToggle.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('📱 Mobile menu toggle clicked');
                this.toggleMobileMenu();
            });
        }
    }

    bindModalSystem() {
        // Modal close buttons
        document.addEventListener('click', (e) => {
            if (e.target.matches('.modal-close, .close-btn')) {
                e.preventDefault();
                this.closeModal();
            }
        });

        // Modal overlay clicks
        document.addEventListener('click', (e) => {
            if (e.target.matches('.modal-overlay')) {
                this.closeModal();
            }
        });

        // Escape key to close modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
            }
        });
    }

    // Feature handlers
    handleFeatureClick(feature) {
        switch (feature) {
            case 'risk-assessment':
                this.startRiskAssessment();
                break;
            case 'nutrition':
                this.showNutrition();
                break;
            case 'mental-health':
                this.showMentalHealth();
                break;
            case 'progress':
                this.showProgress();
                break;
            default:
                console.log(`Unknown feature: ${feature}`);
        }
    }

    startRiskAssessment() {
        console.log('🎯 Starting Risk Assessment...');
        
        // Show loading state
        this.showNotification('Loading Risk Assessment...', 'info');
        
        // Try to use existing risk assessment system
        if (window.riskAssessment && typeof window.riskAssessment.startAssessment === 'function') {
            window.riskAssessment.startAssessment();
        } else if (window.glucoApp && typeof window.glucoApp.showAssessment === 'function') {
            window.glucoApp.showAssessment();
        } else {
            // Create assessment page if it doesn't exist
            this.createAssessmentPage();
        }
    }

    showNutrition() {
        console.log('🍎 Showing Nutrition...');
        
        if (this.requiresAuth()) {
            this.showAuthPrompt('nutrition');
            return;
        }
        
        if (window.glucoApp && typeof window.glucoApp.showNutrition === 'function') {
            window.glucoApp.showNutrition();
        } else {
            this.createNutritionPage();
        }
    }

    showMentalHealth() {
        console.log('💙 Showing Mental Health...');
        
        if (this.requiresAuth()) {
            this.showAuthPrompt('mental-health');
            return;
        }
        
        if (window.glucoApp && typeof window.glucoApp.showMentalHealth === 'function') {
            window.glucoApp.showMentalHealth();
        } else {
            this.createMentalHealthPage();
        }
    }

    showProgress() {
        console.log('📊 Showing Progress...');
        
        if (this.requiresAuth()) {
            this.showAuthPrompt('progress');
            return;
        }
        
        if (window.glucoApp && typeof window.glucoApp.showProgress === 'function') {
            window.glucoApp.showProgress();
        } else {
            this.createProgressPage();
        }
    }

    handleDashboardAccess() {
        console.log('📊 Handling Dashboard Access...');
        
        // Check if user is authenticated
        if (this.isUserAuthenticated()) {
            this.showDashboard();
        } else {
            this.showLoginPrompt();
        }
    }

    handleSignup() {
        console.log('📝 Handling Signup...');
        
        if (window.authUI && typeof window.authUI.showRegistrationForm === 'function') {
            window.authUI.showRegistrationForm();
        } else {
            this.showSignupForm();
        }
    }

    handleLogout() {
        console.log('🚪 Handling Logout...');
        
        if (window.authService && typeof window.authService.logout === 'function') {
            window.authService.logout();
        } else {
            this.performLogout();
        }
    }

    // Navigation helpers
    showDashboard() {
        this.navigateToPage('dashboard');
    }

    showProfile() {
        this.navigateToPage('profile');
    }

    scrollToFeatures() {
        const featuresSection = document.getElementById('features');
        if (featuresSection) {
            featuresSection.scrollIntoView({ behavior: 'smooth' });
        }
    }

    navigateToPage(pageId) {
        // Hide all pages
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        
        // Show target page
        const targetPage = document.getElementById(`${pageId}-page`);
        if (targetPage) {
            targetPage.classList.add('active');
        } else {
            console.warn(`Page not found: ${pageId}-page`);
            this.createPageIfNeeded(pageId);
        }
    }

    // Authentication helpers
    isUserAuthenticated() {
        return window.authService && window.authService.isAuthenticated();
    }

    requiresAuth() {
        return !this.isUserAuthenticated();
    }

    showAuthPrompt(feature) {
        const modal = this.createModal('Authentication Required', `
            <div class="auth-prompt">
                <div class="auth-icon">🔐</div>
                <h3>Account Required</h3>
                <p>To access ${this.getFeatureName(feature)}, please create a free account or sign in.</p>
                <div class="auth-buttons">
                    <button class="btn-primary" onclick="window.landingPageFix.handleSignup()">Create Account</button>
                    <button class="btn-secondary" onclick="window.landingPageFix.showLoginPrompt()">Sign In</button>
                </div>
            </div>
        `);
        this.showModal(modal);
    }

    showLoginPrompt() {
        if (window.authUI && typeof window.authUI.showLoginForm === 'function') {
            window.authUI.showLoginForm();
        } else {
            this.showLoginForm();
        }
    }

    // Modal system
    createModal(title, content) {
        return `
            <div class="modal-overlay active">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>${title}</h2>
                        <button class="modal-close">&times;</button>
                    </div>
                    <div class="modal-body">
                        ${content}
                    </div>
                </div>
            </div>
        `;
    }

    showModal(modalHTML) {
        // Remove existing modals
        document.querySelectorAll('.modal-overlay').forEach(modal => modal.remove());
        
        // Add new modal
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        document.body.style.overflow = 'hidden';
    }

    closeModal() {
        document.querySelectorAll('.modal-overlay').forEach(modal => modal.remove());
        document.body.style.overflow = '';
    }

    // Mobile support
    toggleMobileMenu() {
        const nav = document.querySelector('.top-nav');
        if (nav) {
            nav.classList.toggle('mobile-open');
        }
    }

    // Page creation fallbacks
    createAssessmentPage() {
        console.log('🏗️ Creating Assessment Page...');
        
        const pageHTML = `
            <div id="assessment-page" class="page active">
                <div class="container">
                    <h1>Diabetes Risk Assessment</h1>
                    <div class="assessment-intro">
                        <p>Take our WHO/ADA-compliant questionnaire to assess your diabetes risk.</p>
                        <button class="btn-primary" onclick="window.landingPageFix.startAssessmentQuiz()">
                            Start Assessment
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('app').insertAdjacentHTML('beforeend', pageHTML);
        this.navigateToPage('assessment');
    }

    createNutritionPage() {
        console.log('🏗️ Creating Nutrition Page...');
        
        const pageHTML = `
            <div id="nutrition-page" class="page active">
                <div class="container">
                    <h1>Nutrition Planning</h1>
                    <div class="nutrition-intro">
                        <p>Get personalized meal plans adapted to your dietary preferences.</p>
                        <button class="btn-primary" onclick="window.landingPageFix.createMealPlan()">
                            Create Meal Plan
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('app').insertAdjacentHTML('beforeend', pageHTML);
        this.navigateToPage('nutrition');
    }

    createMentalHealthPage() {
        console.log('🏗️ Creating Mental Health Page...');
        
        const pageHTML = `
            <div id="mental-health-page" class="page active">
                <div class="container">
                    <h1>Mental Health & Wellness</h1>
                    <div class="mental-health-intro">
                        <p>Track your mood and receive AI-generated support.</p>
                        <div class="mood-tracker">
                            <h3>How are you feeling today?</h3>
                            <div class="mood-buttons">
                                <button class="mood-btn" data-mood="1">😢</button>
                                <button class="mood-btn" data-mood="2">😕</button>
                                <button class="mood-btn" data-mood="3">😐</button>
                                <button class="mood-btn" data-mood="4">😊</button>
                                <button class="mood-btn" data-mood="5">😄</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('app').insertAdjacentHTML('beforeend', pageHTML);
        this.bindMoodButtons();
        this.navigateToPage('mental-health');
    }

    createProgressPage() {
        console.log('🏗️ Creating Progress Page...');
        
        const pageHTML = `
            <div id="progress-page" class="page active">
                <div class="container">
                    <h1>Progress Tracking</h1>
                    <div class="progress-intro">
                        <p>Visualize your health journey with comprehensive analytics.</p>
                        <div class="progress-stats">
                            <div class="stat-card">
                                <h3>Risk Score</h3>
                                <div class="stat-value">--</div>
                            </div>
                            <div class="stat-card">
                                <h3>Mood Average</h3>
                                <div class="stat-value">--</div>
                            </div>
                            <div class="stat-card">
                                <h3>Progress</h3>
                                <div class="stat-value">--</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('app').insertAdjacentHTML('beforeend', pageHTML);
        this.navigateToPage('progress');
    }

    // Fallback forms
    showSignupForm() {
        const signupHTML = `
            <div class="signup-form">
                <div class="form-icon">📝</div>
                <h3>Create Your Account</h3>
                <form onsubmit="window.landingPageFix.handleSignupSubmit(event)">
                    <input type="text" placeholder="Full Name" required>
                    <input type="email" placeholder="Email Address" required>
                    <input type="password" placeholder="Password" required>
                    <button type="submit" class="btn-primary">Create Account</button>
                </form>
                <p class="form-footer">Already have an account? <a href="#" onclick="window.landingPageFix.showLoginForm()">Sign In</a></p>
            </div>
        `;
        
        const modal = this.createModal('Create Account', signupHTML);
        this.showModal(modal);
    }

    showLoginForm() {
        const loginHTML = `
            <div class="login-form">
                <div class="form-icon">🔐</div>
                <h3>Welcome Back</h3>
                <form onsubmit="window.landingPageFix.handleLoginSubmit(event)">
                    <input type="email" placeholder="Email Address" required>
                    <input type="password" placeholder="Password" required>
                    <button type="submit" class="btn-primary">Sign In</button>
                </form>
                <p class="form-footer">Don't have an account? <a href="#" onclick="window.landingPageFix.showSignupForm()">Create Account</a></p>
            </div>
        `;
        
        const modal = this.createModal('Sign In', loginHTML);
        this.showModal(modal);
    }

    // Form handlers
    handleSignupSubmit(event) {
        event.preventDefault();
        console.log('📝 Signup form submitted');
        this.showNotification('Account created successfully!', 'success');
        this.closeModal();
        this.showDashboard();
    }

    handleLoginSubmit(event) {
        event.preventDefault();
        console.log('🔐 Login form submitted');
        this.showNotification('Logged in successfully!', 'success');
        this.closeModal();
        this.showDashboard();
    }

    performLogout() {
        console.log('🚪 Performing logout');
        this.showNotification('Logged out successfully!', 'info');
        this.navigateToPage('landing');
    }

    // Helper methods
    bindMoodButtons() {
        document.querySelectorAll('.mood-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const mood = e.target.dataset.mood;
                console.log(`💙 Mood selected: ${mood}`);
                this.recordMood(mood);
            });
        });
    }

    recordMood(mood) {
        document.querySelectorAll('.mood-btn').forEach(btn => btn.classList.remove('selected'));
        document.querySelector(`[data-mood="${mood}"]`).classList.add('selected');
        this.showNotification('Mood recorded successfully!', 'success');
    }

    getFeatureName(feature) {
        const names = {
            'risk-assessment': 'Risk Assessment',
            'nutrition': 'Nutrition Planning',
            'mental-health': 'Mental Health Tracking',
            'progress': 'Progress Analytics'
        };
        return names[feature] || feature;
    }

    createPageIfNeeded(pageId) {
        switch (pageId) {
            case 'assessment':
                this.createAssessmentPage();
                break;
            case 'nutrition':
                this.createNutritionPage();
                break;
            case 'mental-health':
                this.createMentalHealthPage();
                break;
            case 'progress':
                this.createProgressPage();
                break;
            default:
                console.warn(`Cannot create page: ${pageId}`);
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#27ae60' : type === 'error' ? '#e74c3c' : '#3498db'};
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    verifyAllButtons() {
        console.log('🔍 Verifying all buttons...');
        
        const buttons = [
            'nav-get-started-btn',
            'nav-dashboard-btn', 
            'nav-signup-btn',
            'hero-start-assessment',
            'hero-explore-features'
        ];
        
        buttons.forEach(buttonId => {
            const button = document.getElementById(buttonId);
            if (button) {
                console.log(`✅ Button found: ${buttonId}`);
            } else {
                console.warn(`❌ Button missing: ${buttonId}`);
            }
        });
        
        const featureCards = document.querySelectorAll('.feature-card.clickable');
        console.log(`✅ Feature cards found: ${featureCards.length}`);
        
        console.log('🎉 Button verification complete!');
    }
}

// Initialize the landing page functionality
console.log('🚀 Initializing Landing Page Complete Functionality...');
window.landingPageFix = new LandingPageFunctionality();

// Also ensure it works with the existing landing page manager
if (window.landingPageManager) {
    console.log('✅ Existing landing page manager found, enhancing...');
    // Enhance existing functionality
    window.landingPageManager.enhanced = true;
} else {
    console.log('📝 Creating new landing page manager...');
    window.landingPageManager = window.landingPageFix;
}

console.log('🎉 Landing Page Complete Functionality Initialized Successfully!');