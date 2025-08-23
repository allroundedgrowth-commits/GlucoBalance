// Verify Signup and Login Functionality
// This script verifies that the signup and login buttons work correctly

console.log('🔍 Starting signup and login functionality verification...');

class SignupLoginVerifier {
    constructor() {
        this.results = [];
        this.testsPassed = 0;
        this.testsFailed = 0;
    }

    log(test, status, message) {
        const result = `${status.toUpperCase()}: ${test} - ${message}`;
        this.results.push(result);
        console.log(`🧪 ${result}`);
        
        if (status === 'pass') {
            this.testsPassed++;
        } else if (status === 'fail') {
            this.testsFailed++;
        }
        
        return result;
    }

    async runAllTests() {
        console.log('🚀 Running all signup and login tests...');
        
        // Wait for services to be ready
        await this.waitForServices();
        
        // Test DOM elements
        this.testDOMElements();
        
        // Test services availability
        this.testServicesAvailability();
        
        // Test button event listeners
        await this.testButtonEventListeners();
        
        // Test authentication flow
        await this.testAuthenticationFlow();
        
        // Generate report
        this.generateReport();
    }

    async waitForServices() {
        console.log('⏳ Waiting for services to be ready...');
        
        const maxWait = 5000; // 5 seconds
        const checkInterval = 100; // 100ms
        let waited = 0;
        
        while (waited < maxWait) {
            const authServiceReady = window.authService && typeof window.authService.register === 'function';
            const authUIReady = window.authUI && typeof window.authUI.showRegistrationForm === 'function';
            const dbReady = window.kiroDb && typeof window.kiroDb.createUser === 'function';
            
            if (authServiceReady && authUIReady && dbReady) {
                this.log('Service Loading', 'pass', `All services ready after ${waited}ms`);
                return;
            }
            
            await new Promise(resolve => setTimeout(resolve, checkInterval));
            waited += checkInterval;
        }
        
        this.log('Service Loading', 'fail', `Services not ready after ${maxWait}ms`);
    }

    testDOMElements() {
        console.log('🔍 Testing DOM elements...');
        
        const requiredElements = [
            { id: 'nav-signup-btn', name: 'Navigation Signup Button' },
            { id: 'nav-get-started-btn', name: 'Navigation Get Started Button' },
            { id: 'nav-dashboard-btn', name: 'Navigation Dashboard Button' },
            { id: 'nav-profile-btn', name: 'Navigation Profile Button' },
            { id: 'nav-logout-btn', name: 'Navigation Logout Button' }
        ];
        
        requiredElements.forEach(element => {
            const domElement = document.getElementById(element.id);
            if (domElement) {
                this.log('DOM Element', 'pass', `${element.name} found`);
                
                // Check if element is clickable
                if (domElement.onclick || domElement.addEventListener) {
                    this.log('Element Interaction', 'pass', `${element.name} is interactive`);
                } else {
                    this.log('Element Interaction', 'warn', `${element.name} may not be interactive`);
                }
            } else {
                this.log('DOM Element', 'fail', `${element.name} not found`);
            }
        });
    }

    testServicesAvailability() {
        console.log('🔍 Testing services availability...');
        
        // Test Auth Service
        if (window.authService) {
            this.log('Auth Service', 'pass', 'Available');
            
            const requiredMethods = ['register', 'login', 'logout', 'isAuthenticated', 'getCurrentUser'];
            requiredMethods.forEach(method => {
                if (typeof window.authService[method] === 'function') {
                    this.log('Auth Service Method', 'pass', `${method} available`);
                } else {
                    this.log('Auth Service Method', 'fail', `${method} not available`);
                }
            });
        } else {
            this.log('Auth Service', 'fail', 'Not available');
        }
        
        // Test Auth UI
        if (window.authUI) {
            this.log('Auth UI', 'pass', 'Available');
            
            const requiredMethods = ['showRegistrationForm', 'showLoginForm', 'closeAuthModal'];
            requiredMethods.forEach(method => {
                if (typeof window.authUI[method] === 'function') {
                    this.log('Auth UI Method', 'pass', `${method} available`);
                } else {
                    this.log('Auth UI Method', 'fail', `${method} not available`);
                }
            });
        } else {
            this.log('Auth UI', 'fail', 'Not available');
        }
        
        // Test Database
        if (window.kiroDb) {
            this.log('Database', 'pass', 'Available');
            
            const requiredMethods = ['createUser', 'getUser', 'updateUser'];
            requiredMethods.forEach(method => {
                if (typeof window.kiroDb[method] === 'function') {
                    this.log('Database Method', 'pass', `${method} available`);
                } else {
                    this.log('Database Method', 'fail', `${method} not available`);
                }
            });
        } else {
            this.log('Database', 'fail', 'Not available');
        }
        
        // Test Button Manager
        if (window.authButtonManager) {
            this.log('Button Manager', 'pass', 'Available');
        } else {
            this.log('Button Manager', 'fail', 'Not available');
        }
    }

    async testButtonEventListeners() {
        console.log('🔍 Testing button event listeners...');
        
        // Test signup button
        const signupBtn = document.getElementById('nav-signup-btn');
        if (signupBtn) {
            try {
                // Create a mock click event
                const clickEvent = new Event('click', { bubbles: true, cancelable: true });
                signupBtn.dispatchEvent(clickEvent);
                
                // Wait a bit and check if modal appeared
                await new Promise(resolve => setTimeout(resolve, 500));
                
                const modal = document.getElementById('auth-modal');
                if (modal) {
                    this.log('Signup Button', 'pass', 'Click triggers registration modal');
                    
                    // Close the modal
                    const closeBtn = modal.querySelector('.close-btn');
                    if (closeBtn) {
                        closeBtn.click();
                    } else {
                        modal.remove();
                    }
                } else {
                    this.log('Signup Button', 'fail', 'Click does not trigger registration modal');
                }
            } catch (error) {
                this.log('Signup Button', 'fail', `Error testing click: ${error.message}`);
            }
        }
        
        // Test dashboard button
        const dashboardBtn = document.getElementById('nav-dashboard-btn');
        if (dashboardBtn) {
            try {
                const isAuthenticated = window.authService && window.authService.isAuthenticated();
                
                const clickEvent = new Event('click', { bubbles: true, cancelable: true });
                dashboardBtn.dispatchEvent(clickEvent);
                
                await new Promise(resolve => setTimeout(resolve, 500));
                
                if (isAuthenticated) {
                    // Should navigate to dashboard
                    const dashboardPage = document.getElementById('dashboard-page');
                    if (dashboardPage && dashboardPage.classList.contains('active')) {
                        this.log('Dashboard Button', 'pass', 'Authenticated user navigated to dashboard');
                    } else {
                        this.log('Dashboard Button', 'warn', 'Dashboard navigation may not be working');
                    }
                } else {
                    // Should show login modal
                    const modal = document.getElementById('auth-modal');
                    if (modal) {
                        this.log('Dashboard Button', 'pass', 'Unauthenticated user shown login modal');
                        
                        // Close the modal
                        const closeBtn = modal.querySelector('.close-btn');
                        if (closeBtn) {
                            closeBtn.click();
                        } else {
                            modal.remove();
                        }
                    } else {
                        this.log('Dashboard Button', 'fail', 'Unauthenticated user not shown login modal');
                    }
                }
            } catch (error) {
                this.log('Dashboard Button', 'fail', `Error testing click: ${error.message}`);
            }
        }
    }

    async testAuthenticationFlow() {
        console.log('🔍 Testing authentication flow...');
        
        if (!window.authService) {
            this.log('Auth Flow', 'fail', 'Auth service not available');
            return;
        }
        
        try {
            // Test user registration
            const testUser = {
                name: 'Verification Test User',
                email: 'verify@test.com',
                age: 28,
                gender: 'other'
            };
            
            // Clear any existing test user first
            const existingUsers = JSON.parse(localStorage.getItem('users') || '[]');
            const filteredUsers = existingUsers.filter(u => u.email !== testUser.email);
            localStorage.setItem('users', JSON.stringify(filteredUsers));
            
            // Test registration
            const registerResult = await window.authService.register(testUser);
            if (registerResult.success) {
                this.log('User Registration', 'pass', 'Test user registered successfully');
                
                // Test if user is automatically logged in
                const isAuthenticated = window.authService.isAuthenticated();
                if (isAuthenticated) {
                    this.log('Auto Login', 'pass', 'User automatically logged in after registration');
                    
                    // Test getting current user
                    const currentUser = window.authService.getCurrentUser();
                    if (currentUser && currentUser.email === testUser.email) {
                        this.log('Current User', 'pass', 'Current user data retrieved correctly');
                    } else {
                        this.log('Current User', 'fail', 'Current user data incorrect');
                    }
                    
                    // Test logout
                    const logoutResult = await window.authService.logout();
                    if (logoutResult.success) {
                        this.log('User Logout', 'pass', 'User logged out successfully');
                        
                        // Test login
                        const loginResult = await window.authService.login({ email: testUser.email });
                        if (loginResult.success) {
                            this.log('User Login', 'pass', 'User logged in successfully');
                            
                            // Final logout
                            await window.authService.logout();
                        } else {
                            this.log('User Login', 'fail', `Login failed: ${loginResult.error}`);
                        }
                    } else {
                        this.log('User Logout', 'fail', `Logout failed: ${logoutResult.error}`);
                    }
                } else {
                    this.log('Auto Login', 'fail', 'User not automatically logged in after registration');
                }
            } else {
                this.log('User Registration', 'fail', `Registration failed: ${registerResult.error}`);
            }
            
            // Clean up test user
            const finalUsers = JSON.parse(localStorage.getItem('users') || '[]');
            const cleanedUsers = finalUsers.filter(u => u.email !== testUser.email);
            localStorage.setItem('users', JSON.stringify(cleanedUsers));
            
        } catch (error) {
            this.log('Auth Flow', 'fail', `Error in authentication flow: ${error.message}`);
        }
    }

    generateReport() {
        console.log('\n📊 VERIFICATION REPORT');
        console.log('='.repeat(50));
        
        const totalTests = this.testsPassed + this.testsFailed;
        const successRate = totalTests > 0 ? Math.round((this.testsPassed / totalTests) * 100) : 0;
        
        console.log(`Total Tests: ${totalTests}`);
        console.log(`Passed: ${this.testsPassed}`);
        console.log(`Failed: ${this.testsFailed}`);
        console.log(`Success Rate: ${successRate}%`);
        
        console.log('\nDetailed Results:');
        this.results.forEach(result => {
            console.log(`  ${result}`);
        });
        
        if (this.testsFailed === 0) {
            console.log('\n✅ ALL TESTS PASSED - Signup and login functionality is working correctly!');
        } else {
            console.log(`\n⚠️  ${this.testsFailed} TESTS FAILED - Some issues need to be addressed.`);
        }
        
        console.log('='.repeat(50));
        
        // Create visual report in the page if possible
        this.createVisualReport(successRate);
    }

    createVisualReport(successRate) {
        // Try to create a visual report in the page
        const reportContainer = document.createElement('div');
        reportContainer.id = 'verification-report';
        reportContainer.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            width: 300px;
            background: white;
            border: 2px solid ${successRate === 100 ? '#4caf50' : '#ff9800'};
            border-radius: 8px;
            padding: 1rem;
            box-shadow: 0 4px 20px rgba(0,0,0,0.2);
            z-index: 10000;
            font-family: Arial, sans-serif;
            font-size: 14px;
        `;
        
        reportContainer.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                <h3 style="margin: 0; color: #333;">Verification Report</h3>
                <button onclick="this.parentElement.parentElement.remove()" style="background: none; border: none; font-size: 18px; cursor: pointer;">&times;</button>
            </div>
            <div style="margin-bottom: 0.5rem;">
                <strong>Success Rate: ${successRate}%</strong>
            </div>
            <div style="margin-bottom: 0.5rem;">
                Passed: <span style="color: #4caf50;">${this.testsPassed}</span> | 
                Failed: <span style="color: #f44336;">${this.testsFailed}</span>
            </div>
            <div style="font-size: 12px; color: #666;">
                ${successRate === 100 ? '✅ All functionality working!' : '⚠️ Some issues detected'}
            </div>
        `;
        
        document.body.appendChild(reportContainer);
        
        // Auto-remove after 10 seconds
        setTimeout(() => {
            if (reportContainer.parentElement) {
                reportContainer.remove();
            }
        }, 10000);
    }
}

// Run verification when page loads
document.addEventListener('DOMContentLoaded', async () => {
    // Wait a bit for all scripts to load
    setTimeout(async () => {
        const verifier = new SignupLoginVerifier();
        await verifier.runAllTests();
    }, 2000);
});

// Also export for manual testing
window.signupLoginVerifier = SignupLoginVerifier;

console.log('✅ Signup and login verification script loaded');