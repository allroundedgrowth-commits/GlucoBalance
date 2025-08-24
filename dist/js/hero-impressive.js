// Impressive Hero Section JavaScript
// Handles interactions and animations for the enhanced hero section

class ImpressiveHero {
    constructor() {
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupAnimations();
        this.setupParallaxEffects();
        this.setupIntersectionObserver();
    }

    setupEventListeners() {
        // Hero CTA buttons
        const startAssessmentBtn = document.getElementById('hero-start-assessment');
        const exploreFeaturesBtn = document.getElementById('hero-explore-features');

        if (startAssessmentBtn) {
            startAssessmentBtn.addEventListener('click', () => {
                this.handleStartAssessment();
            });
        }

        if (exploreFeaturesBtn) {
            exploreFeaturesBtn.addEventListener('click', () => {
                this.handleExploreFeatures();
            });
        }

        // Trust badges hover effects
        document.querySelectorAll('.trust-badge').forEach(badge => {
            badge.addEventListener('mouseenter', () => {
                this.animateTrustBadge(badge, true);
            });

            badge.addEventListener('mouseleave', () => {
                this.animateTrustBadge(badge, false);
            });
        });

        // Add click handlers for interactive elements
        this.setupInteractiveElements();
    }

    setupAnimations() {
        // Stagger animation for title words
        const titleWords = document.querySelectorAll('.title-word');
        titleWords.forEach((word, index) => {
            word.style.animationDelay = `${0.3 + (index * 0.3)}s`;
        });

        // Add scroll-triggered animations
        this.setupScrollAnimations();
    }

    setupParallaxEffects() {
        // Parallax effect for floating elements
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const parallaxElements = document.querySelectorAll('.floating-elements::before, .floating-elements::after');
            
            // Apply parallax to background elements
            const heroBackground = document.querySelector('.hero-background');
            if (heroBackground) {
                heroBackground.style.transform = `translateY(${scrolled * 0.5}px)`;
            }

            // Parallax for illustration
            const illustration = document.querySelector('.hero-illustration');
            if (illustration) {
                illustration.style.transform = `translateY(${scrolled * 0.3}px)`;
            }
        });
    }

    setupIntersectionObserver() {
        // Animate elements when they come into view
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, observerOptions);

        // Observe hero elements
        const elementsToObserve = [
            '.hero-badge',
            '.hero-title',
            '.hero-trust',
            '.hero-cta',
            '.hero-illustration'
        ];

        elementsToObserve.forEach(selector => {
            const element = document.querySelector(selector);
            if (element) {
                observer.observe(element);
            }
        });
    }

    setupScrollAnimations() {
        // Add CSS classes for scroll animations
        const style = document.createElement('style');
        style.textContent = `
            .animate-in {
                animation: slideInUp 0.8s ease-out forwards;
            }

            @keyframes slideInUp {
                from {
                    opacity: 0;
                    transform: translateY(30px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }

            .trust-badge.hover-effect {
                transform: translateY(-5px) scale(1.05) !important;
                box-shadow: 0 15px 40px rgba(64, 224, 255, 0.4) !important;
            }
        `;
        document.head.appendChild(style);
    }

    setupInteractiveElements() {
        // Make the main circle interactive
        const mainCircle = document.querySelector('.main-circle');
        if (mainCircle) {
            mainCircle.addEventListener('click', () => {
                this.triggerCircleAnimation();
            });

            mainCircle.style.cursor = 'pointer';
            mainCircle.title = 'Click to see health insights';
        }

        // Add keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                const focusedElement = document.activeElement;
                if (focusedElement.classList.contains('hero-btn')) {
                    e.preventDefault();
                    focusedElement.click();
                }
            }
        });
    }

    handleStartAssessment() {
        console.log('🎯 Starting assessment from hero section');
        
        // Add click animation
        this.addClickAnimation(document.getElementById('hero-start-assessment'));
        
        // Check if user is authenticated
        if (window.authService && window.authService.isAuthenticated()) {
            // User is logged in, start assessment directly
            if (window.glucoApp && typeof window.glucoApp.showAssessment === 'function') {
                window.glucoApp.showAssessment();
            } else if (window.riskAssessment && typeof window.riskAssessment.startAssessment === 'function') {
                window.riskAssessment.startAssessment();
            } else {
                this.showMessage('Assessment feature loading...', 'info');
            }
        } else {
            // User not logged in, show signup form
            if (window.authUI && typeof window.authUI.showRegistrationForm === 'function') {
                window.authUI.showRegistrationForm();
            } else {
                this.showMessage('Please sign up to start your assessment', 'info');
            }
        }
    }

    handleExploreFeatures() {
        console.log('✨ Exploring features from hero section');
        
        // Add click animation
        this.addClickAnimation(document.getElementById('hero-explore-features'));
        
        // Smooth scroll to features section
        const featuresSection = document.getElementById('features');
        if (featuresSection) {
            featuresSection.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
            
            // Add highlight animation to features
            setTimeout(() => {
                this.highlightFeatures();
            }, 800);
        }
    }

    addClickAnimation(button) {
        if (!button) return;
        
        button.style.transform = 'scale(0.95)';
        button.style.transition = 'transform 0.1s ease';
        
        setTimeout(() => {
            button.style.transform = '';
            button.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
        }, 100);
    }

    animateTrustBadge(badge, isHover) {
        if (isHover) {
            badge.classList.add('hover-effect');
        } else {
            badge.classList.remove('hover-effect');
        }
    }

    triggerCircleAnimation() {
        const mainCircle = document.querySelector('.main-circle');
        const pulseRings = document.querySelectorAll('.pulse-ring');
        
        if (mainCircle) {
            // Add special animation class
            mainCircle.style.animation = 'none';
            mainCircle.offsetHeight; // Trigger reflow
            mainCircle.style.animation = 'mainCircleRotate 2s linear, circleClick 0.5s ease-out';
            
            // Trigger pulse rings
            pulseRings.forEach((ring, index) => {
                setTimeout(() => {
                    ring.style.animation = 'none';
                    ring.offsetHeight; // Trigger reflow
                    ring.style.animation = `advancedPulse 1s ease-out`;
                }, index * 100);
            });
            
            // Show health tip
            setTimeout(() => {
                this.showHealthTip();
            }, 500);
        }
    }

    showHealthTip() {
        const tips = [
            "💡 Regular health monitoring can prevent 80% of diabetes cases",
            "🎯 Early detection increases treatment success by 90%",
            "💪 Small lifestyle changes can reduce diabetes risk by 58%",
            "🧠 AI-powered insights help personalize your health journey",
            "❤️ Consistent tracking leads to better health outcomes"
        ];
        
        const randomTip = tips[Math.floor(Math.random() * tips.length)];
        this.showMessage(randomTip, 'success', 4000);
    }

    highlightFeatures() {
        const featureCards = document.querySelectorAll('.feature-card');
        featureCards.forEach((card, index) => {
            setTimeout(() => {
                card.style.transform = 'translateY(-10px) scale(1.02)';
                card.style.boxShadow = '0 20px 40px rgba(0, 127, 255, 0.3)';
                card.style.transition = 'all 0.3s ease';
                
                setTimeout(() => {
                    card.style.transform = '';
                    card.style.boxShadow = '';
                }, 1000);
            }, index * 200);
        });
    }

    showMessage(message, type = 'info', duration = 3000) {
        // Create message element
        const messageEl = document.createElement('div');
        messageEl.className = `hero-message ${type}`;
        messageEl.textContent = message;
        
        // Style the message
        messageEl.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: ${type === 'success' ? '#4caf50' : type === 'error' ? '#f44336' : '#2196f3'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
            z-index: 10000;
            font-weight: 500;
            max-width: 300px;
            animation: messageSlideIn 0.3s ease-out;
        `;
        
        // Add animation styles
        const style = document.createElement('style');
        style.textContent = `
            @keyframes messageSlideIn {
                from {
                    opacity: 0;
                    transform: translateX(100px);
                }
                to {
                    opacity: 1;
                    transform: translateX(0);
                }
            }
            
            @keyframes messageSlideOut {
                from {
                    opacity: 1;
                    transform: translateX(0);
                }
                to {
                    opacity: 0;
                    transform: translateX(100px);
                }
            }
            
            @keyframes circleClick {
                0% { transform: translate(-50%, -50%) scale(1); }
                50% { transform: translate(-50%, -50%) scale(1.1); }
                100% { transform: translate(-50%, -50%) scale(1); }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(messageEl);
        
        // Remove message after duration
        setTimeout(() => {
            messageEl.style.animation = 'messageSlideOut 0.3s ease-out';
            setTimeout(() => {
                if (messageEl.parentElement) {
                    messageEl.remove();
                }
            }, 300);
        }, duration);
    }

    // Performance optimization
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Wait a bit for other scripts to load
    setTimeout(() => {
        window.impressiveHero = new ImpressiveHero();
        console.log('✨ Impressive Hero initialized');
    }, 500);
});

// Export for global access
window.ImpressiveHero = ImpressiveHero;
//# sourceMappingURL=hero-impressive.js.map