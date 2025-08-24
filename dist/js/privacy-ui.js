/**
 * Privacy and Consent UI Components for GlucoBalance
 * Handles GDPR compliance and user consent management
 */

class PrivacyUI {
    constructor() {
        this.privacyManager = new PrivacyManager();
        this.currentUserId = null;
    }

    /**
     * Initialize privacy UI for a user
     */
    init(userId) {
        this.currentUserId = userId;
        this.createPrivacyBanner();
        this.setupPrivacyControls();
    }

    /**
     * Create privacy consent banner
     */
    createPrivacyBanner() {
        // Check if user has already given consent
        const settings = this.privacyManager.getPrivacySettings(this.currentUserId);
        if (settings && settings.dataProcessingAgreement) {
            return; // Don't show banner if already consented
        }

        const banner = document.createElement('div');
        banner.id = 'privacy-banner';
        banner.className = 'privacy-banner';
        banner.innerHTML = `
            <div class="privacy-banner-content">
                <div class="privacy-banner-text">
                    <h3>Your Privacy Matters</h3>
                    <p>We use cookies and process your health data to provide personalized diabetes prevention insights. 
                    You can manage your privacy preferences at any time.</p>
                </div>
                <div class="privacy-banner-actions">
                    <button id="privacy-accept-all" class="btn btn-primary">Accept All</button>
                    <button id="privacy-customize" class="btn btn-secondary">Customize</button>
                    <button id="privacy-reject" class="btn btn-outline">Reject Non-Essential</button>
                </div>
            </div>
        `;

        document.body.appendChild(banner);

        // Add event listeners
        document.getElementById('privacy-accept-all').addEventListener('click', () => {
            this.acceptAllConsent();
        });

        document.getElementById('privacy-customize').addEventListener('click', () => {
            this.showConsentModal();
        });

        document.getElementById('privacy-reject').addEventListener('click', () => {
            this.rejectNonEssential();
        });
    }

    /**
     * Accept all consent types
     */
    acceptAllConsent() {
        const consentTypes = this.privacyManager.consentTypes;
        Object.values(consentTypes).forEach(type => {
            this.privacyManager.updateConsent(this.currentUserId, type, true);
        });

        this.updateDataProcessingAgreement(true);
        this.hideBanner();
        this.showConsentConfirmation('All privacy preferences have been accepted.');
    }

    /**
     * Reject non-essential consent
     */
    rejectNonEssential() {
        const consentTypes = this.privacyManager.consentTypes;
        
        // Accept only essential
        this.privacyManager.updateConsent(this.currentUserId, consentTypes.ESSENTIAL, true);
        
        // Reject others
        this.privacyManager.updateConsent(this.currentUserId, consentTypes.ANALYTICS, false);
        this.privacyManager.updateConsent(this.currentUserId, consentTypes.MARKETING, false);
        this.privacyManager.updateConsent(this.currentUserId, consentTypes.HEALTH_DATA, false);
        this.privacyManager.updateConsent(this.currentUserId, consentTypes.AI_PROCESSING, false);

        this.updateDataProcessingAgreement(true);
        this.hideBanner();
        this.showConsentConfirmation('Only essential features will be enabled. You can change this in settings.');
    }

    /**
     * Show detailed consent modal
     */
    showConsentModal() {
        const modal = document.createElement('div');
        modal.id = 'consent-modal';
        modal.className = 'modal-overlay';
        
        const settings = this.privacyManager.getPrivacySettings(this.currentUserId) || 
                        this.privacyManager.initializePrivacySettings(this.currentUserId);

        modal.innerHTML = `
            <div class="modal-content privacy-modal">
                <div class="modal-header">
                    <h2>Privacy Preferences</h2>
                    <button class="modal-close" id="close-consent-modal">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="consent-section">
                        <h3>Essential Cookies & Data Processing</h3>
                        <p>Required for basic app functionality, security, and user authentication.</p>
                        <label class="consent-toggle">
                            <input type="checkbox" id="consent-essential" checked disabled>
                            <span class="toggle-slider"></span>
                            <span class="toggle-label">Always Active</span>
                        </label>
                    </div>

                    <div class="consent-section">
                        <h3>Health Data Processing</h3>
                        <p>Allows us to store and analyze your health assessments, mood tracking, and nutrition data to provide personalized insights.</p>
                        <label class="consent-toggle">
                            <input type="checkbox" id="consent-health" ${settings.consentGiven.health_data ? 'checked' : ''}>
                            <span class="toggle-slider"></span>
                            <span class="toggle-label">Enable Health Data Processing</span>
                        </label>
                    </div>

                    <div class="consent-section">
                        <h3>AI-Powered Insights</h3>
                        <p>Enables AI analysis of your data to provide personalized recommendations, explanations, and support messages.</p>
                        <label class="consent-toggle">
                            <input type="checkbox" id="consent-ai" ${settings.consentGiven.ai_processing ? 'checked' : ''}>
                            <span class="toggle-slider"></span>
                            <span class="toggle-label">Enable AI Processing</span>
                        </label>
                    </div>

                    <div class="consent-section">
                        <h3>Analytics & Performance</h3>
                        <p>Helps us understand how you use the app to improve performance and user experience.</p>
                        <label class="consent-toggle">
                            <input type="checkbox" id="consent-analytics" ${settings.consentGiven.analytics ? 'checked' : ''}>
                            <span class="toggle-slider"></span>
                            <span class="toggle-label">Enable Analytics</span>
                        </label>
                    </div>

                    <div class="consent-section">
                        <h3>Marketing Communications</h3>
                        <p>Allows us to send you health tips, feature updates, and promotional content.</p>
                        <label class="consent-toggle">
                            <input type="checkbox" id="consent-marketing" ${settings.consentGiven.marketing ? 'checked' : ''}>
                            <span class="toggle-slider"></span>
                            <span class="toggle-label">Enable Marketing</span>
                        </label>
                    </div>

                    <div class="privacy-info">
                        <h4>Your Rights</h4>
                        <ul>
                            <li>Right to access your data</li>
                            <li>Right to rectify incorrect data</li>
                            <li>Right to erase your data</li>
                            <li>Right to data portability</li>
                            <li>Right to withdraw consent</li>
                        </ul>
                        <p>For more information, see our <a href="#" id="privacy-policy-link">Privacy Policy</a>.</p>
                    </div>
                </div>
                <div class="modal-footer">
                    <button id="save-consent" class="btn btn-primary">Save Preferences</button>
                    <button id="cancel-consent" class="btn btn-secondary">Cancel</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Add event listeners
        document.getElementById('close-consent-modal').addEventListener('click', () => {
            this.hideConsentModal();
        });

        document.getElementById('cancel-consent').addEventListener('click', () => {
            this.hideConsentModal();
        });

        document.getElementById('save-consent').addEventListener('click', () => {
            this.saveConsentPreferences();
        });

        document.getElementById('privacy-policy-link').addEventListener('click', (e) => {
            e.preventDefault();
            this.showPrivacyPolicy();
        });

        // Close modal when clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.hideConsentModal();
            }
        });
    }

    /**
     * Save consent preferences from modal
     */
    saveConsentPreferences() {
        const consentTypes = this.privacyManager.consentTypes;
        
        // Always enable essential
        this.privacyManager.updateConsent(this.currentUserId, consentTypes.ESSENTIAL, true);
        
        // Update other preferences based on checkboxes
        this.privacyManager.updateConsent(
            this.currentUserId, 
            consentTypes.HEALTH_DATA, 
            document.getElementById('consent-health').checked
        );
        
        this.privacyManager.updateConsent(
            this.currentUserId, 
            consentTypes.AI_PROCESSING, 
            document.getElementById('consent-ai').checked
        );
        
        this.privacyManager.updateConsent(
            this.currentUserId, 
            consentTypes.ANALYTICS, 
            document.getElementById('consent-analytics').checked
        );
        
        this.privacyManager.updateConsent(
            this.currentUserId, 
            consentTypes.MARKETING, 
            document.getElementById('consent-marketing').checked
        );

        this.updateDataProcessingAgreement(true);
        this.hideConsentModal();
        this.hideBanner();
        this.showConsentConfirmation('Your privacy preferences have been saved.');
    }

    /**
     * Update data processing agreement status
     */
    updateDataProcessingAgreement(agreed) {
        const settings = this.privacyManager.getPrivacySettings(this.currentUserId);
        if (settings) {
            settings.dataProcessingAgreement = agreed;
            settings.lastUpdated = Date.now();
            localStorage.setItem(`privacy_settings_${this.currentUserId}`, JSON.stringify(settings));
        }
    }

    /**
     * Show privacy policy
     */
    showPrivacyPolicy() {
        const policyModal = document.createElement('div');
        policyModal.id = 'privacy-policy-modal';
        policyModal.className = 'modal-overlay';
        policyModal.innerHTML = `
            <div class="modal-content privacy-policy-modal">
                <div class="modal-header">
                    <h2>Privacy Policy</h2>
                    <button class="modal-close" id="close-policy-modal">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="policy-content">
                        <h3>Data Collection and Use</h3>
                        <p>GlucoBalance collects and processes the following types of data:</p>
                        <ul>
                            <li><strong>Personal Information:</strong> Name, email, age, gender for account creation</li>
                            <li><strong>Health Data:</strong> Risk assessment responses, mood entries, nutrition preferences</li>
                            <li><strong>Usage Data:</strong> App interactions, feature usage, performance metrics</li>
                        </ul>

                        <h3>Data Processing Purposes</h3>
                        <ul>
                            <li>Provide personalized diabetes prevention insights</li>
                            <li>Generate AI-powered health recommendations</li>
                            <li>Track your health progress over time</li>
                            <li>Improve app functionality and user experience</li>
                        </ul>

                        <h3>Data Security</h3>
                        <p>We implement industry-standard security measures including:</p>
                        <ul>
                            <li>AES-256 encryption for sensitive health data</li>
                            <li>Secure API key management</li>
                            <li>Input validation and sanitization</li>
                            <li>Regular security audits and monitoring</li>
                        </ul>

                        <h3>Your Rights (GDPR)</h3>
                        <ul>
                            <li><strong>Right to Access:</strong> Request a copy of your data</li>
                            <li><strong>Right to Rectification:</strong> Correct inaccurate data</li>
                            <li><strong>Right to Erasure:</strong> Delete your data</li>
                            <li><strong>Right to Portability:</strong> Export your data</li>
                            <li><strong>Right to Withdraw Consent:</strong> Change your privacy preferences</li>
                        </ul>

                        <h3>Data Retention</h3>
                        <ul>
                            <li>Personal data: 1 year after account deletion</li>
                            <li>Health data: 7 years (medical record standards)</li>
                            <li>Analytics data: 90 days</li>
                            <li>Audit logs: 30 days</li>
                        </ul>

                        <h3>Contact Information</h3>
                        <p>For privacy-related questions or to exercise your rights, contact us at privacy@glucobalance.app</p>
                        
                        <p><em>Last updated: ${new Date().toLocaleDateString()}</em></p>
                    </div>
                </div>
                <div class="modal-footer">
                    <button id="close-policy" class="btn btn-primary">Close</button>
                </div>
            </div>
        `;

        document.body.appendChild(policyModal);

        // Add event listeners
        document.getElementById('close-policy-modal').addEventListener('click', () => {
            document.body.removeChild(policyModal);
        });

        document.getElementById('close-policy').addEventListener('click', () => {
            document.body.removeChild(policyModal);
        });

        policyModal.addEventListener('click', (e) => {
            if (e.target === policyModal) {
                document.body.removeChild(policyModal);
            }
        });
    }

    /**
     * Create privacy settings page
     */
    createPrivacySettingsPage() {
        const settings = this.privacyManager.getPrivacySettings(this.currentUserId);
        if (!settings) return null;

        const settingsHTML = `
            <div class="privacy-settings">
                <h2>Privacy & Data Settings</h2>
                
                <div class="settings-section">
                    <h3>Current Consent Status</h3>
                    <div class="consent-status">
                        <div class="status-item">
                            <span>Essential Functions:</span>
                            <span class="status-badge active">Active</span>
                        </div>
                        <div class="status-item">
                            <span>Health Data Processing:</span>
                            <span class="status-badge ${settings.consentGiven.health_data ? 'active' : 'inactive'}">
                                ${settings.consentGiven.health_data ? 'Active' : 'Inactive'}
                            </span>
                        </div>
                        <div class="status-item">
                            <span>AI Processing:</span>
                            <span class="status-badge ${settings.consentGiven.ai_processing ? 'active' : 'inactive'}">
                                ${settings.consentGiven.ai_processing ? 'Active' : 'Inactive'}
                            </span>
                        </div>
                        <div class="status-item">
                            <span>Analytics:</span>
                            <span class="status-badge ${settings.consentGiven.analytics ? 'active' : 'inactive'}">
                                ${settings.consentGiven.analytics ? 'Active' : 'Inactive'}
                            </span>
                        </div>
                    </div>
                </div>

                <div class="settings-section">
                    <h3>Data Management</h3>
                    <div class="data-actions">
                        <button id="export-data" class="btn btn-outline">
                            <i class="icon-download"></i> Export My Data
                        </button>
                        <button id="delete-data" class="btn btn-danger">
                            <i class="icon-trash"></i> Delete All Data
                        </button>
                        <button id="anonymize-data" class="btn btn-secondary">
                            <i class="icon-shield"></i> Anonymize Data
                        </button>
                    </div>
                </div>

                <div class="settings-section">
                    <h3>Privacy Controls</h3>
                    <div class="privacy-actions">
                        <button id="update-consent" class="btn btn-primary">
                            Update Privacy Preferences
                        </button>
                        <button id="view-audit-log" class="btn btn-outline">
                            View Data Access Log
                        </button>
                    </div>
                </div>

                <div class="settings-section">
                    <h3>Information</h3>
                    <p><strong>Consent given:</strong> ${new Date(settings.consentDate).toLocaleDateString()}</p>
                    <p><strong>Last updated:</strong> ${new Date(settings.lastUpdated).toLocaleDateString()}</p>
                    <p><strong>Privacy policy version:</strong> ${settings.privacyPolicyVersion}</p>
                </div>
            </div>
        `;

        return settingsHTML;
    }

    /**
     * Setup privacy control event listeners
     */
    setupPrivacyControls() {
        // Export data functionality
        document.addEventListener('click', (e) => {
            if (e.target.id === 'export-data') {
                this.handleDataExport();
            } else if (e.target.id === 'delete-data') {
                this.handleDataDeletion();
            } else if (e.target.id === 'anonymize-data') {
                this.handleDataAnonymization();
            } else if (e.target.id === 'update-consent') {
                this.showConsentModal();
            } else if (e.target.id === 'view-audit-log') {
                this.showAuditLog();
            }
        });
    }

    /**
     * Handle data export request
     */
    async handleDataExport() {
        const confirmed = confirm('This will download all your data in JSON format. Continue?');
        if (confirmed) {
            const success = await this.privacyManager.exportUserData(this.currentUserId);
            if (success) {
                this.showConsentConfirmation('Your data has been exported successfully.');
            } else {
                this.showConsentConfirmation('Data export failed. Please try again.', 'error');
            }
        }
    }

    /**
     * Handle data deletion request
     */
    async handleDataDeletion() {
        const confirmed = confirm(
            'This will permanently delete ALL your data. This action cannot be undone. Are you sure?'
        );
        
        if (confirmed) {
            const doubleConfirm = confirm('Are you absolutely sure? This will delete everything.');
            if (doubleConfirm) {
                const success = await this.privacyManager.deleteAllUserData(this.currentUserId);
                if (success) {
                    alert('All your data has been deleted. You will be logged out.');
                    // Redirect to login or home page
                    window.location.href = '/';
                } else {
                    this.showConsentConfirmation('Data deletion failed. Please try again.', 'error');
                }
            }
        }
    }

    /**
     * Handle data anonymization request
     */
    async handleDataAnonymization() {
        const confirmed = confirm(
            'This will anonymize your data by removing personal identifiers. Continue?'
        );
        
        if (confirmed) {
            const anonymizedId = await this.privacyManager.anonymizeUserData(this.currentUserId);
            if (anonymizedId) {
                this.showConsentConfirmation('Your data has been anonymized successfully.');
            } else {
                this.showConsentConfirmation('Data anonymization failed. Please try again.', 'error');
            }
        }
    }

    /**
     * Show audit log
     */
    showAuditLog() {
        const auditHistory = this.privacyManager.getConsentHistory(this.currentUserId);
        
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Data Access Audit Log</h2>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="audit-log">
                        ${auditHistory.length > 0 ? 
                            auditHistory.map(entry => `
                                <div class="audit-entry">
                                    <div class="audit-date">${new Date(entry.timestamp).toLocaleString()}</div>
                                    <div class="audit-action">${entry.action}: ${entry.consentType}</div>
                                    <div class="audit-status">${entry.granted ? 'Granted' : 'Revoked'}</div>
                                </div>
                            `).join('') :
                            '<p>No audit log entries found.</p>'
                        }
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-primary">Close</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Add close functionality
        modal.querySelector('.modal-close').addEventListener('click', () => {
            document.body.removeChild(modal);
        });

        modal.querySelector('.btn-primary').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
    }

    /**
     * Utility methods
     */
    hideBanner() {
        const banner = document.getElementById('privacy-banner');
        if (banner) {
            banner.remove();
        }
    }

    hideConsentModal() {
        const modal = document.getElementById('consent-modal');
        if (modal) {
            modal.remove();
        }
    }

    showConsentConfirmation(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 5000);
    }
}

// Export PrivacyUI
window.PrivacyUI = PrivacyUI;
//# sourceMappingURL=privacy-ui.js.map