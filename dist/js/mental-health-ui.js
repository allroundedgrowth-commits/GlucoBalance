// GlucoBalance - Mental Health UI Components
class MentalHealthUI {
    constructor() {
        this.currentUser = null;
        this.selectedMood = null;
        this.moodChart = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        console.log('Mental Health UI initialized');
    }

    setCurrentUser(userId) {
        this.currentUser = userId;
        if (window.mentalHealthService) {
            window.mentalHealthService.setCurrentUser(userId);
        }
        this.loadMoodData();
    }

    setupEventListeners() {
        // Mood selector buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('mood-btn')) {
                this.handleMoodSelection(e.target);
            }
        });

        // Chart period buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('chart-period-btn')) {
                this.handleChartPeriodChange(e.target);
            }
        });

        // Mood notes form submission
        document.addEventListener('submit', (e) => {
            if (e.target.id === 'mood-notes-form') {
                e.preventDefault();
                this.saveMoodWithNotes();
            }
        });

        // Mental health page navigation
        document.addEventListener('click', (e) => {
            if (e.target.id === 'mental-health-btn' || e.target.dataset.page === 'mental-health') {
                this.showMentalHealthPage();
            }
        });
    }

    handleChartPeriodChange(button) {
        const period = parseInt(button.dataset.period);
        
        // Update active button
        document.querySelectorAll('.chart-period-btn').forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        
        // Update chart with new period
        if (window.mentalHealthService) {
            const chartData = window.mentalHealthService.getMoodChartData(period);
            const chartContainer = document.getElementById('mood-chart');
            if (chartContainer) {
                const chart = this.createMoodChart(chartData);
                chartContainer.innerHTML = chart;
            }
        }
    }

    async handleMoodSelection(button) {
        const mood = parseInt(button.dataset.mood);
        this.selectedMood = mood;

        // Update UI
        document.querySelectorAll('.mood-btn').forEach(btn => btn.classList.remove('selected'));
        button.classList.add('selected');

        // Show mood confirmation or notes input
        this.showMoodConfirmation(mood);

        try {
            // Save mood immediately for dashboard
            if (this.currentUser && window.mentalHealthService) {
                const result = await window.mentalHealthService.saveMood(mood);
                
                // Show affirmation
                if (result.affirmation) {
                    this.showAffirmation(result.affirmation);
                }

                // Update mood display
                this.updateMoodDisplay();
                
                // Check if enhanced support is needed
                if (window.mentalHealthService.needsEnhancedSupport()) {
                    const supportMessage = await window.mentalHealthService.getEnhancedSupportMessage();
                    this.showEnhancedSupport(supportMessage);
                }
            }
        } catch (error) {
            console.error('Failed to save mood:', error);
            this.showError('Failed to save mood. Please try again.');
        }
    }

    showMoodConfirmation(mood) {
        const moodEmojis = { 1: '😢', 2: '😕', 3: '😐', 4: '😊', 5: '😄' };
        const moodLabels = { 1: 'Very Sad', 2: 'Sad', 3: 'Neutral', 4: 'Happy', 5: 'Very Happy' };

        // Create or update mood confirmation
        let confirmation = document.getElementById('mood-confirmation');
        if (!confirmation) {
            confirmation = document.createElement('div');
            confirmation.id = 'mood-confirmation';
            confirmation.className = 'mood-confirmation';
            
            const moodCard = document.querySelector('.mood-card');
            if (moodCard) {
                moodCard.appendChild(confirmation);
            }
        }

        confirmation.innerHTML = `
            <div class="mood-selected">
                <span class="mood-emoji">${moodEmojis[mood]}</span>
                <span class="mood-label">${moodLabels[mood]}</span>
            </div>
            <div class="mood-actions">
                <button class="btn-small btn-secondary" onclick="mentalHealthUI.showNotesInput()">Add Notes</button>
                <button class="btn-small btn-primary" onclick="mentalHealthUI.confirmMood()">Confirm</button>
            </div>
        `;

        confirmation.style.display = 'block';
    }

    showNotesInput() {
        const confirmation = document.getElementById('mood-confirmation');
        if (!confirmation) return;

        confirmation.innerHTML = `
            <form id="mood-notes-form" class="mood-notes-form">
                <div class="form-group">
                    <label for="mood-notes">How are you feeling? (optional)</label>
                    <textarea id="mood-notes" class="form-control" rows="3" 
                              placeholder="Share what's on your mind..."></textarea>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn-small btn-secondary" onclick="mentalHealthUI.cancelNotes()">Cancel</button>
                    <button type="submit" class="btn-small btn-primary">Save Mood</button>
                </div>
            </form>
        `;
    }

    async saveMoodWithNotes() {
        const notesInput = document.getElementById('mood-notes');
        const notes = notesInput ? notesInput.value.trim() : '';

        if (!this.selectedMood || !this.currentUser) return;

        try {
            const result = await window.mentalHealthService.saveMood(this.selectedMood, notes);
            
            // Show success message
            this.showSuccess('Mood saved successfully!');
            
            // Trigger engagement notification for consistent mood tracking
            if (window.notificationService && this.selectedMood <= 2) {
                // Send supportive notification for low mood
                setTimeout(() => {
                    if (window.notificationUI) {
                        window.notificationUI.sendMotivationalMessage({
                            trigger: 'low_mood_support',
                            mood: this.selectedMood,
                            notes: notes
                        });
                    }
                }, 1000);
            }
            
            // Show affirmation
            if (result.affirmation) {
                this.showAffirmation(result.affirmation);
            }

            // Hide confirmation
            this.hideMoodConfirmation();
            
            // Update displays
            this.updateMoodDisplay();
            
        } catch (error) {
            console.error('Failed to save mood with notes:', error);
            this.showError('Failed to save mood. Please try again.');
        }
    }

    confirmMood() {
        this.hideMoodConfirmation();
        this.showSuccess('Mood recorded!');
    }

    cancelNotes() {
        this.hideMoodConfirmation();
    }

    hideMoodConfirmation() {
        const confirmation = document.getElementById('mood-confirmation');
        if (confirmation) {
            confirmation.style.display = 'none';
        }
    }

    showAffirmation(message) {
        // Create empathetic affirmation modal with enhanced presentation
        const affirmation = document.createElement('div');
        affirmation.className = 'affirmation-modal empathetic-content';
        
        // Determine appropriate icon and styling based on message tone
        const isAIGenerated = message.length > 100; // AI messages tend to be longer
        const icon = isAIGenerated ? '🤗' : '💙';
        const title = isAIGenerated ? 'A Personal Message for You' : 'A Message for You';
        
        affirmation.innerHTML = `
            <div class="affirmation-content">
                <div class="affirmation-header">
                    <div class="affirmation-icon">${icon}</div>
                    <h3>${title}</h3>
                    ${isAIGenerated ? '<span class="ai-badge">✨ AI-Personalized</span>' : ''}
                </div>
                <div class="affirmation-message">
                    <p>${message}</p>
                </div>
                <div class="affirmation-actions">
                    <button class="btn-secondary" onclick="mentalHealthUI.showCopingStrategies()">Get Coping Tips</button>
                    <button class="btn-primary" onclick="this.parentElement.parentElement.parentElement.remove()">Thank You</button>
                </div>
            </div>
        `;

        document.body.appendChild(affirmation);

        // Enhanced auto-remove with fade effect
        setTimeout(() => {
            if (affirmation.parentElement) {
                affirmation.classList.add('fade-out');
                setTimeout(() => {
                    if (affirmation.parentElement) {
                        affirmation.remove();
                    }
                }, 500);
            }
        }, 12000);
    }

    showEnhancedSupport(message) {
        const support = document.createElement('div');
        support.className = 'enhanced-support-modal empathetic-content priority-support';
        
        // Check if this is AI-generated enhanced support
        const isAIGenerated = message.length > 150;
        
        support.innerHTML = `
            <div class="support-content">
                <div class="support-header">
                    <div class="support-icon">🤗</div>
                    <h3>We're Here for You</h3>
                    ${isAIGenerated ? '<span class="ai-badge">✨ Personalized Support</span>' : ''}
                </div>
                <div class="support-message">
                    <p>${message}</p>
                </div>
                <div class="support-notice">
                    <div class="notice-icon">💡</div>
                    <p><strong>Remember:</strong> Professional support can make a real difference in your health journey.</p>
                </div>
                <div class="support-actions">
                    <button class="btn-secondary" onclick="this.parentElement.parentElement.parentElement.remove()">Not Now</button>
                    <button class="btn-primary" onclick="mentalHealthUI.showSupportResources()">Find Resources</button>
                </div>
            </div>
        `;

        document.body.appendChild(support);
        
        // Add gentle pulsing animation to draw attention
        support.classList.add('gentle-pulse');
    }

    async showCopingStrategies() {
        // Remove any existing affirmation modal
        const existingModal = document.querySelector('.affirmation-modal');
        if (existingModal) existingModal.remove();

        // Get current mood for context
        const today = new Date().toISOString().split('T')[0];
        let currentMood = 3; // Default
        
        if (this.currentUser && window.mentalHealthService) {
            const todayMood = await window.mentalHealthService.getMoodByDate(today);
            if (todayMood) {
                currentMood = todayMood.mood;
            }
        }

        // Generate AI-powered coping strategies
        let strategies = [];
        try {
            if (window.mentalHealthService) {
                strategies = await window.mentalHealthService.generateCopingStrategies(currentMood, []);
            }
        } catch (error) {
            console.error('Failed to generate coping strategies:', error);
            strategies = [
                "Take 5 deep breaths, focusing on slow exhales",
                "Go for a 10-minute walk outside if possible",
                "Write down three things you're grateful for",
                "Listen to calming music or nature sounds"
            ];
        }

        const copingModal = document.createElement('div');
        copingModal.className = 'coping-strategies-modal empathetic-content';
        copingModal.innerHTML = `
            <div class="coping-content">
                <div class="coping-header">
                    <div class="coping-icon">🌱</div>
                    <h3>Coping Strategies for You</h3>
                    <span class="ai-badge">✨ Personalized Tips</span>
                </div>
                <div class="coping-message">
                    <p>Here are some gentle strategies to help you feel better:</p>
                </div>
                <div class="strategies-list">
                    ${strategies.map((strategy, index) => `
                        <div class="strategy-item">
                            <div class="strategy-number">${index + 1}</div>
                            <div class="strategy-text">${strategy}</div>
                        </div>
                    `).join('')}
                </div>
                <div class="coping-actions">
                    <button class="btn-secondary" onclick="mentalHealthUI.showSupportResources()">More Resources</button>
                    <button class="btn-primary" onclick="this.parentElement.parentElement.parentElement.remove()">Got It</button>
                </div>
            </div>
        `;

        document.body.appendChild(copingModal);
    }

    showSupportResources() {
        // Remove any existing modals
        const existingModals = document.querySelectorAll('.enhanced-support-modal, .coping-strategies-modal');
        existingModals.forEach(modal => modal.remove());

        const resources = document.createElement('div');
        resources.className = 'support-resources-modal empathetic-content';
        resources.innerHTML = `
            <div class="resources-content">
                <div class="resources-header">
                    <div class="resources-icon">🆘</div>
                    <h3>Mental Health Resources</h3>
                    <button class="close-btn" onclick="this.parentElement.parentElement.parentElement.remove()">×</button>
                </div>
                <div class="resources-intro">
                    <p>Professional support is available and can make a significant difference in your health journey.</p>
                </div>
                <div class="resources-list">
                    <div class="resource-item crisis-support">
                        <div class="resource-icon">🚨</div>
                        <h4>Immediate Crisis Support</h4>
                        <div class="resource-details">
                            <p><strong>National Suicide Prevention Lifeline:</strong> <a href="tel:988">988</a></p>
                            <p><strong>Crisis Text Line:</strong> Text HOME to <a href="sms:741741">741741</a></p>
                            <p><em>Available 24/7 for immediate support</em></p>
                        </div>
                    </div>
                    <div class="resource-item professional-help">
                        <div class="resource-icon">👩‍⚕️</div>
                        <h4>Professional Mental Health Support</h4>
                        <div class="resource-details">
                            <p>• Licensed therapists and counselors</p>
                            <p>• Your primary healthcare provider can provide referrals</p>
                            <p>• Many insurance plans cover mental health services</p>
                            <p>• Online therapy platforms are also available</p>
                        </div>
                    </div>
                    <div class="resource-item self-care">
                        <div class="resource-icon">🌿</div>
                        <h4>Daily Self-Care Practices</h4>
                        <div class="resource-details">
                            <p>• Practice deep breathing exercises (4-7-8 technique)</p>
                            <p>• Maintain regular sleep schedule (7-9 hours)</p>
                            <p>• Stay connected with supportive friends and family</p>
                            <p>• Engage in gentle physical activity</p>
                            <p>• Limit alcohol and avoid substances</p>
                        </div>
                    </div>
                    <div class="resource-item diabetes-connection">
                        <div class="resource-icon">💙</div>
                        <h4>Mental Health & Diabetes Prevention</h4>
                        <div class="resource-details">
                            <p>• Stress management helps regulate blood sugar</p>
                            <p>• Good mental health supports healthy lifestyle choices</p>
                            <p>• Regular mood tracking can identify patterns</p>
                            <p>• Professional support enhances overall health outcomes</p>
                        </div>
                    </div>
                </div>
                <div class="resources-actions">
                    <button class="btn-primary" onclick="this.parentElement.parentElement.parentElement.remove()">Close</button>
                </div>
            </div>
        `;

        document.body.appendChild(resources);
    }

    async updateMoodDisplay() {
        // Update dashboard mood display
        const moodDisplay = document.getElementById('mood-display');
        if (moodDisplay && this.currentUser && window.mentalHealthService) {
            const today = new Date().toISOString().split('T')[0];
            const todayMood = await window.mentalHealthService.getMoodByDate(today);
            
            if (todayMood) {
                const moodEmojis = { 1: '😢', 2: '😕', 3: '😐', 4: '😊', 5: '😄' };
                moodDisplay.innerHTML = `
                    <div class="current-mood">
                        <span class="mood-emoji-large">${moodEmojis[todayMood.mood]}</span>
                        <span class="mood-text">Mood: ${todayMood.mood}/5</span>
                    </div>
                `;
            }
        }

        // Update mental health page if visible
        if (document.getElementById('mental-health-page')?.classList.contains('active')) {
            this.loadMoodData();
        }
    }

    async loadMoodData() {
        if (!this.currentUser || !window.mentalHealthService) return;

        try {
            // Load mood history
            await window.mentalHealthService.loadMoodHistory();
            
            // Update today's mood status
            await this.updateTodayMoodStatus();
            
            // Update mood chart
            this.updateMoodChart();
            
            // Update mood analytics
            this.updateMoodAnalytics();
            
        } catch (error) {
            console.error('Failed to load mood data:', error);
        }
    }

    async updateTodayMoodStatus() {
        const statusContainer = document.getElementById('today-mood-status');
        if (!statusContainer || !window.mentalHealthService) return;

        try {
            const today = new Date().toISOString().split('T')[0];
            const todayMood = await window.mentalHealthService.getMoodByDate(today);
            
            if (todayMood) {
                const moodEmojis = { 1: '😢', 2: '😕', 3: '😐', 4: '😊', 5: '😄' };
                const moodLabels = { 1: 'Very Sad', 2: 'Sad', 3: 'Neutral', 4: 'Happy', 5: 'Very Happy' };
                
                statusContainer.innerHTML = `
                    <div class="today-mood-recorded">
                        <div class="mood-status-icon">✅</div>
                        <div class="mood-status-content">
                            <div class="status-title">Today's mood recorded</div>
                            <div class="status-mood">
                                <span class="mood-emoji">${moodEmojis[todayMood.mood]}</span>
                                <span class="mood-text">${moodLabels[todayMood.mood]} (${todayMood.mood}/5)</span>
                            </div>
                            ${todayMood.notes ? `<div class="status-notes">"${todayMood.notes}"</div>` : ''}
                            <button class="update-mood-btn" onclick="mentalHealthUI.showUpdateMoodDialog()">
                                Update Today's Mood
                            </button>
                        </div>
                    </div>
                `;
                
                // Highlight the current mood button
                document.querySelectorAll('.mood-btn').forEach(btn => {
                    btn.classList.remove('selected', 'current-mood');
                    if (parseInt(btn.dataset.mood) === todayMood.mood) {
                        btn.classList.add('selected', 'current-mood');
                    }
                });
            } else {
                statusContainer.innerHTML = `
                    <div class="today-mood-pending">
                        <div class="mood-status-icon">⏰</div>
                        <div class="mood-status-content">
                            <div class="status-title">How are you feeling today?</div>
                            <div class="status-subtitle">Track your daily mood to build insights over time</div>
                        </div>
                    </div>
                `;
            }
        } catch (error) {
            console.error('Failed to update today mood status:', error);
            statusContainer.innerHTML = `
                <div class="today-mood-error">
                    <div class="mood-status-icon">⚠️</div>
                    <div class="mood-status-content">
                        <div class="status-title">Unable to load mood status</div>
                        <div class="status-subtitle">Please try refreshing the page</div>
                    </div>
                </div>
            `;
        }
    }

    showUpdateMoodDialog() {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content update-mood-modal">
                <div class="modal-header">
                    <h3>Update Today's Mood</h3>
                    <button class="close-btn" onclick="this.parentElement.parentElement.parentElement.remove()">×</button>
                </div>
                <div class="modal-body">
                    <p>Select your updated mood for today:</p>
                    <div class="mood-scale-modal">
                        <button class="mood-btn-modal" data-mood="1">
                            <span class="mood-emoji">😢</span>
                            <span class="mood-label">Very Sad</span>
                        </button>
                        <button class="mood-btn-modal" data-mood="2">
                            <span class="mood-emoji">😕</span>
                            <span class="mood-label">Sad</span>
                        </button>
                        <button class="mood-btn-modal" data-mood="3">
                            <span class="mood-emoji">😐</span>
                            <span class="mood-label">Neutral</span>
                        </button>
                        <button class="mood-btn-modal" data-mood="4">
                            <span class="mood-emoji">😊</span>
                            <span class="mood-label">Happy</span>
                        </button>
                        <button class="mood-btn-modal" data-mood="5">
                            <span class="mood-emoji">😄</span>
                            <span class="mood-label">Very Happy</span>
                        </button>
                    </div>
                    <div class="form-group">
                        <label for="update-mood-notes">Update your notes (optional):</label>
                        <textarea id="update-mood-notes" class="form-control" rows="3" 
                                  placeholder="What's changed since your last entry?"></textarea>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn-secondary" onclick="this.parentElement.parentElement.parentElement.remove()">Cancel</button>
                    <button class="btn-primary" onclick="mentalHealthUI.saveUpdatedMood()">Update Mood</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Add event listeners for mood selection
        modal.querySelectorAll('.mood-btn-modal').forEach(btn => {
            btn.addEventListener('click', () => {
                modal.querySelectorAll('.mood-btn-modal').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                this.selectedMood = parseInt(btn.dataset.mood);
            });
        });
    }

    async saveUpdatedMood() {
        if (!this.selectedMood) {
            this.showError('Please select a mood first');
            return;
        }

        const notesInput = document.getElementById('update-mood-notes');
        const notes = notesInput ? notesInput.value.trim() : '';

        try {
            const result = await window.mentalHealthService.saveMood(this.selectedMood, notes);
            
            // Close modal
            document.querySelector('.modal-overlay').remove();
            
            // Show success message
            this.showSuccess('Mood updated successfully!');
            
            // Show affirmation
            if (result.affirmation) {
                setTimeout(() => this.showAffirmation(result.affirmation), 1000);
            }
            
            // Refresh displays
            await this.updateTodayMoodStatus();
            this.updateMoodDisplay();
            
        } catch (error) {
            console.error('Failed to update mood:', error);
            this.showError('Failed to update mood. Please try again.');
        }
    }

    updateMoodChart() {
        const chartContainer = document.getElementById('mood-chart');
        if (!chartContainer) return;

        const chartData = window.mentalHealthService.getMoodChartData(30);
        
        if (chartData.length === 0) {
            chartContainer.innerHTML = '<p class="no-data">No mood data available. Start tracking your mood to see trends!</p>';
            return;
        }

        // Create simple line chart
        const chart = this.createMoodChart(chartData);
        chartContainer.innerHTML = chart;
    }

    createMoodChart(data) {
        if (data.length === 0) return '<p class="no-data">No mood data available. Start tracking your mood to see trends!</p>';

        const maxPoints = 30;
        const displayData = data.slice(-maxPoints); // Show last 30 days
        
        const chartWidth = 100;
        const chartHeight = 60;
        
        // Create SVG path for mood line with smooth curves
        let pathData = '';
        const points = displayData.map((item, index) => {
            const x = (index / Math.max(displayData.length - 1, 1)) * chartWidth;
            const y = chartHeight - ((item.mood - 1) / 4) * chartHeight;
            return { x, y, mood: item.mood, date: item.date, notes: item.notes };
        });

        if (points.length > 0) {
            if (points.length === 1) {
                // Single point
                pathData = `M ${points[0].x} ${points[0].y}`;
            } else {
                // Create smooth curve using quadratic bezier curves
                pathData = `M ${points[0].x} ${points[0].y}`;
                for (let i = 1; i < points.length; i++) {
                    const prevPoint = points[i - 1];
                    const currentPoint = points[i];
                    const controlX = (prevPoint.x + currentPoint.x) / 2;
                    pathData += ` Q ${controlX} ${prevPoint.y} ${currentPoint.x} ${currentPoint.y}`;
                }
            }
        }

        // Calculate trend
        const trendInfo = this.calculateTrendInfo(displayData);
        
        // Create mood distribution
        const distribution = this.getMoodDistribution(displayData);

        return `
            <div class="mood-chart-container">
                <div class="chart-header">
                    <h4>Mood Trend (Last ${displayData.length} days)</h4>
                    <div class="chart-controls">
                        <button class="chart-period-btn active" data-period="7">7D</button>
                        <button class="chart-period-btn" data-period="14">14D</button>
                        <button class="chart-period-btn" data-period="30">30D</button>
                    </div>
                </div>
                
                <div class="chart-wrapper">
                    <svg viewBox="0 0 ${chartWidth} ${chartHeight}" class="mood-chart-svg">
                        <!-- Background grid -->
                        <defs>
                            <pattern id="moodGrid" width="10" height="12" patternUnits="userSpaceOnUse">
                                <path d="M 10 0 L 0 0 0 12" fill="none" stroke="#f0f0f0" stroke-width="0.5"/>
                            </pattern>
                            <linearGradient id="moodGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" style="stop-color:#007FFF;stop-opacity:0.3" />
                                <stop offset="100%" style="stop-color:#007FFF;stop-opacity:0.1" />
                            </linearGradient>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#moodGrid)" />
                        
                        <!-- Mood area fill -->
                        ${points.length > 1 ? `
                            <path d="${pathData} L ${points[points.length - 1].x} ${chartHeight} L ${points[0].x} ${chartHeight} Z" 
                                  fill="url(#moodGradient)" opacity="0.3"/>
                        ` : ''}
                        
                        <!-- Mood line -->
                        <path d="${pathData}" fill="none" stroke="#007FFF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                        
                        <!-- Data points -->
                        ${points.map((point, index) => `
                            <circle cx="${point.x}" cy="${point.y}" r="3" fill="#007FFF" class="mood-point" 
                                    data-mood="${point.mood}" data-date="${point.date}" data-notes="${point.notes || ''}"
                                    stroke="#fff" stroke-width="1.5">
                                <title>Date: ${new Date(point.date).toLocaleDateString()}, Mood: ${point.mood}/5${point.notes ? ', Notes: ' + point.notes : ''}</title>
                            </circle>
                        `).join('')}
                        
                        <!-- Trend line if applicable -->
                        ${trendInfo.showTrend ? `
                            <line x1="0" y1="${trendInfo.startY}" x2="${chartWidth}" y2="${trendInfo.endY}" 
                                  stroke="#ff6b6b" stroke-width="2" stroke-dasharray="4,2" opacity="0.8"/>
                            <text x="${chartWidth - 10}" y="${trendInfo.endY - 5}" 
                                  fill="#ff6b6b" font-size="8" text-anchor="end">
                                ${trendInfo.direction}
                            </text>
                        ` : ''}
                    </svg>
                    
                    <!-- Y-axis labels -->
                    <div class="chart-y-labels">
                        <span class="y-label" style="bottom: 80%">😄 5</span>
                        <span class="y-label" style="bottom: 60%">😊 4</span>
                        <span class="y-label" style="bottom: 40%">😐 3</span>
                        <span class="y-label" style="bottom: 20%">😕 2</span>
                        <span class="y-label" style="bottom: 0%">😢 1</span>
                    </div>
                </div>
                
                <!-- Chart insights -->
                <div class="chart-insights">
                    <div class="insight-item">
                        <span class="insight-label">Average:</span>
                        <span class="insight-value">${trendInfo.average}/5</span>
                    </div>
                    <div class="insight-item">
                        <span class="insight-label">Trend:</span>
                        <span class="insight-value ${trendInfo.trendClass}">${trendInfo.trendText}</span>
                    </div>
                    <div class="insight-item">
                        <span class="insight-label">Best Day:</span>
                        <span class="insight-value">${trendInfo.bestDay}</span>
                    </div>
                </div>
                
                <!-- Mood distribution -->
                <div class="mood-distribution">
                    <h5>Mood Distribution</h5>
                    <div class="distribution-bars">
                        ${Object.entries(distribution).map(([mood, count]) => `
                            <div class="distribution-item">
                                <div class="mood-emoji">${['', '😢', '😕', '😐', '😊', '😄'][mood]}</div>
                                <div class="distribution-bar">
                                    <div class="bar-fill" style="height: ${(count / displayData.length) * 100}%"></div>
                                </div>
                                <div class="distribution-count">${count}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <!-- Chart legend -->
                <div class="chart-legend">
                    <div class="legend-item">
                        <span class="legend-color" style="background: #007FFF"></span>
                        <span>Daily Mood Tracking</span>
                    </div>
                    ${trendInfo.showTrend ? `
                        <div class="legend-item">
                            <span class="legend-line" style="border-top: 1px dashed #ff6b6b"></span>
                            <span>Trend Line</span>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    calculateTrendInfo(data) {
        if (data.length < 2) {
            return {
                average: data.length > 0 ? data[0].mood.toFixed(1) : '0.0',
                trendText: 'Insufficient data',
                trendClass: 'neutral',
                showTrend: false,
                bestDay: data.length > 0 ? new Date(data[0].date).toLocaleDateString() : 'N/A'
            };
        }

        const moods = data.map(d => d.mood);
        const average = (moods.reduce((a, b) => a + b, 0) / moods.length).toFixed(1);
        
        // Calculate linear regression for trend
        const n = data.length;
        const sumX = data.reduce((sum, _, i) => sum + i, 0);
        const sumY = moods.reduce((sum, mood) => sum + mood, 0);
        const sumXY = data.reduce((sum, item, i) => sum + (i * item.mood), 0);
        const sumXX = data.reduce((sum, _, i) => sum + (i * i), 0);
        
        const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
        
        let trendText, trendClass;
        if (slope > 0.05) {
            trendText = '📈 Improving';
            trendClass = 'positive';
        } else if (slope < -0.05) {
            trendText = '📉 Declining';
            trendClass = 'negative';
        } else {
            trendText = '➡️ Stable';
            trendClass = 'neutral';
        }

        // Find best day
        const bestMoodEntry = data.reduce((best, current) => 
            current.mood > best.mood ? current : best
        );
        const bestDay = new Date(bestMoodEntry.date).toLocaleDateString();

        // Calculate trend line coordinates using linear regression
        const chartHeight = 60;
        const n = moods.length;
        const sumX = moods.reduce((sum, _, i) => sum + i, 0);
        const sumY = moods.reduce((sum, mood) => sum + mood, 0);
        const sumXY = moods.reduce((sum, mood, i) => sum + (i * mood), 0);
        const sumXX = moods.reduce((sum, _, i) => sum + (i * i), 0);

        const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;

        const startY = chartHeight - ((intercept - 1) / 4) * chartHeight;
        const endY = chartHeight - (((slope * (n - 1) + intercept) - 1) / 4) * chartHeight;
        
        // Determine trend direction
        let direction = 'Stable';
        if (slope > 0.05) direction = '↗ Improving';
        else if (slope < -0.05) direction = '↘ Declining';

        return {
            average,
            trendText,
            trendClass,
            showTrend: Math.abs(slope) > 0.02,
            startY,
            endY,
            direction,
            slope: slope.toFixed(3),
            bestDay
        };
    }

    getMoodDistribution(data) {
        const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        data.forEach(item => {
            distribution[item.mood]++;
        });
        return distribution;
    }

    async updateMoodAnalytics() {
        const analyticsContainer = document.getElementById('mood-analytics');
        if (!analyticsContainer || !window.mentalHealthService) return;

        try {
            const patterns = await window.mentalHealthService.analyzeMoodPatterns();
            const avgMood = window.mentalHealthService.getAverageMood(7);
            const trends = window.mentalHealthService.calculateMoodTrends(7);
            const distribution = window.mentalHealthService.getMoodDistribution(30);
            const weeklyAvg = window.mentalHealthService.getAverageMood(7);
            const monthlyAvg = window.mentalHealthService.getAverageMood(30);

            let analyticsHTML = '<div class="mood-analytics-grid">';

            // Average mood cards
            analyticsHTML += `
                <div class="analytics-card avg-card">
                    <div class="card-icon">📊</div>
                    <h4>7-Day Average</h4>
                    <div class="metric-value ${this.getMoodClass(weeklyAvg)}">${weeklyAvg || 'N/A'}</div>
                    <div class="metric-label">out of 5</div>
                    <div class="metric-change">
                        ${monthlyAvg ? this.getChangeIndicator(weeklyAvg, monthlyAvg) : ''}
                    </div>
                </div>
            `;

            analyticsHTML += `
                <div class="analytics-card avg-card">
                    <div class="card-icon">📅</div>
                    <h4>30-Day Average</h4>
                    <div class="metric-value ${this.getMoodClass(monthlyAvg)}">${monthlyAvg || 'N/A'}</div>
                    <div class="metric-label">out of 5</div>
                    <div class="metric-sublabel">Overall wellbeing</div>
                </div>
            `;

            // Trend card with enhanced visualization
            const trendIcons = {
                'improving': '📈',
                'declining': '📉',
                'stable': '➡️',
                'insufficient_data': '📊'
            };

            const trendColors = {
                'improving': 'trend-positive',
                'declining': 'trend-negative',
                'stable': 'trend-neutral',
                'insufficient_data': 'trend-neutral'
            };

            analyticsHTML += `
                <div class="analytics-card trend-card ${trendColors[trends.trend]}">
                    <div class="card-icon">${trendIcons[trends.trend] || '📊'}</div>
                    <h4>Mood Trend</h4>
                    <div class="metric-value">${trends.trend.replace('_', ' ')}</div>
                    <div class="metric-label">${trends.message}</div>
                </div>
            `;

            // Mood consistency card
            const consistency = this.calculateMoodConsistency(distribution);
            analyticsHTML += `
                <div class="analytics-card consistency-card">
                    <div class="card-icon">🎯</div>
                    <h4>Consistency</h4>
                    <div class="metric-value ${consistency.class}">${consistency.score}%</div>
                    <div class="metric-label">${consistency.label}</div>
                </div>
            `;

            analyticsHTML += '</div>';

            // AI-Enhanced insights section
            if (patterns.hasPatterns) {
                // Try to get AI insights first
                let aiInsights = '';
                try {
                    if (window.aiService && window.aiService.isAvailable()) {
                        const moodData = {
                            moodHistory: window.mentalHealthService.moodHistory,
                            trends: trends,
                            patterns: patterns.patterns,
                            timeframe: '30 days'
                        };
                        aiInsights = await window.aiService.generateMoodInsights(moodData);
                    }
                } catch (error) {
                    console.error('Failed to generate AI mood insights:', error);
                }

                analyticsHTML += `
                    <div class="insights-section">
                        <h4>🧠 Personalized Insights</h4>
                        ${aiInsights ? `
                            <div class="ai-insights-highlight">
                                <div class="ai-insights-header">
                                    <span class="ai-icon">✨</span>
                                    <span class="ai-label">AI Analysis</span>
                                </div>
                                <div class="ai-insights-content">${aiInsights}</div>
                            </div>
                        ` : ''}
                        <div class="insights-grid">
                `;

                if (patterns.insights.length > 0) {
                    patterns.insights.forEach((insight, index) => {
                        analyticsHTML += `
                            <div class="insight-card">
                                <div class="insight-icon">${this.getInsightIcon(index)}</div>
                                <div class="insight-text">${insight}</div>
                            </div>
                        `;
                    });
                }

                analyticsHTML += '</div></div>';

                // Enhanced recommendations
                if (patterns.recommendations.length > 0) {
                    analyticsHTML += `
                        <div class="recommendations-section">
                            <h4>💡 Personalized Recommendations</h4>
                            <div class="recommendations-grid">
                    `;

                    patterns.recommendations.forEach((rec, index) => {
                        analyticsHTML += `
                            <div class="recommendation-card">
                                <div class="rec-priority">${index + 1}</div>
                                <div class="rec-content">
                                    <div class="rec-text">${rec}</div>
                                    <button class="rec-action" onclick="mentalHealthUI.handleRecommendationAction('${rec}')">
                                        Try This
                                    </button>
                                </div>
                            </div>
                        `;
                    });

                    analyticsHTML += '</div></div>';
                }
            }

            // Mood pattern visualization
            analyticsHTML += this.createMoodPatternVisualization(distribution);

            analyticsContainer.innerHTML = analyticsHTML;

        } catch (error) {
            console.error('Failed to update mood analytics:', error);
            analyticsContainer.innerHTML = '<p class="error-message">Unable to load mood analytics. Please try refreshing the page.</p>';
        }
    }

    getMoodClass(avgMood) {
        if (!avgMood) return '';
        const mood = parseFloat(avgMood);
        if (mood >= 4) return 'mood-high';
        if (mood >= 3) return 'mood-medium';
        return 'mood-low';
    }

    getChangeIndicator(current, previous) {
        if (!current || !previous) return '';
        const change = parseFloat(current) - parseFloat(previous);
        if (Math.abs(change) < 0.1) return '<span class="change-neutral">No change</span>';
        if (change > 0) return `<span class="change-positive">+${change.toFixed(1)} from last month</span>`;
        return `<span class="change-negative">${change.toFixed(1)} from last month</span>`;
    }

    calculateMoodConsistency(distribution) {
        const total = Object.values(distribution).reduce((sum, count) => sum + count, 0);
        if (total === 0) return { score: 0, label: 'No data', class: 'mood-low' };

        // Calculate how spread out the moods are
        const maxCount = Math.max(...Object.values(distribution));
        const consistency = Math.round((maxCount / total) * 100);

        let label, className;
        if (consistency >= 70) {
            label = 'Very consistent';
            className = 'mood-high';
        } else if (consistency >= 50) {
            label = 'Moderately consistent';
            className = 'mood-medium';
        } else {
            label = 'Highly variable';
            className = 'mood-low';
        }

        return { score: consistency, label, class: className };
    }

    getInsightIcon(index) {
        const icons = ['🔍', '📈', '🎯', '💪', '🌟', '⚡'];
        return icons[index % icons.length];
    }

    createMoodPatternVisualization(distribution) {
        const total = Object.values(distribution).reduce((sum, count) => sum + count, 0);
        if (total === 0) return '';

        return `
            <div class="mood-patterns-section">
                <h4>📊 Mood Distribution (Last 30 Days)</h4>
                <div class="mood-distribution-chart">
                    ${Object.entries(distribution).map(([mood, count]) => {
                        const percentage = total > 0 ? (count / total) * 100 : 0;
                        const moodEmojis = { 1: '😢', 2: '😕', 3: '😐', 4: '😊', 5: '😄' };
                        const moodLabels = { 1: 'Very Sad', 2: 'Sad', 3: 'Neutral', 4: 'Happy', 5: 'Very Happy' };
                        
                        return `
                            <div class="distribution-item">
                                <div class="mood-info">
                                    <span class="mood-emoji">${moodEmojis[mood]}</span>
                                    <span class="mood-name">${moodLabels[mood]}</span>
                                </div>
                                <div class="distribution-bar-container">
                                    <div class="distribution-bar">
                                        <div class="bar-fill mood-${mood}" style="width: ${percentage}%"></div>
                                    </div>
                                    <span class="distribution-percentage">${percentage.toFixed(1)}%</span>
                                </div>
                                <div class="distribution-count">${count} days</div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }

    handleRecommendationAction(recommendation) {
        // Handle recommendation actions
        this.showNotification(`Great choice! "${recommendation}" - Remember to be consistent for best results.`, 'success');
        
        // Could integrate with goal tracking or reminder system
        if (recommendation.includes('exercise') || recommendation.includes('walk')) {
            this.showNotification('💪 Consider setting a daily reminder for physical activity!', 'info');
        } else if (recommendation.includes('breathing') || recommendation.includes('meditation')) {
            this.showNotification('🧘‍♀️ Try the 4-7-8 breathing technique: Inhale for 4, hold for 7, exhale for 8.', 'info');
        }
    }

    showMentalHealthPage() {
        // Create mental health page if it doesn't exist
        if (!document.getElementById('mental-health-page')) {
            this.createMentalHealthPage();
        }

        // Navigate to the page
        if (window.glucoApp) {
            window.glucoApp.navigateTo('mental-health');
        }

        // Load data
        this.loadMoodData();
    }

    createMentalHealthPage() {
        const mentalHealthHTML = `
            <div id="mental-health-page" class="page">
                <header class="app-header">
                    <div class="container">
                        <h1>💙 Mental Health & Mood Tracking</h1>
                        <p class="page-subtitle">Track your daily mood and receive personalized emotional support</p>
                    </div>
                </header>
                
                <main class="container">
                    <!-- Daily Mood Input -->
                    <div class="card mood-input-card">
                        <div class="card-header">
                            <h3>💙 How are you feeling today?</h3>
                            <p>Select your current mood on the scale below. Your daily check-ins help track patterns and provide personalized support.</p>
                        </div>
                        
                        <!-- Today's mood status -->
                        <div id="today-mood-status" class="today-mood-status">
                            <div class="loading">Checking today's mood...</div>
                        </div>
                        
                        <div class="mood-scale">
                            <button class="mood-btn-large mood-btn" data-mood="1" title="Very Sad - Having a really tough day">
                                <span class="mood-emoji">😢</span>
                                <span class="mood-label">Very Sad</span>
                                <span class="mood-description">Really tough day</span>
                            </button>
                            <button class="mood-btn-large mood-btn" data-mood="2" title="Sad - Feeling down or low">
                                <span class="mood-emoji">😕</span>
                                <span class="mood-label">Sad</span>
                                <span class="mood-description">Feeling down</span>
                            </button>
                            <button class="mood-btn-large mood-btn" data-mood="3" title="Neutral - Feeling okay, neither good nor bad">
                                <span class="mood-emoji">😐</span>
                                <span class="mood-label">Neutral</span>
                                <span class="mood-description">Feeling okay</span>
                            </button>
                            <button class="mood-btn-large mood-btn" data-mood="4" title="Happy - Having a good day">
                                <span class="mood-emoji">😊</span>
                                <span class="mood-label">Happy</span>
                                <span class="mood-description">Good day</span>
                            </button>
                            <button class="mood-btn-large mood-btn" data-mood="5" title="Very Happy - Feeling fantastic and energetic">
                                <span class="mood-emoji">😄</span>
                                <span class="mood-label">Very Happy</span>
                                <span class="mood-description">Feeling fantastic</span>
                            </button>
                        </div>
                        
                        <!-- Mood scale indicator -->
                        <div class="mood-scale-indicator">
                            <div class="scale-line">
                                <div class="scale-marker" data-mood="1">1</div>
                                <div class="scale-marker" data-mood="2">2</div>
                                <div class="scale-marker" data-mood="3">3</div>
                                <div class="scale-marker" data-mood="4">4</div>
                                <div class="scale-marker" data-mood="5">5</div>
                            </div>
                            <div class="scale-labels">
                                <span>Low</span>
                                <span>High</span>
                            </div>
                        </div>
                        
                        <div id="mood-confirmation" class="mood-confirmation" style="display: none;"></div>
                        
                        <!-- Quick mood insights -->
                        <div class="quick-insights">
                            <div class="insight-tip">
                                <span class="tip-icon">💡</span>
                                <span class="tip-text">Tip: Regular mood tracking helps identify patterns and triggers in your emotional wellbeing.</span>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Mood History Visualization -->
                    <div class="card mood-history-card">
                        <div class="card-header">
                            <h3>📈 Mood History & Trends</h3>
                            <p>Visualize your mood patterns over time</p>
                        </div>
                        
                        <div id="mood-chart" class="mood-chart">
                            <div class="loading">Loading mood data...</div>
                        </div>
                    </div>
                    
                    <!-- Mood Analytics -->
                    <div class="card mood-analytics-card">
                        <div class="card-header">
                            <h3>🧠 Mood Analytics & Insights</h3>
                            <p>Understand your mood patterns and get personalized recommendations</p>
                        </div>
                        
                        <div id="mood-analytics" class="mood-analytics">
                            <div class="loading">Analyzing mood patterns...</div>
                        </div>
                    </div>
                    
                    <!-- Coping Strategies -->
                    <div class="card coping-strategies-card">
                        <div class="card-header">
                            <h3>🛠️ Coping Strategies</h3>
                            <p>Personalized strategies to help manage your emotions</p>
                        </div>
                        
                        <div id="coping-strategies" class="coping-strategies">
                            <button class="btn-primary" onclick="mentalHealthUI.loadCopingStrategies()">
                                Get Personalized Strategies
                            </button>
                        </div>
                    </div>
                </main>
            </div>
        `;
        
        document.getElementById('app').insertAdjacentHTML('beforeend', mentalHealthHTML);
    }

    async loadCopingStrategies() {
        const container = document.getElementById('coping-strategies');
        if (!container || !window.mentalHealthService) return;

        container.innerHTML = '<div class="loading">Generating personalized strategies...</div>';

        try {
            // Get recent mood to determine appropriate strategies
            const avgMood = window.mentalHealthService.getAverageMood(3) || 3;
            const moodLevel = Math.round(parseFloat(avgMood));
            
            const strategies = await window.mentalHealthService.generateCopingStrategies(moodLevel);
            
            let strategiesHTML = '<div class="strategies-list">';
            strategies.forEach((strategy, index) => {
                strategiesHTML += `
                    <div class="strategy-item">
                        <div class="strategy-number">${index + 1}</div>
                        <div class="strategy-text">${strategy}</div>
                    </div>
                `;
            });
            strategiesHTML += '</div>';
            
            strategiesHTML += `
                <div class="strategies-actions">
                    <button class="btn-secondary" onclick="mentalHealthUI.loadCopingStrategies()">
                        Get New Strategies
                    </button>
                </div>
            `;
            
            container.innerHTML = strategiesHTML;
            
        } catch (error) {
            console.error('Failed to load coping strategies:', error);
            container.innerHTML = `
                <div class="error-message">
                    <p>Unable to load coping strategies at the moment.</p>
                    <button class="btn-secondary" onclick="mentalHealthUI.loadCopingStrategies()">
                        Try Again
                    </button>
                </div>
            `;
        }
    }

    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Trigger animation
        setTimeout(() => notification.classList.add('show'), 100);
        
        // Auto-remove
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Initialize Mental Health UI
window.mentalHealthUI = new MentalHealthUI();
//# sourceMappingURL=mental-health-ui.js.map