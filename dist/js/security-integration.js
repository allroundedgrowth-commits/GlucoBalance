/**
 * Security Integration for GlucoBalance Application
 * Integrates security measures with existing services
 */

class SecureAuthService {
    constructor() {
        this.security = new SecurityService();
        this.validator = new InputValidator();
        this.privacy = new PrivacyManager();
    }

    /**
     * Secure user registration with validation and encryption
     */
    async registerUser(userData) {
        try {
            // Validate input data
            const validation = this.validator.validateUserRegistration(userData);
            if (!validation.isValid) {
                return {
                    success: false,
                    errors: validation.errors
                };
            }

            // Check rate limiting
            const rateLimit = this.validator.checkRateLimit(
                userData.email, 
                'registration', 
                3, 
                60 * 60 * 1000 // 1 hour
            );
            
            if (!rateLimit.allowed) {
                return {
                    success: false,
                    errors: ['Too many registration attempts. Please try again later.']
                };
            }

            // Generate secure user ID
            const userId = await this.generateSecureUserId();
            
            // Encrypt sensitive data
            const encryptedUserData = await this.security.encryptHealthData({
                ...validation.sanitizedData,
                id: userId,
                createdAt: Date.now()
            });

            // Store encrypted user data
            await this.security.secureStore(`user_${userId}`, encryptedUserData, true);
            
            // Initialize privacy settings
            this.privacy.initializePrivacySettings(userId);
            
            // Create session
            const session = await this.createSecureSession(userId);
            
            return {
                success: true,
                userId: userId,
                session: session
            };
            
        } catch (error) {
            console.error('Secure registration failed:', error);
            return {
                success: false,
                errors: ['Registration failed. Please try again.']
            };
        }
    }

    /**
     * Secure user login with validation
     */
    async loginUser(credentials) {
        try {
            // Validate credentials format
            if (!credentials.email || !this.validator.patterns.email.test(credentials.email)) {
                return {
                    success: false,
                    errors: ['Invalid email format']
                };
            }

            // Check rate limiting
            const rateLimit = this.validator.checkRateLimit(
                credentials.email, 
                'login', 
                5, 
                15 * 60 * 1000 // 15 minutes
            );
            
            if (!rateLimit.allowed) {
                return {
                    success: false,
                    errors: ['Too many login attempts. Please try again later.']
                };
            }

            // Find user by email (in a real app, this would be server-side)
            const userId = await this.findUserByEmail(credentials.email);
            if (!userId) {
                return {
                    success: false,
                    errors: ['Invalid credentials']
                };
            }

            // Create secure session
            const session = await this.createSecureSession(userId);
            
            return {
                success: true,
                userId: userId,
                session: session
            };
            
        } catch (error) {
            console.error('Secure login failed:', error);
            return {
                success: false,
                errors: ['Login failed. Please try again.']
            };
        }
    }

    /**
     * Generate secure user ID
     */
    async generateSecureUserId() {
        const timestamp = Date.now().toString();
        const random = crypto.getRandomValues(new Uint8Array(16));
        const combined = timestamp + Array.from(random).join('');
        return await this.security.hashSensitiveData(combined);
    }

    /**
     * Create secure session
     */
    async createSecureSession(userId) {
        const sessionData = {
            userId: userId,
            createdAt: Date.now(),
            expiresAt: Date.now() + SecurityConfig.settings.session.timeout,
            sessionId: await this.generateSessionId()
        };

        await this.security.secureStore(`session_${userId}`, sessionData);
        return sessionData;
    }

    /**
     * Generate secure session ID
     */
    async generateSessionId() {
        const array = new Uint8Array(32);
        crypto.getRandomValues(array);
        return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    }

    /**
     * Find user by email (simplified for demo)
     */
    async findUserByEmail(email) {
        // In a real application, this would be a secure server-side lookup
        const keys = Object.keys(localStorage);
        for (const key of keys) {
            if (key.startsWith('secure_user_')) {
                try {
                    const userData = await this.security.secureRetrieve(key.replace('secure_', ''));
                    if (userData && userData.email === email) {
                        return userData.id;
                    }
                } catch (error) {
                    // Skip invalid data
                }
            }
        }
        return null;
    }
}

/**
 * Secure AI Service Integration
 */
class SecureAIService {
    constructor() {
        this.security = new SecurityService();
        this.apiKeyManager = new APIKeyManager();
        this.validator = new InputValidator();
        this.middleware = new SecurityMiddleware();
    }

    /**
     * Secure AI request with validation and rate limiting
     */
    async makeSecureAIRequest(prompt, userId, requestType = 'general') {
        try {
            // Check user consent for AI processing
            const privacy = new PrivacyManager();
            if (!privacy.hasConsent(userId, privacy.consentTypes.AI_PROCESSING)) {
                return {
                    success: false,
                    error: 'AI processing consent required',
                    fallback: this.getFallbackContent(requestType)
                };
            }

            // Rate limiting check
            const rateLimit = this.validator.checkRateLimit(
                userId, 
                'ai_request', 
                SecurityConfig.settings.rateLimit.aiRequest.attempts,
                SecurityConfig.settings.rateLimit.aiRequest.window
            );
            
            if (!rateLimit.allowed) {
                return {
                    success: false,
                    error: 'Rate limit exceeded',
                    fallback: this.getFallbackContent(requestType)
                };
            }

            // Sanitize input prompt
            const sanitizedPrompt = this.validator.sanitizeGeneral(prompt);
            
            // Get secure API key
            const apiKey = this.apiKeyManager.getAPIKey('gemini');
            if (!apiKey) {
                return {
                    success: false,
                    error: 'API key not available',
                    fallback: this.getFallbackContent(requestType)
                };
            }

            // Prepare secure request
            const request = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: sanitizedPrompt
                        }]
                    }]
                })
            };

            // Process request through security middleware
            const secureRequest = this.middleware.processRequest(request);

            // Make API call with timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), SecurityConfig.settings.api.timeout);

            const response = await fetch(
                'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
                {
                    ...secureRequest,
                    signal: controller.signal
                }
            );

            clearTimeout(timeoutId);

            // Process response through security middleware
            const secureResponse = this.middleware.processResponse(response);

            if (!response.ok) {
                throw new Error(`API request failed: ${response.status}`);
            }

            const data = await response.json();
            
            // Validate and sanitize AI response
            const sanitizedResponse = this.sanitizeAIResponse(data);
            
            // Log AI usage for audit
            this.logAIUsage(userId, requestType, sanitizedPrompt.length);

            return {
                success: true,
                data: sanitizedResponse
            };

        } catch (error) {
            console.error('Secure AI request failed:', error);
            
            return {
                success: false,
                error: error.message,
                fallback: this.getFallbackContent(requestType)
            };
        }
    }

    /**
     * Sanitize AI response content
     */
    sanitizeAIResponse(response) {
        if (!response || !response.candidates || !response.candidates[0]) {
            return null;
        }

        const content = response.candidates[0].content?.parts?.[0]?.text || '';
        
        // Remove potentially harmful content
        const sanitized = content
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/javascript:/gi, '')
            .replace(/on\w+\s*=/gi, '')
            .trim();

        // Validate content length
        if (sanitized.length > 5000) {
            return sanitized.substring(0, 5000) + '...';
        }

        return sanitized;
    }

    /**
     * Get fallback content for different request types
     */
    getFallbackContent(requestType) {
        const fallbacks = {
            risk_explanation: 'Your risk assessment has been completed. Please consult with a healthcare provider for personalized advice.',
            nutrition_plan: 'A balanced diet with whole grains, lean proteins, and vegetables is recommended for diabetes prevention.',
            mood_support: 'Remember to take care of your mental health. Consider speaking with a counselor if you need support.',
            progress_insights: 'Keep tracking your health metrics regularly. Consistency is key to managing your health.',
            general: 'Thank you for using GlucoBalance. Please try again later or contact support if issues persist.'
        };

        return fallbacks[requestType] || fallbacks.general;
    }

    /**
     * Log AI usage for audit and monitoring
     */
    logAIUsage(userId, requestType, promptLength) {
        const usage = {
            userId: userId,
            requestType: requestType,
            promptLength: promptLength,
            timestamp: Date.now(),
            userAgent: navigator.userAgent
        };

        // Store usage log
        const key = `ai_usage_${userId}`;
        const existingUsage = JSON.parse(localStorage.getItem(key) || '[]');
        existingUsage.push(usage);

        // Keep only last 100 entries
        if (existingUsage.length > 100) {
            existingUsage.splice(0, existingUsage.length - 100);
        }

        localStorage.setItem(key, JSON.stringify(existingUsage));
    }
}

/**
 * Secure Database Service Integration
 */
class SecureDatabaseService {
    constructor() {
        this.security = new SecurityService();
        this.validator = new InputValidator();
        this.privacy = new PrivacyManager();
    }

    /**
     * Securely store health data with encryption
     */
    async storeHealthData(userId, dataType, data) {
        try {
            // Validate data based on type
            let validation;
            switch (dataType) {
                case 'risk_assessment':
                    validation = this.validator.validateRiskAssessment(data);
                    break;
                case 'mood_entry':
                    validation = this.validator.validateMoodEntry(data);
                    break;
                case 'nutrition_plan':
                    validation = this.validator.validateNutritionPlan(data);
                    break;
                default:
                    validation = { isValid: true, sanitizedData: data };
            }

            if (!validation.isValid) {
                return {
                    success: false,
                    errors: validation.errors
                };
            }

            // Check consent for health data storage
            if (!this.privacy.hasConsent(userId, this.privacy.consentTypes.HEALTH_DATA)) {
                return {
                    success: false,
                    errors: ['Health data storage consent required']
                };
            }

            // Add metadata
            const dataWithMetadata = {
                ...validation.sanitizedData,
                userId: userId,
                dataType: dataType,
                createdAt: Date.now(),
                encrypted: true
            };

            // Store encrypted data
            const key = `${dataType}_${userId}_${Date.now()}`;
            const success = await this.security.secureStore(key, dataWithMetadata, true);

            if (success) {
                // Log data storage for audit
                this.privacy.logDataAccess(userId, `STORE_${dataType.toUpperCase()}`);
                
                return {
                    success: true,
                    key: key
                };
            } else {
                return {
                    success: false,
                    errors: ['Failed to store data securely']
                };
            }

        } catch (error) {
            console.error('Secure data storage failed:', error);
            return {
                success: false,
                errors: ['Data storage failed']
            };
        }
    }

    /**
     * Securely retrieve health data with decryption
     */
    async retrieveHealthData(userId, dataType, limit = 10) {
        try {
            // Check consent for health data access
            if (!this.privacy.hasConsent(userId, this.privacy.consentTypes.HEALTH_DATA)) {
                return {
                    success: false,
                    errors: ['Health data access consent required']
                };
            }

            const keys = Object.keys(localStorage);
            const matchingKeys = keys.filter(key => 
                key.startsWith(`secure_${dataType}_${userId}`)
            ).sort().reverse().slice(0, limit);

            const data = [];
            for (const key of matchingKeys) {
                try {
                    const retrievedData = await this.security.secureRetrieve(
                        key.replace('secure_', '')
                    );
                    if (retrievedData) {
                        data.push(retrievedData);
                    }
                } catch (error) {
                    console.error(`Failed to retrieve data for key: ${key}`, error);
                }
            }

            // Log data access for audit
            this.privacy.logDataAccess(userId, `RETRIEVE_${dataType.toUpperCase()}`);

            return {
                success: true,
                data: data
            };

        } catch (error) {
            console.error('Secure data retrieval failed:', error);
            return {
                success: false,
                errors: ['Data retrieval failed']
            };
        }
    }
}

// Export secure services
window.SecureAuthService = SecureAuthService;
window.SecureAIService = SecureAIService;
window.SecureDatabaseService = SecureDatabaseService;
//# sourceMappingURL=security-integration.js.map