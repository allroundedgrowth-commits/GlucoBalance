// GlucoBalance Dashboard Hero Section Manager
class DashboardHero {
    constructor() {
        this.currentUser = null;
        this.heroData = {
            riskScore: '--',
            moodAvg: '--',
            progress: '--'
        };
        this.init();
    }

    init() {
        this.updateTimeOfDay();
        this.setupEventListeners();
        
        // Update time of day every minute
        setInterval(() => this.updateTimeOfDay(), 60000);
        
        console.log('Dashboard Hero initialized');
    }

    setupEventListeners() {
        // Profile button click (now in navigation)
        document.getElementById('nav-profile-btn')?.addEventListener('click', () => {
            this.showProfileMenu();
        });

        // Auto-refresh setup - refresh every 5 minutes
        this.setupAutoRefresh();
    }

    setupAutoRefresh() {
        // Auto-refresh dashboard every 5 minutes
        this.autoRefreshInterval = setInterval(() => {
            if (document.getElementById('dashboard-page')?.classList.contains('active')) {
                this.refreshDashboard(true); // Silent refresh
            }
        }, 5 * 60 * 1000); // 5 minutes

        console.log('Auto-refresh enabled: Dashboard will refresh every 5 minutes');
    }

    setCurrentUser(user) {
        this.currentUser = user;
        this.updateUserName();
        this.loadHeroData();
    }

    updateTimeOfDay() {
        const now = new Date();
        const hour = now.getHours();
        const timeOfDayElement = document.getElementById('time-of-day');
        const heroTitle = document.querySelector('.hero-title');
        
        if (!timeOfDayElement || !heroTitle) return;

        let timeOfDay = '';
        let className = '';

        if (hour >= 5 && hour < 12) {
            timeOfDay = 'morning';
            className = 'morning';
        } else if (hour >= 12 && hour < 17) {
            timeOfDay = 'afternoon';
            className = 'afternoon';
        } else if (hour >= 17 && hour < 21) {
            timeOfDay = 'evening';
            className = 'evening';
        } else {
            timeOfDay = 'night';
            className = 'night';
        }

        timeOfDayElement.textContent = timeOfDay;
        
        // Remove existing time classes
        heroTitle.classList.remove('morning', 'afternoon', 'evening', 'night');
        heroTitle.classList.add(className);
    }

    updateUserName() {
        const userNameElement = document.getElementById('dashboard-user-name');
        if (!userNameElement) return;

        if (this.currentUser && this.currentUser.name) {
            userNameElement.textContent = this.currentUser.name;
        } else if (this.currentUser && this.currentUser.email) {
            // Extract name from email
            const name = this.currentUser.email.split('@')[0];
            const capitalizedName = name.charAt(0).toUpperCase() + name.slice(1);
            userNameElement.textContent = capitalizedName;
        } else {
            userNameElement.textContent = 'User';
        }
    }

    async loadHeroData() {
        try {
            // Load risk score
            await this.loadRiskScore();
            
            // Load mood average
            await this.loadMoodAverage();
            
            // Load progress data
            await this.loadProgress();
            
        } catch (error) {
            console.error('Failed to load hero data:', error);
        }
    }

    async loadRiskScore() {
        const riskScoreElement = document.getElementById('hero-risk-score');
        if (!riskScoreElement) return;

        try {
            if (this.currentUser) {
                // Try to load from localStorage first (for demo data)
                const assessments = JSON.parse(localStorage.getItem(`risk-assessments-${this.currentUser.id}`) || '[]');
                
                if (assessments.length > 0) {
                    // Get the latest assessment
                    const latestAssessment = assessments[assessments.length - 1];
                    this.heroData.riskScore = latestAssessment.score;
                    riskScoreElement.textContent = latestAssessment.score;
                    
                    // Add color coding based on risk level
                    riskScoreElement.className = 'stat-value';
                    if (latestAssessment.score <= 5) {
                        riskScoreElement.style.color = '#4ade80'; // Green for low risk
                    } else if (latestAssessment.score <= 10) {
                        riskScoreElement.style.color = '#fbbf24'; // Yellow for moderate risk
                    } else {
                        riskScoreElement.style.color = '#f87171'; // Red for high risk
                    }
                } else if (window.kiroDb) {
                    // Fallback to database
                    const latestAssessment = await window.kiroDb.getLatestAssessment(this.currentUser.id);
                    if (latestAssessment && latestAssessment.score !== undefined) {
                        this.heroData.riskScore = latestAssessment.score;
                        riskScoreElement.textContent = latestAssessment.score;
                        
                        // Add color coding based on risk level
                        riskScoreElement.className = 'stat-value';
                        if (latestAssessment.score <= 5) {
                            riskScoreElement.style.color = '#4ade80'; // Green for low risk
                        } else if (latestAssessment.score <= 10) {
                            riskScoreElement.style.color = '#fbbf24'; // Yellow for moderate risk
                        } else {
                            riskScoreElement.style.color = '#f87171'; // Red for high risk
                        }
                    } else {
                        riskScoreElement.textContent = 'New';
                        riskScoreElement.style.color = '#ffd700';
                    }
                } else {
                    riskScoreElement.textContent = 'New';
                    riskScoreElement.style.color = '#ffd700';
                }
            }
        } catch (error) {
            console.error('Failed to load risk score:', error);
            riskScoreElement.textContent = '--';
        }
    }

    async loadMoodAverage() {
        const moodAvgElement = document.getElementById('hero-mood-avg');
        if (!moodAvgElement) return;

        try {
            if (this.currentUser) {
                // Try to load from localStorage first (for demo data)
                const moods = JSON.parse(localStorage.getItem(`mood-entries-${this.currentUser.id}`) || '[]');
                
                if (moods.length > 0) {
                    // Calculate 7-day average
                    const sevenDaysAgo = new Date();
                    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
                    
                    const recentMoods = moods.filter(mood => {
                        const moodDate = new Date(mood.date);
                        return moodDate >= sevenDaysAgo;
                    });
                    
                    if (recentMoods.length > 0) {
                        const avgMood = recentMoods.reduce((sum, mood) => sum + mood.mood, 0) / recentMoods.length;
                        const avgMoodFormatted = avgMood.toFixed(1);
                        
                        this.heroData.moodAvg = parseFloat(avgMoodFormatted);
                        moodAvgElement.textContent = avgMoodFormatted;
                        
                        // Add color coding based on mood level
                        if (avgMood >= 4) {
                            moodAvgElement.style.color = '#4ade80'; // Green for good mood
                        } else if (avgMood >= 3) {
                            moodAvgElement.style.color = '#fbbf24'; // Yellow for neutral mood
                        } else {
                            moodAvgElement.style.color = '#f87171'; // Red for low mood
                        }
                    } else {
                        moodAvgElement.textContent = 'New';
                        moodAvgElement.style.color = '#ffd700';
                    }
                } else if (window.mentalHealthService) {
                    // Fallback to mental health service
                    window.mentalHealthService.setCurrentUser(this.currentUser.id);
                    const avgMood = window.mentalHealthService.getAverageMood(7); // 7-day average
                    
                    if (avgMood && avgMood !== '--') {
                        this.heroData.moodAvg = parseFloat(avgMood);
                        moodAvgElement.textContent = avgMood;
                        
                        // Add color coding based on mood level
                        const moodValue = parseFloat(avgMood);
                        if (moodValue >= 4) {
                            moodAvgElement.style.color = '#4ade80'; // Green for good mood
                        } else if (moodValue >= 3) {
                            moodAvgElement.style.color = '#fbbf24'; // Yellow for neutral mood
                        } else {
                            moodAvgElement.style.color = '#f87171'; // Red for low mood
                        }
                    } else {
                        moodAvgElement.textContent = 'New';
                        moodAvgElement.style.color = '#ffd700';
                    }
                } else {
                    moodAvgElement.textContent = 'New';
                    moodAvgElement.style.color = '#ffd700';
                }
            }
        } catch (error) {
            console.error('Failed to load mood average:', error);
            moodAvgElement.textContent = '--';
        }
    }

    async loadProgress() {
        const progressElement = document.getElementById('hero-progress');
        if (!progressElement) return;

        try {
            // Calculate overall progress based on available data
            let progressScore = 0;
            let factors = 0;

            // Factor 1: Risk assessment completion
            if (this.heroData.riskScore !== '--' && this.heroData.riskScore !== 'New') {
                progressScore += 25;
                factors++;
            }

            // Factor 2: Mood tracking consistency
            if (this.heroData.moodAvg !== '--' && this.heroData.moodAvg !== 'New') {
                progressScore += 25;
                factors++;
                
                // Bonus for good mood average
                if (this.heroData.moodAvg >= 3.5) {
                    progressScore += 10;
                }
            }

            // Factor 3: Recent activity (check if user has recent data)
            if (this.currentUser && window.kiroDb) {
                try {
                    const recentAssessments = await window.kiroDb.getUserAssessments(this.currentUser.id, 2);
                    if (recentAssessments && recentAssessments.length > 1) {
                        progressScore += 20; // Bonus for multiple assessments
                    }
                } catch (error) {
                    console.log('Could not load recent assessments for progress calculation');
                }
            }

            // Factor 4: Engagement bonus
            const today = new Date().toISOString().split('T')[0];
            if (window.mentalHealthService) {
                try {
                    const todayMood = await window.mentalHealthService.getMoodByDate(today);
                    if (todayMood) {
                        progressScore += 15; // Bonus for today's mood entry
                    }
                } catch (error) {
                    console.log('Could not check today\'s mood for progress calculation');
                }
            }

            // Cap at 100%
            progressScore = Math.min(progressScore, 100);
            
            if (progressScore > 0) {
                this.heroData.progress = progressScore;
                progressElement.textContent = `${progressScore}%`;
                
                // Color coding based on progress
                if (progressScore >= 80) {
                    progressElement.style.color = '#4ade80'; // Green for excellent progress
                } else if (progressScore >= 50) {
                    progressElement.style.color = '#fbbf24'; // Yellow for good progress
                } else {
                    progressElement.style.color = '#f87171'; // Red for needs improvement
                }
            } else {
                progressElement.textContent = 'Start';
                progressElement.style.color = '#ffd700';
            }

        } catch (error) {
            console.error('Failed to calculate progress:', error);
            progressElement.textContent = '--';
        }
    }

    showProfileMenu() {
        // Create profile dropdown menu
        const existingMenu = document.querySelector('.profile-dropdown');
        if (existingMenu) {
            existingMenu.remove();
            return;
        }

        const profileBtn = document.getElementById('nav-profile-btn');
        if (!profileBtn) return;

        const dropdown = document.createElement('div');
        dropdown.className = 'profile-dropdown';
        dropdown.innerHTML = `
            <div class="profile-menu">
                <div class="profile-header">
                    <div class="profile-avatar">👤</div>
                    <div class="profile-info">
                        <div class="profile-name">${this.currentUser?.name || this.currentUser?.email || 'User'}</div>
                        <div class="profile-email">${this.currentUser?.email || 'user@example.com'}</div>
                    </div>
                </div>
                <div class="profile-divider"></div>
                <div class="profile-actions">
                    <button class="profile-action-btn" onclick="dashboardHero.editProfile()">
                        <span class="action-icon">✏️</span>
                        <span class="action-text">Edit Profile</span>
                    </button>
                    <button class="profile-action-btn" onclick="dashboardHero.viewSettings()">
                        <span class="action-icon">⚙️</span>
                        <span class="action-text">Settings</span>
                    </button>
                    <button class="profile-action-btn" onclick="dashboardHero.viewHelp()">
                        <span class="action-icon">❓</span>
                        <span class="action-text">Help & Support</span>
                    </button>
                    <div class="profile-divider"></div>
                    <button class="profile-action-btn logout-action" onclick="dashboardHero.logout()">
                        <span class="action-icon">🚪</span>
                        <span class="action-text">Sign Out</span>
                    </button>
                </div>
            </div>
        `;

        // Position the dropdown
        const rect = profileBtn.getBoundingClientRect();
        dropdown.style.position = 'fixed';
        dropdown.style.top = `${rect.bottom + 10}px`;
        dropdown.style.right = `${window.innerWidth - rect.right}px`;
        dropdown.style.zIndex = '1000';

        document.body.appendChild(dropdown);

        // Close dropdown when clicking outside
        setTimeout(() => {
            document.addEventListener('click', (e) => {
                if (!dropdown.contains(e.target) && e.target !== profileBtn) {
                    dropdown.remove();
                }
            }, { once: true });
        }, 100);
    }

    async refreshDashboard(silent = false) {
        try {
            if (!silent) {
                console.log('Refreshing dashboard...');
            }

            // Reload hero data
            await this.loadHeroData();
            
            // Refresh dashboard if enhanced dashboard is available
            if (window.enhancedDashboard && typeof window.enhancedDashboard.refreshDashboard === 'function') {
                await window.enhancedDashboard.refreshDashboard(silent);
            } else if (window.enhancedDashboard && typeof window.enhancedDashboard.loadDashboard === 'function') {
                await window.enhancedDashboard.loadDashboard();
            }
            
            if (!silent) {
                console.log('Dashboard refreshed successfully');
                // Show a subtle notification
                this.showRefreshNotification('Dashboard updated', 'success');
            }

        } catch (error) {
            console.error('Failed to refresh dashboard:', error);
            
            if (!silent) {
                this.showRefreshNotification('Failed to refresh dashboard', 'error');
            }
        }
    }

    showRefreshNotification(message, type = 'info') {
        // Create a subtle notification
        const notification = document.createElement('div');
        notification.className = `refresh-notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            background: ${type === 'success' ? '#4ade80' : type === 'error' ? '#f87171' : '#60a5fa'};
            color: white;
            padding: 0.75rem 1rem;
            border-radius: 8px;
            font-size: 0.9rem;
            font-weight: 500;
            z-index: 1001;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            animation: slideInRight 0.3s ease-out;
        `;

        document.body.appendChild(notification);

        // Remove notification after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease-in';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }

    editProfile() {
        // Close dropdown
        document.querySelector('.profile-dropdown')?.remove();
        
        // Navigate to profile page or show profile modal
        if (window.glucoApp && typeof window.glucoApp.showProfile === 'function') {
            window.glucoApp.showProfile();
        } else {
            alert('Profile editing feature coming soon!');
        }
    }

    viewSettings() {
        // Close dropdown
        document.querySelector('.profile-dropdown')?.remove();
        
        // Show settings modal or navigate to settings
        alert('Settings feature coming soon!');
    }

    viewHelp() {
        // Close dropdown
        document.querySelector('.profile-dropdown')?.remove();
        
        // Show help modal or navigate to help page
        alert('Help & Support feature coming soon!');
    }

    logout() {
        // Close dropdown
        document.querySelector('.profile-dropdown')?.remove();
        
        // Confirm logout
        if (confirm('Are you sure you want to sign out?')) {
            // Use existing logout functionality
            if (window.authService && typeof window.authService.logout === 'function') {
                window.authService.logout();
            } else if (window.glucoApp && typeof window.glucoApp.logout === 'function') {
                window.glucoApp.logout();
            } else {
                // Fallback logout
                localStorage.clear();
                sessionStorage.clear();
                window.location.reload();
            }
        }
    }

    // Method to update hero stats from external sources
    updateHeroStats(stats) {
        if (stats.riskScore !== undefined) {
            this.heroData.riskScore = stats.riskScore;
            const element = document.getElementById('hero-risk-score');
            if (element) element.textContent = stats.riskScore;
        }

        if (stats.moodAvg !== undefined) {
            this.heroData.moodAvg = stats.moodAvg;
            const element = document.getElementById('hero-mood-avg');
            if (element) element.textContent = stats.moodAvg;
        }

        if (stats.progress !== undefined) {
            this.heroData.progress = stats.progress;
            const element = document.getElementById('hero-progress');
            if (element) element.textContent = `${stats.progress}%`;
        }
    }

    // Cleanup method
    destroy() {
        if (this.autoRefreshInterval) {
            clearInterval(this.autoRefreshInterval);
            this.autoRefreshInterval = null;
            console.log('Auto-refresh interval cleared');
        }
    }
}

// Initialize dashboard hero
window.dashboardHero = new DashboardHero();