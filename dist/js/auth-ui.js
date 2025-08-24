// GlucoBalance - Authentication UI Components
class AuthUI {
    constructor() {
        this.currentForm = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Listen for authentication state changes
        document.addEventListener('authStateChanged', (event) => {
            this.handleAuthStateChange(event.detail);
        });
    }

    // Show registration form
    showRegistrationForm() {
        const formHTML = `
        <div id="auth-modal" class="modal-overlay">
            <div class="modal-content auth-modal">
                <div class="modal-header">
                    <h2>Create Your Account</h2>
                    <button class="close-btn" onclick="authUI.closeAuthModal()">&times;</button>
                </div>
                
                <form id="registration-form" class="auth-form">
                    <div class="form-group">
                        <label for="reg-name">Full Name *</label>
                        <input type="text" id="reg-name" name="name" required 
                               placeholder="Enter your full name" autocomplete="name">
                        <div class="field-error" id="name-error"></div>
                    </div>
                    
                    <div class="form-group">
                        <label for="reg-email">Email Address *</label>
                        <input type="email" id="reg-email" name="email" required 
                               placeholder="Enter your email" autocomplete="email">
                        <div class="field-error" id="email-error"></div>
                    </div>
                    
                    <div class="form-group">
                        <label for="reg-age">Age *</label>
                        <input type="number" id="reg-age" name="age" required 
                               min="13" max="120" placeholder="Enter your age">
                        <div class="field-error" id="age-error"></div>
                    </div>
                    
                    <div class="form-group">
                        <label for="reg-gender">Gender *</label>
                        <select id="reg-gender" name="gender" required>
                            <option value="">Select gender</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                        </select>
                        <div class="field-error" id="gender-error"></div>
                    </div>
                    
                    <div class="form-group checkbox-group">
                        <label class="checkbox-label">
                            <input type="checkbox" id="terms-checkbox" required>
                            <span class="checkmark"></span>
                            I agree to the <a href="#" onclick="authUI.showTerms()">Terms of Service</a> 
                            and <a href="#" onclick="authUI.showPrivacy()">Privacy Policy</a>
                        </label>
                        <div class="field-error" id="terms-error"></div>
                    </div>
                    
                    <button type="submit" class="btn-primary auth-submit-btn">
                        <span class="btn-text">Create Account</span>
                        <div class="btn-spinner" style="display: none;"></div>
                    </button>
                    
                    <div class="auth-switch">
                        Already have an account? 
                        <a href="#" onclick="authUI.showLoginForm()">Sign In</a>
                    </div>
                </form>
            </div>
        </div>`;
        
        document.body.insertAdjacentHTML('beforeend', formHTML);
        this.currentForm = 'registration';
        this.setupFormValidation('registration-form');
        this.setupFormSubmission('registration-form', this.handleRegistration.bind(this));
        
        // Focus first input
        setTimeout(() => {
            document.getElementById('reg-name').focus();
        }, 100);
    }

    // Show login form
    showLoginForm() {
        const formHTML = `
        <div id="auth-modal" class="modal-overlay">
            <div class="modal-content auth-modal">
                <div class="modal-header">
                    <h2>Welcome Back</h2>
                    <button class="close-btn" onclick="authUI.closeAuthModal()">&times;</button>
                </div>
                
                <form id="login-form" class="auth-form">
                    <div class="form-group">
                        <label for="login-email">Email Address *</label>
                        <input type="email" id="login-email" name="email" required 
                               placeholder="Enter your email" autocomplete="email">
                        <div class="field-error" id="login-email-error"></div>
                    </div>
                    
                    <button type="submit" class="btn-primary auth-submit-btn">
                        <span class="btn-text">Sign In</span>
                        <div class="btn-spinner" style="display: none;"></div>
                    </button>
                    
                    <div class="auth-switch">
                        Don't have an account? 
                        <a href="#" onclick="authUI.showRegistrationForm()">Create Account</a>
                    </div>
                    
                    <div class="auth-note">
                        <small>Note: This is a demo app. Simply enter any email to sign in or create a new account.</small>
                    </div>
                </form>
            </div>
        </div>`;
        
        document.body.insertAdjacentHTML('beforeend', formHTML);
        this.currentForm = 'login';
        this.setupFormValidation('login-form');
        this.setupFormSubmission('login-form', this.handleLogin.bind(this));
        
        // Focus email input
        setTimeout(() => {
            document.getElementById('login-email').focus();
        }, 100);
    }

    // Close authentication modal
    closeAuthModal() {
        const modal = document.getElementById('auth-modal');
        if (modal) {
            modal.remove();
        }
        this.currentForm = null;
    }

    // Setup form validation
    setupFormValidation(formId) {
        const form = document.getElementById(formId);
        if (!form) return;

        const inputs = form.querySelectorAll('input, select');
        inputs.forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('input', () => this.clearFieldError(input));
        });
    }

    // Setup form submission
    setupFormSubmission(formId, handler) {
        const form = document.getElementById(formId);
        if (!form) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Validate all fields
            const isValid = this.validateForm(form);
            if (!isValid) return;
            
            // Show loading state
            this.setFormLoading(form, true);
            
            try {
                await handler(new FormData(form));
            } finally {
                this.setFormLoading(form, false);
            }
        });
    }

    // Handle registration
    async handleRegistration(formData) {
        try {
            const userData = {
                name: formData.get('name').trim(),
                email: formData.get('email').trim(),
                age: parseInt(formData.get('age')),
                gender: formData.get('gender')
            };

            const result = await window.authService.register(userData);
            
            if (result.success) {
                this.showSuccessMessage('Account created successfully! Welcome to GlucoBalance.');
                this.closeAuthModal();
                
                // Dispatch auth state change event
                document.dispatchEvent(new CustomEvent('authStateChanged', {
                    detail: { isAuthenticated: true, user: result.user }
                }));
                
                // Navigate to dashboard
                if (window.glucoApp) {
                    window.glucoApp.showDashboard();
                }
            } else {
                this.showFormError(result.error);
            }
        } catch (error) {
            console.error('Registration error:', error);
            this.showFormError('Registration failed. Please try again.');
        }
    }

    // Handle login
    async handleLogin(formData) {
        try {
            const credentials = {
                email: formData.get('email').trim()
            };

            const result = await window.authService.login(credentials);
            
            if (result.success) {
                this.showSuccessMessage('Welcome back!');
                this.closeAuthModal();
                
                // Dispatch auth state change event
                document.dispatchEvent(new CustomEvent('authStateChanged', {
                    detail: { isAuthenticated: true, user: result.user }
                }));
                
                // Navigate to dashboard
                if (window.glucoApp) {
                    window.glucoApp.showDashboard();
                }
            } else {
                this.showFormError(result.error);
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showFormError('Login failed. Please try again.');
        }
    }

    // Enhanced field validation with real-time feedback
    validateField(field) {
        const value = field.value.trim();
        let isValid = true;
        let errorMessage = '';

        switch (field.name) {
            case 'name':
                if (!value) {
                    errorMessage = 'Name is required';
                    isValid = false;
                } else if (value.length < 2) {
                    errorMessage = 'Name must be at least 2 characters long';
                    isValid = false;
                } else if (value.length > 50) {
                    errorMessage = 'Name must be less than 50 characters';
                    isValid = false;
                } else if (!/^[a-zA-Z\s'-]+$/.test(value)) {
                    errorMessage = 'Name can only contain letters, spaces, hyphens, and apostrophes';
                    isValid = false;
                }
                break;
                
            case 'email':
                if (!value) {
                    errorMessage = 'Email address is required';
                    isValid = false;
                } else if (!this.isValidEmail(value)) {
                    errorMessage = 'Please enter a valid email address';
                    isValid = false;
                } else if (value.length > 254) {
                    errorMessage = 'Email address is too long';
                    isValid = false;
                }
                break;
                
            case 'age':
                if (!value) {
                    errorMessage = 'Age is required';
                    isValid = false;
                } else {
                    const age = parseInt(value);
                    if (isNaN(age)) {
                        errorMessage = 'Please enter a valid age';
                        isValid = false;
                    } else if (age < 13) {
                        errorMessage = 'You must be at least 13 years old to use this app';
                        isValid = false;
                    } else if (age > 120) {
                        errorMessage = 'Please enter a valid age';
                        isValid = false;
                    }
                }
                break;
                
            case 'gender':
                if (!value) {
                    errorMessage = 'Please select your gender';
                    isValid = false;
                } else if (!['male', 'female', 'other'].includes(value)) {
                    errorMessage = 'Please select a valid gender option';
                    isValid = false;
                }
                break;
        }

        // Handle terms checkbox
        if (field.id === 'terms-checkbox' && !field.checked) {
            errorMessage = 'You must agree to the terms and conditions to continue';
            isValid = false;
        }

        this.setFieldError(field, isValid ? '' : errorMessage);
        return isValid;
    }

    // Validate entire form
    validateForm(form) {
        const fields = form.querySelectorAll('input[required], select[required]');
        let isValid = true;

        fields.forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
            }
        });

        return isValid;
    }

    // Set field error
    setFieldError(field, message) {
        const errorElement = document.getElementById(`${field.name}-error`) || 
                           document.getElementById(`${field.id}-error`);
        
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = message ? 'block' : 'none';
        }

        // Update field styling
        if (message) {
            field.classList.add('error');
        } else {
            field.classList.remove('error');
        }
    }

    // Clear field error
    clearFieldError(field) {
        this.setFieldError(field, '');
    }

    // Set form loading state
    setFormLoading(form, isLoading) {
        const submitBtn = form.querySelector('.auth-submit-btn');
        const btnText = submitBtn.querySelector('.btn-text');
        const spinner = submitBtn.querySelector('.btn-spinner');
        
        if (isLoading) {
            submitBtn.disabled = true;
            btnText.style.display = 'none';
            spinner.style.display = 'inline-block';
        } else {
            submitBtn.disabled = false;
            btnText.style.display = 'inline';
            spinner.style.display = 'none';
        }
    }

    // Show form error
    showFormError(message) {
        const form = document.querySelector('.auth-form');
        if (!form) return;

        // Remove existing error
        const existingError = form.querySelector('.form-error');
        if (existingError) {
            existingError.remove();
        }

        // Add new error
        const errorDiv = document.createElement('div');
        errorDiv.className = 'form-error';
        errorDiv.textContent = message;
        
        const submitBtn = form.querySelector('.auth-submit-btn');
        form.insertBefore(errorDiv, submitBtn);
    }

    // Show success message
    showSuccessMessage(message) {
        if (window.glucoApp && window.glucoApp.showNotification) {
            window.glucoApp.showNotification(message, 'success');
        } else {
            alert(message); // Fallback
        }
    }

    // Enhanced email validation matching auth service
    isValidEmail(email) {
        if (!email || typeof email !== 'string') return false;
        
        // Basic format check
        const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
        
        if (!emailRegex.test(email)) return false;
        
        // Additional checks
        const parts = email.split('@');
        if (parts.length !== 2) return false;
        
        const [localPart, domain] = parts;
        
        // Local part checks
        if (localPart.length === 0 || localPart.length > 64) return false;
        if (localPart.startsWith('.') || localPart.endsWith('.')) return false;
        if (localPart.includes('..')) return false;
        
        // Domain checks
        if (domain.length === 0 || domain.length > 253) return false;
        if (domain.startsWith('.') || domain.endsWith('.')) return false;
        if (domain.includes('..')) return false;
        
        return true;
    }

    // Handle authentication state changes
    handleAuthStateChange(authState) {
        if (authState.isAuthenticated) {
            this.updateUIForAuthenticatedUser(authState.user);
        } else {
            this.updateUIForUnauthenticatedUser();
        }
    }

    // Update UI for authenticated user
    updateUIForAuthenticatedUser(user) {
        // Update login button to show user name
        const loginBtn = document.getElementById('login-btn');
        if (loginBtn) {
            loginBtn.textContent = `Welcome, ${user.name}`;
            loginBtn.onclick = () => {
                if (window.glucoApp) {
                    window.glucoApp.showDashboard();
                }
            };
        }

        // Update profile button
        const profileBtn = document.getElementById('profile-btn');
        if (profileBtn) {
            profileBtn.style.display = 'block';
        }

        // Hide landing page, show dashboard
        const landingPage = document.getElementById('landing-page');
        const bottomNav = document.getElementById('bottom-nav');
        
        if (landingPage && landingPage.classList.contains('active')) {
            setTimeout(() => {
                if (window.glucoApp) {
                    window.glucoApp.showDashboard();
                }
            }, 1000);
        }
    }

    // Update UI for unauthenticated user
    updateUIForUnauthenticatedUser() {
        // Reset login button
        const loginBtn = document.getElementById('login-btn');
        if (loginBtn) {
            loginBtn.textContent = 'Login to Dashboard';
            loginBtn.onclick = () => this.showLoginForm();
        }

        // Hide profile button
        const profileBtn = document.getElementById('profile-btn');
        if (profileBtn) {
            profileBtn.style.display = 'none';
        }

        // Show landing page
        const landingPage = document.getElementById('landing-page');
        const bottomNav = document.getElementById('bottom-nav');
        
        if (landingPage) {
            document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
            landingPage.classList.add('active');
        }
        
        if (bottomNav) {
            bottomNav.style.display = 'none';
        }
    }

    // Show terms of service
    showTerms() {
        alert('Terms of Service: This is a demo application for educational purposes. Please consult healthcare professionals for medical advice.');
    }

    // Show privacy policy
    showPrivacy() {
        alert('Privacy Policy: Your data is stored locally in your browser. This demo does not transmit personal data to external servers.');
    }

    // Logout user
    async logout() {
        try {
            const result = await window.authService.logout();
            if (result.success) {
                this.showSuccessMessage('Logged out successfully');
                
                // Dispatch auth state change event
                document.dispatchEvent(new CustomEvent('authStateChanged', {
                    detail: { isAuthenticated: false, user: null }
                }));
            }
        } catch (error) {
            console.error('Logout error:', error);
        }
    }
}

// Initialize authentication UI
window.authUI = new AuthUI();
//# sourceMappingURL=auth-ui.js.map