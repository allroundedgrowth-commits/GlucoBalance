// Demo Account Setup and Management
class DemoAccountSetup {
    constructor() {
        this.demoEmail = 'demo@glucobalance.com';
        this.demoPassword = 'demo123';
        this.userId = 'demo-user-glucobalance';
    }

    setupDemoAccount() {
        console.log('🎯 Setting up demo account: demo@glucobalance.com');
        
        // Create demo user in auth system
        this.createDemoUser();
        
        // Generate comprehensive demo data
        if (window.comprehensiveDemoData) {
            window.comprehensiveDemoData.generateAllDemoData();
        }
        
        // Set up demo login capability
        this.setupDemoLogin();
        
        console.log('✅ Demo account setup complete!');
        console.log('📧 Email: demo@glucobalance.com');
        console.log('🔑 Password: demo123');
    }

    createDemoUser() {
        // Create user in the auth system
        const users = JSON.parse(localStorage.getItem('glucobalance-users') || '[]');
        
        const demoUser = {
            id: this.userId,
            email: this.demoEmail,
            password: this.hashPassword(this.demoPassword), // Simple hash for demo
            name: 'Alex Demo',
            firstName: 'Alex',
            lastName: 'Demo',
            age: 42,
            createdAt: new Date().toISOString(),
            isDemo: true,
            hasCompletedAssessment: true,
            riskScore: 12,
            riskCategory: 'Increased Risk',
            lastAssessmentDate: new Date().toISOString(),
            profile: {
                height: 175, // cm
                initialWeight: 185, // lbs
                currentWeight: 181.8, // lbs
                activityLevel: 'moderate',
                dietaryPreferences: ['Mediterranean', 'Low-Glycemic'],
                healthGoals: ['Diabetes Prevention', 'Weight Management', 'Improved Energy']
            }
        };

        // Remove existing demo user if present
        const filteredUsers = users.filter(u => u.email !== this.demoEmail);
        filteredUsers.push(demoUser);
        
        localStorage.setItem('glucobalance-users', JSON.stringify(filteredUsers));
        localStorage.setItem(`user-${this.userId}`, JSON.stringify(demoUser));
        
        console.log('✅ Demo user created in auth system');
    }

    setupDemoLogin() {
        // Override auth service for demo login
        const originalAuthService = window.authService;
        
        if (originalAuthService) {
            const originalLogin = originalAuthService.login.bind(originalAuthService);
            
            originalAuthService.login = async (email, password) => {
                if (email === this.demoEmail && password === this.demoPassword) {
                    // Demo login
                    const demoUser = {
                        id: this.userId,
                        email: this.demoEmail,
                        name: 'Alex Demo',
                        isDemo: true
                    };
                    
                    localStorage.setItem('current-user', JSON.stringify(demoUser));
                    localStorage.setItem('auth-token', 'demo-token-' + Date.now());
                    
                    // Trigger login success
                    document.dispatchEvent(new CustomEvent('userLoggedIn', {
                        detail: { user: demoUser }
                    }));
                    
                    console.log('✅ Demo user logged in successfully');
                    return { success: true, user: demoUser };
                } else {
                    // Regular login
                    return originalLogin(email, password);
                }
            };
        }
    }

    hashPassword(password) {
        // Simple hash for demo purposes (not secure for production)
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            const char = password.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return hash.toString();
    }

    loginAsDemo() {
        if (window.authService && typeof window.authService.login === 'function') {
            return window.authService.login(this.demoEmail, this.demoPassword);
        } else {
            // Direct login for demo
            const demoUser = {
                id: this.userId,
                email: this.demoEmail,
                name: 'Alex Demo',
                isDemo: true
            };
            
            localStorage.setItem('current-user', JSON.stringify(demoUser));
            localStorage.setItem('auth-token', 'demo-token-' + Date.now());
            
            // Navigate to dashboard
            if (window.glucoApp && typeof window.glucoApp.showDashboard === 'function') {
                window.glucoApp.userData = demoUser;
                window.glucoApp.showDashboard();
            }
            
            console.log('✅ Demo login successful');
            return { success: true, user: demoUser };
        }
    }

    isDemoUser(user) {
        return user && (user.email === this.demoEmail || user.isDemo === true);
    }

    getDemoDataSummary() {
        if (window.comprehensiveDemoData) {
            return window.comprehensiveDemoData.getDataSummary();
        }
        return null;
    }

    clearDemoData() {
        if (window.comprehensiveDemoData) {
            window.comprehensiveDemoData.clearAllDemoData();
        }
        
        // Clear auth data
        const users = JSON.parse(localStorage.getItem('glucobalance-users') || '[]');
        const filteredUsers = users.filter(u => u.email !== this.demoEmail);
        localStorage.setItem('glucobalance-users', JSON.stringify(filteredUsers));
        
        localStorage.removeItem(`user-${this.userId}`);
        
        console.log('🗑️ Demo account and data cleared');
    }

    refreshDemoData() {
        console.log('🔄 Refreshing demo data...');
        this.clearDemoData();
        this.setupDemoAccount();
        console.log('✅ Demo data refreshed');
    }
}

// Initialize demo account setup
window.demoAccountSetup = new DemoAccountSetup();

// Auto-setup demo account on page load
document.addEventListener('DOMContentLoaded', () => {
    // Check if demo data exists
    const demoUser = JSON.parse(localStorage.getItem(`user-demo-user-glucobalance`) || 'null');
    if (!demoUser) {
        console.log('🎯 Setting up demo account for first time...');
        window.demoAccountSetup.setupDemoAccount();
    } else {
        console.log('✅ Demo account already exists');
    }
});

// Demo login button functionality removed
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('demo-login')) {
        e.preventDefault();
        window.demoAccountSetup.loginAsDemo();
    }
});

// Expose demo functions globally for testing
window.loginAsDemo = () => window.demoAccountSetup.loginAsDemo();
window.getDemoSummary = () => window.demoAccountSetup.getDemoDataSummary();
window.refreshDemoData = () => window.demoAccountSetup.refreshDemoData();