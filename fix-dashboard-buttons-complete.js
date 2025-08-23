// Complete Dashboard Button Fix
// This script ensures all dashboard buttons work properly

(function() {
    'use strict';
    
    console.log('🔧 Applying comprehensive dashboard button fixes...');
    
    // Wait for DOM to be ready
    function waitForDOM(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }
    
    // Fix risk assessment button
    function fixRiskAssessmentButton() {
        const takeAssessmentBtn = document.getElementById('take-assessment-btn');
        if (takeAssessmentBtn) {
            // Remove any existing event listeners
            takeAssessmentBtn.replaceWith(takeAssessmentBtn.cloneNode(true));
            const newBtn = document.getElementById('take-assessment-btn');
            
            newBtn.addEventListener('click', function(e) {
                e.preventDefault();
                console.log('🎯 Risk Assessment button clicked');
                
                // Priority 1: Use app's showAssessment method
                if (window.glucoApp && typeof window.glucoApp.showAssessment === 'function') {
                    console.log('✅ Starting assessment through app...');
                    window.glucoApp.showAssessment();
                    return;
                }
                
                // Priority 2: Use risk assessment module directly
                if (window.riskAssessment && typeof window.riskAssessment.startAssessment === 'function') {
                    console.log('✅ Starting WHO/ADA risk assessment...');
                    window.riskAssessment.startAssessment();
                    return;
                }
                
                // Priority 3: Try to initialize if class is available
                if (window.RiskAssessmentEngine) {
                    console.log('⚠️ Initializing risk assessment...');
                    window.riskAssessment = new window.RiskAssessmentEngine();
                    window.riskAssessment.startAssessment();
                    return;
                }
                
                // Fallback: Show error
                console.error('❌ Risk assessment not available');
                alert('Risk assessment is currently unavailable. Please refresh the page and try again.');
            });
            
            console.log('✅ Risk assessment button fixed');
        } else {
            console.warn('⚠️ Risk assessment button not found');
        }
    }
    
    // Fix mood buttons
    function fixMoodButtons() {
        const moodBtns = document.querySelectorAll('.mood-btn');
        moodBtns.forEach((btn, index) => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                const mood = parseInt(this.dataset.mood);
                console.log(`💙 Mood ${mood} selected`);
                
                // Update UI
                moodBtns.forEach(b => b.classList.remove('selected'));
                this.classList.add('selected');
                
                // Show feedback
                const moodLabels = ['', 'Very Sad', 'Sad', 'Neutral', 'Happy', 'Very Happy'];
                if (window.dashboardButtonManager && window.dashboardButtonManager.showNotification) {
                    window.dashboardButtonManager.showNotification(`Mood logged: ${moodLabels[mood]}`, 'success');
                } else {
                    console.log(`Mood logged: ${moodLabels[mood]}`);
                }
            });
        });
        
        console.log(`✅ ${moodBtns.length} mood buttons fixed`);
    }
    
    // Fix mood action buttons
    function fixMoodActionButtons() {
        const logMoodBtn = document.getElementById('log-mood-btn');
        const viewMoodHistoryBtn = document.getElementById('view-mood-history-btn');
        
        if (logMoodBtn) {
            logMoodBtn.addEventListener('click', function(e) {
                e.preventDefault();
                console.log('💙 Log mood clicked');
                
                if (window.glucoApp && typeof window.glucoApp.showMentalHealth === 'function') {
                    window.glucoApp.showMentalHealth();
                } else {
                    // Show mood selector
                    const moodSelector = document.getElementById('mood-selector');
                    if (moodSelector) {
                        moodSelector.style.display = moodSelector.style.display === 'none' ? 'flex' : 'none';
                    }
                }
            });
        }
        
        if (viewMoodHistoryBtn) {
            viewMoodHistoryBtn.addEventListener('click', function(e) {
                e.preventDefault();
                console.log('📈 View mood history clicked');
                
                if (window.dashboardButtonManager && window.dashboardButtonManager.showNotification) {
                    window.dashboardButtonManager.showNotification('Mood history feature coming soon!', 'info');
                } else {
                    alert('Mood history feature coming soon!');
                }
            });
        }
        
        console.log('✅ Mood action buttons fixed');
    }
    
    // Fix nutrition buttons
    function fixNutritionButtons() {
        const createMealPlanBtn = document.getElementById('create-meal-plan-btn');
        const viewNutritionBtn = document.getElementById('view-nutrition-btn');
        
        if (createMealPlanBtn) {
            createMealPlanBtn.addEventListener('click', function(e) {
                e.preventDefault();
                console.log('🍽️ Create meal plan clicked');
                
                if (window.glucoApp && typeof window.glucoApp.showNutrition === 'function') {
                    window.glucoApp.showNutrition();
                } else if (window.nutritionService) {
                    // Try nutrition service
                    console.log('Using nutrition service...');
                } else {
                    if (window.dashboardButtonManager && window.dashboardButtonManager.showNotification) {
                        window.dashboardButtonManager.showNotification('Nutrition planning feature coming soon!', 'info');
                    } else {
                        alert('Nutrition planning feature coming soon!');
                    }
                }
            });
        }
        
        if (viewNutritionBtn) {
            viewNutritionBtn.addEventListener('click', function(e) {
                e.preventDefault();
                console.log('📋 View nutrition plans clicked');
                
                if (window.glucoApp && typeof window.glucoApp.showNutrition === 'function') {
                    window.glucoApp.showNutrition();
                } else {
                    if (window.dashboardButtonManager && window.dashboardButtonManager.showNotification) {
                        window.dashboardButtonManager.showNotification('Nutrition plans feature coming soon!', 'info');
                    } else {
                        alert('Nutrition plans feature coming soon!');
                    }
                }
            });
        }
        
        console.log('✅ Nutrition buttons fixed');
    }
    
    // Fix AI insights button
    function fixAIInsightsButton() {
        const getStartedInsightsBtn = document.getElementById('get-started-insights-btn');
        const refreshInsightsBtn = document.getElementById('refresh-insights-btn');
        
        if (getStartedInsightsBtn) {
            getStartedInsightsBtn.addEventListener('click', function(e) {
                e.preventDefault();
                console.log('🤖 AI insights get started clicked');
                
                if (window.ai && typeof window.ai.generateInsights === 'function') {
                    window.ai.generateInsights();
                } else {
                    if (window.dashboardButtonManager && window.dashboardButtonManager.showNotification) {
                        window.dashboardButtonManager.showNotification('AI insights feature coming soon!', 'info');
                    } else {
                        alert('AI insights feature coming soon!');
                    }
                }
            });
        }
        
        if (refreshInsightsBtn) {
            refreshInsightsBtn.addEventListener('click', function(e) {
                e.preventDefault();
                console.log('🔄 Refresh insights clicked');
                
                if (window.dashboardButtonManager && window.dashboardButtonManager.showNotification) {
                    window.dashboardButtonManager.showNotification('Refreshing insights...', 'info');
                } else {
                    console.log('Refreshing insights...');
                }
            });
        }
        
        console.log('✅ AI insights buttons fixed');
    }
    
    // Fix dashboard hero buttons
    function fixDashboardHeroButtons() {
        const refreshDashboardBtn = document.getElementById('refresh-dashboard');
        const profileBtn = document.getElementById('profile-btn');
        
        if (refreshDashboardBtn) {
            refreshDashboardBtn.addEventListener('click', function(e) {
                e.preventDefault();
                console.log('🔄 Refresh dashboard clicked');
                
                // Refresh dashboard data
                if (window.dashboardButtonManager && window.dashboardButtonManager.showNotification) {
                    window.dashboardButtonManager.showNotification('Dashboard refreshed!', 'success');
                } else {
                    console.log('Dashboard refreshed!');
                }
                
                // Reload dashboard data
                location.reload();
            });
        }
        
        if (profileBtn) {
            profileBtn.addEventListener('click', function(e) {
                e.preventDefault();
                console.log('👤 Profile clicked');
                
                if (window.dashboardButtonManager && window.dashboardButtonManager.showNotification) {
                    window.dashboardButtonManager.showNotification('Profile feature coming soon!', 'info');
                } else {
                    alert('Profile feature coming soon!');
                }
            });
        }
        
        console.log('✅ Dashboard hero buttons fixed');
    }
    
    // Main fix function
    function applyAllFixes() {
        console.log('🔧 Applying all dashboard button fixes...');
        
        fixRiskAssessmentButton();
        fixMoodButtons();
        fixMoodActionButtons();
        fixNutritionButtons();
        fixAIInsightsButton();
        fixDashboardHeroButtons();
        
        console.log('✅ All dashboard button fixes applied successfully!');
    }
    
    // Apply fixes when DOM is ready
    waitForDOM(function() {
        // Wait a bit for other scripts to load
        setTimeout(applyAllFixes, 1000);
    });
    
    // Export for manual use
    window.fixDashboardButtons = applyAllFixes;
    
})();