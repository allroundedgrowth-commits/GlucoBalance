// Landing Page Enhanced Functionality
class LandingPageManager {
    constructor() {
        this.featureData = {
            'risk-assessment': {
                title: 'Diabetes Risk Assessment',
                icon: '🎯',
                description: 'Take our comprehensive WHO/ADA-compliant questionnaire to assess your diabetes risk.',
                features: [
                    'Evidence-based risk scoring algorithm',
                    'Personalized risk factors analysis',
                    'AI-powered insights and recommendations',
                    'Immediate results with detailed explanations',
                    'Progress tracking over time'
                ],
                benefits: [
                    'Early detection of diabetes risk',
                    'Personalized prevention strategies',
                    'Regular monitoring and updates',
                    'Healthcare provider integration'
                ],
                action: 'Start Assessment Now',
                actionCallback: () => this.startRiskAssessment(),
                directAccess: true // This feature can be accessed without login
            },
            'nutrition': {
                title: 'Personalized Nutrition Planning',
                icon: '🍎',
                description: 'Get AI-powered meal plans tailored to your dietary preferences and health goals.',
                features: [
                    'Culturally adapted meal suggestions',
                    'Dietary restriction accommodations',
                    'Nutritional analysis and tracking',
                    'Shopping list generation',
                    'Recipe recommendations with instructions'
                ],
                benefits: [
                    'Improved blood sugar control',
                    'Weight management support',
                    'Reduced diabetes risk factors',
                    'Enhanced overall health'
                ],
                action: 'Explore Nutrition',
                actionCallback: () => this.exploreNutrition()
            },
            'mental-health': {
                title: 'Mental Health & Wellness',
                icon: '💙',
                description: 'Track your mood and receive AI-generated support for mental wellness.',
                features: [
                    'Daily mood tracking and analysis',
                    'Stress level monitoring',
                    'AI-generated affirmations and support',
                    'Mindfulness and relaxation exercises',
                    'Mental health trend analysis'
                ],
                benefits: [
                    'Better emotional regulation',
                    'Reduced stress and anxiety',
                    'Improved overall well-being',
                    'Enhanced diabetes management'
                ],
                action: 'Start Tracking',
                actionCallback: () => this.startMentalHealth()
            },
            'progress': {
                title: 'Progress Tracking & Analytics',
                icon: '📊',
                description: 'Visualize your health journey with comprehensive progress tracking and insights.',
                features: [
                    'Interactive health dashboards',
                    'Trend analysis and predictions',
                    'Goal setting and achievement tracking',
                    'Comprehensive health reports',
                    'Data export for healthcare providers'
                ],
                benefits: [
                    'Clear visibility into health improvements',
                    'Motivation through progress visualization',
                    'Data-driven health decisions',
                    'Better healthcare provider communication'
                ],
                action: 'View Dashboard',
                actionCallback: () => this.viewProgress()
            }
        };
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupSmoothScrolling();
        this.setupMobileMenu();
        this.setupFeatureCards();
        this.setupModal();
    }

    setupEventListeners() {
        // Navigation action buttons
        document.getElementById('nav-get-started-btn')?.addEventListener('click', () => this.startRiskAssessment());
        document.getElementById('nav-dashboard-btn')?.addEventListener('click', () => this.handleDashboardClick());
        document.getElementById('nav-signup-btn')?.addEventListener('click', () => this.handleSignupClick());
        
        // Mobile action buttons
        document.getElementById('mobile-get-started-btn')?.addEventListener('click', () => {
            this.closeMobileMenu();
            this.startRiskAssessment();
        });
        
        document.getElementById('mobile-dashboard-btn')?.addEventListener('click', () => {
            this.closeMobileMenu();
            this.handleDashboardClick();
        });
        
        document.querySelector('.mobile-signup')?.addEventListener('click', () => {
            this.closeMobileMenu();
            this.handleSignupClick();
        });
        
        // Footer links
        document.getElementById('help-center-link')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.showHelpCenter();
        });
        
        document.getElementById('privacy-policy-link')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.showPrivacyPolicy();
        });
        
        document.getElementById('terms-link')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.showTerms();
        });
        
        document.getElementById('contact-link')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.showContact();
        });
    }

    setupSmoothScrolling() {
        // Smooth scrolling for navigation links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                if (target) {
                    const offsetTop = target.offsetTop - 80; // Account for fixed nav
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    setupMobileMenu() {
        const mobileToggle = document.getElementById('mobile-menu-toggle');
        const mobileOverlay = document.getElementById('mobile-menu-overlay');
        
        mobileToggle?.addEventListener('click', () => this.toggleMobileMenu());
        mobileOverlay?.addEventListener('click', (e) => {
            if (e.target === mobileOverlay) {
                this.closeMobileMenu();
            }
        });

        // Mobile nav links
        document.querySelectorAll('.mobile-nav-link').forEach(link => {
            link.addEventListener('click', () => {
                this.closeMobileMenu();
            });
        });
    }

    setupFeatureCards() {
        document.querySelectorAll('.feature-card.clickable').forEach(card => {
            card.addEventListener('click', () => {
                const feature = card.dataset.feature;
                this.handleFeatureCardClick(feature);
            });

            // Add keyboard support
            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    const feature = card.dataset.feature;
                    this.handleFeatureCardClick(feature);
                }
            });

            // Add hover effects for better UX
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-4px)';
                card.style.boxShadow = '0 12px 30px rgba(0, 127, 255, 0.2)';
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0)';
                card.style.boxShadow = '';
            });

            // Make cards focusable
            card.setAttribute('tabindex', '0');
            card.setAttribute('role', 'button');
            card.setAttribute('aria-label', `Learn more about ${card.querySelector('h3').textContent}`);
        });

        // Footer feature links
        document.querySelectorAll('a[data-feature]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const feature = link.dataset.feature;
                this.handleFeatureCardClick(feature);
            });
        });

        // Add click handlers for hero buttons
        this.setupHeroButtons();
    }

    setupHeroButtons() {
        // Risk Assessment button in hero section
        const riskAssessmentBtn = document.querySelector('.hero-btn.primary');
        if (riskAssessmentBtn) {
            riskAssessmentBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.startRiskAssessment();
            });
        }

        // Explore Features button
        const exploreFeaturesBtn = document.querySelector('.hero-btn.secondary');
        if (exploreFeaturesBtn) {
            exploreFeaturesBtn.addEventListener('click', (e) => {
                e.preventDefault();
                document.querySelector('#features').scrollIntoView({behavior: 'smooth'});
            });
        }
    }

    setupModal() {
        const modal = document.getElementById('feature-modal');
        const closeBtn = document.getElementById('modal-close');
        const cancelBtn = document.getElementById('modal-cancel');

        closeBtn?.addEventListener('click', () => this.closeModal());
        cancelBtn?.addEventListener('click', () => this.closeModal());

        // Close modal on overlay click
        modal?.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeModal();
            }
        });

        // Close modal on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal?.classList.contains('active')) {
                this.closeModal();
            }
        });
    }

    toggleMobileMenu() {
        const overlay = document.getElementById('mobile-menu-overlay');
        const toggle = document.getElementById('mobile-menu-toggle');
        
        if (overlay?.classList.contains('active')) {
            this.closeMobileMenu();
        } else {
            overlay?.classList.add('active');
            toggle?.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    closeMobileMenu() {
        const overlay = document.getElementById('mobile-menu-overlay');
        const toggle = document.getElementById('mobile-menu-toggle');
        
        overlay?.classList.remove('active');
        toggle?.classList.remove('active');
        document.body.style.overflow = '';
    }

    handleFeatureCardClick(featureKey) {
        const feature = this.featureData[featureKey];
        if (!feature) return;

        // For risk assessment, allow direct access since it doesn't require login
        if (featureKey === 'risk-assessment') {
            this.showFeatureDetails(featureKey);
        } else {
            // For other features, check authentication first
            const isAuthenticated = this.checkUserAuthentication();
            if (isAuthenticated) {
                // User is authenticated, show feature details with action
                this.showFeatureDetails(featureKey);
            } else {
                // User not authenticated, show info and prompt for signup
                this.showFeatureDetailsWithSignupPrompt(featureKey);
            }
        }
    }

    // Check if user is authenticated
    checkUserAuthentication() {
        return window.authService && window.authService.isAuthenticated();
    }

    showFeatureDetailsWithSignupPrompt(featureKey) {
        const feature = this.featureData[featureKey];
        if (!feature) return;

        const modal = document.getElementById('feature-modal');
        const title = document.getElementById('modal-title');
        const body = document.getElementById('modal-body');
        const actionBtn = document.getElementById('modal-action');

        title.textContent = feature.title;
        actionBtn.textContent = 'Sign Up to Access';

        body.innerHTML = `
            <div class="feature-detail">
                <div class="feature-detail-header">
                    <div class="feature-detail-icon">${feature.icon}</div>
                    <h3 class="feature-detail-title">${feature.title}</h3>
                    <p class="feature-detail-description">${feature.description}</p>
                </div>
                
                <div class="auth-required-notice">
                    <div class="notice-icon">🔐</div>
                    <h4>Account Required</h4>
                    <p>To access personalized ${feature.title.toLowerCase()}, please create a free account or sign in.</p>
                </div>
                
                <div class="feature-detail-content">
                    <div class="feature-detail-section">
                        <h4>🚀 What You'll Get</h4>
                        <ul class="feature-list">
                            ${feature.features.map(item => `<li>${item}</li>`).join('')}
                        </ul>
                    </div>
                    
                    <div class="feature-detail-section">
                        <h4>💡 Benefits</h4>
                        <ul class="benefit-list">
                            ${feature.benefits.map(item => `<li>${item}</li>`).join('')}
                        </ul>
                    </div>
                </div>
                
                <div class="feature-detail-cta">
                    <div class="cta-content">
                        <h4>Ready to Get Started?</h4>
                        <p>Create your free account now to access all personalized features!</p>
                    </div>
                </div>
            </div>
        `;

        // Set up action button to go to signup
        actionBtn.onclick = () => {
            this.closeModal();
            this.showSignupPage();
        };

        this.showModal();
    }

    showFeatureDetails(featureKey) {
        const feature = this.featureData[featureKey];
        if (!feature) return;

        const modal = document.getElementById('feature-modal');
        const title = document.getElementById('modal-title');
        const body = document.getElementById('modal-body');
        const actionBtn = document.getElementById('modal-action');

        title.textContent = feature.title;
        actionBtn.textContent = feature.action;

        body.innerHTML = `
            <div class="feature-detail">
                <div class="feature-detail-header">
                    <div class="feature-detail-icon">${feature.icon}</div>
                    <h3 class="feature-detail-title">${feature.title}</h3>
                    <p class="feature-detail-description">${feature.description}</p>
                </div>
                
                <div class="feature-detail-content">
                    <div class="feature-detail-section">
                        <h4>🚀 Key Features</h4>
                        <ul class="feature-list">
                            ${feature.features.map(item => `<li>${item}</li>`).join('')}
                        </ul>
                    </div>
                    
                    <div class="feature-detail-section">
                        <h4>💡 Benefits for You</h4>
                        <ul class="benefit-list">
                            ${feature.benefits.map(item => `<li>${item}</li>`).join('')}
                        </ul>
                    </div>
                    
                    ${this.getFeatureSpecificInfo(featureKey)}
                </div>
                
                <div class="feature-detail-cta">
                    <div class="cta-content">
                        <h4>Ready to Get Started?</h4>
                        <p>${this.getFeatureCallToAction(featureKey)}</p>
                        ${feature.directAccess ? '<p class="direct-access-note">✨ No account required to get started!</p>' : '<p class="account-note">📝 Create a free account to access personalized features</p>'}
                    </div>
                </div>
            </div>
        `;

        // Set up action button
        actionBtn.onclick = () => {
            this.closeModal();
            feature.actionCallback();
        };

        this.showModal();
    }

    getFeatureSpecificInfo(featureKey) {
        const specificInfo = {
            'risk-assessment': `
                <div class="feature-detail-section">
                    <h4>📋 How It Works</h4>
                    <ol class="process-list">
                        <li>Complete a 5-minute WHO/ADA-compliant questionnaire</li>
                        <li>Get your personalized risk score instantly</li>
                        <li>Receive AI-powered recommendations based on your results</li>
                        <li>Access resources for prevention and early intervention</li>
                    </ol>
                </div>
                <div class="feature-detail-section">
                    <h4>🎯 What You'll Learn</h4>
                    <ul class="insight-list">
                        <li>Your current diabetes risk level (Low, Moderate, High)</li>
                        <li>Key risk factors specific to your profile</li>
                        <li>Personalized prevention strategies</li>
                        <li>When to consult with healthcare providers</li>
                    </ul>
                </div>`,
            'nutrition': `
                <div class="feature-detail-section">
                    <h4>🍽️ Personalized Meal Planning</h4>
                    <ol class="process-list">
                        <li>Tell us about your dietary preferences and restrictions</li>
                        <li>Get AI-generated meal plans adapted to your culture</li>
                        <li>Receive shopping lists and recipe instructions</li>
                        <li>Track your nutrition progress over time</li>
                    </ol>
                </div>
                <div class="feature-detail-section">
                    <h4>🥗 What's Included</h4>
                    <ul class="insight-list">
                        <li>Weekly meal plans with calorie and carb counts</li>
                        <li>Recipes adapted to your local cuisine</li>
                        <li>Smart shopping lists organized by store sections</li>
                        <li>Nutritional analysis and progress tracking</li>
                    </ul>
                </div>`,
            'mental-health': `
                <div class="feature-detail-section">
                    <h4>🧠 Mental Wellness Support</h4>
                    <ol class="process-list">
                        <li>Log your daily mood and stress levels</li>
                        <li>Receive personalized AI-generated affirmations</li>
                        <li>Access mindfulness exercises and coping strategies</li>
                        <li>Track patterns and progress over time</li>
                    </ol>
                </div>
                <div class="feature-detail-section">
                    <h4>💙 Support Features</h4>
                    <ul class="insight-list">
                        <li>Daily mood tracking with emoji-based interface</li>
                        <li>AI-powered motivational messages</li>
                        <li>Stress management techniques and exercises</li>
                        <li>Mental health trend analysis and insights</li>
                    </ul>
                </div>`,
            'progress': `
                <div class="feature-detail-section">
                    <h4>📈 Comprehensive Analytics</h4>
                    <ol class="process-list">
                        <li>View your health data in interactive charts</li>
                        <li>Track progress across all health metrics</li>
                        <li>Generate comprehensive reports for doctors</li>
                        <li>Set and monitor personal health goals</li>
                    </ol>
                </div>
                <div class="feature-detail-section">
                    <h4>📊 Analytics Dashboard</h4>
                    <ul class="insight-list">
                        <li>Risk score trends and improvements over time</li>
                        <li>Nutrition adherence and meal plan success</li>
                        <li>Mental health patterns and mood trends</li>
                        <li>Exportable reports for healthcare providers</li>
                    </ul>
                </div>`
        };
        
        return specificInfo[featureKey] || '';
    }

    getFeatureCallToAction(featureKey) {
        const callToActions = {
            'risk-assessment': 'Take your free diabetes risk assessment now and get personalized insights in just 5 minutes.',
            'nutrition': 'Create your personalized meal plan and start eating healthier today with AI-powered recommendations.',
            'mental-health': 'Begin tracking your mental wellness and receive daily support to maintain a positive mindset.',
            'progress': 'Start monitoring your health journey with comprehensive analytics and progress tracking.'
        };
        
        return callToActions[featureKey] || 'Get started with this feature to improve your health journey.';
    }

    showModal() {
        const modal = document.getElementById('feature-modal');
        modal?.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Focus management for accessibility
        const closeBtn = document.getElementById('modal-close');
        closeBtn?.focus();
    }

    closeModal() {
        const modal = document.getElementById('feature-modal');
        modal?.classList.remove('active');
        document.body.style.overflow = '';
    }

    // Navigation button handlers
    handleSignupClick() {
        console.log('🔐 Sign Up button clicked');
        
        // Remove any existing auth modal first
        const existingModal = document.getElementById('auth-modal');
        if (existingModal) {
            existingModal.remove();
        }
        
        // Check if authUI is available
        if (window.authUI && typeof window.authUI.showRegistrationForm === 'function') {
            console.log('✅ AuthUI available, showing registration form');
            window.authUI.showRegistrationForm();
        } else {
            console.error('❌ AuthUI not available, showing fallback');
            // Wait a bit and try again in case authUI is still loading
            setTimeout(() => {
                if (window.authUI && typeof window.authUI.showRegistrationForm === 'function') {
                    console.log('✅ AuthUI loaded, showing registration form');
                    window.authUI.showRegistrationForm();
                } else {
                    this.showFallbackSignup();
                }
            }, 500);
        }
    }

    handleDashboardClick() {
        console.log('📊 Dashboard button clicked');
        
        // Remove any existing auth modal first
        const existingModal = document.getElementById('auth-modal');
        if (existingModal) {
            existingModal.remove();
        }
        
        // Check if user is already authenticated
        if (window.authService && window.authService.isAuthenticated()) {
            console.log('✅ User authenticated, going to dashboard');
            // User is logged in, go directly to dashboard
            this.showDashboard();
        } else {
            console.log('❌ User not authenticated, showing login form');
            // User not logged in, show login form
            if (window.authUI && typeof window.authUI.showLoginForm === 'function') {
                console.log('✅ AuthUI available, showing login form');
                window.authUI.showLoginForm();
            } else {
                console.error('❌ AuthUI not available, showing fallback');
                // Wait a bit and try again in case authUI is still loading
                setTimeout(() => {
                    if (window.authUI && typeof window.authUI.showLoginForm === 'function') {
                        console.log('✅ AuthUI loaded, showing login form');
                        window.authUI.showLoginForm();
                    } else {
                        this.showFallbackLogin();
                    }
                }, 500);
            }
        }
    }

    showFallbackSignup() {
        // Create a simple fallback signup form
        const fallbackHTML = `
        <div id="auth-modal" class="modal-overlay">
            <div class="modal-content auth-modal">
                <div class="modal-header">
                    <h2>Create Your Account</h2>
                    <button class="close-btn" onclick="document.getElementById('auth-modal').remove()">&times;</button>
                </div>
                <div class="fallback-message">
                    <p>🔄 Authentication system is loading...</p>
                    <p>Please wait a moment and try again.</p>
                    <button class="btn-primary" onclick="window.landingPageManager.handleSignupClick()">Try Again</button>
                </div>
            </div>
        </div>`;
        
        document.body.insertAdjacentHTML('beforeend', fallbackHTML);
    }

    showFallbackLogin() {
        // Create a simple fallback login form
        const fallbackHTML = `
        <div id="auth-modal" class="modal-overlay">
            <div class="modal-content auth-modal">
                <div class="modal-header">
                    <h2>Welcome Back</h2>
                    <button class="close-btn" onclick="document.getElementById('auth-modal').remove()">&times;</button>
                </div>
                <div class="fallback-message">
                    <p>🔄 Authentication system is loading...</p>
                    <p>Please wait a moment and try again.</p>
                    <button class="btn-primary" onclick="window.landingPageManager.handleDashboardClick()">Try Again</button>
                </div>
            </div>
        </div>`;
        
        document.body.insertAdjacentHTML('beforeend', fallbackHTML);
    }

    showDashboard() {
        console.log('🏠 Navigating to dashboard');
        
        // Hide landing page
        this.hideLandingPage();
        
        // Show dashboard page
        this.showPage('dashboard');
        
        // Initialize dashboard if available
        if (window.glucoApp && typeof window.glucoApp.showDashboard === 'function') {
            window.glucoApp.showDashboard();
        }
    }

    // Helper methods for page navigation
    hideLandingPage() {
        const landingPage = document.getElementById('landing-page');
        if (landingPage) {
            landingPage.classList.remove('active');
        }
    }

    showPage(pageId) {
        // Hide all pages
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        
        // Show target page
        const targetPage = document.getElementById(`${pageId}-page`);
        if (targetPage) {
            targetPage.classList.add('active');
        }
    }

    showLandingPage() {
        // Hide all pages
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        
        // Show landing page
        const landingPage = document.getElementById('landing-page');
        if (landingPage) {
            landingPage.classList.add('active');
        }
    }

    // Feature action methods
    exploreNutrition() {
        console.log('🍎 Exploring Nutrition');
        if (window.glucoApp && typeof window.glucoApp.showNutrition === 'function') {
            window.glucoApp.showNutrition();
        }
    }

    startMentalHealth() {
        console.log('💙 Starting Mental Health');
        if (window.glucoApp && typeof window.glucoApp.showMentalHealth === 'function') {
            window.glucoApp.showMentalHealth();
        }
    }

    viewProgress() {
        console.log('📊 Viewing Progress');
        if (window.glucoApp && typeof window.glucoApp.showProgress === 'function') {
            window.glucoApp.showProgress();
        }
    }

    showSignupPage() {
        this.handleSignupClick();
    }

    // Help and support methods
    showHelpCenter() {
        alert('Help Center: For support, please contact our team at support@glucobalance.app');
    }

    showPrivacyPolicy() {
        alert('Privacy Policy: Your data is stored locally and never shared without consent. Full policy available at glucobalance.app/privacy');
    }

    showTerms() {
        alert('Terms of Service: By using GlucoBalance, you agree to our terms. Full terms available at glucobalance.app/terms');
    }

    showContact() {
        alert('Contact Us: Email: support@glucobalance.app | Phone: 1-800-GLUCO-HELP');
    }

    // Feature action callbacks
    startRiskAssessment() {
        console.log('🎯 Starting Risk Assessment');
        
        // Hide landing page and show assessment directly
        this.hideLandingPage();
        
        // Create assessment page if it doesn't exist
        if (!document.getElementById('assessment-page')) {
            this.createAssessmentPage();
        }
        
        // Show the assessment page
        this.showPage('assessment');
        
        // Initialize the risk assessment engine
        setTimeout(() => {
            if (window.RiskAssessmentEngine) {
                console.log('✅ Risk Assessment Engine found, initializing...');
                if (!window.riskAssessmentInstance) {
                    window.riskAssessmentInstance = new window.RiskAssessmentEngine();
                }
                window.riskAssessmentInstance.startAssessment();
            } else {
                console.log('⚠️ Risk Assessment Engine not found, using fallback');
                this.initializeFallbackAssessment();
            }
        }, 100);
    }

    createAssessmentPage() {
        const assessmentPage = document.createElement('div');
        assessmentPage.id = 'assessment-page';
        assessmentPage.className = 'page';
        assessmentPage.innerHTML = `
            <div class="assessment-container">
                <header class="assessment-header">
                    <div class="container">
                        <button class="back-btn" onclick="window.landingPageManager.showLandingPage()">← Back to Home</button>
                        <h1>🎯 Diabetes Risk Assessment</h1>
                        <p class="assessment-subtitle">WHO/ADA Compliant Questionnaire</p>
                    </div>
                </header>
                
                <main class="assessment-main">
                    <div class="container">
                        <!-- Assessment Welcome Screen -->
                        <div id="assessment-welcome" class="assessment-screen active">
                            <div class="welcome-card">
                                <div class="welcome-icon">🎯</div>
                                <h2>Diabetes Risk Assessment</h2>
                                <p class="welcome-description">
                                    This comprehensive questionnaire will help evaluate your diabetes risk using 
                                    evidence-based criteria from the World Health Organization (WHO) and 
                                    American Diabetes Association (ADA).
                                </p>
                                
                                <div class="assessment-info-grid">
                                    <div class="info-item">
                                        <div class="info-icon">⏱️</div>
                                        <h4>5 Minutes</h4>
                                        <p>Quick and easy to complete</p>
                                    </div>
                                    <div class="info-item">
                                        <div class="info-icon">🔒</div>
                                        <h4>Private & Secure</h4>
                                        <p>Your data is protected</p>
                                    </div>
                                    <div class="info-item">
                                        <div class="info-icon">📊</div>
                                        <h4>Instant Results</h4>
                                        <p>Get your risk score immediately</p>
                                    </div>
                                    <div class="info-item">
                                        <div class="info-icon">🏥</div>
                                        <h4>Evidence-Based</h4>
                                        <p>WHO/ADA compliant scoring</p>
                                    </div>
                                </div>
                                
                                <button class="btn-primary assessment-start-btn" onclick="window.landingPageManager.startAssessmentQuestions()">
                                    Start Assessment
                                </button>
                                
                                <div class="assessment-disclaimer">
                                    <p><strong>Important:</strong> This assessment is for informational purposes only and does not replace professional medical advice. Please consult with a healthcare provider for proper diagnosis and treatment.</p>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Assessment Questions Screen -->
                        <div id="assessment-questions" class="assessment-screen">
                            <div class="progress-container">
                                <div class="progress-bar">
                                    <div class="progress-fill" id="progress-fill"></div>
                                </div>
                                <div class="progress-text">
                                    <span id="current-question">1</span> of <span id="total-questions">8</span>
                                </div>
                            </div>
                            
                            <div class="question-container">
                                <div class="question-card">
                                    <h3 id="question-text">Loading question...</h3>
                                    <div id="question-options" class="question-options">
                                        <!-- Options will be dynamically inserted -->
                                    </div>
                                    
                                    <div class="question-navigation">
                                        <button class="btn-secondary" id="prev-btn" onclick="window.landingPageManager.previousQuestion()" disabled>
                                            Previous
                                        </button>
                                        <button class="btn-primary" id="next-btn" onclick="window.landingPageManager.nextQuestion()" disabled>
                                            Next
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Assessment Results Screen -->
                        <div id="assessment-results" class="assessment-screen">
                            <div class="results-container">
                                <div class="results-card">
                                    <div class="results-header">
                                        <div class="results-icon" id="results-icon">📊</div>
                                        <h2>Your Risk Assessment Results</h2>
                                    </div>
                                    
                                    <div class="risk-score-display">
                                        <div class="risk-score" id="risk-score">--</div>
                                        <div class="risk-category" id="risk-category">Calculating...</div>
                                        <div class="risk-description" id="risk-description">Please wait while we analyze your responses.</div>
                                    </div>
                                    
                                    <div class="recommendations" id="recommendations">
                                        <!-- Recommendations will be inserted here -->
                                    </div>
                                    
                                    <div class="results-actions">
                                        <button class="btn-primary" onclick="window.landingPageManager.saveResults()">
                                            Save Results
                                        </button>
                                        <button class="btn-secondary" onclick="window.landingPageManager.retakeAssessment()">
                                            Retake Assessment
                                        </button>
                                        <button class="btn-outline" onclick="window.landingPageManager.showLandingPage()">
                                            Back to Home
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        `;
        
        document.getElementById('app').appendChild(assessmentPage);
    }
                        <p>WHO/ADA Compliant Questionnaire</p>
                    </div>
                </header>
                
                <main class="container">
                    <div class="assessment-welcome">
                        <div class="welcome-card">
                            <h2>Welcome to Your Health Assessment</h2>
                            <p>This comprehensive questionnaire will help evaluate your diabetes risk using evidence-based criteria from the World Health Organization (WHO) and American Diabetes Association (ADA).</p>
                            
                            <div class="assessment-info">
                                <div class="info-item">
                                    <span class="info-icon">⏱️</span>
                                    <div>
                                        <h4>5 Minutes</h4>
                                        <p>Quick and easy to complete</p>
                                    </div>
                                </div>
                                <div class="info-item">
                                    <span class="info-icon">🔒</span>
                                    <div>
                                        <h4>Private & Secure</h4>
                                        <p>Your data is protected</p>
                                    </div>
                                </div>
                                <div class="info-item">
                                    <span class="info-icon">📊</span>
                                    <div>
                                        <h4>Instant Results</h4>
                                        <p>Get your risk score immediately</p>
                                    </div>
                                </div>
                            </div>
                            
                            <button class="btn-primary assessment-start" onclick="window.landingPageManager.showNotification('Risk Assessment module loading...', 'info')">
                                Start Assessment Now
                            </button>
                            
                            <p class="assessment-note">
                                <strong>Note:</strong> This assessment is for informational purposes only and does not replace professional medical advice.
                            </p>
                        </div>
                    </div>
                </main>
            </div>
        `;
        
        document.getElementById('app').appendChild(assessmentPage);
    }

    exploreNutrition() {
        // Check if user needs to be authenticated for this feature
        const isAuthenticated = this.checkUserAuthentication();
        
        if (!isAuthenticated) {
            this.showNotification('Please create an account to access personalized nutrition planning', 'info');
            this.showSignup();
            return;
        }

        this.hideLandingPage();
        
        if (window.app && typeof window.app.showNutrition === 'function') {
            window.app.showNutrition();
        } else {
            // Create nutrition page if it doesn't exist
            if (!document.getElementById('nutrition-page')) {
                this.createNutritionPage();
            }
            this.showPage('nutrition');
        }
    }

    startMentalHealth() {
        // Check if user needs to be authenticated for this feature
        const isAuthenticated = this.checkUserAuthentication();
        
        if (!isAuthenticated) {
            this.showNotification('Please create an account to access mental health tracking', 'info');
            this.showSignup();
            return;
        }

        this.hideLandingPage();
        
        if (window.app && typeof window.app.showMentalHealth === 'function') {
            window.app.showMentalHealth();
        } else {
            // Create mental health page if it doesn't exist
            if (!document.getElementById('mental-health-page')) {
                this.createMentalHealthPage();
            }
            this.showPage('mental-health');
        }
    }

    viewProgress() {
        // Check if user needs to be authenticated for this feature
        const isAuthenticated = this.checkUserAuthentication();
        
        if (!isAuthenticated) {
            this.showNotification('Please create an account to access progress tracking', 'info');
            this.showSignup();
            return;
        }

        this.hideLandingPage();
        
        if (window.app && typeof window.app.showProgress === 'function') {
            window.app.showProgress();
        } else {
            // Create progress page if it doesn't exist
            if (!document.getElementById('progress-page')) {
                this.createProgressPage();
            }
            this.showPage('progress');
        }
    }

    // Create placeholder pages for features
    createNutritionPage() {
        const nutritionPage = document.createElement('div');
        nutritionPage.id = 'nutrition-page';
        nutritionPage.className = 'page';
        nutritionPage.innerHTML = `
            <header class="app-header">
                <div class="container">
                    <button class="back-btn" onclick="window.landingPageManager.showLandingPage()">← Back</button>
                    <h1>Nutrition Planning</h1>
                </div>
            </header>
            <main class="container">
                <div class="feature-container">
                    <div class="feature-welcome">
                        <h2>🍎 Personalized Nutrition Planning</h2>
                        <p>Get AI-powered meal plans tailored to your dietary preferences and health goals.</p>
                    </div>
                    <div class="feature-content">
                        <p>This feature is being loaded. Please wait...</p>
                        <div class="loading-spinner"></div>
                    </div>
                </div>
            </main>
        `;
        
        document.getElementById('app').appendChild(nutritionPage);
        
        // Try to load nutrition service
        if (window.moduleLoader) {
            window.moduleLoader.require('nutrition-service').then(() => {
                if (window.nutritionService) {
                    this.initializeNutritionFeature();
                }
            });
        }
    }

    createMentalHealthPage() {
        const mentalHealthPage = document.createElement('div');
        mentalHealthPage.id = 'mental-health-page';
        mentalHealthPage.className = 'page';
        mentalHealthPage.innerHTML = `
            <header class="app-header">
                <div class="container">
                    <button class="back-btn" onclick="window.landingPageManager.showLandingPage()">← Back</button>
                    <h1>Mental Health & Wellness</h1>
                </div>
            </header>
            <main class="container">
                <div class="feature-container">
                    <div class="feature-welcome">
                        <h2>💙 Mental Health Tracking</h2>
                        <p>Track your mood and receive AI-generated support for mental wellness.</p>
                    </div>
                    <div class="feature-content">
                        <p>This feature is being loaded. Please wait...</p>
                        <div class="loading-spinner"></div>
                    </div>
                </div>
            </main>
        `;
        
        document.getElementById('app').appendChild(mentalHealthPage);
        
        // Try to load mental health service
        if (window.moduleLoader) {
            window.moduleLoader.require('mental-health').then(() => {
                if (window.mentalHealthService) {
                    this.initializeMentalHealthFeature();
                }
            });
        }
    }

    createProgressPage() {
        const progressPage = document.createElement('div');
        progressPage.id = 'progress-page';
        progressPage.className = 'page';
        progressPage.innerHTML = `
            <header class="app-header">
                <div class="container">
                    <button class="back-btn" onclick="window.landingPageManager.showLandingPage()">← Back</button>
                    <h1>Progress Tracking</h1>
                </div>
            </header>
            <main class="container">
                <div class="feature-container">
                    <div class="feature-welcome">
                        <h2>📊 Progress Analytics</h2>
                        <p>Visualize your health journey with comprehensive progress tracking and insights.</p>
                    </div>
                    <div class="feature-content">
                        <p>This feature is being loaded. Please wait...</p>
                        <div class="loading-spinner"></div>
                    </div>
                </div>
            </main>
        `;
        
        document.getElementById('app').appendChild(progressPage);
        
        // Try to load progress dashboard
        if (window.moduleLoader) {
            window.moduleLoader.require('progress-dashboard').then(() => {
                if (window.progressDashboard) {
                    this.initializeProgressFeature();
                }
            });
        }
    }

    initializeNutritionFeature() {
        const container = document.querySelector('#nutrition-page .feature-content');
        if (container && window.nutritionService) {
            container.innerHTML = `
                <div class="nutrition-dashboard">
                    <h3>Your Nutrition Plan</h3>
                    <p>Personalized meal recommendations will appear here.</p>
                    <button class="btn-primary" onclick="window.nutritionService.generateMealPlan()">Generate Meal Plan</button>
                </div>
            `;
        }
    }

    initializeMentalHealthFeature() {
        const container = document.querySelector('#mental-health-page .feature-content');
        if (container && window.mentalHealthService) {
            container.innerHTML = `
                <div class="mental-health-dashboard">
                    <h3>Daily Mood Tracking</h3>
                    <div class="mood-selector">
                        <button class="mood-btn" data-mood="1">😢</button>
                        <button class="mood-btn" data-mood="2">😕</button>
                        <button class="mood-btn" data-mood="3">😐</button>
                        <button class="mood-btn" data-mood="4">😊</button>
                        <button class="mood-btn" data-mood="5">😄</button>
                    </div>
                    <p>How are you feeling today?</p>
                </div>
            `;
        }
    }

    initializeProgressFeature() {
        const container = document.querySelector('#progress-page .feature-content');
        if (container && window.progressDashboard) {
            container.innerHTML = `
                <div class="progress-dashboard">
                    <h3>Your Health Progress</h3>
                    <div class="progress-charts">
                        <p>Progress charts and analytics will appear here.</p>
                        <button class="btn-primary" onclick="window.progressDashboard.loadCharts()">Load Progress Data</button>
                    </div>
                </div>
            `;
        }
    }

    // Auth functions
    showLogin() {
        if (window.authUI && typeof window.authUI.showLoginForm === 'function') {
            window.authUI.showLoginForm();
        } else if (window.authUI && typeof window.authUI.showRegistrationForm === 'function') {
            // Fallback to registration if login not available
            window.authUI.showRegistrationForm();
        } else {
            this.createLoginModal();
        }
    }

    showSignup() {
        // Show dedicated signup page instead of modal
        this.showSignupPage();
    }

    showSignupPage() {
        // Hide landing page and show dedicated signup page
        this.hideLandingPage();
        
        // Create signup page if it doesn't exist
        if (!document.getElementById('signup-page')) {
            this.createSignupPage();
        }
        
        this.showPage('signup');
    }

    createSignupPage() {
        const signupPage = document.createElement('div');
        signupPage.id = 'signup-page';
        signupPage.className = 'page';
        signupPage.innerHTML = `
            <div class="auth-page">
                <div class="auth-container">
                    <div class="auth-header">
                        <button class="back-btn" onclick="window.landingPageManager.showLandingPage()">← Back to Home</button>
                        <div class="auth-logo">
                            <h1>GlucoBalance</h1>
                            <p>Create your account and start your health journey today!</p>
                        </div>
                    </div>
                    
                    <div class="auth-content">
                        <form id="signup-page-form" class="auth-form">
                            <h2>Create Your Account</h2>
                            
                            <div class="form-group">
                                <label for="signup-page-name">Full Name *</label>
                                <input type="text" id="signup-page-name" name="name" required placeholder="Enter your full name">
                                <div class="field-error" id="signup-name-error"></div>
                            </div>
                            
                            <div class="form-group">
                                <label for="signup-page-email">Email Address *</label>
                                <input type="email" id="signup-page-email" name="email" required placeholder="Enter your email address">
                                <div class="field-error" id="signup-email-error"></div>
                            </div>
                            
                            <div class="form-group">
                                <label for="signup-page-age">Age *</label>
                                <input type="number" id="signup-page-age" name="age" required min="13" max="120" placeholder="Enter your age">
                                <div class="field-error" id="signup-age-error"></div>
                            </div>
                            
                            <div class="form-group">
                                <label for="signup-page-password">Password *</label>
                                <input type="password" id="signup-page-password" name="password" required placeholder="Create a secure password">
                                <div class="field-error" id="signup-password-error"></div>
                            </div>
                            
                            <div class="form-group">
                                <label for="signup-page-confirm">Confirm Password *</label>
                                <input type="password" id="signup-page-confirm" name="confirmPassword" required placeholder="Confirm your password">
                                <div class="field-error" id="signup-confirm-error"></div>
                            </div>
                            
                            <div class="form-group checkbox-group">
                                <label>
                                    <input type="checkbox" id="signup-page-terms" required>
                                    I agree to the <a href="#" onclick="window.landingPageManager.showTerms()">Terms of Service</a> and <a href="#" onclick="window.landingPageManager.showPrivacyPolicy()">Privacy Policy</a>
                                </label>
                            </div>
                            
                            <button type="submit" class="btn-primary auth-submit" onclick="window.landingPageManager.handleSignupPageSubmit(event)">
                                Create Account & Access Dashboard
                            </button>
                            
                            <div class="auth-divider">
                                <span>Already have an account?</span>
                            </div>
                            
                            <button type="button" class="btn-outline auth-switch" onclick="window.landingPageManager.showLoginPage()">
                                Sign In Instead
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('app').appendChild(signupPage);
    }

    createSignupModal() {
        // Create a signup modal if authUI is not available
        const modal = document.createElement('div');
        modal.id = 'signup-modal';
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Create Your Account</h2>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="signup-form" class="auth-form">
                        <div class="form-group">
                            <label for="signup-name">Full Name *</label>
                            <input type="text" id="signup-name" name="name" required placeholder="Enter your full name">
                        </div>
                        <div class="form-group">
                            <label for="signup-email">Email Address *</label>
                            <input type="email" id="signup-email" name="email" required placeholder="Enter your email">
                        </div>
                        <div class="form-group">
                            <label for="signup-age">Age *</label>
                            <input type="number" id="signup-age" name="age" required min="13" max="120" placeholder="Enter your age">
                        </div>
                        <div class="form-group">
                            <label for="signup-password">Password *</label>
                            <input type="password" id="signup-password" name="password" required placeholder="Create a password">
                        </div>
                        <div class="form-group">
                            <label for="signup-confirm">Confirm Password *</label>
                            <input type="password" id="signup-confirm" name="confirmPassword" required placeholder="Confirm your password">
                        </div>
                        <div class="form-group checkbox-group">
                            <label>
                                <input type="checkbox" id="signup-terms" required>
                                I agree to the <a href="#" onclick="window.landingPageManager.showTerms()">Terms of Service</a> and <a href="#" onclick="window.landingPageManager.showPrivacyPolicy()">Privacy Policy</a>
                            </label>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn-secondary" onclick="this.closest('.modal').remove()">Cancel</button>
                    <button type="submit" class="btn-primary" onclick="window.landingPageManager.handleSignup(event)">Create Account</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        document.body.style.overflow = 'hidden';
        
        // Focus on first input
        setTimeout(() => {
            document.getElementById('signup-name')?.focus();
        }, 100);
    }

    createLoginModal() {
        // Create a login modal if authUI is not available
        const modal = document.createElement('div');
        modal.id = 'login-modal';
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Login to Your Account</h2>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="login-form" class="auth-form">
                        <div class="form-group">
                            <label for="login-email">Email Address *</label>
                            <input type="email" id="login-email" name="email" required placeholder="Enter your email">
                        </div>
                        <div class="form-group">
                            <label for="login-password">Password *</label>
                            <input type="password" id="login-password" name="password" required placeholder="Enter your password">
                        </div>
                        <div class="form-group checkbox-group">
                            <label>
                                <input type="checkbox" id="login-remember">
                                Remember me
                            </label>
                        </div>
                    </form>
                    <p class="auth-switch">
                        Don't have an account? <a href="#" onclick="this.closest('.modal').remove(); window.landingPageManager.showSignup()">Sign up here</a>
                    </p>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn-secondary" onclick="this.closest('.modal').remove()">Cancel</button>
                    <button type="submit" class="btn-primary" onclick="window.landingPageManager.handleLogin(event)">Login</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        document.body.style.overflow = 'hidden';
        
        // Focus on first input
        setTimeout(() => {
            document.getElementById('login-email')?.focus();
        }, 100);
    }

    async handleSignup(event) {
        event.preventDefault();
        
        const form = document.getElementById('signup-form');
        const formData = new FormData(form);
        const userData = {
            name: formData.get('name'),
            email: formData.get('email'),
            age: parseInt(formData.get('age')),
            password: formData.get('password'),
            confirmPassword: formData.get('confirmPassword')
        };

        // Validate form
        if (!this.validateSignupForm(userData)) {
            return;
        }

        try {
            // Use authService if available, otherwise create user locally
            if (window.authService && typeof window.authService.register === 'function') {
                const result = await window.authService.register(userData.email, userData.password, {
                    name: userData.name,
                    age: userData.age
                });
                
                if (result.success) {
                    this.showNotification('Account created successfully! Welcome to GlucoBalance!', 'success');
                    document.getElementById('signup-modal')?.remove();
                    document.body.style.overflow = '';
                    
                    // Navigate to dashboard
                    setTimeout(() => {
                        this.showDashboard();
                    }, 1000);
                } else {
                    this.showNotification(result.message || 'Registration failed. Please try again.', 'error');
                }
            } else {
                // Fallback: create user locally
                await this.createUserLocally(userData);
            }
        } catch (error) {
            console.error('Signup error:', error);
            this.showNotification('An error occurred during registration. Please try again.', 'error');
        }
    }

    async handleLogin(event) {
        event.preventDefault();
        
        const form = document.getElementById('login-form');
        const formData = new FormData(form);
        const loginData = {
            email: formData.get('email'),
            password: formData.get('password'),
            remember: formData.get('remember') === 'on'
        };

        try {
            // Use authService if available
            if (window.authService && typeof window.authService.login === 'function') {
                const result = await window.authService.login(loginData.email, loginData.password);
                
                if (result.success) {
                    this.showNotification('Login successful! Welcome back!', 'success');
                    document.getElementById('login-modal')?.remove();
                    document.body.style.overflow = '';
                    
                    // Navigate to dashboard
                    setTimeout(() => {
                        this.showDashboard();
                    }, 1000);
                } else {
                    this.showNotification(result.message || 'Login failed. Please check your credentials.', 'error');
                }
            } else {
                // Fallback: check local storage
                await this.loginUserLocally(loginData);
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showNotification('An error occurred during login. Please try again.', 'error');
        }
    }

    validateSignupForm(userData) {
        // Clear previous errors
        document.querySelectorAll('.field-error').forEach(el => el.textContent = '');
        
        let isValid = true;

        // Validate name
        if (!userData.name || userData.name.trim().length < 2) {
            this.showFieldError('name-error', 'Name must be at least 2 characters long');
            isValid = false;
        }

        // Validate email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!userData.email || !emailRegex.test(userData.email)) {
            this.showFieldError('email-error', 'Please enter a valid email address');
            isValid = false;
        }

        // Validate age
        if (!userData.age || userData.age < 13 || userData.age > 120) {
            this.showFieldError('age-error', 'Age must be between 13 and 120');
            isValid = false;
        }

        // Validate password
        if (!userData.password || userData.password.length < 6) {
            this.showFieldError('password-error', 'Password must be at least 6 characters long');
            isValid = false;
        }

        // Validate password confirmation
        if (userData.password !== userData.confirmPassword) {
            this.showFieldError('confirm-error', 'Passwords do not match');
            isValid = false;
        }

        // Check terms agreement
        const termsCheckbox = document.getElementById('signup-terms');
        if (!termsCheckbox?.checked) {
            this.showNotification('Please agree to the Terms of Service and Privacy Policy', 'warning');
            isValid = false;
        }

        return isValid;
    }

    showFieldError(elementId, message) {
        const errorElement = document.getElementById(elementId);
        if (errorElement) {
            errorElement.textContent = message;
        }
    }

    async createUserLocally(userData) {
        // Create user in local storage as fallback
        const users = JSON.parse(localStorage.getItem('glucobalance-users') || '[]');
        
        // Check if user already exists
        if (users.find(user => user.email === userData.email)) {
            this.showNotification('An account with this email already exists', 'error');
            return;
        }

        // Create new user
        const newUser = {
            id: Date.now().toString(),
            name: userData.name,
            email: userData.email,
            age: userData.age,
            password: userData.password, // In production, this should be hashed
            createdAt: new Date().toISOString(),
            isActive: true
        };

        users.push(newUser);
        localStorage.setItem('glucobalance-users', JSON.stringify(users));
        
        // Set current user session
        localStorage.setItem('glucobalance-current-user', JSON.stringify({
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
            age: newUser.age
        }));

        this.showNotification('Account created successfully! Welcome to GlucoBalance!', 'success');
        document.getElementById('signup-modal')?.remove();
        document.body.style.overflow = '';
        
        // Navigate to dashboard
        setTimeout(() => {
            this.showDashboard();
        }, 1000);
    }

    async loginUserLocally(loginData) {
        // Check local storage for user
        const users = JSON.parse(localStorage.getItem('glucobalance-users') || '[]');
        const user = users.find(u => u.email === loginData.email && u.password === loginData.password);

        if (user) {
            // Set current user session
            localStorage.setItem('glucobalance-current-user', JSON.stringify({
                id: user.id,
                name: user.name,
                email: user.email,
                age: user.age
            }));

            this.showNotification('Login successful! Welcome back!', 'success');
            document.getElementById('login-modal')?.remove();
            document.body.style.overflow = '';
            
            // Navigate to dashboard
            setTimeout(() => {
                this.showDashboard();
            }, 1000);
        } else {
            this.showNotification('Invalid email or password', 'error');
        }
    }

    // Footer link functions
    showHelpCenter() {
        this.showInfoModal('Help Center', `
            <h3>Getting Started</h3>
            <p>Welcome to GlucoBalance! Here are some quick tips to get you started:</p>
            <ul>
                <li>Take the risk assessment to understand your diabetes risk</li>
                <li>Set up your nutrition preferences for personalized meal plans</li>
                <li>Start tracking your daily mood and wellness</li>
                <li>Monitor your progress with our comprehensive dashboard</li>
            </ul>
            
            <h3>Need More Help?</h3>
            <p>Contact our support team at <a href="mailto:support@glucobalance.app">support@glucobalance.app</a></p>
        `);
    }

    showPrivacyPolicy() {
        this.showInfoModal('Privacy Policy', `
            <h3>Your Privacy Matters</h3>
            <p>At GlucoBalance, we are committed to protecting your privacy and personal health information.</p>
            
            <h4>Data Collection</h4>
            <p>We collect only the information necessary to provide you with personalized health insights and recommendations.</p>
            
            <h4>Data Security</h4>
            <p>All your health data is encrypted and stored securely. We never share your personal information with third parties without your explicit consent.</p>
            
            <h4>Your Rights</h4>
            <p>You have full control over your data and can request deletion or export at any time.</p>
            
            <p><em>Last updated: December 2024</em></p>
        `);
    }

    showTerms() {
        this.showInfoModal('Terms of Service', `
            <h3>Terms of Use</h3>
            <p>By using GlucoBalance, you agree to these terms and conditions.</p>
            
            <h4>Medical Disclaimer</h4>
            <p>GlucoBalance is designed to support your health journey but is not a substitute for professional medical advice, diagnosis, or treatment.</p>
            
            <h4>User Responsibilities</h4>
            <p>Users are responsible for providing accurate information and consulting healthcare providers for medical decisions.</p>
            
            <h4>Service Availability</h4>
            <p>We strive to provide continuous service but cannot guarantee 100% uptime.</p>
            
            <p><em>Last updated: December 2024</em></p>
        `);
    }

    showContact() {
        this.showInfoModal('Contact Us', `
            <h3>Get in Touch</h3>
            <p>We'd love to hear from you! Reach out to us through any of the following channels:</p>
            
            <div class="contact-info">
                <p><strong>Email:</strong> <a href="mailto:support@glucobalance.app">support@glucobalance.app</a></p>
                <p><strong>Phone:</strong> +1 (555) 123-4567</p>
                <p><strong>Address:</strong> 123 Health Street, Wellness City, WC 12345</p>
            </div>
            
            <h4>Support Hours</h4>
            <p>Monday - Friday: 9:00 AM - 6:00 PM EST<br>
            Saturday - Sunday: 10:00 AM - 4:00 PM EST</p>
            
            <h4>Emergency</h4>
            <p>For medical emergencies, please contact your healthcare provider or call emergency services immediately.</p>
        `);
    }

    showInfoModal(title, content) {
        const modal = document.getElementById('feature-modal');
        const modalTitle = document.getElementById('modal-title');
        const modalBody = document.getElementById('modal-body');
        const actionBtn = document.getElementById('modal-action');
        const cancelBtn = document.getElementById('modal-cancel');

        modalTitle.textContent = title;
        modalBody.innerHTML = content;
        actionBtn.textContent = 'Close';
        cancelBtn.style.display = 'none';

        actionBtn.onclick = () => {
            this.closeModal();
            cancelBtn.style.display = 'block';
        };

        this.showModal();
    }

    // Page navigation methods
    hideLandingPage() {
        const landingPage = document.getElementById('landing-page');
        if (landingPage) {
            landingPage.classList.remove('active');
        }
    }

    showLandingPage() {
        const landingPage = document.getElementById('landing-page');
        if (landingPage) {
            landingPage.classList.add('active');
        }
        // Hide other pages
        document.querySelectorAll('.page').forEach(page => {
            if (page.id !== 'landing-page') {
                page.classList.remove('active');
            }
        });
    }

    showPage(pageId) {
        // Hide all pages
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        
        // Show target page
        const targetPage = document.getElementById(`${pageId}-page`);
        if (targetPage) {
            targetPage.classList.add('active');
        }
        
        // Show bottom navigation for app pages
        const bottomNav = document.getElementById('bottom-nav');
        if (pageId !== 'landing' && bottomNav) {
            bottomNav.style.display = 'flex';
        }
    }

    createAssessmentPage() {
        // Create a basic assessment page if it doesn't exist
        const assessmentPage = document.createElement('div');
        assessmentPage.id = 'assessment-page';
        assessmentPage.className = 'page';
        assessmentPage.innerHTML = `
            <header class="app-header">
                <div class="container">
                    <button class="back-btn" onclick="window.landingPageManager.showLandingPage()">← Back</button>
                    <h1>Risk Assessment</h1>
                </div>
            </header>
            <main class="container">
                <div id="assessment-container">
                    <p>Loading risk assessment...</p>
                </div>
            </main>
        `;
        
        document.getElementById('app').appendChild(assessmentPage);
    }

    showDashboard() {
        // Check if user is authenticated
        const isAuthenticated = this.checkUserAuthentication();
        
        if (isAuthenticated) {
            // User is logged in, show dashboard
            this.hideLandingPage();
            this.showPage('dashboard');
            this.updateDashboardForUser();
        } else {
            // User not logged in, show login page
            this.showLoginPage();
        }
    }

    showLoginPage() {
        // Hide landing page and show dedicated login page
        this.hideLandingPage();
        
        // Create login page if it doesn't exist
        if (!document.getElementById('login-page')) {
            this.createLoginPage();
        }
        
        this.showPage('login');
    }

    createLoginPage() {
        const loginPage = document.createElement('div');
        loginPage.id = 'login-page';
        loginPage.className = 'page';
        loginPage.innerHTML = `
            <div class="auth-page">
                <div class="auth-container">
                    <div class="auth-header">
                        <button class="back-btn" onclick="window.landingPageManager.showLandingPage()">← Back to Home</button>
                        <div class="auth-logo">
                            <h1>GlucoBalance</h1>
                            <p>Welcome back! Please sign in to your account.</p>
                        </div>
                    </div>
                    
                    <div class="auth-content">
                        <form id="login-page-form" class="auth-form">
                            <h2>Sign In to Your Account</h2>
                            
                            <div class="form-group">
                                <label for="login-page-email">Email Address *</label>
                                <input type="email" id="login-page-email" name="email" required placeholder="Enter your email address">
                                <div class="field-error" id="login-email-error"></div>
                            </div>
                            
                            <div class="form-group">
                                <label for="login-page-password">Password *</label>
                                <input type="password" id="login-page-password" name="password" required placeholder="Enter your password">
                                <div class="field-error" id="login-password-error"></div>
                            </div>
                            
                            <div class="form-group checkbox-group">
                                <label>
                                    <input type="checkbox" id="login-page-remember">
                                    Remember me for 30 days
                                </label>
                            </div>
                            
                            <button type="submit" class="btn-primary auth-submit" onclick="window.landingPageManager.handleLoginPageSubmit(event)">
                                Sign In to Dashboard
                            </button>
                            
                            <div class="auth-divider">
                                <span>Don't have an account?</span>
                            </div>
                            
                            <button type="button" class="btn-outline auth-switch" onclick="window.landingPageManager.showSignupPage()">
                                Create New Account
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('app').appendChild(loginPage);
    }

    checkUserAuthentication() {
        // Check multiple authentication sources
        
        // 1. Check authService if available
        if (window.authService && typeof window.authService.isAuthenticated === 'function') {
            return window.authService.isAuthenticated();
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
        
        // 3. Check if user data exists in app
        if (window.app && window.app.userData && window.app.userData.id) {
            return true;
        }
        
        return false;
    }

    getCurrentUser() {
        // Get current user from multiple sources
        
        // 1. Check authService
        if (window.authService && typeof window.authService.getCurrentUser === 'function') {
            return window.authService.getCurrentUser();
        }
        
        // 2. Check local storage
        const currentUser = localStorage.getItem('glucobalance-current-user');
        if (currentUser) {
            try {
                return JSON.parse(currentUser);
            } catch (error) {
                console.error('Error parsing current user:', error);
                return null;
            }
        }
        
        // 3. Check app userData
        if (window.app && window.app.userData) {
            return window.app.userData;
        }
        
        return null;
    }

    updateDashboardForUser() {
        const user = this.getCurrentUser();
        if (!user) return;

        // Update dashboard with user information
        const profileBtn = document.getElementById('profile-btn');
        if (profileBtn) {
            profileBtn.textContent = user.name ? user.name.charAt(0).toUpperCase() : '👤';
            profileBtn.title = `Profile: ${user.name || user.email}`;
        }

        // Update any welcome messages
        const welcomeElements = document.querySelectorAll('.welcome-message');
        welcomeElements.forEach(el => {
            el.textContent = `Welcome back, ${user.name || 'User'}!`;
        });

        // Trigger dashboard data loading
        if (window.app && typeof window.app.loadDashboard === 'function') {
            window.app.loadDashboard();
        }
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-message">${message}</span>
                <button class="notification-close">&times;</button>
            </div>
        `;

        // Add to page
        document.body.appendChild(notification);

        // Show notification
        setTimeout(() => notification.classList.add('show'), 100);

        // Auto-hide after 5 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 5000);

        // Close button functionality
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        });
    }

    async handleLoginPageSubmit(event) {
        event.preventDefault();
        
        const form = document.getElementById('login-page-form');
        const formData = new FormData(form);
        const loginData = {
            email: formData.get('email'),
            password: formData.get('password'),
            remember: document.getElementById('login-page-remember').checked
        };

        // Clear previous errors
        document.querySelectorAll('.field-error').forEach(el => el.textContent = '');

        try {
            // Use authService if available
            if (window.authService && typeof window.authService.login === 'function') {
                const result = await window.authService.login(loginData.email, loginData.password);
                
                if (result.success) {
                    this.showNotification('Login successful! Welcome back!', 'success');
                    
                    // Navigate to dashboard
                    setTimeout(() => {
                        this.hideLandingPage();
                        this.showPage('dashboard');
                        this.updateDashboardForUser();
                    }, 1000);
                } else {
                    this.showNotification(result.message || 'Login failed. Please check your credentials.', 'error');
                }
            } else {
                // Fallback: check local storage
                await this.loginUserLocallyFromPage(loginData);
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showNotification('An error occurred during login. Please try again.', 'error');
        }
    }

    async handleSignupPageSubmit(event) {
        event.preventDefault();
        console.log('🔄 Registration form submitted');
        
        const form = document.getElementById('signup-page-form');
        if (!form) {
            console.error('❌ Signup form not found');
            this.showNotification('Form not found. Please try again.', 'error');
            return;
        }
        
        const formData = new FormData(form);
        const userData = {
            name: formData.get('name'),
            email: formData.get('email'),
            age: parseInt(formData.get('age')),
            password: formData.get('password'),
            confirmPassword: formData.get('confirmPassword')
        };

        console.log('📝 Form data collected:', { 
            name: userData.name, 
            email: userData.email, 
            age: userData.age,
            hasPassword: !!userData.password,
            hasConfirmPassword: !!userData.confirmPassword
        });

        // Validate form
        if (!this.validateSignupPageForm(userData)) {
            console.log('❌ Form validation failed');
            return;
        }

        console.log('✅ Form validation passed');

        try {
            // Use authService if available, otherwise create user locally
            if (window.authService && typeof window.authService.register === 'function') {
                console.log('🔄 Using authService for registration');
                const result = await window.authService.register(userData.email, userData.password, {
                    name: userData.name,
                    age: userData.age
                });
                
                if (result.success) {
                    console.log('✅ AuthService registration successful');
                    this.showNotification('Account created successfully! Welcome to GlucoBalance!', 'success');
                    
                    // Navigate to dashboard
                    setTimeout(() => {
                        this.hideLandingPage();
                        this.showPage('dashboard');
                        this.updateDashboardForUser();
                    }, 1000);
                } else {
                    console.log('❌ AuthService registration failed:', result.message);
                    this.showNotification(result.message || 'Registration failed. Please try again.', 'error');
                }
            } else {
                console.log('🔄 Using local storage for registration');
                // Fallback: create user locally
                await this.createUserLocallyFromPage(userData);
            }
        } catch (error) {
            console.error('❌ Signup error:', error);
            this.showNotification('An error occurred during registration. Please try again.', 'error');
        }
    }

    async loginUserLocallyFromPage(loginData) {
        // Check local storage for user
        const users = JSON.parse(localStorage.getItem('glucobalance-users') || '[]');
        const user = users.find(u => u.email === loginData.email && u.password === loginData.password);

        if (user) {
            // Set current user session
            localStorage.setItem('glucobalance-current-user', JSON.stringify({
                id: user.id,
                name: user.name,
                email: user.email,
                age: user.age
            }));

            this.showNotification('Login successful! Welcome back!', 'success');
            
            // Navigate to dashboard
            setTimeout(() => {
                this.hideLandingPage();
                this.showPage('dashboard');
                this.updateDashboardForUser();
            }, 1000);
        } else {
            this.showNotification('Invalid email or password', 'error');
        }
    }

    async createUserLocallyFromPage(userData) {
        console.log('🔄 Creating user locally with data:', userData);
        
        // Create user in local storage as fallback
        const users = JSON.parse(localStorage.getItem('glucobalance-users') || '[]');
        console.log('📊 Existing users count:', users.length);
        
        // Check if user already exists
        if (users.find(user => user.email === userData.email)) {
            console.log('❌ User already exists with email:', userData.email);
            this.showNotification('An account with this email already exists', 'error');
            return;
        }

        // Create new user
        const newUser = {
            id: Date.now().toString(),
            name: userData.name,
            email: userData.email,
            age: userData.age,
            password: userData.password, // In production, this should be hashed
            createdAt: new Date().toISOString(),
            isActive: true
        };

        console.log('👤 New user created:', { id: newUser.id, name: newUser.name, email: newUser.email });

        users.push(newUser);
        localStorage.setItem('glucobalance-users', JSON.stringify(users));
        console.log('💾 User saved to localStorage');
        
        // Set current user session
        const currentUserData = {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
            age: newUser.age
        };
        
        localStorage.setItem('glucobalance-current-user', JSON.stringify(currentUserData));
        console.log('🔐 User session created:', currentUserData);

        this.showNotification('Account created successfully! Welcome to GlucoBalance!', 'success');
        console.log('✅ Success notification shown');
        
        // Navigate to dashboard
        console.log('🔄 Navigating to dashboard in 1 second...');
        setTimeout(() => {
            console.log('🏠 Hiding landing page');
            this.hideLandingPage();
            console.log('📊 Showing dashboard page');
            this.showPage('dashboard');
            console.log('👤 Updating dashboard for user');
            this.updateDashboardForUser();
            console.log('✅ Dashboard navigation complete');
        }, 1000);
    }

    validateSignupPageForm(userData) {
        // Clear previous errors
        document.querySelectorAll('.field-error').forEach(el => el.textContent = '');
        
        let isValid = true;

        // Validate name
        if (!userData.name || userData.name.trim().length < 2) {
            document.getElementById('signup-name-error').textContent = 'Name must be at least 2 characters long';
            isValid = false;
        }

        // Validate email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!userData.email || !emailRegex.test(userData.email)) {
            document.getElementById('signup-email-error').textContent = 'Please enter a valid email address';
            isValid = false;
        }

        // Validate age
        if (!userData.age || userData.age < 13 || userData.age > 120) {
            document.getElementById('signup-age-error').textContent = 'Age must be between 13 and 120';
            isValid = false;
        }

        // Validate password
        if (!userData.password || userData.password.length < 6) {
            document.getElementById('signup-password-error').textContent = 'Password must be at least 6 characters long';
            isValid = false;
        }

        // Validate password confirmation
        if (userData.password !== userData.confirmPassword) {
            document.getElementById('signup-confirm-error').textContent = 'Passwords do not match';
            isValid = false;
        }

        // Check terms agreement
        const termsCheckbox = document.getElementById('signup-page-terms');
        if (!termsCheckbox?.checked) {
            this.showNotification('Please agree to the Terms of Service and Privacy Policy', 'warning');
            isValid = false;
        }

        return isValid;
    }

    showLandingPage() {
        // Hide all other pages and show landing page
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        
        const landingPage = document.getElementById('landing-page');
        if (landingPage) {
            landingPage.classList.add('active');
        }
        
        // Hide bottom navigation on landing page
        const bottomNav = document.getElementById('bottom-nav');
        if (bottomNav) {
            bottomNav.style.display = 'none';
        }
    }
}

// Initialize landing page manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    if (!window.landingPageManager) {
        window.landingPageManager = new LandingPageManager();
        console.log('✅ LandingPageManager initialized successfully');
    }
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LandingPageManager;
}

// Add scroll effect for navigation
window.addEventListener('scroll', () => {
    const nav = document.querySelector('.top-nav');
    if (window.scrollY > 50) {
        nav?.classList.add('scrolled');
    } else {
        nav?.classList.remove('scrolled');
    }
});

// Add smooth scroll behavior for better UX
document.documentElement.style.scrollBehavior = 'smooth';
//# sourceMappingURL=landing-page.js.map