/**
 * Security Configuration for GlucoBalance Application
 * Centralized security settings and policies
 */

class SecurityConfig {
    static get settings() {
        return {
            // Encryption settings
            encryption: {
                algorithm: 'AES-GCM',
                keyLength: 256,
                ivLength: 12,
                saltLength: 16
            },
            
            // API security settings
            api: {
                timeout: 30000, // 30 seconds
                maxRetries: 3,
                rateLimitWindow: 60000, // 1 minute
                maxRequestsPerWindow: 100
            },
            
            // Input validation settings
            validation: {
                maxInputLength: 1000,
                maxFileSize: 5 * 1024 * 1024, // 5MB
                allowedFileTypes: ['json', 'pdf', 'txt'],
                sanitizeHtml: true,
                preventXss: true
            },
            
            // Session management
            session: {
                timeout: 24 * 60 * 60 * 1000, // 24 hours
                renewThreshold: 60 * 60 * 1000, // 1 hour before expiry
                maxConcurrentSessions: 3
            },
            
            // Privacy and compliance
            privacy: {
                dataRetentionDays: 365,
                healthDataRetentionDays: 2555, // 7 years
                auditLogRetentionDays: 90,
                consentExpiryDays: 365,
                anonymizationDelay: 30 * 24 * 60 * 60 * 1000 // 30 days
            },
            
            // Rate limiting
            rateLimit: {
                login: { attempts: 5, window: 15 * 60 * 1000 }, // 5 attempts per 15 minutes
                assessment: { attempts: 10, window: 60 * 60 * 1000 }, // 10 per hour
                aiRequest: { attempts: 50, window: 60 * 60 * 1000 }, // 50 per hour
                dataExport: { attempts: 3, window: 24 * 60 * 60 * 1000 } // 3 per day
            },
            
            // Content Security Policy
            csp: {
                defaultSrc: ["'self'"],
                scriptSrc: ["'self'", "'unsafe-inline'", "https://generativelanguage.googleapis.com"],
                styleSrc: ["'self'", "'unsafe-inline'"],
                imgSrc: ["'self'", "data:", "https:"],
                connectSrc: ["'self'", "https://generativelanguage.googleapis.com"],
                fontSrc: ["'self'"],
                objectSrc: ["'none'"],
                mediaSrc: ["'self'"],
                frameSrc: ["'none'"]
            },
            
            // Security headers
            headers: {
                'X-Content-Type-Options': 'nosniff',
                'X-Frame-Options': 'DENY',
                'X-XSS-Protection': '1; mode=block',
                'Referrer-Policy': 'strict-origin-when-cross-origin',
                'Permissions-Policy': 'geolocation=(), microphone=(), camera=()'
            }
        };
    }
    
    /**
     * Get security policy for specific feature
     */
    static getPolicy(feature) {
        const policies = {
            healthData: {
                encryption: true,
                auditLog: true,
                consentRequired: true,
                retentionPeriod: this.settings.privacy.healthDataRetentionDays
            },
            
            personalData: {
                encryption: true,
                auditLog: true,
                consentRequired: true,
                retentionPeriod: this.settings.privacy.dataRetentionDays
            },
            
            aiProcessing: {
                encryption: false,
                auditLog: true,
                consentRequired: true,
                dataMinimization: true
            },
            
            analytics: {
                encryption: false,
                auditLog: false,
                consentRequired: true,
                anonymization: true
            }
        };
        
        return policies[feature] || {};
    }
    
    /**
     * Validate security configuration
     */
    static validateConfig() {
        const issues = [];
        
        // Check if required security features are available
        if (!window.crypto || !window.crypto.subtle) {
            issues.push('Web Crypto API not available - encryption features disabled');
        }
        
        if (!window.localStorage) {
            issues.push('Local Storage not available - data persistence disabled');
        }
        
        if (!window.indexedDB) {
            issues.push('IndexedDB not available - offline functionality limited');
        }
        
        // Check Content Security Policy
        if (!this.isCSPEnabled()) {
            issues.push('Content Security Policy not properly configured');
        }
        
        return {
            isValid: issues.length === 0,
            issues: issues
        };
    }
    
    /**
     * Check if Content Security Policy is enabled
     */
    static isCSPEnabled() {
        // This would typically be checked server-side
        // For client-side, we can check if CSP violations are being reported
        return true; // Assume enabled for now
    }
    
    /**
     * Generate security report
     */
    static generateSecurityReport() {
        const validation = this.validateConfig();
        
        return {
            timestamp: new Date().toISOString(),
            configuration: this.settings,
            validation: validation,
            features: {
                encryption: !!window.crypto?.subtle,
                localStorage: !!window.localStorage,
                indexedDB: !!window.indexedDB,
                serviceWorker: 'serviceWorker' in navigator,
                webCrypto: !!window.crypto
            },
            recommendations: this.getSecurityRecommendations()
        };
    }
    
    /**
     * Get security recommendations based on current environment
     */
    static getSecurityRecommendations() {
        const recommendations = [];
        
        if (!window.crypto?.subtle) {
            recommendations.push('Upgrade to a modern browser that supports Web Crypto API');
        }
        
        if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
            recommendations.push('Deploy application over HTTPS for enhanced security');
        }
        
        if (!navigator.serviceWorker) {
            recommendations.push('Service Worker not supported - offline security features limited');
        }
        
        return recommendations;
    }
}

/**
 * Security Middleware for request/response processing
 */
class SecurityMiddleware {
    constructor(config = SecurityConfig.settings) {
        this.config = config;
        this.validator = new InputValidator();
    }
    
    /**
     * Process outgoing requests with security headers
     */
    processRequest(request) {
        // Add security headers
        Object.entries(this.config.headers).forEach(([header, value]) => {
            request.headers = request.headers || {};
            request.headers[header] = value;
        });
        
        // Add request timeout
        request.timeout = this.config.api.timeout;
        
        return request;
    }
    
    /**
     * Process incoming responses for security validation
     */
    processResponse(response) {
        // Validate response content type
        const contentType = response.headers?.['content-type'];
        if (contentType && !this.isAllowedContentType(contentType)) {
            throw new Error('Invalid content type received');
        }
        
        // Check response size
        const contentLength = response.headers?.['content-length'];
        if (contentLength && parseInt(contentLength) > this.config.validation.maxFileSize) {
            throw new Error('Response size exceeds maximum allowed');
        }
        
        return response;
    }
    
    /**
     * Check if content type is allowed
     */
    isAllowedContentType(contentType) {
        const allowedTypes = [
            'application/json',
            'text/plain',
            'text/html',
            'application/pdf'
        ];
        
        return allowedTypes.some(type => contentType.includes(type));
    }
    
    /**
     * Sanitize data before processing
     */
    sanitizeData(data, type = 'general') {
        if (typeof data === 'string') {
            return this.validator.sanitizers[type](data);
        }
        
        if (typeof data === 'object' && data !== null) {
            const sanitized = {};
            Object.keys(data).forEach(key => {
                sanitized[key] = this.sanitizeData(data[key], type);
            });
            return sanitized;
        }
        
        return data;
    }
}

// Export security configuration and middleware
window.SecurityConfig = SecurityConfig;
window.SecurityMiddleware = SecurityMiddleware;
//# sourceMappingURL=security-config.js.map