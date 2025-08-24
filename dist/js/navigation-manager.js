// Navigation Manager - Handles page navigation and authentication state
class NavigationManager {
    constructor() {
        this.currentPage = 'landing';
        this.isAuthenticated = false;
        this.init();
    }

    init() {
        console.log('🧭 Initializing Navigation Manager...');
        
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupNavigation());
        } else {
            this.setupNavigation();
        }
    }

    setupNavigation() {
        // Setup navigation buttons
        this.setupNavigationButtons();
        
        // Check initial authentication state
        this.checkAuthenticationState();
        
        // Setup page visibility observers
        this.observePageChanges();
        
        console.log('✅ Navigation Manager initialized');
    }

    setupNavigationButtons() {
        // Dashboard navigation button
        const navDashboardBtn = document.getElementById('nav-dashboard-btn');
        if (navDashboardBtn) {
            navDashboardBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.navigateToDashboard();
            });
        }

        // Sign up button
        const navSignupBtn = document.getElementById('nav-signup-btn');
        if (navSignupBtn) {
            navSignupBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleSignUp();
            });
        }

        // Profile button
        const navProfileBtn = document.getElementById('nav-profile-btn');
        if (navProfileBtn) {
            navProfileBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleProfileClick();
            });
        }

        // Logout button
        const navLogoutBtn = document.getElementById('nav-logout-btn');
        if (navLogoutBtn) {
            navLogoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.logout();
            });
        }

        // Logo click - go to landing
        const logo = document.querySelector('.logo h1');
        if (logo) {
            logo.style.cursor = 'pointer';
            logo.addEventListener('click', () => {
                this.navigateToLanding();
            });
        }
    }

    handleProfileClick() {
        // Delegate to dashboard hero if available
        if (window.dashboardHero && typeof window.dashboardHero.showProfileMenu === 'function') {
            window.dashboardHero.showProfileMenu();
        } else {
            // Fallback profile menu
            this.showProfileMenu();
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

        // Get current user info
        const currentUser = JSON.parse(localStorage.getItem('glucobalance-current-user') || '{}');
        const userName = currentUser.name || 'User';
        const userEmail = currentUser.email || 'user@example.com';

        const dropdown = document.createElement('div');
        dropdown.className = 'profile-dropdown';
        dropdown.innerHTML = `
            <div class="profile-menu">
                <div class="profile-header">
                    <div class="profile-avatar">👤</div>
                    <div class="profile-info">
                        <div class="profile-name">${userName}</div>
                        <div class="profile-email">${userEmail}</div>
                    </div>
                </div>
                <div class="profile-divider"></div>
                <div class="profile-actions">
                    <button class="profile-action-btn" onclick="navigationManager.editProfile()">
                        <span class="action-icon">✏️</span>
                        <span class="action-text">Edit Profile</span>
                    </button>
                    <button class="profile-action-btn" onclick="navigationManager.viewSettings()">
                        <span class="action-icon">⚙️</span>
                        <span class="action-text">Settings</span>
                    </button>
                    <button class="profile-action-btn" onclick="navigationManager.viewHelp()">
                        <span class="action-icon">❓</span>
                        <span class="action-text">Help & Support</span>
                    </button>
                    <div class="profile-divider"></div>
                    <button class="profile-action-btn logout-action" onclick="navigationManager.logout()">
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

    editProfile() {
        // Close dropdown
        document.querySelector('.profile-dropdown')?.remove();
        
        // Show profile editing functionality
        this.showNotification('Profile editing feature coming soon!', 'info');
    }

    viewSettings() {
        // Close dropdown
        document.querySelector('.profile-dropdown')?.remove();
        
        // Show settings functionality
        this.showNotification('Settings feature coming soon!', 'info');
    }

    viewHelp() {
        // Close dropdown
        document.querySelector('.profile-dropdown')?.remove();
        
        // Show help functionality
        this.showNotification('Help & Support feature coming soon!', 'info');
    }

    navigateToDashboard() {
        console.log('🎯 Navigating to dashboard...');
        
        // Set authentication state
        this.isAuthenticated = true;
        localStorage.setItem('glucobalance-auth-state', 'authenticated');
        
        // Set demo user as current user for demonstration
        const demoUser = {
            id: 'demo-user-glucobalance',
            email: 'demo@glucobalance.com',
            name: 'Alex Demo',
            age: 42
        };
        
        // Store current user
        localStorage.setItem('glucobalance-current-user', JSON.stringify(demoUser));
        
        // Set user in dashboard hero
        if (window.dashboardHero) {
            window.dashboardHero.setCurrentUser(demoUser);
        }
        
        // Generate demo data if not already present
        if (window.demoDataGenerator) {
            const existingData = JSON.parse(localStorage.getItem(`mood-entries-${demoUser.id}`) || '[]');
            if (existingData.length === 0) {
                console.log('🎯 Generating demo data for Alex Demo...');
                window.demoDataGenerator.generateAllDemoData();
            }
        }
        
        // Hide landing page
        const landingPage = document.getElementById('landing-page');
        if (landingPage) {
            landingPage.classList.remove('active');
        }
        
        // Show dashboard page
        const dashboardPage = document.getElementById('dashboard-page');
        if (dashboardPage) {
            dashboardPage.classList.add('active');
        }
        
        // Update navigation state
        this.updateNavigationForAuthenticatedUser();
        this.currentPage = 'dashboard';
        
        // Initialize dashboard if not already done
        setTimeout(() => {
            if (window.dashboardButtonsFix && !window.dashboardButtonsFix.isInitialized) {
                window.dashboardButtonsFix.setupAllButtons();
            }
        }, 100);
    }

    navigateToLanding() {
        console.log('🏠 Navigating to landing page...');
        
        // Set authentication state
        this.isAuthenticated = false;
        localStorage.removeItem('glucobalance-auth-state');
        
        // Hide dashboard page
        const dashboardPage = document.getElementById('dashboard-page');
        if (dashboardPage) {
            dashboardPage.classList.remove('active');
        }
        
        // Show landing page
        const landingPage = document.getElementById('landing-page');
        if (landingPage) {
            landingPage.classList.add('active');
        }
        
        // Update navigation state
        this.updateNavigationForUnauthenticatedUser();
        this.currentPage = 'landing';
    }

    handleSignUp() {
        console.log('📝 Sign up clicked');
        
        // For demo purposes, simulate sign up and go to dashboard
        this.showNotification('Welcome to GlucoBalance! Taking you to your dashboard...', 'success');
        
        setTimeout(() => {
            this.navigateToDashboard();
        }, 1500);
    }

    logout() {
        console.log('🚪 Logging out user...');
        
        // Clear all user data
        this.clearUserData();
        
        // Navigate to landing page
        this.navigateToLanding();
        
        // Show logout confirmation
        this.showNotification('Successfully logged out. See you soon!', 'success');
    }

    clearUserData() {
        // Clear authentication state
        localStorage.removeItem('glucobalance-auth-state');
        localStorage.removeItem('glucobalance-current-user');
        localStorage.removeItem('glucobalance-auth-token');
        
        // Clear session storage
        sessionStorage.clear();
        
        console.log('🗑️ User data cleared');
    }

    updateNavigationForAuthenticatedUser() {
        // Hide sign up button
        const navSignupBtn = document.getElementById('nav-signup-btn');
        if (navSignupBtn) {
            navSignupBtn.style.display = 'none';
        }
        
        // Show profile button
        const navProfileBtn = document.getElementById('nav-profile-btn');
        if (navProfileBtn) {
            navProfileBtn.style.display = 'flex';
        }
        
        // Show logout button
        const navLogoutBtn = document.getElementById('nav-logout-btn');
        if (navLogoutBtn) {
            navLogoutBtn.style.display = 'block';
        }
        
        // Update dashboard button text
        const navDashboardBtn = document.getElementById('nav-dashboard-btn');
        if (navDashboardBtn) {
            navDashboardBtn.textContent = 'Dashboard';
            navDashboardBtn.classList.remove('btn-outline');
            navDashboardBtn.classList.add('btn-primary');
        }
        
        console.log('🔐 Navigation updated for authenticated user');
    }

    updateNavigationForUnauthenticatedUser() {
        // Show sign up button
        const navSignupBtn = document.getElementById('nav-signup-btn');
        if (navSignupBtn) {
            navSignupBtn.style.display = 'block';
        }
        
        // Hide profile button
        const navProfileBtn = document.getElementById('nav-profile-btn');
        if (navProfileBtn) {
            navProfileBtn.style.display = 'none';
        }
        
        // Hide logout button
        const navLogoutBtn = document.getElementById('nav-logout-btn');
        if (navLogoutBtn) {
            navLogoutBtn.style.display = 'none';
        }
        
        // Update dashboard button text
        const navDashboardBtn = document.getElementById('nav-dashboard-btn');
        if (navDashboardBtn) {
            navDashboardBtn.textContent = 'Dashboard';
            navDashboardBtn.classList.remove('btn-primary');
            navDashboardBtn.classList.add('btn-outline');
        }
        
        console.log('🔓 Navigation updated for unauthenticated user');
    }

    checkAuthenticationState() {
        const authState = localStorage.getItem('glucobalance-auth-state');
        
        if (authState === 'authenticated') {
            this.isAuthenticated = true;
            this.updateNavigationForAuthenticatedUser();
            
            // Load current user if authenticated
            const currentUser = JSON.parse(localStorage.getItem('glucobalance-current-user') || '{}');
            if (currentUser.id && window.dashboardHero) {
                window.dashboardHero.setCurrentUser(currentUser);
            }
        } else {
            this.isAuthenticated = false;
            this.updateNavigationForUnauthenticatedUser();
        }
        
        console.log('🔍 Authentication state checked:', this.isAuthenticated ? 'Authenticated' : 'Not authenticated');
    }

    observePageChanges() {
        // Watch for page changes
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    const target = mutation.target;
                    
                    if (target.id === 'dashboard-page' && target.classList.contains('active')) {
                        this.currentPage = 'dashboard';
                        this.isAuthenticated = true;
                        this.updateNavigationForAuthenticatedUser();
                    } else if (target.id === 'landing-page' && target.classList.contains('active')) {
                        this.currentPage = 'landing';
                        if (!this.isAuthenticated) {
                            this.updateNavigationForUnauthenticatedUser();
                        }
                    }
                }
            });
        });

        // Observe both pages
        const dashboardPage = document.getElementById('dashboard-page');
        const landingPage = document.getElementById('landing-page');
        
        if (dashboardPage) {
            observer.observe(dashboardPage, { attributes: true });
        }
        
        if (landingPage) {
            observer.observe(landingPage, { attributes: true });
        }
    }

    showNotification(message, type = 'info') {
        // Remove existing notifications
        document.querySelectorAll('.nav-notification').forEach(n => n.remove());
        
        const notification = document.createElement('div');
        notification.className = `nav-notification notification-${type}`;
        
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">${icons[type]}</span>
                <span class="notification-message">${message}</span>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;
        
        notification.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            background: white;
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
            border-left: 4px solid ${type === 'success' ? '#10B981' : type === 'error' ? '#EF4444' : type === 'warning' ? '#F59E0B' : '#3B82F6'};
            padding: 16px;
            max-width: 350px;
            z-index: 10000;
            animation: slideInRight 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        // Auto-remove after 4 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.style.animation = 'slideOutRight 0.3s ease';
                setTimeout(() => notification.remove(), 300);
            }
        }, 4000);
    }

    // Public methods for external use
    getCurrentPage() {
        return this.currentPage;
    }

    getAuthenticationState() {
        return this.isAuthenticated;
    }
}

// Initialize navigation manager
window.navigationManager = new NavigationManager();
console.log('🧭 Navigation Manager service initialized');
//# sourceMappingURL=navigation-manager.js.map