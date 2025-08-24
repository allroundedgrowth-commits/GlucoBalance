// Enhanced Landing Page Manager - Comprehensive Fix
class EnhancedLandingPageManager {
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
                directAccess: true
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
        console.log('🚀 Enhanced Landing Page Manager initializing...');
        this.setupEventListeners();
        this.setupFeatureCards();
        this.setupModal();
        this.setupMobileMenu();
        this.setupNavigationButtons();
        this.setupHeroButtons();
        this.addVisualEnhancements();
        console.log('✅ Enhanced Landing Page Manager initialized successfully');
    }

    setupEventListeners() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.bindEvents());
        } else {
            this.bindEvents();
        }
    }

    bindEvents() {
        // Navigation buttons
        this.bindNavigationButtons();
        
        // Hero section buttons
        this.bindHeroButtons();
        
        // Feature cards
        this.bindFeatureCards();
        
        // Modal controls
        this.bindModalControls();
        
        // Mobile menu
        this.bindMobileMenu();
        
        // Footer links
        this.bindFooterLinks();
    }

    bindNavigationButtons() {
        // Dashboard button
        const dashboardBtn = document.getElementById('nav-dashboard-btn');
        if (dashboardBtn) {
            dashboardBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showDashboard();
            });
        }

        // Sign up button
        const signupBtn = document.getElementById('nav-signup-btn');
        if (signupBtn) {
            signupBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showSignup();
            });
        }

        // Mobile dashboard button
        const mobileDashboardBtn = document.getElementById('mobile-dashboard-btn');
        if (mobileDashboardBtn) {
            mobileDashboardBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.closeMobileMenu();
                this.showDashboard();
            });
        }

        // Mobile signup button
        const mobileSignupBtn = document.querySelector('.mobile-signup');
        if (mobileSignupBtn) {
            mobileSignupBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.closeMobileMenu();
                this.showSignup();
            });
        }
    }

    bindHeroButtons() {
        // Get Started button in hero
        const heroGetStartedBtn = document.getElementById('hero-get-started-btn');
        if (heroGetStartedBtn) {
            heroGetStartedBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.startRiskAssessment();
            });
        }

        // Demo button removed - no longer needed

        // Legacy support for existing buttons
        const heroRiskBtn = document.querySelector('.hero-btn.primary:not(#hero-get-started-btn)');
        if (heroRiskBtn) {
            heroRiskBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.startRiskAssessment();
            });
        }

        const heroExploreBtn = document.querySelector('.hero-btn.secondary');
        if (heroExploreBtn) {
            heroExploreBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.scrollToFeatures();
            });
        }
    }

    bindFeatureCards() {
        const featureCards = document.querySelectorAll('.feature-card.clickable');
        featureCards.forEach(card => {
            // Remove any existing listeners
            card.replaceWith(card.cloneNode(true));
        });

        // Re-select after cloning
        document.querySelectorAll('.feature-card.clickable').forEach(card => {
            card.addEventListener('click', (e) => {
                e.preventDefault();
                const feature = card.dataset.feature;
                if (feature) {
                    this.handleFeatureCardClick(feature);
                }
            });

            // Keyboard support
            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    const feature = card.dataset.feature;
                    if (feature) {
                        this.handleFeatureCardClick(feature);
                    }
                }
            });

            // Make focusable
            card.setAttribute('tabindex', '0');
            card.setAttribute('role', 'button');
        });
    }

    bindModalControls() {
        const modal = document.getElementById('feature-modal');
        const closeBtn = document.getElementById('modal-close');
        const cancelBtn = document.getElementById('modal-cancel');
        const actionBtn = document.getElementById('modal-action');

        if (closeBtn) {
            closeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.closeModal();
            });
        }

        if (cancelBtn) {
            cancelBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.closeModal();
            });
        }

        if (modal) {
            // Only close when clicking the modal backdrop, not the content
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal();
                }
            });
            
            // Prevent modal content clicks from closing the modal
            const modalContent = modal.querySelector('.modal-content');
            if (modalContent) {
                modalContent.addEventListener('click', (e) => {
                    e.stopPropagation();
                });
            }
        }

        // Escape key to close modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal?.classList.contains('active')) {
                this.closeModal();
            }
        });
    }

    bindMobileMenu() {
        const mobileToggle = document.getElementById('mobile-menu-toggle');
        const mobileOverlay = document.getElementById('mobile-menu-overlay');

        if (mobileToggle) {
            mobileToggle.addEventListener('click', () => this.toggleMobileMenu());
        }

        if (mobileOverlay) {
            mobileOverlay.addEventListener('click', (e) => {
                if (e.target === mobileOverlay) {
                    this.closeMobileMenu();
                }
            });
        }

        // Mobile nav links
        document.querySelectorAll('.mobile-nav-link').forEach(link => {
            link.addEventListener('click', () => {
                this.closeMobileMenu();
            });
        });
    }

    bindFooterLinks() {
        const footerLinks = {
            'help-center-link': () => this.showHelpCenter(),
            'privacy-policy-link': () => this.showPrivacyPolicy(),
            'terms-link': () => this.showTerms(),
            'contact-link': () => this.showContact()
        };

        Object.entries(footerLinks).forEach(([id, handler]) => {
            const link = document.getElementById(id);
            if (link) {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    handler();
                });
            }
        });

        // Footer feature links
        document.querySelectorAll('a[data-feature]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const feature = link.dataset.feature;
                if (feature) {
                    this.handleFeatureCardClick(feature);
                }
            });
        });
    }

    setupFeatureCards() {
        const cards = document.querySelectorAll('.feature-card.clickable');
        cards.forEach(card => {
            // Add visual enhancements
            card.style.cursor = 'pointer';
            card.style.transition = 'all 0.3s ease';
            
            // Add hover effects
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-4px)';
                card.style.boxShadow = '0 12px 30px rgba(0, 127, 255, 0.2)';
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0)';
                card.style.boxShadow = '';
            });

            // Add card arrow if not present
            if (!card.querySelector('.card-arrow')) {
                const arrow = document.createElement('div');
                arrow.className = 'card-arrow';
                arrow.textContent = '→';
                arrow.style.cssText = `
                    position: absolute;
                    top: 1rem;
                    right: 1rem;
                    font-size: 1.2rem;
                    color: var(--azure-blue);
                    opacity: 0;
                    transition: opacity 0.3s ease;
                `;
                card.appendChild(arrow);
            }
        });
    }

    setupModal() {
        const modal = document.getElementById('feature-modal');
        if (modal) {
            // Ensure modal is properly styled
            modal.style.cssText = `
                display: none;
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                z-index: 2000;
                backdrop-filter: blur(5px);
                align-items: center;
                justify-content: center;
            `;

            const modalContent = modal.querySelector('.modal-content');
            if (modalContent) {
                modalContent.style.cssText = `
                    background: white;
                    border-radius: 12px;
                    max-width: 600px;
                    width: 90%;
                    max-height: 80vh;
                    overflow-y: auto;
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
                    animation: slideUp 0.3s ease;
                    margin: 2rem;
                `;
            }
        }
    }

    setupMobileMenu() {
        const overlay = document.getElementById('mobile-menu-overlay');
        if (overlay) {
            overlay.style.cssText = `
                display: none;
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                z-index: 1500;
                backdrop-filter: blur(5px);
            `;
        }
    }

    setupNavigationButtons() {
        // Ensure all navigation buttons are properly styled and functional
        const navButtons = document.querySelectorAll('.btn-primary, .btn-secondary, .btn-outline');
        navButtons.forEach(btn => {
            btn.style.cursor = 'pointer';
            btn.style.transition = 'all 0.3s ease';
        });
    }

    setupHeroButtons() {
        const heroButtons = document.querySelectorAll('.hero-btn');
        heroButtons.forEach(btn => {
            btn.style.cursor = 'pointer';
            btn.style.transition = 'all 0.3s ease';
            
            btn.addEventListener('mouseenter', () => {
                btn.style.transform = 'translateY(-2px)';
            });

            btn.addEventListener('mouseleave', () => {
                btn.style.transform = 'translateY(0)';
            });
        });
    }

    addVisualEnhancements() {
        // Add CSS animations if not present
        if (!document.getElementById('landing-page-animations')) {
            const style = document.createElement('style');
            style.id = 'landing-page-animations';
            style.textContent = `
                /* Risk Assessment Styles */
                .assessment-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.8);
                    backdrop-filter: blur(8px);
                    z-index: 10000;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    animation: fadeIn 0.3s ease;
                }

                .assessment-modal {
                    background: white;
                    border-radius: 16px;
                    width: 90%;
                    max-width: 700px;
                    max-height: 90vh;
                    overflow-y: auto;
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
                    animation: slideUp 0.3s ease;
                }

                .assessment-header {
                    padding: 30px 30px 20px;
                    border-bottom: 1px solid #e5e7eb;
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                }

                .assessment-title h2 {
                    margin: 0 0 5px 0;
                    color: #1f2937;
                    font-size: 1.5rem;
                }

                .assessment-subtitle {
                    margin: 0;
                    color: #64748b;
                    font-size: 0.9rem;
                }

                .assessment-close {
                    background: none;
                    border: none;
                    font-size: 24px;
                    cursor: pointer;
                    color: #64748b;
                    padding: 4px;
                    border-radius: 50%;
                    transition: all 0.2s ease;
                }

                .assessment-close:hover {
                    background: #f3f4f6;
                    color: #1f2937;
                }

                .assessment-progress-container {
                    padding: 20px 30px;
                    border-bottom: 1px solid #e5e7eb;
                }

                .progress-bar-container {
                    background: #e5e7eb;
                    height: 8px;
                    border-radius: 4px;
                    overflow: hidden;
                    margin-bottom: 10px;
                }

                .progress-bar {
                    background: linear-gradient(90deg, #007FFF, #0066CC);
                    height: 100%;
                    border-radius: 4px;
                    transition: width 0.3s ease;
                    width: 0%;
                }

                .progress-text {
                    text-align: center;
                    color: #64748b;
                    font-size: 0.9rem;
                }

                .assessment-content {
                    padding: 30px;
                }

                .question-container {
                    animation: slideInRight 0.3s ease;
                }

                .question-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                }

                .question-number {
                    background: #007FFF;
                    color: white;
                    padding: 6px 12px;
                    border-radius: 20px;
                    font-size: 0.8rem;
                    font-weight: 600;
                }

                .question-category {
                    color: #64748b;
                    font-size: 0.8rem;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .question-text {
                    color: #1f2937;
                    font-size: 1.2rem;
                    margin-bottom: 20px;
                    line-height: 1.5;
                }

                .question-explanation {
                    background: #f0f9ff;
                    border-left: 4px solid #007FFF;
                    padding: 15px;
                    margin-bottom: 20px;
                    border-radius: 0 8px 8px 0;
                    display: flex;
                    gap: 12px;
                }

                .explanation-icon {
                    font-size: 1.2rem;
                    flex-shrink: 0;
                }

                .question-explanation p {
                    margin: 0;
                    color: #1e40af;
                    font-size: 0.9rem;
                    line-height: 1.5;
                }

                .question-note {
                    background: #fffbeb;
                    border-left: 4px solid #f59e0b;
                    padding: 15px;
                    margin-bottom: 20px;
                    border-radius: 0 8px 8px 0;
                    display: flex;
                    gap: 12px;
                }

                .note-icon {
                    font-size: 1.2rem;
                    flex-shrink: 0;
                }

                .question-note p {
                    margin: 0;
                    color: #92400e;
                    font-size: 0.9rem;
                    line-height: 1.5;
                }

                .response-options {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                    margin-bottom: 20px;
                }

                .response-option {
                    border: 2px solid #e5e7eb;
                    border-radius: 12px;
                    padding: 16px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    display: flex;
                    align-items: center;
                    gap: 15px;
                    position: relative;
                }

                .response-option:hover {
                    border-color: #007FFF;
                    background: #f8fafc;
                }

                .response-option.selected {
                    border-color: #007FFF;
                    background: #f0f9ff;
                }

                .response-option input[type="radio"] {
                    display: none;
                }

                .option-content {
                    flex: 1;
                }

                .option-text {
                    color: #1f2937;
                    font-weight: 500;
                    margin-bottom: 4px;
                }

                .option-points {
                    color: #64748b;
                    font-size: 0.8rem;
                }

                .option-indicator {
                    width: 20px;
                    height: 20px;
                    border: 2px solid #d1d5db;
                    border-radius: 50%;
                    position: relative;
                    transition: all 0.2s ease;
                }

                .response-option.selected .option-indicator {
                    border-color: #007FFF;
                    background: #007FFF;
                }

                .response-option.selected .option-indicator::after {
                    content: '';
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    width: 8px;
                    height: 8px;
                    background: white;
                    border-radius: 50%;
                    transform: translate(-50%, -50%);
                }

                .question-helper {
                    text-align: center;
                    margin-top: 15px;
                    font-size: 0.9rem;
                    color: #64748b;
                }

                .question-helper a {
                    color: #007FFF;
                    text-decoration: none;
                }

                .question-helper a:hover {
                    text-decoration: underline;
                }

                .assessment-navigation {
                    padding: 20px 30px 30px;
                    border-top: 1px solid #e5e7eb;
                    display: flex;
                    justify-content: space-between;
                    gap: 15px;
                }

                .assessment-navigation button {
                    padding: 12px 24px;
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    border: none;
                }

                .btn-primary {
                    background: #007FFF;
                    color: white;
                }

                .btn-primary:hover:not(:disabled) {
                    background: #0066CC;
                    transform: translateY(-1px);
                }

                .btn-primary:disabled {
                    background: #d1d5db;
                    cursor: not-allowed;
                }

                .btn-secondary {
                    background: #f3f4f6;
                    color: #374151;
                }

                .btn-secondary:hover {
                    background: #e5e7eb;
                }

                .btn-outline {
                    background: transparent;
                    color: #007FFF;
                    border: 2px solid #007FFF;
                }

                .btn-outline:hover {
                    background: #007FFF;
                    color: white;
                }

                .assessment-result {
                    padding: 30px;
                }

                .risk-result-container {
                    text-align: center;
                }

                .result-header {
                    margin-bottom: 30px;
                }

                .result-icon {
                    font-size: 3rem;
                    margin-bottom: 15px;
                }

                .result-header h3 {
                    color: #1f2937;
                    margin: 0;
                    font-size: 1.5rem;
                }

                .risk-score-display {
                    background: #f8fafc;
                    border-radius: 16px;
                    padding: 30px;
                    margin-bottom: 30px;
                }

                .risk-score-number {
                    font-size: 4rem;
                    font-weight: 700;
                    margin-bottom: 10px;
                }

                .risk-category-badge {
                    display: inline-block;
                    color: white;
                    padding: 8px 20px;
                    border-radius: 20px;
                    font-weight: 600;
                    font-size: 1.1rem;
                }

                .risk-explanation {
                    text-align: left;
                    margin-bottom: 30px;
                }

                .risk-explanation h4 {
                    color: #1f2937;
                    margin-bottom: 15px;
                }

                .risk-description {
                    color: #64748b;
                    line-height: 1.6;
                    margin-bottom: 20px;
                }

                .risk-recommendation {
                    background: #f0f9ff;
                    border-left: 4px solid #007FFF;
                    padding: 15px;
                    border-radius: 0 8px 8px 0;
                    display: flex;
                    gap: 12px;
                }

                .recommendation-icon {
                    font-size: 1.2rem;
                    flex-shrink: 0;
                }

                .risk-recommendation p {
                    margin: 0;
                    color: #1e40af;
                    line-height: 1.5;
                }

                .risk-factors-summary {
                    text-align: left;
                    margin-bottom: 30px;
                }

                .risk-factors-summary h4 {
                    color: #1f2937;
                    margin-bottom: 15px;
                }

                .factors-grid {
                    display: grid;
                    gap: 10px;
                }

                .risk-factor-item {
                    display: grid;
                    grid-template-columns: 1fr 2fr auto;
                    gap: 15px;
                    padding: 12px;
                    background: #f8fafc;
                    border-radius: 8px;
                    align-items: center;
                }

                .risk-factor-item.impact-high {
                    border-left: 4px solid #dc2626;
                }

                .risk-factor-item.impact-medium {
                    border-left: 4px solid #f59e0b;
                }

                .risk-factor-item.impact-low {
                    border-left: 4px solid #10b981;
                }

                .factor-name {
                    font-weight: 600;
                    color: #1f2937;
                }

                .factor-value {
                    color: #64748b;
                    font-size: 0.9rem;
                }

                .factor-points {
                    background: #007FFF;
                    color: white;
                    padding: 4px 8px;
                    border-radius: 12px;
                    font-size: 0.8rem;
                    font-weight: 600;
                }

                .no-risk-factors {
                    text-align: center;
                    color: #10b981;
                    font-weight: 500;
                    padding: 20px;
                    background: #f0fdf4;
                    border-radius: 8px;
                }

                .next-steps {
                    text-align: left;
                    margin-bottom: 30px;
                }

                .next-steps h4 {
                    color: #1f2937;
                    margin-bottom: 15px;
                }

                .next-steps-list {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                }

                .next-steps-list li {
                    padding: 10px 0;
                    border-bottom: 1px solid #e5e7eb;
                    position: relative;
                    padding-left: 25px;
                }

                .next-steps-list li:before {
                    content: '✓';
                    position: absolute;
                    left: 0;
                    color: #10b981;
                    font-weight: bold;
                }

                .next-steps-list li:last-child {
                    border-bottom: none;
                }

                .result-actions {
                    display: flex;
                    gap: 15px;
                    justify-content: center;
                    flex-wrap: wrap;
                    margin-top: 30px;
                }

                @media (max-width: 640px) {
                    .assessment-modal {
                        width: 95%;
                        margin: 20px;
                    }
                    
                    .assessment-header,
                    .assessment-content,
                    .assessment-navigation {
                        padding-left: 20px;
                        padding-right: 20px;
                    }
                    
                    .question-header {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 10px;
                    }
                    
                    .risk-factor-item {
                        grid-template-columns: 1fr;
                        text-align: center;
                    }
                    
                    .assessment-navigation {
                        flex-direction: column;
                    }
                    
                    .result-actions {
                        flex-direction: column;
                    }
                }

                @keyframes slideInRight {
                    from {
                        opacity: 0;
                        transform: translateX(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }
                @keyframes slideUp {
                    from {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                .modal.active {
                    display: flex !important;
                    animation: fadeIn 0.3s ease;
                }

                /* Feature Modal Styles */
                #feature-modal {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.6);
                    backdrop-filter: blur(8px);
                    z-index: 10000;
                    display: none;
                    align-items: center;
                    justify-content: center;
                    visibility: hidden;
                    opacity: 0;
                    transition: all 0.3s ease;
                }

                #feature-modal.active {
                    display: flex !important;
                    visibility: visible !important;
                    opacity: 1 !important;
                }

                #feature-modal .modal-content {
                    background: white;
                    border-radius: 16px;
                    max-width: 700px;
                    width: 90%;
                    max-height: 85vh;
                    overflow-y: auto;
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
                    position: relative;
                    z-index: 10001;
                    animation: slideUp 0.3s ease;
                }

                #feature-modal .modal-header {
                    padding: 24px 24px 16px;
                    border-bottom: 1px solid #e5e7eb;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                #feature-modal .modal-header h2 {
                    margin: 0;
                    color: #1f2937;
                    font-size: 1.5rem;
                }

                #feature-modal .modal-close {
                    background: none;
                    border: none;
                    font-size: 24px;
                    cursor: pointer;
                    color: #64748b;
                    padding: 4px;
                    border-radius: 50%;
                    transition: all 0.2s ease;
                }

                #feature-modal .modal-close:hover {
                    background: #f3f4f6;
                    color: #1f2937;
                }

                #feature-modal .modal-body {
                    padding: 24px;
                }

                #feature-modal .modal-footer {
                    padding: 16px 24px 24px;
                    border-top: 1px solid #e5e7eb;
                    display: flex;
                    gap: 12px;
                    justify-content: flex-end;
                }

                #feature-modal .modal-footer button {
                    padding: 12px 24px;
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    border: none;
                }

                #feature-modal .btn-secondary {
                    background: #f3f4f6;
                    color: #374151;
                }

                #feature-modal .btn-secondary:hover {
                    background: #e5e7eb;
                }

                #feature-modal .btn-primary {
                    background: #007FFF;
                    color: white;
                }

                #feature-modal .btn-primary:hover {
                    background: #0066CC;
                    transform: translateY(-1px);
                }

                /* Feature Detail Styles */
                .feature-detail-header {
                    text-align: center;
                    margin-bottom: 24px;
                }

                .feature-detail-icon {
                    font-size: 3rem;
                    margin-bottom: 16px;
                }

                .feature-detail-title {
                    color: #1f2937;
                    margin-bottom: 12px;
                    font-size: 1.3rem;
                }

                .feature-detail-description {
                    color: #64748b;
                    line-height: 1.6;
                    margin-bottom: 0;
                }

                .feature-detail-section {
                    margin-bottom: 24px;
                }

                .feature-detail-section h4 {
                    color: #1f2937;
                    margin-bottom: 12px;
                    font-size: 1.1rem;
                }

                .feature-list,
                .benefit-list,
                .process-list {
                    margin: 0;
                    padding-left: 20px;
                }

                .feature-list li,
                .benefit-list li,
                .process-list li {
                    margin-bottom: 8px;
                    color: #64748b;
                    line-height: 1.5;
                }

                .feature-detail-cta {
                    background: #f8fafc;
                    border-radius: 12px;
                    padding: 20px;
                    text-align: center;
                    margin-top: 24px;
                }

                .feature-detail-cta h4 {
                    color: #1f2937;
                    margin-bottom: 12px;
                }

                .direct-access-note {
                    color: #10b981;
                    font-weight: 500;
                    margin: 8px 0 0 0;
                    font-size: 0.9rem;
                }

                .account-note {
                    color: #64748b;
                    margin: 8px 0 0 0;
                    font-size: 0.9rem;
                }

                .feature-card.clickable:hover .card-arrow {
                    opacity: 1 !important;
                }

                .feature-card.clickable:focus {
                    outline: 2px solid var(--azure-blue);
                    outline-offset: 2px;
                }

                .hero-stats {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 2rem;
                    margin: 2rem 0;
                    text-align: center;
                }

                .stat-item {
                    padding: 1rem;
                }

                .stat-number {
                    font-size: 2rem;
                    font-weight: 700;
                    color: rgba(255, 255, 255, 0.9);
                    margin-bottom: 0.5rem;
                }

                .stat-label {
                    font-size: 0.9rem;
                    opacity: 0.8;
                }

                .hero-cta {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                    margin: 2rem 0;
                    align-items: center;
                }

                @media (min-width: 640px) {
                    .hero-cta {
                        flex-direction: row;
                        justify-content: center;
                    }
                }

                .hero-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 1rem 2rem;
                    border-radius: 8px;
                    font-weight: 600;
                    text-decoration: none;
                    transition: all 0.3s ease;
                    min-width: 200px;
                    justify-content: center;
                }

                .hero-btn.primary {
                    background: rgba(255, 255, 255, 0.2);
                    color: white;
                    border: 2px solid rgba(255, 255, 255, 0.3);
                }

                .hero-btn.primary:hover {
                    background: white;
                    color: var(--azure-blue);
                }

                .hero-btn.secondary {
                    background: transparent;
                    color: white;
                    border: 2px solid rgba(255, 255, 255, 0.5);
                }

                .hero-btn.secondary:hover {
                    background: rgba(255, 255, 255, 0.1);
                }

                .hero-trust {
                    margin-top: 3rem;
                    text-align: center;
                }

                .trust-text {
                    font-size: 0.9rem;
                    opacity: 0.8;
                    margin-bottom: 1rem;
                }

                .trust-badges {
                    display: flex;
                    justify-content: center;
                    gap: 1rem;
                    flex-wrap: wrap;
                }

                .trust-badge {
                    background: rgba(255, 255, 255, 0.1);
                    padding: 0.5rem 1rem;
                    border-radius: 20px;
                    font-size: 0.8rem;
                    border: 1px solid rgba(255, 255, 255, 0.2);
                }

                .cta-section {
                    background: var(--light-gray);
                    padding: 2rem;
                    border-radius: 12px;
                    text-align: center;
                    margin: 2rem 0;
                }

                .cta-text {
                    font-size: 1.1rem;
                    color: var(--text-secondary);
                    margin: 0;
                }
            `;
            document.head.appendChild(style);
        }
    }

    // Feature card click handler
    handleFeatureCardClick(featureKey) {
        console.log(`🎯 Feature card clicked: ${featureKey}`);
        const feature = this.featureData[featureKey];
        if (!feature) {
            console.error(`Feature data not found for: ${featureKey}`);
            return;
        }

        // For risk assessment, launch directly without modal
        if (featureKey === 'risk-assessment') {
            this.startRiskAssessment();
            return;
        }

        // For other features, show the modal
        this.showFeatureDetails(featureKey);
    }

    showFeatureDetails(featureKey) {
        const feature = this.featureData[featureKey];
        if (!feature) return;

        const modal = document.getElementById('feature-modal');
        const title = document.getElementById('modal-title');
        const body = document.getElementById('modal-body');
        const actionBtn = document.getElementById('modal-action');

        if (!modal || !title || !body || !actionBtn) {
            console.error('Modal elements not found');
            return;
        }

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
        if (modal) {
            // Ensure modal is properly styled and positioned with higher z-index than navigation
            modal.style.display = 'flex';
            modal.style.position = 'fixed';
            modal.style.top = '0';
            modal.style.left = '0';
            modal.style.width = '100%';
            modal.style.height = '100%';
            modal.style.zIndex = '10000'; // Higher than navigation (9999)
            modal.style.alignItems = 'center';
            modal.style.justifyContent = 'center';
            modal.style.background = 'rgba(0, 0, 0, 0.6)';
            modal.style.backdropFilter = 'blur(8px)';
            modal.style.visibility = 'visible';
            modal.style.opacity = '1';
            
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
            
            // Ensure modal content is centered and visible
            const modalContent = modal.querySelector('.modal-content');
            if (modalContent) {
                modalContent.style.margin = 'auto';
                modalContent.style.maxWidth = '700px';
                modalContent.style.width = '90%';
                modalContent.style.maxHeight = '85vh';
                modalContent.style.position = 'relative';
                modalContent.style.transform = 'none';
                modalContent.style.background = 'white';
                modalContent.style.borderRadius = '16px';
                modalContent.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.3)';
                modalContent.style.overflow = 'auto';
                modalContent.style.zIndex = '10001';
            }
            
            // Prevent modal from closing immediately
            setTimeout(() => {
                // Focus management for accessibility
                const closeBtn = document.getElementById('modal-close');
                if (closeBtn) {
                    closeBtn.focus();
                }
            }, 200);
            
            console.log('Modal displayed and centered with proper z-index');
        } else {
            console.error('Feature modal element not found');
        }
    }

    closeModal() {
        const modal = document.getElementById('feature-modal');
        if (modal) {
            modal.classList.remove('active');
            modal.style.display = 'none';
            modal.style.visibility = 'hidden';
            modal.style.opacity = '0';
            document.body.style.overflow = '';
            console.log('Modal closed');
        }
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

    // Action methods
    startRiskAssessment() {
        console.log('🎯 Starting Risk Assessment');
        this.closeModal(); // Close the feature modal first
        
        // Check if risk assessment engine is available
        if (window.riskAssessmentEngine && typeof window.riskAssessmentEngine.startAssessment === 'function') {
            window.riskAssessmentEngine.startAssessment();
        } else if (window.glucoApp && typeof window.glucoApp.showAssessment === 'function') {
            window.glucoApp.showAssessment();
        } else {
            // Create and show the WHO/ADA questionnaire directly
            this.createWHOADAQuestionnaire();
        }
    }

    exploreNutrition() {
        console.log('🍎 Exploring Nutrition');
        this.showNotification('Loading Nutrition Planning...', 'info');
        
        if (window.glucoApp && window.glucoApp.showNutrition) {
            window.glucoApp.showNutrition();
        } else {
            this.showNotification('Please create an account to access personalized nutrition planning.', 'info');
        }
    }

    startMentalHealth() {
        console.log('💙 Starting Mental Health Tracking');
        this.showNotification('Loading Mental Health Support...', 'info');
        
        if (window.glucoApp && window.glucoApp.showMentalHealth) {
            window.glucoApp.showMentalHealth();
        } else {
            this.showNotification('Please create an account to access mental health tracking.', 'info');
        }
    }

    viewProgress() {
        console.log('📊 Viewing Progress');
        this.showNotification('Loading Progress Dashboard...', 'info');
        
        if (window.glucoApp && window.glucoApp.showProgress) {
            window.glucoApp.showProgress();
        } else {
            this.showNotification('Please create an account to access progress tracking.', 'info');
        }
    }

    showDashboard() {
        console.log('🏠 Showing Dashboard');
        this.showNotification('Loading Dashboard...', 'info');
        
        if (window.glucoApp && window.glucoApp.showDashboard) {
            window.glucoApp.showDashboard();
        } else {
            this.showNotification('Please create an account to access your dashboard.', 'info');
        }
    }

    showSignup() {
        console.log('📝 Showing Signup');
        this.showNotification('Loading Sign Up...', 'info');
        
        if (window.authUI && window.authUI.showSignupForm) {
            window.authUI.showSignupForm();
        } else {
            this.showNotification('Sign up functionality will be available soon!', 'info');
        }
    }

    scrollToFeatures() {
        const featuresSection = document.getElementById('features');
        if (featuresSection) {
            featuresSection.scrollIntoView({ behavior: 'smooth' });
        }
    }

    startDemo() {
        // Show notification about demo
        this.showNotification('🎯 Starting demo mode with sample data...', 'info');
        
        // Demo login button removed - go directly to dashboard
        setTimeout(() => {
            this.showDashboard();
        }, 1000);
    }

    // Footer link handlers
    showHelpCenter() {
        this.showNotification('Help Center coming soon!', 'info');
    }

    showPrivacyPolicy() {
        this.showNotification('Privacy Policy coming soon!', 'info');
    }

    showTerms() {
        this.showNotification('Terms of Service coming soon!', 'info');
    }

    showContact() {
        this.showNotification('Contact information coming soon!', 'info');
    }

    createWHOADAQuestionnaire() {
        // Initialize risk assessment engine if not already done
        if (!window.riskAssessmentEngine) {
            window.riskAssessmentEngine = new RiskAssessmentEngine();
        }
        
        // Create the assessment interface
        const assessmentHTML = `
            <div id="risk-assessment-container" class="assessment-overlay">
                <div class="assessment-modal">
                    <div class="assessment-header">
                        <div class="assessment-title">
                            <h2>🎯 Diabetes Risk Assessment</h2>
                            <p class="assessment-subtitle">WHO/ADA Compliant Diagnostic Tool</p>
                        </div>
                        <button class="assessment-close" id="close-assessment" aria-label="Close Assessment">×</button>
                    </div>
                    
                    <div class="assessment-progress-container">
                        <div class="progress-bar-container">
                            <div class="progress-bar" id="assessment-progress-bar"></div>
                        </div>
                        <div class="progress-text">
                            <span id="current-question-num">1</span> of <span id="total-questions">8</span>
                        </div>
                    </div>
                    
                    <div class="assessment-content" id="assessment-content">
                        <!-- Questions will be dynamically inserted here -->
                    </div>
                    
                    <div class="assessment-navigation">
                        <button class="btn-secondary" id="prev-question" style="display: none;">Previous</button>
                        <button class="btn-primary" id="next-question" disabled>Next</button>
                    </div>
                    
                    <div class="assessment-result" id="assessment-result" style="display: none;">
                        <div id="risk-result-display">
                            <!-- Results will be displayed here -->
                        </div>
                        <div id="ai-explanation">
                            <!-- AI explanation will be displayed here -->
                        </div>
                        <div class="result-actions">
                            <button class="btn-primary" id="save-assessment">Save Results</button>
                            <button class="btn-secondary" id="retake-assessment">Retake Assessment</button>
                            <button class="btn-outline" id="share-results">Share with Doctor</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Add to page
        document.body.insertAdjacentHTML('beforeend', assessmentHTML);
        
        // Initialize the assessment
        this.initializeAssessment();
    }

    initializeAssessment() {
        // Set up event listeners for the assessment
        const closeBtn = document.getElementById('close-assessment');
        const nextBtn = document.getElementById('next-question');
        const prevBtn = document.getElementById('prev-question');
        const saveBtn = document.getElementById('save-assessment');
        const retakeBtn = document.getElementById('retake-assessment');
        const shareBtn = document.getElementById('share-results');
        
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeAssessment());
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.nextQuestion());
        }
        
        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.previousQuestion());
        }
        
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.saveAssessmentResults());
        }
        
        if (retakeBtn) {
            retakeBtn.addEventListener('click', () => this.retakeAssessment());
        }
        
        if (shareBtn) {
            shareBtn.addEventListener('click', () => this.shareResults());
        }
        
        // Initialize assessment data
        this.assessmentData = {
            currentQuestion: 0,
            responses: {},
            questions: this.getWHOADAQuestions(),
            startTime: Date.now()
        };
        
        // Start the assessment
        this.renderCurrentQuestion();
        this.updateProgress();
        
        // Prevent body scrolling
        document.body.style.overflow = 'hidden';
    }

    getWHOADAQuestions() {
        return [
            {
                id: 'age',
                question: 'What is your age?',
                type: 'select',
                options: [
                    { value: 0, text: 'Under 45 years', points: 0 },
                    { value: 2, text: '45-54 years', points: 2 },
                    { value: 3, text: '55-64 years', points: 3 },
                    { value: 4, text: '65 years or older', points: 4 }
                ],
                explanation: 'Age is a significant risk factor for type 2 diabetes. Risk increases with age, particularly after 45.'
            },
            {
                id: 'gender',
                question: 'What is your gender?',
                type: 'select',
                options: [
                    { value: 0, text: 'Female', points: 0 },
                    { value: 1, text: 'Male', points: 1 }
                ],
                explanation: 'Men have a slightly higher risk of developing type 2 diabetes than women.'
            },
            {
                id: 'family_history',
                question: 'Do you have a family history of diabetes?',
                type: 'select',
                options: [
                    { value: 0, text: 'No family history', points: 0 },
                    { value: 2, text: 'Grandparent, aunt, uncle, or first cousin with diabetes', points: 2 },
                    { value: 5, text: 'Parent, brother, or sister with diabetes', points: 5 }
                ],
                explanation: 'Family history is an important risk factor. Having a close relative with diabetes increases your risk significantly.'
            },
            {
                id: 'high_blood_pressure',
                question: 'Have you ever been told by a doctor that you have high blood pressure?',
                type: 'select',
                options: [
                    { value: 0, text: 'No', points: 0 },
                    { value: 2, text: 'Yes', points: 2 }
                ],
                explanation: 'High blood pressure often occurs alongside insulin resistance and increases diabetes risk.'
            },
            {
                id: 'physical_activity',
                question: 'Are you physically active?',
                type: 'select',
                options: [
                    { value: 2, text: 'No, I am not physically active', points: 2 },
                    { value: 0, text: 'Yes, I am physically active', points: 0 }
                ],
                explanation: 'Regular physical activity (30 minutes of brisk walking or similar activity most days) helps prevent diabetes.',
                note: 'Physical activity includes 30 minutes of brisk walking or similar activity most days of the week.'
            },
            {
                id: 'bmi',
                question: 'What is your Body Mass Index (BMI) category?',
                type: 'select',
                options: [
                    { value: 0, text: 'Normal weight (BMI < 25)', points: 0 },
                    { value: 1, text: 'Overweight (BMI 25-29.9)', points: 1 },
                    { value: 3, text: 'Obese (BMI ≥ 30)', points: 3 }
                ],
                explanation: 'Higher BMI increases diabetes risk. Even modest weight loss can significantly reduce risk.',
                note: 'BMI = weight (kg) / height (m)². You can calculate this or estimate based on your build.',
                helper: 'Need help calculating BMI? <a href="#" onclick="window.enhancedLandingPageManager.showBMICalculator()">Use our BMI calculator</a>'
            },
            {
                id: 'gestational_diabetes',
                question: 'For women: Have you ever been diagnosed with gestational diabetes?',
                type: 'select',
                options: [
                    { value: 0, text: 'No / Not applicable (male)', points: 0 },
                    { value: 1, text: 'Yes', points: 1 }
                ],
                explanation: 'Gestational diabetes increases the risk of developing type 2 diabetes later in life.'
            },
            {
                id: 'prediabetes',
                question: 'Have you ever been told you have prediabetes or borderline diabetes?',
                type: 'select',
                options: [
                    { value: 0, text: 'No', points: 0 },
                    { value: 5, text: 'Yes', points: 5 }
                ],
                explanation: 'Prediabetes is a strong predictor of future diabetes, but lifestyle changes can prevent or delay progression.'
            }
        ];
    }

    renderCurrentQuestion() {
        const question = this.assessmentData.questions[this.assessmentData.currentQuestion];
        const content = document.getElementById('assessment-content');
        
        if (!content || !question) return;

        const questionHTML = `
            <div class="question-container">
                <div class="question-header">
                    <div class="question-number">Question ${this.assessmentData.currentQuestion + 1}</div>
                    <div class="question-category">${this.getQuestionCategory(question.id)}</div>
                </div>
                
                <h3 class="question-text">${question.question}</h3>
                
                ${question.explanation ? `<div class="question-explanation">
                    <div class="explanation-icon">💡</div>
                    <p>${question.explanation}</p>
                </div>` : ''}
                
                ${question.note ? `<div class="question-note">
                    <div class="note-icon">ℹ️</div>
                    <p>${question.note}</p>
                </div>` : ''}
                
                <div class="response-options">
                    ${question.options.map((option, index) => `
                        <label class="response-option ${this.assessmentData.responses[question.id] == option.value ? 'selected' : ''}">
                            <input type="radio" 
                                   name="assessment-response" 
                                   value="${option.value}"
                                   ${this.assessmentData.responses[question.id] == option.value ? 'checked' : ''}
                                   onchange="window.enhancedLandingPageManager.recordResponse('${question.id}', ${option.value})">
                            <div class="option-content">
                                <div class="option-text">${option.text}</div>
                                ${option.points > 0 ? `<div class="option-points">+${option.points} points</div>` : ''}
                            </div>
                            <div class="option-indicator"></div>
                        </label>
                    `).join('')}
                </div>
                
                ${question.helper ? `<div class="question-helper">${question.helper}</div>` : ''}
            </div>
        `;

        content.innerHTML = questionHTML;
        this.updateNavigationButtons();
    }

    getQuestionCategory(questionId) {
        const categories = {
            'age': 'Demographics',
            'gender': 'Demographics', 
            'family_history': 'Medical History',
            'high_blood_pressure': 'Medical History',
            'physical_activity': 'Lifestyle',
            'bmi': 'Physical Health',
            'gestational_diabetes': 'Medical History',
            'prediabetes': 'Medical History'
        };
        return categories[questionId] || 'Assessment';
    }

    recordResponse(questionId, value) {
        this.assessmentData.responses[questionId] = parseInt(value);
        
        // Update UI
        const options = document.querySelectorAll('.response-option');
        options.forEach(option => option.classList.remove('selected'));
        
        const selectedOption = document.querySelector(`input[value="${value}"]`).closest('.response-option');
        if (selectedOption) {
            selectedOption.classList.add('selected');
        }
        
        // Enable next button
        const nextBtn = document.getElementById('next-question');
        if (nextBtn) {
            nextBtn.disabled = false;
            nextBtn.textContent = this.assessmentData.currentQuestion === this.assessmentData.questions.length - 1 ? 'Calculate Risk' : 'Next';
        }
    }

    nextQuestion() {
        const currentQuestion = this.assessmentData.questions[this.assessmentData.currentQuestion];
        
        // Validate response
        if (this.assessmentData.responses[currentQuestion.id] === undefined) {
            this.showNotification('Please select an answer before continuing.', 'warning');
            return;
        }

        if (this.assessmentData.currentQuestion < this.assessmentData.questions.length - 1) {
            this.assessmentData.currentQuestion++;
            this.renderCurrentQuestion();
            this.updateProgress();
        } else {
            // Assessment complete
            this.calculateRisk();
        }
    }

    previousQuestion() {
        if (this.assessmentData.currentQuestion > 0) {
            this.assessmentData.currentQuestion--;
            this.renderCurrentQuestion();
            this.updateProgress();
        }
    }

    updateNavigationButtons() {
        const prevBtn = document.getElementById('prev-question');
        const nextBtn = document.getElementById('next-question');
        
        if (prevBtn) {
            prevBtn.style.display = this.assessmentData.currentQuestion > 0 ? 'inline-block' : 'none';
        }
        
        if (nextBtn) {
            const currentQuestion = this.assessmentData.questions[this.assessmentData.currentQuestion];
            const hasResponse = this.assessmentData.responses[currentQuestion.id] !== undefined;
            nextBtn.disabled = !hasResponse;
            nextBtn.textContent = this.assessmentData.currentQuestion === this.assessmentData.questions.length - 1 ? 'Calculate Risk' : 'Next';
        }
    }

    updateProgress() {
        const progressBar = document.getElementById('assessment-progress-bar');
        const currentQuestionNum = document.getElementById('current-question-num');
        const totalQuestions = document.getElementById('total-questions');
        
        if (progressBar) {
            const progress = ((this.assessmentData.currentQuestion + 1) / this.assessmentData.questions.length) * 100;
            progressBar.style.width = `${progress}%`;
        }
        
        if (currentQuestionNum) {
            currentQuestionNum.textContent = this.assessmentData.currentQuestion + 1;
        }
        
        if (totalQuestions) {
            totalQuestions.textContent = this.assessmentData.questions.length;
        }
    }

    calculateRisk() {
        // Calculate total risk score
        let totalScore = 0;
        
        this.assessmentData.questions.forEach(question => {
            const response = this.assessmentData.responses[question.id];
            if (response !== undefined) {
                totalScore += response;
            }
        });

        // Determine risk category
        const riskCategory = this.getRiskCategory(totalScore);
        
        // Store results
        this.assessmentData.results = {
            score: totalScore,
            category: riskCategory,
            completedAt: new Date().toISOString(),
            duration: Date.now() - this.assessmentData.startTime
        };

        this.displayResults();
    }

    getRiskCategory(score) {
        if (score < 3) return 'Low';
        if (score < 10) return 'Increased';
        if (score < 15) return 'High';
        return 'Possible Diabetes';
    }

    displayResults() {
        const assessmentContent = document.getElementById('assessment-content');
        const assessmentNavigation = document.querySelector('.assessment-navigation');
        const assessmentResult = document.getElementById('assessment-result');
        const resultDisplay = document.getElementById('risk-result-display');
        
        // Hide assessment form
        if (assessmentContent) assessmentContent.style.display = 'none';
        if (assessmentNavigation) assessmentNavigation.style.display = 'none';
        
        // Show results
        if (assessmentResult) assessmentResult.style.display = 'block';
        
        const results = this.assessmentData.results;
        const categoryInfo = this.getRiskCategoryInfo(results.category);

        const resultsHTML = `
            <div class="risk-result-container">
                <div class="result-header">
                    <div class="result-icon">${categoryInfo.icon}</div>
                    <h3>Your Risk Assessment Results</h3>
                </div>
                
                <div class="risk-score-display">
                    <div class="risk-score-number" style="color: ${categoryInfo.color}">
                        ${results.score}
                    </div>
                    <div class="risk-category-badge" style="background-color: ${categoryInfo.color}">
                        ${results.category} Risk
                    </div>
                </div>
                
                <div class="risk-explanation">
                    <h4>What this means:</h4>
                    <p class="risk-description">${categoryInfo.description}</p>
                    <div class="risk-recommendation">
                        <div class="recommendation-icon">💡</div>
                        <p><strong>Recommendation:</strong> ${categoryInfo.recommendation}</p>
                    </div>
                </div>
                
                <div class="risk-factors-summary">
                    <h4>Your Risk Factors:</h4>
                    <div class="factors-grid">
                        ${this.generateRiskFactorsSummary()}
                    </div>
                </div>
                
                <div class="next-steps">
                    <h4>Recommended Next Steps:</h4>
                    <ul class="next-steps-list">
                        ${this.getNextSteps(results.category).map(step => `<li>${step}</li>`).join('')}
                    </ul>
                </div>
            </div>
        `;

        if (resultDisplay) {
            resultDisplay.innerHTML = resultsHTML;
        }
        
        // Generate AI explanation
        this.generateAIExplanation();
    }

    getRiskCategoryInfo(category) {
        const categoryInfo = {
            'Low': {
                icon: '✅',
                color: '#28a745',
                description: 'Your risk of developing type 2 diabetes is low. This is excellent news!',
                recommendation: 'Continue maintaining a healthy lifestyle with regular exercise and balanced nutrition to keep your risk low.'
            },
            'Increased': {
                icon: '⚠️',
                color: '#ffc107',
                description: 'You have an increased risk of developing type 2 diabetes.',
                recommendation: 'Consider lifestyle modifications including regular physical activity and healthy eating habits. Small changes can make a big difference.'
            },
            'High': {
                icon: '🚨',
                color: '#fd7e14',
                description: 'You have a high risk of developing type 2 diabetes.',
                recommendation: 'It is strongly recommended to consult with a healthcare provider for further evaluation and guidance on prevention strategies.'
            },
            'Possible Diabetes': {
                icon: '🏥',
                color: '#dc3545',
                description: 'You may already have diabetes or prediabetes.',
                recommendation: 'Please consult with a healthcare provider immediately for proper testing and diagnosis. Early intervention is key.'
            }
        };

        return categoryInfo[category] || categoryInfo['Increased'];
    }

    generateRiskFactorsSummary() {
        const riskFactors = [];
        
        this.assessmentData.questions.forEach(question => {
            const response = this.assessmentData.responses[question.id];
            if (response > 0) {
                const selectedOption = question.options.find(opt => opt.value === response);
                riskFactors.push({
                    factor: this.getFactorName(question.id),
                    value: selectedOption.text,
                    points: response,
                    impact: this.getImpactLevel(response)
                });
            }
        });

        if (riskFactors.length === 0) {
            return '<div class="no-risk-factors">No significant risk factors identified. Great job maintaining healthy habits!</div>';
        }

        return riskFactors.map(factor => `
            <div class="risk-factor-item impact-${factor.impact}">
                <div class="factor-name">${factor.factor}</div>
                <div class="factor-value">${factor.value}</div>
                <div class="factor-points">+${factor.points}</div>
            </div>
        `).join('');
    }

    getFactorName(factorId) {
        const names = {
            'age': 'Age',
            'gender': 'Gender',
            'family_history': 'Family History',
            'high_blood_pressure': 'Blood Pressure',
            'physical_activity': 'Physical Activity',
            'bmi': 'Body Weight',
            'gestational_diabetes': 'Gestational Diabetes',
            'prediabetes': 'Prediabetes History'
        };
        return names[factorId] || 'Risk Factor';
    }

    getImpactLevel(points) {
        if (points >= 5) return 'high';
        if (points >= 3) return 'moderate';
        if (points >= 1) return 'low';
        return 'none';
    }

    getNextSteps(category) {
        const steps = {
            'Low': [
                'Continue your healthy lifestyle habits',
                'Get regular check-ups with your healthcare provider',
                'Stay physically active and maintain a balanced diet',
                'Monitor your health and retake this assessment annually'
            ],
            'Increased': [
                'Increase physical activity to at least 150 minutes per week',
                'Focus on a balanced, nutritious diet',
                'Consider weight management if overweight',
                'Schedule regular health screenings',
                'Retake this assessment in 6 months'
            ],
            'High': [
                'Schedule an appointment with your healthcare provider',
                'Discuss diabetes prevention strategies',
                'Consider a structured lifestyle intervention program',
                'Get regular blood glucose testing',
                'Work with a nutritionist or diabetes educator'
            ],
            'Possible Diabetes': [
                'See a healthcare provider immediately for blood tests',
                'Get HbA1c and fasting glucose tests',
                'Discuss immediate intervention strategies',
                'Consider referral to an endocrinologist',
                'Start monitoring blood glucose if recommended'
            ]
        };
        
        return steps[category] || steps['Increased'];
    }

    async generateAIExplanation() {
        const aiExplanationDiv = document.getElementById('ai-explanation');
        if (!aiExplanationDiv) return;

        // Show loading
        aiExplanationDiv.innerHTML = `
            <div class="ai-explanation-loading">
                <div class="loading-spinner"></div>
                <p>Generating personalized insights...</p>
            </div>
        `;

        try {
            // Generate AI explanation if available
            let explanation = 'Based on your responses, this assessment provides valuable insights into your diabetes risk factors and recommendations for maintaining or improving your health.';
            
            if (window.aiService && window.aiService.generateContent) {
                const prompt = `Provide a compassionate, personalized explanation for someone with a diabetes risk score of ${this.assessmentData.results.score} (${this.assessmentData.results.category} risk). Include encouragement and practical next steps. Keep it under 200 words.`;
                
                try {
                    explanation = await window.aiService.generateContent(prompt);
                } catch (error) {
                    console.log('AI service not available, using fallback explanation');
                }
            }

            aiExplanationDiv.innerHTML = `
                <div class="ai-explanation-card">
                    <div class="ai-header">
                        <div class="ai-icon">🤖</div>
                        <h4>Personalized Health Insights</h4>
                    </div>
                    <div class="ai-content">
                        <p>${explanation}</p>
                    </div>
                </div>
            `;

        } catch (error) {
            console.error('Failed to generate AI explanation:', error);
            aiExplanationDiv.innerHTML = `
                <div class="ai-explanation-card">
                    <div class="ai-header">
                        <div class="ai-icon">💡</div>
                        <h4>Health Insights</h4>
                    </div>
                    <div class="ai-content">
                        <p>Your assessment results provide valuable information about your diabetes risk. Remember that this is a screening tool, and lifestyle changes can significantly impact your risk level.</p>
                    </div>
                </div>
            `;
        }
    }

    closeAssessment() {
        const assessmentContainer = document.getElementById('risk-assessment-container');
        if (assessmentContainer) {
            assessmentContainer.remove();
        }
        document.body.style.overflow = '';
    }

    saveAssessmentResults() {
        // Save to localStorage
        const savedAssessments = JSON.parse(localStorage.getItem('glucobalance-assessments') || '[]');
        savedAssessments.push(this.assessmentData);
        localStorage.setItem('glucobalance-assessments', JSON.stringify(savedAssessments));
        
        this.showNotification('Assessment results saved successfully!', 'success');
    }

    retakeAssessment() {
        // Reset assessment data
        this.assessmentData = {
            currentQuestion: 0,
            responses: {},
            questions: this.getWHOADAQuestions(),
            startTime: Date.now()
        };
        
        // Show assessment form again
        const assessmentContent = document.getElementById('assessment-content');
        const assessmentNavigation = document.querySelector('.assessment-navigation');
        const assessmentResult = document.getElementById('assessment-result');
        
        if (assessmentContent) assessmentContent.style.display = 'block';
        if (assessmentNavigation) assessmentNavigation.style.display = 'flex';
        if (assessmentResult) assessmentResult.style.display = 'none';
        
        // Restart
        this.renderCurrentQuestion();
        this.updateProgress();
    }

    shareResults() {
        const results = this.assessmentData.results;
        const shareText = `My diabetes risk assessment results: ${results.category} risk (Score: ${results.score}). Completed using WHO/ADA guidelines on GlucoBalance.`;
        
        if (navigator.share) {
            navigator.share({
                title: 'Diabetes Risk Assessment Results',
                text: shareText,
                url: window.location.href
            });
        } else {
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(shareText).then(() => {
                this.showNotification('Results copied to clipboard!', 'success');
            });
        }
    }

    showBMICalculator() {
        // Simple BMI calculator modal
        const calculatorHTML = `
            <div id="bmi-calculator" class="modal active">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>BMI Calculator</h3>
                        <button onclick="document.getElementById('bmi-calculator').remove()" class="modal-close">×</button>
                    </div>
                    <div class="modal-body">
                        <div class="bmi-inputs">
                            <div class="input-group">
                                <label>Height (cm):</label>
                                <input type="number" id="height-input" placeholder="170">
                            </div>
                            <div class="input-group">
                                <label>Weight (kg):</label>
                                <input type="number" id="weight-input" placeholder="70">
                            </div>
                            <button onclick="window.enhancedLandingPageManager.calculateBMI()" class="btn-primary">Calculate BMI</button>
                        </div>
                        <div id="bmi-result" class="bmi-result"></div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', calculatorHTML);
    }

    calculateBMI() {
        const height = parseFloat(document.getElementById('height-input').value);
        const weight = parseFloat(document.getElementById('weight-input').value);
        
        if (!height || !weight) {
            document.getElementById('bmi-result').innerHTML = '<p class="error">Please enter valid height and weight values.</p>';
            return;
        }
        
        const bmi = weight / ((height / 100) ** 2);
        let category = '';
        let color = '';
        
        if (bmi < 18.5) {
            category = 'Underweight';
            color = '#17a2b8';
        } else if (bmi < 25) {
            category = 'Normal weight';
            color = '#28a745';
        } else if (bmi < 30) {
            category = 'Overweight';
            color = '#ffc107';
        } else {
            category = 'Obese';
            color = '#dc3545';
        }
        
        document.getElementById('bmi-result').innerHTML = `
            <div class="bmi-result-display">
                <div class="bmi-value" style="color: ${color}">BMI: ${bmi.toFixed(1)}</div>
                <div class="bmi-category" style="background-color: ${color}">${category}</div>
            </div>
        `;
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: white;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 3000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            max-width: 400px;
            border-left: 4px solid var(--azure-blue);
            padding: 1rem;
        `;
        
        notification.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: space-between;">
                <span>${message}</span>
                <button onclick="this.parentElement.parentElement.remove()" 
                        style="background: none; border: none; font-size: 1.2rem; cursor: pointer; margin-left: 1rem;">
                    ×
                </button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Show notification
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Auto-hide after 3 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.enhancedLandingPageManager = new EnhancedLandingPageManager();
    });
} else {
    window.enhancedLandingPageManager = new EnhancedLandingPageManager();
}

// Export for global access
window.EnhancedLandingPageManager = EnhancedLandingPageManager;
//# sourceMappingURL=landing-page-enhanced.js.map