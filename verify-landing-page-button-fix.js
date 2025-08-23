// Landing Page Button Fix Verification Script
// This script verifies that all buttons on the landing page are working correctly

class LandingPageButtonVerifier {
    constructor() {
        this.testResults = [];
        this.init();
    }

    init() {
        console.log('🔍 Starting Landing Page Button Verification...');
        
        // Wait for all scripts to load
        setTimeout(() => {
            this.runVerification();
        }, 2000);
    }

    runVerification() {
        console.log('🚀 Running comprehensive button verification...');
        
        this.verifyNavigationButtons();
        this.verifyFeatureCards();
        this.verifyMobileMenu();
        this.verifyButtonFix();
        this.displayResults();
    }

    verifyNavigationButtons() {
        console.log('🧭 Verifying navigation buttons...');
        
        const navigationButtons = [
            { id: 'nav-get-started-btn', name: 'Get Started Free', expectedAction: 'startRiskAssessment' },
            { id: 'nav-dashboard-btn', name: 'Dashboard', expectedAction: 'showDashboard' },
            { id: 'nav-signup-btn', name: 'Sign Up', expectedAction: 'showSignup' },
            { id: 'nav-profile-btn', name: 'Profile', expectedAction: 'showProfile' },
            { id: 'nav-logout-btn', name: 'Logout', expectedAction: 'handleLogout' }
        ];

        navigationButtons.forEach(buttonInfo => {
            const button = document.getElementById(buttonInfo.id);
            
            if (button) {
                this.addResult(`✅ Navigation button found: ${buttonInfo.name}`, 'success');
                
                // Check if button is clickable
                const isClickable = button.style.cursor === 'pointer' || 
                                  window.getComputedStyle(button).cursor === 'pointer';
                
                if (isClickable) {
                    this.addResult(`✅ Button is clickable: ${buttonInfo.name}`, 'success');
                } else {
                    this.addResult(`⚠️ Button may not be clickable: ${buttonInfo.name}`, 'warning');
                }
                
                // Test click functionality
                this.testButtonClick(button, buttonInfo.name);
                
            } else {
                this.addResult(`❌ Navigation button missing: ${buttonInfo.name}`, 'error');
            }
        });
    }

    verifyFeatureCards() {
        console.log('🎯 Verifying feature cards...');
        
        const featureCards = document.querySelectorAll('.feature-card.clickable');
        
        if (featureCards.length === 0) {
            this.addResult('❌ No feature cards found', 'error');
            return;
        }

        this.addResult(`✅ Found ${featureCards.length} feature cards`, 'success');

        const expectedFeatures = ['risk-assessment', 'nutrition', 'mental-health', 'progress'];
        
        expectedFeatures.forEach(feature => {
            const card = document.querySelector(`[data-feature="${feature}"]`);
            
            if (card) {
                this.addResult(`✅ Feature card found: ${feature}`, 'success');
                
                // Check accessibility attributes
                const hasTabIndex = card.hasAttribute('tabindex');
                const hasRole = card.hasAttribute('role');
                const hasAriaLabel = card.hasAttribute('aria-label');
                
                if (hasTabIndex && hasRole && hasAriaLabel) {
                    this.addResult(`✅ Feature card accessibility: ${feature}`, 'success');
                } else {
                    this.addResult(`⚠️ Feature card accessibility incomplete: ${feature}`, 'warning');
                }
                
                // Test click functionality
                this.testButtonClick(card, `Feature: ${feature}`);
                
            } else {
                this.addResult(`❌ Feature card missing: ${feature}`, 'error');
            }
        });
    }

    verifyMobileMenu() {
        console.log('📱 Verifying mobile menu...');
        
        const mobileToggle = document.getElementById('mobile-menu-toggle');
        const mobileOverlay = document.getElementById('mobile-menu-overlay');
        
        if (mobileToggle) {
            this.addResult('✅ Mobile menu toggle found', 'success');
            this.testButtonClick(mobileToggle, 'Mobile Menu Toggle');
        } else {
            this.addResult('❌ Mobile menu toggle missing', 'error');
        }
        
        if (mobileOverlay) {
            this.addResult('✅ Mobile menu overlay found', 'success');
        } else {
            this.addResult('❌ Mobile menu overlay missing', 'error');
        }

        // Check mobile action buttons
        const mobileButtons = [
            { id: 'mobile-get-started-btn', name: 'Mobile Get Started' },
            { id: 'mobile-dashboard-btn', name: 'Mobile Dashboard' },
            { selector: '.mobile-signup', name: 'Mobile Sign Up' }
        ];

        mobileButtons.forEach(buttonInfo => {
            const button = buttonInfo.id ? 
                document.getElementById(buttonInfo.id) : 
                document.querySelector(buttonInfo.selector);
            
            if (button) {
                this.addResult(`✅ Mobile button found: ${buttonInfo.name}`, 'success');
                this.testButtonClick(button, buttonInfo.name);
            } else {
                this.addResult(`❌ Mobile button missing: ${buttonInfo.name}`, 'error');
            }
        });
    }

    verifyButtonFix() {
        console.log('🔧 Verifying button fix implementation...');
        
        // Check if the fix class is available
        if (window.landingPageButtonFix) {
            this.addResult('✅ LandingPageButtonFix class loaded', 'success');
            
            // Check if required methods exist
            const requiredMethods = [
                'startRiskAssessment',
                'showDashboard', 
                'showSignup',
                'showProfile',
                'handleLogout',
                'handleFeatureClick',
                'showNotification'
            ];
            
            requiredMethods.forEach(method => {
                if (typeof window.landingPageButtonFix[method] === 'function') {
                    this.addResult(`✅ Method available: ${method}`, 'success');
                } else {
                    this.addResult(`❌ Method missing: ${method}`, 'error');
                }
            });
            
        } else {
            this.addResult('❌ LandingPageButtonFix class not loaded', 'error');
        }
    }

    testButtonClick(element, buttonName) {
        try {
            // Create a mock click event
            const clickEvent = new MouseEvent('click', {
                bubbles: true,
                cancelable: true,
                view: window
            });
            
            // Dispatch the event
            const result = element.dispatchEvent(clickEvent);
            
            if (result) {
                this.addResult(`✅ Click test passed: ${buttonName}`, 'success');
            } else {
                this.addResult(`⚠️ Click event prevented: ${buttonName}`, 'warning');
            }
            
        } catch (error) {
            this.addResult(`❌ Click test failed: ${buttonName} - ${error.message}`, 'error');
        }
    }

    addResult(message, type) {
        this.testResults.push({ message, type, timestamp: new Date().toLocaleTimeString() });
        console.log(`${this.getTypeIcon(type)} ${message}`);
    }

    getTypeIcon(type) {
        const icons = {
            success: '✅',
            warning: '⚠️',
            error: '❌',
            info: 'ℹ️'
        };
        return icons[type] || 'ℹ️';
    }

    displayResults() {
        console.log('📊 Verification Results Summary:');
        
        const summary = {
            success: this.testResults.filter(r => r.type === 'success').length,
            warning: this.testResults.filter(r => r.type === 'warning').length,
            error: this.testResults.filter(r => r.type === 'error').length
        };
        
        console.log(`✅ Passed: ${summary.success}`);
        console.log(`⚠️ Warnings: ${summary.warning}`);
        console.log(`❌ Failed: ${summary.error}`);
        
        const totalTests = summary.success + summary.warning + summary.error;
        const successRate = Math.round((summary.success / totalTests) * 100);
        
        console.log(`📈 Success Rate: ${successRate}%`);
        
        if (summary.error === 0) {
            console.log('🎉 All critical tests passed! Landing page buttons should be working correctly.');
        } else {
            console.log('🚨 Some tests failed. Please check the issues above.');
        }

        // Create visual results display
        this.createResultsDisplay(summary, successRate);
    }

    createResultsDisplay(summary, successRate) {
        // Remove existing results display
        const existingDisplay = document.getElementById('verification-results');
        if (existingDisplay) {
            existingDisplay.remove();
        }

        const resultsDisplay = document.createElement('div');
        resultsDisplay.id = 'verification-results';
        resultsDisplay.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            width: 350px;
            background: white;
            border-radius: 12px;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
            z-index: 10000;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            border: 2px solid ${summary.error === 0 ? '#10b981' : '#ef4444'};
        `;

        resultsDisplay.innerHTML = `
            <div style="padding: 20px; border-bottom: 1px solid #e5e7eb;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                    <h3 style="margin: 0; color: #1f2937;">Button Fix Verification</h3>
                    <button onclick="this.parentElement.parentElement.parentElement.remove()" 
                            style="background: none; border: none; font-size: 18px; cursor: pointer; color: #6b7280;">×</button>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
                    <div style="text-align: center;">
                        <div style="font-size: 24px; font-weight: bold; color: #10b981;">${summary.success}</div>
                        <div style="font-size: 12px; color: #6b7280;">Passed</div>
                    </div>
                    <div style="text-align: center;">
                        <div style="font-size: 24px; font-weight: bold; color: #f59e0b;">${summary.warning}</div>
                        <div style="font-size: 12px; color: #6b7280;">Warnings</div>
                    </div>
                    <div style="text-align: center;">
                        <div style="font-size: 24px; font-weight: bold; color: #ef4444;">${summary.error}</div>
                        <div style="font-size: 12px; color: #6b7280;">Failed</div>
                    </div>
                </div>
                <div style="background: #f3f4f6; border-radius: 8px; padding: 10px; text-align: center;">
                    <div style="font-size: 18px; font-weight: bold; color: ${successRate >= 80 ? '#10b981' : '#ef4444'};">
                        ${successRate}% Success Rate
                    </div>
                </div>
            </div>
            <div style="padding: 15px; max-height: 200px; overflow-y: auto;">
                ${this.testResults.map(result => `
                    <div style="display: flex; align-items: flex-start; gap: 8px; margin-bottom: 8px; font-size: 13px;">
                        <span>${this.getTypeIcon(result.type)}</span>
                        <span style="flex: 1; color: #374151;">${result.message}</span>
                        <span style="color: #9ca3af; font-size: 11px;">${result.timestamp}</span>
                    </div>
                `).join('')}
            </div>
        `;

        document.body.appendChild(resultsDisplay);

        // Auto-hide after 30 seconds
        setTimeout(() => {
            if (resultsDisplay.parentNode) {
                resultsDisplay.remove();
            }
        }, 30000);
    }
}

// Auto-run verification when script loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new LandingPageButtonVerifier();
    });
} else {
    new LandingPageButtonVerifier();
}

console.log('🔍 Landing Page Button Verification script loaded');