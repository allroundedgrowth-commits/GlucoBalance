// Landing Page Button Functionality Fix
// This script ensures all buttons on the landing page work correctly

class LandingPageButtonFix {
    constructor() {
        this.init();
    }

    init() {
        console.log('🔧 Fixing landing page button functionality...');
        
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupButtons());
        } else {
            this.setupButtons();
        }
    }

    setupButtons() {
        // Fix navigation buttons
        this.fixNavigationButtons();
        
        // Fix feature cards
        this.fixFeatureCards();
        
        // Fix hero buttons
        this.fixHeroButtons();
        
        // Fix mobile menu
        this.fixMobileMenu();
        
        console.log('✅ Landing page buttons fixed successfully');
    }

    fixNavigationButtons() {
        console.log('🧭 Fixing navigation buttons...');
        
        // Get Started Free button
        const getStartedBtn = document.getElementById('nav-get-started-btn');
        if (getStartedBtn) {
            // Remove existing listeners
            getStartedBtn.replaceWith(getStartedBtn.cloneNode(true));
            const newGetStartedBtn = document.getElementById('nav-get-started-btn');
            
            newGetStartedBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('🎯 Get Started Free clicked');
                this.startRiskAssessment();
            });
            console.log('✅ Get Started Free button fixed');
        }

        // Dashboard button
        const dashboardBtn = document.getElementById('nav-dashboard-btn');
        if (dashboardBtn) {
            // Remove existing listeners
            dashboardBtn.replaceWith(dashboardBtn.cloneNode(true));
            const newDashboardBtn = document.getElementById('nav-dashboard-btn');
            
            newDashboardBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('📊 Dashboard button clicked');
                this.showDashboard();
            });
            console.log('✅ Dashboard button fixed');
        }

        // Sign Up button
        const signupBtn = document.getElementById('nav-signup-btn');
        if (signupBtn) {
            // Remove existing listeners
            signupBtn.replaceWith(signupBtn.cloneNode(true));
            const newSignupBtn = document.getElementById('nav-signup-btn');
            
            newSignupBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('📝 Sign Up button clicked');
                this.showSignup();
            });
            console.log('✅ Sign Up button fixed');
        }

        // Profile button
        const profileBtn = document.getElementById('nav-profile-btn');
        if (profileBtn) {
            // Remove existing listeners
            profileBtn.replaceWith(profileBtn.cloneNode(true));
            const newProfileBtn = document.getElementById('nav-profile-btn');
            
            newProfileBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('👤 Profile button clicked');
                this.showProfile();
            });
            console.log('✅ Profile button fixed');
        }

        // Logout button
        const logoutBtn = document.getElementById('nav-logout-btn');
        if (logoutBtn) {
            // Remove existing listeners
            logoutBtn.replaceWith(logoutBtn.cloneNode(true));
            const newLogoutBtn = document.getElementById('nav-logout-btn');
            
            newLogoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('🚪 Logout button clicked');
                this.handleLogout();
            });
            console.log('✅ Logout button fixed');
        }
    }

    fixFeatureCards() {
        console.log('🎯 Fixing feature cards...');
        
        const featureCards = document.querySelectorAll('.feature-card.clickable');
        featureCards.forEach((card, index) => {
            // Remove existing listeners by cloning
            const newCard = card.cloneNode(true);
            card.parentNode.replaceChild(newCard, card);
            
            const feature = newCard.dataset.feature;
            if (feature) {
                newCard.addEventListener('click', (e) => {
                    e.preventDefault();
                    console.log(`🎯 Feature card clicked: ${feature}`);
                    this.handleFeatureClick(feature);
                });
                
                // Add keyboard support
                newCard.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        console.log(`⌨️ Feature card activated via keyboard: ${feature}`);
                        this.handleFeatureClick(feature);
                    }
                });
                
                // Ensure accessibility
                newCard.setAttribute('tabindex', '0');
                newCard.setAttribute('role', 'button');
                newCard.setAttribute('aria-label', `Access ${feature} feature`);
                
                console.log(`✅ Feature card fixed: ${feature}`);
            }
        });
    }

    fixHeroButtons() {
        console.log('🦸 Fixing hero buttons...');
        
        // Look for hero buttons with different selectors
        const heroSelectors = [
            '.hero-btn.primary',
            '.hero-btn.secondary',
            '.btn-hero-primary',
            '.btn-hero-secondary',
            '[data-action="start-assessment"]',
            '[data-action="explore-features"]'
        ];
        
        heroSelectors.forEach(selector => {
            const buttons = document.querySelectorAll(selector);
            buttons.forEach(btn => {
                // Remove existing listeners
                const newBtn = btn.cloneNode(true);
                btn.parentNode.replaceChild(newBtn, btn);
                
                newBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    const action = newBtn.dataset.action || 'start-assessment';
                    console.log(`🦸 Hero button clicked: ${action}`);
                    
                    if (action === 'start-assessment' || newBtn.textContent.includes('Assessment') || newBtn.textContent.includes('Get Started')) {
                        this.startRiskAssessment();
                    } else if (action === 'explore-features' || newBtn.textContent.includes('Features')) {
                        this.scrollToFeatures();
                    }
                });
                
                console.log(`✅ Hero button fixed: ${selector}`);
            });
        });
    }

    fixMobileMenu() {
        console.log('📱 Fixing mobile menu...');
        
        const mobileToggle = document.getElementById('mobile-menu-toggle');
        if (mobileToggle) {
            // Remove existing listeners
            mobileToggle.replaceWith(mobileToggle.cloneNode(true));
            const newToggle = document.getElementById('mobile-menu-toggle');
            
            newToggle.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('📱 Mobile menu toggle clicked');
                this.toggleMobileMenu();
            });
            console.log('✅ Mobile menu toggle fixed');
        }

        // Fix mobile overlay
        const mobileOverlay = document.getElementById('mobile-menu-overlay');
        if (mobileOverlay) {
            mobileOverlay.replaceWith(mobileOverlay.cloneNode(true));
            const newOverlay = document.getElementById('mobile-menu-overlay');
            
            newOverlay.addEventListener('click', (e) => {
                if (e.target === newOverlay) {
                    console.log('📱 Mobile overlay clicked');
                    this.closeMobileMenu();
                }
            });
            console.log('✅ Mobile overlay fixed');
        }

        // Fix mobile action buttons
        const mobileGetStarted = document.getElementById('mobile-get-started-btn');
        if (mobileGetStarted) {
            mobileGetStarted.replaceWith(mobileGetStarted.cloneNode(true));
            const newMobileGetStarted = document.getElementById('mobile-get-started-btn');
            
            newMobileGetStarted.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('📱 Mobile Get Started clicked');
                this.closeMobileMenu();
                this.startRiskAssessment();
            });
            console.log('✅ Mobile Get Started button fixed');
        }

        const mobileDashboard = document.getElementById('mobile-dashboard-btn');
        if (mobileDashboard) {
            mobileDashboard.replaceWith(mobileDashboard.cloneNode(true));
            const newMobileDashboard = document.getElementById('mobile-dashboard-btn');
            
            newMobileDashboard.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('📱 Mobile Dashboard clicked');
                this.closeMobileMenu();
                this.showDashboard();
            });
            console.log('✅ Mobile Dashboard button fixed');
        }

        const mobileSignup = document.querySelector('.mobile-signup');
        if (mobileSignup) {
            mobileSignup.replaceWith(mobileSignup.cloneNode(true));
            const newMobileSignup = document.querySelector('.mobile-signup');
            
            newMobileSignup.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('📱 Mobile Sign Up clicked');
                this.closeMobileMenu();
                this.showSignup();
            });
            console.log('✅ Mobile Sign Up button fixed');
        }
    }

    // Button action methods
    startRiskAssessment() {
        console.log('🎯 Starting Risk Assessment...');
        
        // Try multiple approaches to start the assessment
        if (window.riskAssessment && typeof window.riskAssessment.startAssessment === 'function') {
            window.riskAssessment.startAssessment();
        } else if (window.RiskAssessmentEngine) {
            const assessment = new window.RiskAssessmentEngine();
            assessment.startAssessment();
        } else if (window.app && typeof window.app.showAssessment === 'function') {
            window.app.showAssessment();
        } else {
            // Fallback: navigate to assessment page or create one
            this.createAssessmentPage();
        }
    }

    showDashboard() {
        console.log('📊 Showing Dashboard...');
        
        // Try multiple approaches to show dashboard
        if (window.app && typeof window.app.showDashboard === 'function') {
            window.app.showDashboard();
        } else if (window.app && typeof window.app.navigateTo === 'function') {
            window.app.navigateTo('dashboard');
        } else {
            // Fallback: show dashboard page
            this.showPage('dashboard');
        }
    }

    showSignup() {
        console.log('📝 Showing Sign Up...');
        
        // Try multiple approaches to show signup
        if (window.authUI && typeof window.authUI.showSignupForm === 'function') {
            window.authUI.showSignupForm();
        } else if (window.app && typeof window.app.showSignup === 'function') {
            window.app.showSignup();
        } else {
            // Fallback: create signup modal
            this.createSignupModal();
        }
    }

    showProfile() {
        console.log('👤 Showing Profile...');
        
        if (window.app && typeof window.app.showProfile === 'function') {
            window.app.showProfile();
        } else {
            this.createProfileModal();
        }
    }

    handleLogout() {
        console.log('🚪 Handling Logout...');
        
        if (window.authService && typeof window.authService.logout === 'function') {
            window.authService.logout();
        } else if (window.app && typeof window.app.logout === 'function') {
            window.app.logout();
        } else {
            // Fallback logout
            localStorage.removeItem('glucobalance-user');
            this.showNotification('Logged out successfully', 'success');
            this.showLandingPage();
        }
    }

    handleFeatureClick(feature) {
        console.log(`🎯 Handling feature click: ${feature}`);
        
        const featureActions = {
            'risk-assessment': () => this.startRiskAssessment(),
            'nutrition': () => this.showNutrition(),
            'mental-health': () => this.showMentalHealth(),
            'progress': () => this.showProgress()
        };
        
        const action = featureActions[feature];
        if (action) {
            action();
        } else {
            console.warn(`Unknown feature: ${feature}`);
            this.showNotification(`${feature} feature coming soon!`, 'info');
        }
    }

    showNutrition() {
        console.log('🍎 Showing Nutrition...');
        
        if (window.app && typeof window.app.showNutrition === 'function') {
            window.app.showNutrition();
        } else {
            this.showPage('nutrition');
        }
    }

    showMentalHealth() {
        console.log('💙 Showing Mental Health...');
        
        if (window.app && typeof window.app.showMentalHealth === 'function') {
            window.app.showMentalHealth();
        } else {
            this.showPage('mental-health');
        }
    }

    showProgress() {
        console.log('📊 Showing Progress...');
        
        if (window.app && typeof window.app.showProgress === 'function') {
            window.app.showProgress();
        } else {
            this.showPage('progress');
        }
    }

    // Utility methods
    showPage(pageId) {
        // Hide all pages
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        
        // Show target page
        const targetPage = document.getElementById(`${pageId}-page`);
        if (targetPage) {
            targetPage.classList.add('active');
            console.log(`✅ Showing page: ${pageId}`);
        } else {
            console.warn(`Page not found: ${pageId}-page`);
            this.showNotification(`${pageId} page not available yet`, 'warning');
        }
    }

    showLandingPage() {
        this.showPage('landing');
    }

    scrollToFeatures() {
        const featuresSection = document.getElementById('features');
        if (featuresSection) {
            featuresSection.scrollIntoView({ behavior: 'smooth' });
        }
    }

    toggleMobileMenu() {
        const overlay = document.getElementById('mobile-menu-overlay');
        const toggle = document.getElementById('mobile-menu-toggle');
        
        if (overlay) {
            overlay.classList.toggle('active');
            document.body.style.overflow = overlay.classList.contains('active') ? 'hidden' : '';
        }
        
        if (toggle) {
            toggle.classList.toggle('active');
        }
    }

    closeMobileMenu() {
        const overlay = document.getElementById('mobile-menu-overlay');
        const toggle = document.getElementById('mobile-menu-toggle');
        
        if (overlay) {
            overlay.classList.remove('active');
        }
        
        if (toggle) {
            toggle.classList.remove('active');
        }
        
        document.body.style.overflow = '';
    }

    createAssessmentPage() {
        console.log('🎯 Creating assessment page...');
        
        // Check if page already exists
        if (document.getElementById('assessment-page')) {
            this.showPage('assessment');
            return;
        }
        
        const assessmentPage = document.createElement('div');
        assessmentPage.id = 'assessment-page';
        assessmentPage.className = 'page';
        assessmentPage.innerHTML = `
            <div class="assessment-container">
                <header class="page-header">
                    <div class="container">
                        <button class="back-btn" onclick="window.landingPageButtonFix.showLandingPage()">← Back to Home</button>
                        <h1>🎯 Diabetes Risk Assessment</h1>
                        <p>WHO/ADA Compliant Questionnaire</p>
                    </div>
                </header>
                
                <main class="container">
                    <div class="assessment-welcome">
                        <div class="welcome-card">
                            <h2>Welcome to Your Health Assessment</h2>
                            <p>This comprehensive questionnaire will help evaluate your diabetes risk using evidence-based criteria.</p>
                            
                            <div class="assessment-features">
                                <div class="feature-item">
                                    <span class="feature-icon">⏱️</span>
                                    <span>5 minutes to complete</span>
                                </div>
                                <div class="feature-item">
                                    <span class="feature-icon">🔒</span>
                                    <span>Private and secure</span>
                                </div>
                                <div class="feature-item">
                                    <span class="feature-icon">📊</span>
                                    <span>Instant results</span>
                                </div>
                            </div>
                            
                            <button class="btn-primary" onclick="window.landingPageButtonFix.showNotification('Assessment feature coming soon!', 'info')">
                                Start Assessment
                            </button>
                        </div>
                    </div>
                </main>
            </div>
        `;
        
        document.getElementById('app').appendChild(assessmentPage);
        this.showPage('assessment');
    }

    createSignupModal() {
        console.log('📝 Creating signup modal...');
        
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Sign Up for GlucoBalance</h2>
                    <button class="modal-close" onclick="this.parentElement.parentElement.parentElement.remove()">×</button>
                </div>
                <div class="modal-body">
                    <form class="signup-form">
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
        `;
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
        
        modal.querySelector('.signup-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.showNotification('Account creation feature coming soon!', 'info');
            modal.remove();
        });
        
        document.body.appendChild(modal);
    }

    createProfileModal() {
        console.log('👤 Creating profile modal...');
        
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>User Profile</h2>
                    <button class="modal-close" onclick="this.parentElement.parentElement.parentElement.remove()">×</button>
                </div>
                <div class="modal-body">
                    <div class="profile-info">
                        <div class="profile-avatar">👤</div>
                        <h3>Welcome, User!</h3>
                        <p>Manage your health profile and preferences</p>
                        <button class="btn-primary" onclick="window.landingPageButtonFix.showNotification('Profile management coming soon!', 'info')">
                            Edit Profile
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
        
        document.body.appendChild(modal);
    }

    showNotification(message, type = 'info') {
        console.log(`📢 Notification: ${message} (${type})`);
        
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#10b981' : type === 'warning' ? '#f59e0b' : type === 'error' ? '#ef4444' : '#3b82f6'};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 10000;
            animation: slideInRight 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Initialize the fix when the script loads
window.landingPageButtonFix = new LandingPageButtonFix();

// Add CSS for notifications and modals
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOutRight {
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
        z-index: 10000;
    }
    
    .modal-content {
        background: white;
        border-radius: 12px;
        width: 90%;
        max-width: 500px;
        max-height: 90vh;
        overflow-y: auto;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
    }
    
    .modal-header {
        padding: 20px;
        border-bottom: 1px solid #e5e7eb;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    
    .modal-header h2 {
        margin: 0;
        color: #1f2937;
    }
    
    .modal-close {
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        color: #6b7280;
    }
    
    .modal-body {
        padding: 20px;
    }
    
    .form-group {
        margin-bottom: 16px;
    }
    
    .form-group label {
        display: block;
        margin-bottom: 4px;
        font-weight: 500;
        color: #374151;
    }
    
    .form-group input {
        width: 100%;
        padding: 8px 12px;
        border: 1px solid #d1d5db;
        border-radius: 6px;
        font-size: 14px;
    }
    
    .profile-info {
        text-align: center;
    }
    
    .profile-avatar {
        font-size: 48px;
        margin-bottom: 16px;
    }
    
    .assessment-features {
        display: grid;
        gap: 12px;
        margin: 20px 0;
    }
    
    .feature-item {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px;
        background: #f9fafb;
        border-radius: 6px;
    }
    
    .feature-icon {
        font-size: 18px;
    }
    
    .page-header {
        background: #f8fafc;
        padding: 20px 0;
        border-bottom: 1px solid #e5e7eb;
    }
    
    .back-btn {
        background: none;
        border: none;
        color: #3b82f6;
        cursor: pointer;
        font-size: 14px;
        margin-bottom: 10px;
    }
    
    .back-btn:hover {
        text-decoration: underline;
    }
    
    .welcome-card {
        background: white;
        border-radius: 12px;
        padding: 30px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        margin: 20px 0;
    }
`;

document.head.appendChild(style);

console.log('🔧 Landing page button fix loaded successfully');