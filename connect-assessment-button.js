// Connect the "Start Free Assessment" button to the actual WHO/ADA questionnaire
console.log('🔗 Connecting assessment button to WHO/ADA questionnaire...');

// Enhanced Risk Assessment Connection
class AssessmentButtonConnector {
    constructor() {
        this.init();
    }

    init() {
        this.connectAssessmentButton();
        this.ensureRiskAssessmentEngine();
    }

    connectAssessmentButton() {
        // Connect the hero button to the actual assessment
        const heroAssessmentBtn = document.getElementById('hero-start-assessment');
        if (heroAssessmentBtn) {
            // Remove any existing listeners
            const newBtn = heroAssessmentBtn.cloneNode(true);
            heroAssessmentBtn.parentNode.replaceChild(newBtn, heroAssessmentBtn);
            
            // Add the proper assessment launcher
            newBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('🎯 Hero Assessment Button Clicked - Launching WHO/ADA Questionnaire');
                this.launchWHOADAAssessment();
            });
            
            console.log('✅ Hero assessment button connected');
        }

        // Also connect navigation assessment button
        const navAssessmentBtn = document.getElementById('nav-get-started-btn');
        if (navAssessmentBtn) {
            const newNavBtn = navAssessmentBtn.cloneNode(true);
            navAssessmentBtn.parentNode.replaceChild(newNavBtn, navAssessmentBtn);
            
            newNavBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('🎯 Nav Assessment Button Clicked - Launching WHO/ADA Questionnaire');
                this.launchWHOADAAssessment();
            });
            
            console.log('✅ Navigation assessment button connected');
        }

        // Connect feature card assessment
        const assessmentCard = document.querySelector('.feature-card[data-feature="risk-assessment"]');
        if (assessmentCard) {
            const newCard = assessmentCard.cloneNode(true);
            assessmentCard.parentNode.replaceChild(newCard, assessmentCard);
            
            newCard.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('🎯 Assessment Card Clicked - Launching WHO/ADA Questionnaire');
                this.launchWHOADAAssessment();
            });
            
            console.log('✅ Assessment feature card connected');
        }
    }

    ensureRiskAssessmentEngine() {
        // Ensure the risk assessment engine is available
        if (!window.RiskAssessmentEngine) {
            console.log('📥 Loading Risk Assessment Engine...');
            this.loadRiskAssessmentEngine();
        }
    }

    loadRiskAssessmentEngine() {
        // Load the risk assessment script if not already loaded
        const script = document.createElement('script');
        script.src = 'js/risk-assessment.js';
        script.onload = () => {
            console.log('✅ Risk Assessment Engine loaded');
            window.riskAssessmentEngine = new RiskAssessmentEngine();
        };
        script.onerror = () => {
            console.warn('⚠️ Could not load risk assessment engine, using fallback');
            this.createFallbackAssessment();
        };
        document.head.appendChild(script);
    }

    launchWHOADAAssessment() {
        console.log('🚀 Launching WHO/ADA Diabetes Risk Assessment...');
        
        // Show loading notification
        this.showNotification('Loading WHO/ADA Risk Assessment...', 'info');
        
        // Close any existing modals
        this.closeAllModals();
        
        // Create the assessment interface
        setTimeout(() => {
            this.createAssessmentInterface();
        }, 500);
    }

    createAssessmentInterface() {
        // Create the full-screen assessment interface
        const assessmentHTML = `
            <div id="risk-assessment-modal" class="assessment-modal-overlay active">
                <div class="assessment-container">
                    <div class="assessment-header">
                        <div class="assessment-title">
                            <h1>🎯 WHO/ADA Diabetes Risk Assessment</h1>
                            <p class="assessment-subtitle">Evidence-based screening questionnaire following international medical guidelines</p>
                        </div>
                        <button class="assessment-close" onclick="window.assessmentConnector.closeAssessment()">&times;</button>
                    </div>
                    
                    <div class="assessment-progress-container">
                        <div class="progress-info">
                            <span class="progress-text">Question <span id="current-question">1</span> of <span id="total-questions">8</span></span>
                            <span class="progress-percentage"><span id="progress-percent">12</span>%</span>
                        </div>
                        <div class="progress-bar-container">
                            <div class="progress-bar" id="assessment-progress" style="width: 12.5%"></div>
                        </div>
                    </div>
                    
                    <div class="assessment-content" id="assessment-content">
                        <!-- Questions will be loaded here -->
                    </div>
                    
                    <div class="assessment-navigation">
                        <button class="btn-secondary" id="prev-question" style="display: none;">Previous</button>
                        <button class="btn-primary" id="next-question" disabled>Next</button>
                    </div>
                    
                    <div class="assessment-result" id="assessment-result" style="display: none;">
                        <div id="risk-result-display">
                            <!-- Results will be displayed here -->
                        </div>
                        <div id="ai-explanation">
                            <!-- AI explanation will be loaded here -->
                        </div>
                        <div class="result-actions">
                            <button class="btn-primary" id="save-assessment">Save Results</button>
                            <button class="btn-secondary" id="retake-assessment">Retake Assessment</button>
                            <button class="btn-outline" onclick="window.assessmentConnector.closeAssessment()">Close</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Add to page
        document.body.insertAdjacentHTML('beforeend', assessmentHTML);
        
        // Prevent body scroll
        document.body.style.overflow = 'hidden';
        
        // Initialize the assessment engine
        this.initializeAssessment();
        
        console.log('✅ WHO/ADA Assessment Interface Created');
    }

    initializeAssessment() {
        // Initialize or use existing risk assessment engine
        if (window.RiskAssessmentEngine) {
            if (!window.riskAssessmentEngine) {
                window.riskAssessmentEngine = new RiskAssessmentEngine();
            }
            window.riskAssessmentEngine.startAssessment();
        } else {
            // Use fallback assessment
            this.startFallbackAssessment();
        }
    }

    startFallbackAssessment() {
        console.log('🔄 Starting fallback assessment...');
        
        // WHO/ADA Questions (fallback implementation)
        this.questions = [
            {
                id: 'age',
                question: 'What is your age?',
                options: [
                    { value: 0, text: 'Under 45 years', points: 0 },
                    { value: 2, text: '45-54 years', points: 2 },
                    { value: 3, text: '55-64 years', points: 3 },
                    { value: 4, text: '65 years or older', points: 4 }
                ]
            },
            {
                id: 'gender',
                question: 'What is your gender?',
                options: [
                    { value: 0, text: 'Female', points: 0 },
                    { value: 1, text: 'Male', points: 1 }
                ]
            },
            {
                id: 'family_history',
                question: 'Do you have a family history of diabetes?',
                options: [
                    { value: 0, text: 'No family history', points: 0 },
                    { value: 2, text: 'Grandparent, aunt, uncle, or first cousin with diabetes', points: 2 },
                    { value: 5, text: 'Parent, brother, or sister with diabetes', points: 5 }
                ]
            },
            {
                id: 'high_blood_pressure',
                question: 'Have you ever been told by a doctor that you have high blood pressure?',
                options: [
                    { value: 0, text: 'No', points: 0 },
                    { value: 2, text: 'Yes', points: 2 }
                ]
            },
            {
                id: 'physical_activity',
                question: 'Are you physically active?',
                description: 'Physical activity includes 30 minutes of brisk walking or similar activity most days of the week.',
                options: [
                    { value: 2, text: 'No, I am not physically active', points: 2 },
                    { value: 0, text: 'Yes, I am physically active', points: 0 }
                ]
            },
            {
                id: 'bmi',
                question: 'What is your Body Mass Index (BMI) category?',
                description: 'BMI = weight (kg) / height (m)². You can calculate this or estimate based on your build.',
                options: [
                    { value: 0, text: 'Normal weight (BMI < 25)', points: 0 },
                    { value: 1, text: 'Overweight (BMI 25-29.9)', points: 1 },
                    { value: 3, text: 'Obese (BMI ≥ 30)', points: 3 }
                ]
            },
            {
                id: 'gestational_diabetes',
                question: 'For women: Have you ever been diagnosed with gestational diabetes?',
                options: [
                    { value: 0, text: 'No / Not applicable (male)', points: 0 },
                    { value: 1, text: 'Yes', points: 1 }
                ]
            },
            {
                id: 'prediabetes',
                question: 'Have you ever been told you have prediabetes or borderline diabetes?',
                options: [
                    { value: 0, text: 'No', points: 0 },
                    { value: 5, text: 'Yes', points: 5 }
                ]
            }
        ];

        this.currentQuestionIndex = 0;
        this.responses = {};
        this.renderCurrentQuestion();
        this.setupFallbackNavigation();
    }

    renderCurrentQuestion() {
        const question = this.questions[this.currentQuestionIndex];
        const content = document.getElementById('assessment-content');
        
        if (!content) return;

        const questionHTML = `
            <div class="question-container">
                <div class="question-header">
                    <h3 class="question-text">${question.question}</h3>
                    ${question.description ? `<p class="question-description">${question.description}</p>` : ''}
                </div>
                
                <div class="response-options">
                    ${question.options.map((option, index) => `
                        <label class="response-option">
                            <input type="radio" 
                                   name="assessment-response" 
                                   value="${option.value}"
                                   ${this.responses[question.id] == option.value ? 'checked' : ''}>
                            <span class="option-content">
                                <span class="option-text">${option.text}</span>
                                <span class="option-points">+${option.points} points</span>
                            </span>
                        </label>
                    `).join('')}
                </div>
            </div>
        `;

        content.innerHTML = questionHTML;
        this.updateProgress();
        this.updateNavigationButtons();
    }

    setupFallbackNavigation() {
        // Response selection
        document.addEventListener('change', (e) => {
            if (e.target.name === 'assessment-response') {
                const question = this.questions[this.currentQuestionIndex];
                this.responses[question.id] = parseInt(e.target.value);
                
                // Enable next button
                const nextBtn = document.getElementById('next-question');
                if (nextBtn) {
                    nextBtn.disabled = false;
                    nextBtn.textContent = this.currentQuestionIndex === this.questions.length - 1 ? 'Calculate Risk' : 'Next';
                }
            }
        });

        // Navigation buttons
        document.getElementById('next-question')?.addEventListener('click', () => {
            this.nextQuestion();
        });

        document.getElementById('prev-question')?.addEventListener('click', () => {
            this.previousQuestion();
        });
    }

    nextQuestion() {
        const question = this.questions[this.currentQuestionIndex];
        
        // Validate response
        if (this.responses[question.id] === undefined) {
            this.showNotification('Please select an answer before continuing.', 'warning');
            return;
        }

        if (this.currentQuestionIndex < this.questions.length - 1) {
            this.currentQuestionIndex++;
            this.renderCurrentQuestion();
        } else {
            // Assessment complete
            this.calculateAndShowResults();
        }
    }

    previousQuestion() {
        if (this.currentQuestionIndex > 0) {
            this.currentQuestionIndex--;
            this.renderCurrentQuestion();
        }
    }

    updateProgress() {
        const currentQ = document.getElementById('current-question');
        const totalQ = document.getElementById('total-questions');
        const progressPercent = document.getElementById('progress-percent');
        const progressBar = document.getElementById('assessment-progress');
        
        const progress = ((this.currentQuestionIndex + 1) / this.questions.length) * 100;
        
        if (currentQ) currentQ.textContent = this.currentQuestionIndex + 1;
        if (totalQ) totalQ.textContent = this.questions.length;
        if (progressPercent) progressPercent.textContent = Math.round(progress);
        if (progressBar) progressBar.style.width = `${progress}%`;
    }

    updateNavigationButtons() {
        const prevBtn = document.getElementById('prev-question');
        const nextBtn = document.getElementById('next-question');
        
        if (prevBtn) {
            prevBtn.style.display = this.currentQuestionIndex > 0 ? 'inline-block' : 'none';
        }
        
        if (nextBtn) {
            const question = this.questions[this.currentQuestionIndex];
            const hasResponse = this.responses[question.id] !== undefined;
            nextBtn.disabled = !hasResponse;
            nextBtn.textContent = this.currentQuestionIndex === this.questions.length - 1 ? 'Calculate Risk' : 'Next';
        }
    }

    calculateAndShowResults() {
        // Calculate total score
        let totalScore = 0;
        this.questions.forEach(question => {
            const response = this.responses[question.id];
            if (response !== undefined) {
                totalScore += response;
            }
        });

        // Determine risk category
        const riskCategory = this.getRiskCategory(totalScore);
        const categoryInfo = this.getRiskCategoryInfo(riskCategory);

        // Hide assessment form and show results
        document.querySelector('.assessment-content').style.display = 'none';
        document.querySelector('.assessment-navigation').style.display = 'none';
        document.getElementById('assessment-result').style.display = 'block';

        // Display results
        const resultDisplay = document.getElementById('risk-result-display');
        resultDisplay.innerHTML = `
            <div class="risk-result-container">
                <div class="risk-score-display">
                    <div class="risk-score-number" style="color: ${categoryInfo.color}">
                        ${totalScore}
                    </div>
                    <div class="risk-category-badge" style="background-color: ${categoryInfo.color}">
                        ${riskCategory} Risk
                    </div>
                </div>
                
                <div class="risk-explanation">
                    <h4>What this means:</h4>
                    <p>${categoryInfo.description}</p>
                    <p><strong>Recommendation:</strong> ${categoryInfo.recommendation}</p>
                </div>
                
                <div class="risk-factors-summary">
                    <h4>Your Risk Factors:</h4>
                    <div class="factors-list">
                        ${this.generateRiskFactorsSummary(totalScore)}
                    </div>
                </div>
            </div>
        `;

        // Show completion notification
        this.showNotification('Assessment completed! Review your results below.', 'success');
        
        console.log(`✅ Assessment completed - Score: ${totalScore}, Category: ${riskCategory}`);
    }

    getRiskCategory(score) {
        if (score < 3) return 'Low';
        if (score < 10) return 'Increased';
        if (score < 15) return 'High';
        return 'Possible Diabetes';
    }

    getRiskCategoryInfo(category) {
        const categoryInfo = {
            'Low': {
                color: '#28a745',
                description: 'Your risk of developing type 2 diabetes is low.',
                recommendation: 'Continue maintaining a healthy lifestyle with regular exercise and balanced nutrition.'
            },
            'Increased': {
                color: '#ffc107',
                description: 'You have an increased risk of developing type 2 diabetes.',
                recommendation: 'Consider lifestyle modifications including regular physical activity and healthy eating habits.'
            },
            'High': {
                color: '#fd7e14',
                description: 'You have a high risk of developing type 2 diabetes.',
                recommendation: 'It is recommended to consult with a healthcare provider for further evaluation and guidance.'
            },
            'Possible Diabetes': {
                color: '#dc3545',
                description: 'You may already have diabetes or prediabetes.',
                recommendation: 'Please consult with a healthcare provider immediately for proper testing and diagnosis.'
            }
        };

        return categoryInfo[category] || categoryInfo['Increased'];
    }

    generateRiskFactorsSummary(totalScore) {
        const factors = [];
        
        this.questions.forEach(question => {
            const response = this.responses[question.id];
            if (response > 0) {
                const option = question.options.find(opt => opt.value === response);
                factors.push(`
                    <div class="risk-factor-item">
                        <span class="factor-points">+${response}</span>
                        <span class="factor-description">${option.text}</span>
                    </div>
                `);
            }
        });

        if (factors.length === 0) {
            return '<div class="no-risk-factors">No significant risk factors identified. Great job maintaining healthy habits!</div>';
        }

        return factors.join('');
    }

    closeAssessment() {
        const modal = document.getElementById('risk-assessment-modal');
        if (modal) {
            modal.remove();
        }
        document.body.style.overflow = '';
        console.log('🔒 Assessment closed');
    }

    closeAllModals() {
        document.querySelectorAll('.modal-overlay, .assessment-modal-overlay').forEach(modal => {
            modal.remove();
        });
    }

    showNotification(message, type = 'info') {
        // Remove existing notifications
        document.querySelectorAll('.assessment-notification').forEach(n => n.remove());
        
        const notification = document.createElement('div');
        notification.className = `assessment-notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: ${type === 'success' ? '#27ae60' : type === 'error' ? '#e74c3c' : type === 'warning' ? '#f39c12' : '#3498db'};
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            z-index: 10001;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            font-weight: 600;
            max-width: 300px;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => notification.remove(), 300);
        }, 4000);
    }
}

// Add assessment-specific styles
const assessmentStyles = `
<style id="assessment-modal-styles">
.assessment-modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0,0,0,0.9);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s ease;
}

.assessment-modal-overlay.active {
    opacity: 1;
    visibility: visible;
}

.assessment-container {
    background: white;
    border-radius: 16px;
    width: 90%;
    max-width: 800px;
    max-height: 90vh;
    overflow-y: auto;
    transform: scale(0.9);
    transition: transform 0.3s ease;
}

.assessment-modal-overlay.active .assessment-container {
    transform: scale(1);
}

.assessment-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 30px 30px 20px;
    border-bottom: 2px solid #f0f0f0;
}

.assessment-title h1 {
    margin: 0 0 10px 0;
    color: #2c3e50;
    font-size: 1.8rem;
}

.assessment-subtitle {
    color: #7f8c8d;
    margin: 0;
    font-size: 1rem;
}

.assessment-close {
    background: none;
    border: none;
    font-size: 2rem;
    cursor: pointer;
    color: #7f8c8d;
    padding: 0;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: all 0.2s ease;
}

.assessment-close:hover {
    background: #f8f9fa;
    color: #2c3e50;
}

.assessment-progress-container {
    padding: 20px 30px;
    background: #f8f9fa;
}

.progress-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
    font-weight: 600;
    color: #2c3e50;
}

.progress-bar-container {
    background: #e9ecef;
    border-radius: 10px;
    height: 8px;
    overflow: hidden;
}

.progress-bar {
    background: linear-gradient(90deg, #007FFF, #0066CC);
    height: 100%;
    border-radius: 10px;
    transition: width 0.3s ease;
}

.assessment-content {
    padding: 30px;
}

.question-container {
    max-width: 600px;
    margin: 0 auto;
}

.question-header {
    text-align: center;
    margin-bottom: 30px;
}

.question-text {
    font-size: 1.4rem;
    color: #2c3e50;
    margin-bottom: 10px;
    line-height: 1.4;
}

.question-description {
    color: #7f8c8d;
    font-style: italic;
    margin: 0;
}

.response-options {
    display: flex;
    flex-direction: column;
    gap: 15px;
}

.response-option {
    display: flex;
    align-items: center;
    padding: 20px;
    border: 2px solid #e9ecef;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s ease;
    background: white;
}

.response-option:hover {
    border-color: #007FFF;
    background: #f8f9ff;
}

.response-option input[type="radio"] {
    margin-right: 15px;
    transform: scale(1.2);
}

.response-option input[type="radio"]:checked + .option-content {
    color: #007FFF;
    font-weight: 600;
}

.response-option:has(input:checked) {
    border-color: #007FFF;
    background: #f8f9ff;
}

.option-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
}

.option-text {
    flex: 1;
}

.option-points {
    color: #007FFF;
    font-weight: 600;
    font-size: 0.9rem;
}

.assessment-navigation {
    display: flex;
    justify-content: space-between;
    padding: 20px 30px 30px;
    border-top: 1px solid #f0f0f0;
}

.assessment-navigation button {
    padding: 12px 24px;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 1rem;
}

.btn-primary {
    background: #007FFF;
    color: white;
}

.btn-primary:hover:not(:disabled) {
    background: #0066CC;
    transform: translateY(-1px);
}

.btn-primary:disabled {
    background: #bdc3c7;
    cursor: not-allowed;
}

.btn-secondary {
    background: #6c757d;
    color: white;
}

.btn-secondary:hover {
    background: #5a6268;
    transform: translateY(-1px);
}

.btn-outline {
    background: transparent;
    color: #007FFF;
    border: 2px solid #007FFF;
}

.btn-outline:hover {
    background: #007FFF;
    color: white;
}

.assessment-result {
    padding: 30px;
}

.risk-result-container {
    text-align: center;
    max-width: 600px;
    margin: 0 auto;
}

.risk-score-display {
    margin-bottom: 30px;
}

.risk-score-number {
    font-size: 4rem;
    font-weight: 800;
    margin-bottom: 10px;
}

.risk-category-badge {
    display: inline-block;
    padding: 10px 20px;
    border-radius: 25px;
    color: white;
    font-weight: 600;
    font-size: 1.1rem;
}

.risk-explanation {
    background: #f8f9fa;
    padding: 25px;
    border-radius: 12px;
    margin-bottom: 30px;
    text-align: left;
}

.risk-explanation h4 {
    color: #2c3e50;
    margin-bottom: 15px;
}

.risk-explanation p {
    margin-bottom: 10px;
    line-height: 1.6;
}

.risk-factors-summary {
    text-align: left;
}

.risk-factors-summary h4 {
    color: #2c3e50;
    margin-bottom: 15px;
}

.risk-factor-item {
    display: flex;
    align-items: center;
    padding: 10px;
    margin-bottom: 8px;
    background: #f8f9fa;
    border-radius: 8px;
}

.factor-points {
    background: #007FFF;
    color: white;
    padding: 4px 8px;
    border-radius: 12px;
    font-weight: 600;
    font-size: 0.8rem;
    margin-right: 12px;
    min-width: 40px;
    text-align: center;
}

.factor-description {
    flex: 1;
    color: #2c3e50;
}

.no-risk-factors {
    text-align: center;
    color: #27ae60;
    font-weight: 600;
    padding: 20px;
    background: #f0fff4;
    border-radius: 8px;
}

.result-actions {
    display: flex;
    gap: 15px;
    justify-content: center;
    margin-top: 30px;
    flex-wrap: wrap;
}

@media (max-width: 768px) {
    .assessment-container {
        width: 95%;
        margin: 20px;
        max-height: calc(100vh - 40px);
    }
    
    .assessment-header {
        padding: 20px 20px 15px;
    }
    
    .assessment-title h1 {
        font-size: 1.5rem;
    }
    
    .assessment-content {
        padding: 20px;
    }
    
    .question-text {
        font-size: 1.2rem;
    }
    
    .response-option {
        padding: 15px;
    }
    
    .option-content {
        flex-direction: column;
        align-items: flex-start;
        gap: 5px;
    }
    
    .assessment-navigation {
        padding: 15px 20px 20px;
        flex-direction: column;
        gap: 10px;
    }
    
    .result-actions {
        flex-direction: column;
    }
    
    .result-actions button {
        width: 100%;
    }
}
</style>
`;

// Add styles to page
document.head.insertAdjacentHTML('beforeend', assessmentStyles);

// Initialize the connector
window.assessmentConnector = new AssessmentButtonConnector();

console.log('✅ Assessment button successfully connected to WHO/ADA questionnaire!');