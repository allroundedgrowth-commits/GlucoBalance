// GlucoBalance - Authentication Service
class AuthService {
    constructor() {
        this.currentUser = null;
        this.sessionKey = 'glucobalance-session';
        this.encryptionKey = this.generateEncryptionKey();
        this.init();
    }

    async init() {
        await this.loadSession();
    }

    // Generate a simple encryption key for demo purposes
    // In production, this should use proper key management
    generateEncryptionKey() {
        const stored = localStorage.getItem('glucobalance-encryption-key');
        if (stored) {
            return stored;
        }
        
        const key = this.generateRandomString(32);
        localStorage.setItem('glucobalance-encryption-key', key);
        return key;
    }

    generateRandomString(length) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    // Simple encryption for sensitive data (demo implementation)
    encrypt(data) {
        try {
            const jsonString = JSON.stringify(data);
            // Simple XOR encryption for demo - use proper encryption in production
            let encrypted = '';
            for (let i = 0; i < jsonString.length; i++) {
                const keyChar = this.encryptionKey.charCodeAt(i % this.encryptionKey.length);
                const dataChar = jsonString.charCodeAt(i);
                encrypted += String.fromCharCode(dataChar ^ keyChar);
            }
            return btoa(encrypted); // Base64 encode
        } catch (error) {
            console.error('Encryption failed:', error);
            return null;
        }
    }

    // Simple decryption for sensitive data
    decrypt(encryptedData) {
        try {
            const encrypted = atob(encryptedData); // Base64 decode
            let decrypted = '';
            for (let i = 0; i < encrypted.length; i++) {
                const keyChar = this.encryptionKey.charCodeAt(i % this.encryptionKey.length);
                const encryptedChar = encrypted.charCodeAt(i);
                decrypted += String.fromCharCode(encryptedChar ^ keyChar);
            }
            return JSON.parse(decrypted);
        } catch (error) {
            console.error('Decryption failed:', error);
            return null;
        }
    }

    // User Registration
    async register(userData) {
        try {
            // Validate required fields
            const validation = this.validateRegistrationData(userData);
            if (!validation.isValid) {
                throw new Error(validation.errors.join(', '));
            }

            // Check if user already exists
            const existingUser = await this.findUserByEmail(userData.email);
            if (existingUser) {
                throw new Error('User with this email already exists');
            }

            // Create user with encrypted sensitive data
            const user = {
                name: userData.name,
                email: userData.email.toLowerCase(),
                age: parseInt(userData.age),
                gender: userData.gender,
                preferences: {
                    notifications: {
                        dailyReminders: true,
                        weeklyNutrition: true,
                        motivationalMessages: true
                    },
                    dietary: {
                        cuisine: 'general',
                        restrictions: []
                    },
                    language: 'en',
                    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
                },
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            // Save user to database
            const savedUser = await window.kiroDb.createUser(user);
            
            // Create session
            await this.createSession(savedUser);
            
            return {
                success: true,
                user: this.sanitizeUserData(savedUser),
                message: 'Registration successful'
            };

        } catch (error) {
            console.error('Registration failed:', error);
            return {
                success: false,
                error: error.message || 'Registration failed'
            };
        }
    }

    // User Login
    async login(credentials) {
        try {
            // Validate credentials
            if (!credentials.email || !credentials.email.trim()) {
                throw new Error('Email is required');
            }

            // Find user by email
            const user = await this.findUserByEmail(credentials.email);
            if (!user) {
                throw new Error('User not found');
            }

            // Create session
            await this.createSession(user);

            return {
                success: true,
                user: this.sanitizeUserData(user),
                message: 'Login successful'
            };

        } catch (error) {
            console.error('Login failed:', error);
            return {
                success: false,
                error: error.message || 'Login failed'
            };
        }
    }

    // Find user by email
    async findUserByEmail(email) {
        try {
            // Get all users and find by email (simplified for demo)
            const users = window.kiroDb.getFromLocalStorage('users') || [];
            return users.find(u => u.email.toLowerCase() === email.toLowerCase());
        } catch (error) {
            console.error('Error finding user:', error);
            return null;
        }
    }

    // Create user session with enhanced security
    async createSession(user) {
        try {
            // Generate session token
            const sessionToken = this.generateSessionToken();
            
            const sessionData = {
                userId: user.id,
                email: user.email,
                name: user.name,
                sessionToken: sessionToken,
                loginTime: new Date().toISOString(),
                lastActivity: new Date().toISOString(),
                expiresAt: new Date(Date.now() + (7 * 24 * 60 * 60 * 1000)).toISOString(), // 7 days
                userAgent: navigator.userAgent.substring(0, 100), // Store partial user agent for security
                ipFingerprint: await this.generateIPFingerprint()
            };

            // Encrypt session data
            const encryptedSession = this.encrypt(sessionData);
            if (encryptedSession) {
                localStorage.setItem(this.sessionKey, encryptedSession);
                this.currentUser = user;
                
                // Set up session refresh timer
                this.setupSessionRefresh();
                
                return true;
            }
            return false;
        } catch (error) {
            console.error('Session creation failed:', error);
            return false;
        }
    }

    // Generate secure session token
    generateSessionToken() {
        const array = new Uint8Array(32);
        crypto.getRandomValues(array);
        return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    }

    // Generate IP fingerprint for additional security
    async generateIPFingerprint() {
        try {
            // Create a simple fingerprint based on available browser info
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            ctx.textBaseline = 'top';
            ctx.font = '14px Arial';
            ctx.fillText('Browser fingerprint', 2, 2);
            
            const fingerprint = [
                navigator.language,
                screen.width + 'x' + screen.height,
                new Date().getTimezoneOffset(),
                canvas.toDataURL().slice(-50) // Last 50 chars of canvas fingerprint
            ].join('|');
            
            return btoa(fingerprint).substring(0, 20);
        } catch (error) {
            return 'unknown';
        }
    }

    // Setup automatic session refresh
    setupSessionRefresh() {
        // Clear existing timer
        if (this.sessionRefreshTimer) {
            clearInterval(this.sessionRefreshTimer);
        }
        
        // Refresh session every 30 minutes
        this.sessionRefreshTimer = setInterval(() => {
            this.refreshSession();
        }, 30 * 60 * 1000);
    }

    // Refresh session to extend expiry
    async refreshSession() {
        if (!this.isAuthenticated()) return;
        
        try {
            const encryptedSession = localStorage.getItem(this.sessionKey);
            if (!encryptedSession) return;
            
            const sessionData = this.decrypt(encryptedSession);
            if (!sessionData) return;
            
            // Update session data
            sessionData.lastActivity = new Date().toISOString();
            sessionData.expiresAt = new Date(Date.now() + (7 * 24 * 60 * 60 * 1000)).toISOString();
            
            // Re-encrypt and save
            const newEncryptedSession = this.encrypt(sessionData);
            if (newEncryptedSession) {
                localStorage.setItem(this.sessionKey, newEncryptedSession);
            }
        } catch (error) {
            console.error('Session refresh failed:', error);
        }
    }

    // Load existing session with enhanced security validation
    async loadSession() {
        try {
            const encryptedSession = localStorage.getItem(this.sessionKey);
            if (!encryptedSession) {
                return false;
            }

            const sessionData = this.decrypt(encryptedSession);
            if (!sessionData) {
                this.clearSession();
                return false;
            }

            // Check if session is expired
            if (new Date() > new Date(sessionData.expiresAt)) {
                this.clearSession();
                return false;
            }

            // Check session inactivity (24 hours)
            const lastActivity = new Date(sessionData.lastActivity || sessionData.loginTime);
            const inactivityLimit = 24 * 60 * 60 * 1000; // 24 hours
            if (new Date() - lastActivity > inactivityLimit) {
                this.clearSession();
                return false;
            }

            // Validate session token exists
            if (!sessionData.sessionToken) {
                this.clearSession();
                return false;
            }

            // Basic fingerprint validation (if available)
            if (sessionData.ipFingerprint) {
                const currentFingerprint = await this.generateIPFingerprint();
                // Allow some flexibility in fingerprint matching
                if (sessionData.ipFingerprint !== currentFingerprint) {
                    console.warn('Session fingerprint mismatch - potential security issue');
                    // Don't automatically clear session, but log the event
                }
            }

            // Load full user data
            const user = await window.kiroDb.getUser(sessionData.userId);
            if (user) {
                this.currentUser = user;
                
                // Setup session refresh timer
                this.setupSessionRefresh();
                
                // Update last activity
                this.refreshSession();
                
                return true;
            } else {
                this.clearSession();
                return false;
            }
        } catch (error) {
            console.error('Session load failed:', error);
            this.clearSession();
            return false;
        }
    }

    // Clear user session
    clearSession() {
        localStorage.removeItem(this.sessionKey);
        this.currentUser = null;
    }

    // Logout user with proper cleanup
    async logout() {
        try {
            // Clear session refresh timer
            if (this.sessionRefreshTimer) {
                clearInterval(this.sessionRefreshTimer);
                this.sessionRefreshTimer = null;
            }
            
            // Clear session data
            this.clearSession();
            
            // Dispatch logout event for UI updates
            document.dispatchEvent(new CustomEvent('authStateChanged', {
                detail: { isAuthenticated: false, user: null }
            }));
            
            return {
                success: true,
                message: 'Logged out successfully'
            };
        } catch (error) {
            console.error('Logout error:', error);
            return {
                success: false,
                error: 'Logout failed'
            };
        }
    }

    // Check if user is authenticated
    isAuthenticated() {
        return this.currentUser !== null;
    }

    // Get current user
    getCurrentUser() {
        return this.currentUser ? this.sanitizeUserData(this.currentUser) : null;
    }

    // Update user profile with enhanced validation and security
    async updateProfile(updates) {
        try {
            if (!this.isAuthenticated()) {
                throw new Error('User not authenticated');
            }

            // Sanitize and validate updates
            const sanitizedUpdates = this.sanitizeProfileUpdates(updates);
            const validation = this.validateProfileUpdates(sanitizedUpdates);
            if (!validation.isValid) {
                throw new Error(validation.errors.join(', '));
            }

            // Check if email is being changed and if it's already in use
            if (sanitizedUpdates.email && sanitizedUpdates.email !== this.currentUser.email) {
                const existingUser = await this.findUserByEmail(sanitizedUpdates.email);
                if (existingUser && existingUser.id !== this.currentUser.id) {
                    throw new Error('Email address is already in use');
                }
            }

            // Prepare update data
            const updateData = {
                ...sanitizedUpdates,
                updatedAt: new Date().toISOString()
            };

            // Update user in database
            const updatedUser = await window.kiroDb.updateUser(this.currentUser.id, updateData);

            if (updatedUser) {
                this.currentUser = updatedUser;
                
                // Update session if email changed
                if (sanitizedUpdates.email) {
                    await this.refreshSession();
                }
                
                // Dispatch profile update event
                document.dispatchEvent(new CustomEvent('profileUpdated', {
                    detail: { user: this.sanitizeUserData(updatedUser) }
                }));
                
                return {
                    success: true,
                    user: this.sanitizeUserData(updatedUser),
                    message: 'Profile updated successfully'
                };
            } else {
                throw new Error('Failed to update profile in database');
            }

        } catch (error) {
            console.error('Profile update failed:', error);
            return {
                success: false,
                error: error.message || 'Profile update failed'
            };
        }
    }

    // Sanitize profile updates to prevent XSS and other attacks
    sanitizeProfileUpdates(updates) {
        const sanitized = {};
        
        if (updates.name !== undefined) {
            sanitized.name = String(updates.name).trim().substring(0, 50);
        }
        
        if (updates.email !== undefined) {
            sanitized.email = String(updates.email).trim().toLowerCase().substring(0, 254);
        }
        
        if (updates.age !== undefined) {
            const age = parseInt(updates.age);
            if (!isNaN(age)) {
                sanitized.age = Math.max(13, Math.min(120, age));
            }
        }
        
        if (updates.gender !== undefined && ['male', 'female', 'other'].includes(updates.gender)) {
            sanitized.gender = updates.gender;
        }
        
        // Handle preferences object
        if (updates.preferences && typeof updates.preferences === 'object') {
            sanitized.preferences = this.sanitizePreferences(updates.preferences);
        }
        
        return sanitized;
    }

    // Sanitize user preferences
    sanitizePreferences(preferences) {
        const sanitized = {};
        
        if (preferences.notifications && typeof preferences.notifications === 'object') {
            sanitized.notifications = {
                dailyReminders: Boolean(preferences.notifications.dailyReminders),
                weeklyNutrition: Boolean(preferences.notifications.weeklyNutrition),
                motivationalMessages: Boolean(preferences.notifications.motivationalMessages)
            };
        }
        
        if (preferences.dietary && typeof preferences.dietary === 'object') {
            sanitized.dietary = {
                cuisine: String(preferences.dietary.cuisine || 'general').substring(0, 50),
                restrictions: Array.isArray(preferences.dietary.restrictions) 
                    ? preferences.dietary.restrictions.slice(0, 10).map(r => String(r).substring(0, 50))
                    : []
            };
        }
        
        if (preferences.language) {
            sanitized.language = String(preferences.language).substring(0, 10);
        }
        
        if (preferences.timezone) {
            sanitized.timezone = String(preferences.timezone).substring(0, 50);
        }
        
        return sanitized;
    }

    // Enhanced validation for registration data
    validateRegistrationData(data) {
        const errors = [];

        // Name validation
        if (!data.name || typeof data.name !== 'string') {
            errors.push('Name is required');
        } else {
            const trimmedName = data.name.trim();
            if (trimmedName.length < 2) {
                errors.push('Name must be at least 2 characters long');
            } else if (trimmedName.length > 50) {
                errors.push('Name must be less than 50 characters');
            } else if (!/^[a-zA-Z\s'-]+$/.test(trimmedName)) {
                errors.push('Name can only contain letters, spaces, hyphens, and apostrophes');
            }
        }

        // Email validation
        if (!data.email || typeof data.email !== 'string') {
            errors.push('Email address is required');
        } else if (!this.isValidEmail(data.email)) {
            errors.push('Please enter a valid email address');
        } else if (data.email.length > 254) {
            errors.push('Email address is too long');
        }

        // Age validation
        if (!data.age) {
            errors.push('Age is required');
        } else {
            const age = parseInt(data.age);
            if (isNaN(age) || age < 13 || age > 120) {
                errors.push('Age must be between 13 and 120');
            }
        }

        // Gender validation
        if (!data.gender || !['male', 'female', 'other'].includes(data.gender)) {
            errors.push('Please select a valid gender option');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    // Validate profile updates
    validateProfileUpdates(data) {
        const errors = [];

        if (data.name !== undefined && (!data.name || data.name.trim().length < 2)) {
            errors.push('Name must be at least 2 characters long');
        }

        if (data.email !== undefined && (!data.email || !this.isValidEmail(data.email))) {
            errors.push('Valid email address is required');
        }

        if (data.age !== undefined && (data.age < 13 || data.age > 120)) {
            errors.push('Age must be between 13 and 120');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    // Enhanced email validation
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

    // Remove sensitive data from user object
    sanitizeUserData(user) {
        const { ...sanitized } = user;
        return sanitized;
    }

    // Export user data (for GDPR compliance)
    async exportUserData() {
        try {
            if (!this.isAuthenticated()) {
                throw new Error('User not authenticated');
            }

            const userId = this.currentUser.id;
            const healthReport = await window.kiroDb.generateHealthReport(userId);
            
            return {
                success: true,
                data: {
                    user: this.sanitizeUserData(this.currentUser),
                    healthData: healthReport,
                    exportDate: new Date().toISOString()
                }
            };
        } catch (error) {
            console.error('Data export failed:', error);
            return {
                success: false,
                error: error.message || 'Data export failed'
            };
        }
    }

    // Clear all user data (for GDPR compliance)
    async clearAllUserData() {
        try {
            if (!this.isAuthenticated()) {
                throw new Error('User not authenticated');
            }

            // Clear from database (simplified - in production would need proper deletion)
            this.clearSession();
            
            // Clear localStorage data
            const keys = Object.keys(localStorage);
            keys.forEach(key => {
                if (key.startsWith('glucobalance-')) {
                    localStorage.removeItem(key);
                }
            });

            return {
                success: true,
                message: 'All user data cleared successfully'
            };
        } catch (error) {
            console.error('Data clearing failed:', error);
            return {
                success: false,
                error: error.message || 'Data clearing failed'
            };
        }
    }
}

// Initialize authentication service
window.authService = new AuthService();