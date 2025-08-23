// GlucoBalance - WHO/ADA-Compliant Risk Assessment Engine
class RiskAssessmentEngine {
    constructor() {
        this.currentQuestionIndex = 0;
        this.responses = {};
        this.assessmentData = null;
        this.questions = this.getWHOADAQuestions();
        this.init();
    }

    init() {
        this.setupEventListeners();
    }

    // WHO/ADA-compliant diabetes risk assessment questions
    getWHOADAQuestions() {
        return [
            {
                id: 'age',
                question: 'What is your age?',
                type: 'select',
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
                type: 'select',
                options: [
                    { value: 0, text: 'Female', points: 0 },
                    { value: 1, text: 'Male', points: 1 }
                ]
            },
            {
                id: 'family_history',
                question: 'Do you have a family history of diabetes?',
                type: 'select',
                options: [
                    { value: 0, text: 'No family history', points: 0 },
                    { value: 2, text: 'Grandparent, aunt, uncle, or first cousin with diabetes', points: 2 },
                    { value: 5, text: 'Parent, brother, or sister with diabetes', points: 5 }
                ]
            },
            {
                id: 'high_blood_pressure',
                question: 'Have you ever been told by a doctor that you have high blood pressure?',
                type: 'select',
                options: [
                    { value: 0, text: 'No', points: 0 },
                    { value: 2, text: 'Yes', points: 2 }
                ]
            },
            {
                id: 'physical_activity',
                question: 'Are you physically active?',
                type: 'select',
                options: [
                    { value: 2, text: 'No, I am not physically active', points: 2 },
                    { value: 0, text: 'Yes, I am physically active', points: 0 }
                ],
                description: 'Physical activity includes 30 minutes of brisk walking or similar activity most days of the week.'
            },
            {
                id: 'bmi',
                question: 'What is your Body Mass Index (BMI) category?',
                type: 'select',
                options: [
                    { value: 0, text: 'Normal weight (BMI < 25)', points: 0 },
                    { value: 1, text: 'Overweight (BMI 25-29.9)', points: 1 },
                    { value: 3, text: 'Obese (BMI ≥ 30)', points: 3 }
                ],
                description: 'BMI = weight (kg) / height (m)². You can calculate this or estimate based on your build.'
            },
            {
                id: 'gestational_diabetes',
                question: 'For women: Have you ever been diagnosed with gestational diabetes?',
                type: 'select',
                options: [
                    { value: 0, text: 'No / Not applicable (male)', points: 0 },
                    { value: 1, text: 'Yes', points: 1 }
                ]
            },
            {
                id: 'prediabetes',
                question: 'Have you ever been told you have prediabetes or borderline diabetes?',
                type: 'select',
                options: [
                    { value: 0, text: 'No', points: 0 },
                    { value: 5, text: 'Yes', points: 5 }
                ]
            }
        ];
    }

    setupEventListeners() {
        // Assessment navigation
        document.addEventListener('click', (e) => {
            if (e.target.id === 'next-question') {
                this.nextQuestion();
            } else if (e.target.id === 'prev-question') {
                this.previousQuestion();
            } else if (e.target.id === 'save-assessment') {
                this.saveAssessment();
            } else if (e.target.id === 'retake-assessment') {
                this.restartAssessment();
            }
        });

        // Response selection
        document.addEventListener('change', (e) => {
            if (e.target.name === 'assessment-response') {
                this.recordResponse(e.target.value);
            }
        });
    }

    startAssessment() {
        this.currentQuestionIndex = 0;
        this.responses = {};
        this.startTime = Date.now(); // Track start time for completion analytics
        this.renderQuestion();
        this.updateProgress();
        
        // Track assessment start
        if (window.analytics) {
            window.analytics.track('risk_assessment_started');
        }
    }

    renderQuestion() {
        const question = this.questions[this.currentQuestionIndex];
        const content = document.getElementById('assessment-content');
        
        if (!content) return;

        const questionHTML = `
            <div class="question-container">
                <div class="question-number">Question ${this.currentQuestionIndex + 1} of ${this.questions.length}</div>
                <h3 class="question-text">${question.question}</h3>
                ${question.description ? `<p class="question-description">${question.description}</p>` : ''}
                
                <div class="response-options">
                    ${question.options.map((option, index) => `
                        <label class="response-option">
                            <input type="radio" 
                                   name="assessment-response" 
                                   value="${option.value}"
                                   ${this.responses[question.id] == option.value ? 'checked' : ''}>
                            <span class="option-text">${option.text}</span>
                        </label>
                    `).join('')}
                </div>
            </div>
        `;

        content.innerHTML = questionHTML;
        this.updateNavigationButtons();
    }

    recordResponse(value) {
        const question = this.questions[this.currentQuestionIndex];
        this.responses[question.id] = parseInt(value);
        
        // Enable next button
        const nextBtn = document.getElementById('next-question');
        if (nextBtn) {
            nextBtn.disabled = false;
            nextBtn.textContent = this.currentQuestionIndex === this.questions.length - 1 ? 'Calculate Risk' : 'Next';
        }
    }

    nextQuestion() {
        const question = this.questions[this.currentQuestionIndex];
        
        // Validate response
        if (this.responses[question.id] === undefined) {
            this.showError('Please select an answer before continuing.');
            return;
        }

        if (this.currentQuestionIndex < this.questions.length - 1) {
            this.currentQuestionIndex++;
            this.renderQuestion();
            this.updateProgress();
        } else {
            // Assessment complete
            this.calculateRisk();
        }
    }

    previousQuestion() {
        if (this.currentQuestionIndex > 0) {
            this.currentQuestionIndex--;
            this.renderQuestion();
            this.updateProgress();
        }
    }

    updateNavigationButtons() {
        const prevBtn = document.getElementById('prev-question');
        const nextBtn = document.getElementById('next-question');
        
        if (prevBtn) {
            prevBtn.style.display = this.currentQuestionIndex > 0 ? 'inline-block' : 'none';
        }
        
        if (nextBtn) {
            const hasResponse = this.responses[this.questions[this.currentQuestionIndex].id] !== undefined;
            nextBtn.disabled = !hasResponse;
            nextBtn.textContent = this.currentQuestionIndex === this.questions.length - 1 ? 'Calculate Risk' : 'Next';
        }
    }

    updateProgress() {
        const progressBar = document.getElementById('assessment-progress');
        if (progressBar) {
            const progress = ((this.currentQuestionIndex + 1) / this.questions.length) * 100;
            progressBar.style.width = `${progress}%`;
        }
    }

    calculateRisk() {
        // Calculate total risk score based on WHO/ADA guidelines
        let totalScore = 0;
        
        this.questions.forEach(question => {
            const response = this.responses[question.id];
            if (response !== undefined) {
                totalScore += response;
            }
        });

        // Determine risk category based on score
        const riskCategory = this.getRiskCategory(totalScore);
        
        // Create assessment data
        this.assessmentData = {
            score: totalScore,
            category: riskCategory,
            responses: { ...this.responses },
            date: new Date().toISOString(),
            questionResponses: this.questions.map(q => ({
                questionId: q.id,
                question: q.question,
                response: this.responses[q.id],
                selectedOption: q.options.find(opt => opt.value === this.responses[q.id])?.text || 'Not answered'
            }))
        };

        this.displayResults();
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

    displayResults() {
        const assessmentForm = document.querySelector('.assessment-form');
        const resultContainer = document.getElementById('assessment-result');
        const resultDisplay = document.getElementById('risk-result-display');
        
        if (!resultContainer || !resultDisplay) return;

        const categoryInfo = this.getRiskCategoryInfo(this.assessmentData.category);

        // Hide assessment form and show results
        if (assessmentForm) {
            assessmentForm.style.display = 'none';
        }
        
        resultContainer.style.display = 'block';

        // Generate results HTML
        const resultsHTML = `
            <div class="risk-result">
                <div class="risk-score-display">
                    <div class="risk-score-number" style="color: ${categoryInfo.color}">
                        ${this.assessmentData.score}
                    </div>
                    <div class="risk-category-badge" style="background-color: ${categoryInfo.color}">
                        ${this.assessmentData.category} Risk
                    </div>
                </div>
                
                <div class="risk-explanation">
                    <h4>What this means:</h4>
                    <p>${categoryInfo.description}</p>
                    <p><strong>Recommendation:</strong> ${categoryInfo.recommendation}</p>
                </div>
                
                <div class="risk-factors-breakdown">
                    <h4>Your Risk Factors:</h4>
                    <div class="factors-list">
                        ${this.generateRiskFactorsBreakdown()}
                    </div>
                </div>
            </div>
        `;

        resultDisplay.innerHTML = resultsHTML;

        // Generate AI explanation
        this.generateAIExplanation();
    }

    generateRiskFactorsBreakdown() {
        const riskFactors = this.assessmentData.questionResponses
            .filter(qr => qr.response > 0)
            .map(qr => {
                const question = this.questions.find(q => q.id === qr.questionId);
                const option = question.options.find(opt => opt.value === qr.response);
                const impact = this.getRiskFactorImpact(qr.questionId, qr.response);
                const explanation = this.getRiskFactorExplanation(qr.questionId, qr.response);
                
                return `
                    <div class="risk-factor-item" data-impact="${impact.level}">
                        <div class="factor-header">
                            <span class="factor-points impact-${impact.level}">+${qr.response}</span>
                            <span class="factor-title">${this.getRiskFactorTitle(qr.questionId)}</span>
                            <span class="factor-impact-badge ${impact.level}">${impact.label}</span>
                        </div>
                        <div class="factor-description">${qr.selectedOption}</div>
                        <div class="factor-explanation">${explanation}</div>
                    </div>
                `;
            });

        if (riskFactors.length === 0) {
            return '<div class="no-risk-factors">No significant risk factors identified. Great job maintaining healthy habits!</div>';
        }

        return riskFactors.join('');
    }

    getRiskFactorTitle(factorId) {
        const titles = {
            'age': 'Age Factor',
            'gender': 'Gender',
            'family_history': 'Family History',
            'high_blood_pressure': 'Blood Pressure',
            'physical_activity': 'Physical Activity',
            'bmi': 'Body Weight',
            'gestational_diabetes': 'Gestational Diabetes',
            'prediabetes': 'Prediabetes History'
        };
        return titles[factorId] || 'Risk Factor';
    }

    getRiskFactorImpact(factorId, points) {
        // Determine impact level based on factor type and points
        const impacts = {
            'age': points >= 4 ? { level: 'high', label: 'High Impact' } : { level: 'moderate', label: 'Moderate Impact' },
            'gender': { level: 'low', label: 'Low Impact' },
            'family_history': points >= 5 ? { level: 'high', label: 'High Impact' } : { level: 'moderate', label: 'Moderate Impact' },
            'high_blood_pressure': { level: 'moderate', label: 'Moderate Impact' },
            'physical_activity': { level: 'moderate', label: 'Modifiable' },
            'bmi': points >= 3 ? { level: 'high', label: 'High Impact' } : { level: 'moderate', label: 'Moderate Impact' },
            'gestational_diabetes': { level: 'moderate', label: 'Moderate Impact' },
            'prediabetes': { level: 'high', label: 'High Impact' }
        };
        
        return impacts[factorId] || { level: 'moderate', label: 'Moderate Impact' };
    }

    getRiskFactorExplanation(factorId, points) {
        const explanations = {
            'age': 'Age is a non-modifiable risk factor. As we age, our body\'s ability to process glucose naturally decreases.',
            'gender': 'Males have a slightly higher risk of developing type 2 diabetes, though lifestyle factors are more important.',
            'family_history': 'Genetics play a role in diabetes risk, but lifestyle choices can significantly influence whether you develop the condition.',
            'high_blood_pressure': 'High blood pressure often occurs alongside insulin resistance and can be improved with lifestyle changes.',
            'physical_activity': 'Regular physical activity is one of the most effective ways to prevent diabetes. Even small increases in activity can make a big difference.',
            'bmi': 'Maintaining a healthy weight reduces insulin resistance. Even a 5-10% weight loss can significantly lower diabetes risk.',
            'gestational_diabetes': 'Having gestational diabetes increases future diabetes risk, but this can be managed with healthy lifestyle choices.',
            'prediabetes': 'Prediabetes is a strong predictor of future diabetes, but it\'s also an opportunity - lifestyle changes can prevent or delay type 2 diabetes.'
        };
        
        return explanations[factorId] || 'This factor contributes to your overall diabetes risk assessment.';
    }

    async generateAIExplanation() {
        const aiExplanationDiv = document.getElementById('ai-explanation');
        if (!aiExplanationDiv) return;

        // Show enhanced loading state with progress
        aiExplanationDiv.innerHTML = `
            <div class="ai-explanation-loading">
                <div class="ai-loading-animation">
                    <div class="loading-brain">
                        <div class="brain-pulse"></div>
                        <div class="brain-icon">🧠</div>
                    </div>
                    <div class="loading-steps">
                        <div class="loading-step active">Analyzing your responses...</div>
                        <div class="loading-step">Consulting medical guidelines...</div>
                        <div class="loading-step">Generating personalized insights...</div>
                        <div class="loading-step">Creating action plan...</div>
                    </div>
                </div>
            </div>
        `;

        // Animate loading steps
        this.animateLoadingSteps();

        try {
            // Generate comprehensive AI explanation and recommendations
            let explanation, recommendations, emotionalSupport;
            
            if (window.aiService && window.aiService.gemini.initialized) {
                // Get AI-powered explanation with enhanced prompting
                explanation = await this.generateEnhancedAIExplanation();
                
                // Get personalized recommendations
                recommendations = await this.generatePersonalizedRecommendations();
                
                // Get emotional support message
                emotionalSupport = await this.generateEmotionalSupport();
            } else {
                explanation = this.getFallbackExplanation();
                recommendations = this.getFallbackRecommendations();
                emotionalSupport = this.getFallbackEmotionalSupport();
            }

            // Display comprehensive AI insights with enhanced UI
            aiExplanationDiv.innerHTML = `
                <div class="ai-insights-container">
                    <div class="emotional-support-card">
                        <div class="support-icon">💙</div>
                        <div class="support-content">
                            <h4>A Message for You</h4>
                            <p class="support-text">${emotionalSupport}</p>
                        </div>
                    </div>
                    
                    <div class="ai-explanation-card">
                        <div class="card-header">
                            <div class="ai-badge">
                                <span class="ai-icon">🤖</span>
                                <span>AI Health Insights</span>
                            </div>
                            <div class="confidence-indicator">
                                <span class="confidence-label">Analysis Confidence:</span>
                                <div class="confidence-bar">
                                    <div class="confidence-fill" style="width: ${this.getConfidenceLevel()}%"></div>
                                </div>
                                <span class="confidence-value">${this.getConfidenceLevel()}%</span>
                            </div>
                        </div>
                        <div class="ai-content">
                            <div class="explanation-text">${explanation}</div>
                        </div>
                    </div>
                    
                    <div class="action-plan-card">
                        <div class="card-header">
                            <h4>💡 Your Personalized Action Plan</h4>
                            <div class="plan-priority">
                                <span class="priority-badge ${this.getPriorityLevel()}">${this.getPriorityLabel()}</span>
                            </div>
                        </div>
                        <div class="recommendations-content">
                            ${recommendations}
                        </div>
                        <div class="action-buttons">
                            <button class="btn-primary" id="create-health-plan">Create My Health Plan</button>
                            <button class="btn-secondary" id="share-results">Share with Doctor</button>
                        </div>
                    </div>
                    
                    <div class="risk-factors-visualization">
                        <h4>🎯 Your Risk Factor Breakdown</h4>
                        <div class="factors-chart">
                            ${this.generateRiskFactorsChart()}
                        </div>
                    </div>
                    
                    <div class="transparency-card">
                        <div class="transparency-header">
                            <h5>🔍 Understanding Your Assessment</h5>
                            <button class="btn-link expand-toggle" id="toggle-methodology">
                                <span class="toggle-text">Show Details</span>
                                <span class="toggle-icon">▼</span>
                            </button>
                        </div>
                        <div class="transparency-content collapsed" id="methodology-content">
                            <div class="methodology-summary">
                                <p>Your risk score of <strong>${this.assessmentData.score}</strong> is calculated using evidence-based WHO/ADA guidelines. Each factor is weighted according to extensive medical research on diabetes risk prediction.</p>
                                
                                <div class="score-breakdown">
                                    <h6>Score Breakdown:</h6>
                                    ${this.generateScoreBreakdown()}
                                </div>
                                
                                <div class="guidelines-info">
                                    <h6>Medical Guidelines:</h6>
                                    <ul>
                                        <li>Based on WHO Global Diabetes Risk Assessment</li>
                                        <li>Aligned with ADA Prevention Guidelines</li>
                                        <li>Validated through clinical studies</li>
                                        <li>Updated with latest medical research</li>
                                    </ul>
                                </div>
                                
                                <div class="disclaimer">
                                    <p><strong>Important:</strong> This assessment is for educational purposes and should not replace professional medical advice. Always consult with healthcare providers for medical decisions.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            // Store explanation in assessment data
            this.assessmentData.aiExplanation = explanation;
            this.assessmentData.aiRecommendations = recommendations;
            this.assessmentData.emotionalSupport = emotionalSupport;

            // Setup interactive elements
            this.setupInteractiveElements();

        } catch (error) {
            console.error('Failed to generate AI explanation:', error);
            
            // Show enhanced fallback with better error handling
            this.showFallbackExplanation(aiExplanationDiv, error);
        }
    }

    animateLoadingSteps() {
        const steps = document.querySelectorAll('.loading-step');
        let currentStep = 0;
        
        const animateStep = () => {
            if (currentStep < steps.length) {
                steps[currentStep].classList.add('active');
                if (currentStep > 0) {
                    steps[currentStep - 1].classList.remove('active');
                    steps[currentStep - 1].classList.add('completed');
                }
                currentStep++;
                setTimeout(animateStep, 800);
            }
        };
        
        setTimeout(animateStep, 500);
    }

    async generateEnhancedAIExplanation() {
        const userData = {
            score: this.assessmentData.score,
            category: this.assessmentData.category,
            responses: this.assessmentData.responses,
            riskFactors: this.extractRiskFactors()
        };

        const prompt = `As a compassionate healthcare AI, provide an empathetic and clear explanation for a diabetes risk assessment result.

Patient Profile:
- Risk Score: ${userData.score}
- Risk Category: ${userData.category}
- Key Risk Factors: ${userData.riskFactors.map(f => f.factorName).join(', ')}

Please provide:
1. A warm, empathetic opening that acknowledges their effort in taking the assessment
2. Clear explanation of what their score means in everyday language
3. Context about their risk level without causing alarm
4. Encouragement and hope, emphasizing what they can control
5. Gentle guidance on next steps

Tone: Supportive, informative, encouraging, and medically accurate but accessible.
Length: 2-3 paragraphs, conversational style.`;

        try {
            return await window.aiService.generateContent(prompt, userData);
        } catch (error) {
            console.error('AI explanation generation failed:', error);
            return this.getFallbackExplanation();
        }
    }

    async generateEmotionalSupport() {
        const category = this.assessmentData.category;
        
        const supportPrompts = {
            'Low': 'Provide an encouraging message celebrating their healthy lifestyle choices and motivating them to continue.',
            'Increased': 'Provide a supportive message that acknowledges their situation while emphasizing hope and the power of positive changes.',
            'High': 'Provide a compassionate message that validates any concerns while emphasizing that this is an opportunity for positive change.',
            'Possible Diabetes': 'Provide a gentle, supportive message that acknowledges this may be concerning news while emphasizing hope, support, and the importance of medical care.'
        };

        const prompt = `Write a brief, warm, and encouraging message for someone who just received a "${category}" diabetes risk assessment result. ${supportPrompts[category]} Keep it personal, hopeful, and under 50 words.`;

        try {
            if (window.aiService && window.aiService.gemini.initialized) {
                return await window.aiService.generateContent(prompt);
            }
        } catch (error) {
            console.error('Emotional support generation failed:', error);
        }
        
        return this.getFallbackEmotionalSupport();
    }

    getFallbackEmotionalSupport() {
        const supportMessages = {
            'Low': "Congratulations on taking charge of your health! Your commitment to wellness is inspiring, and you're on a great path.",
            'Increased': "Taking this assessment shows you care about your health. Small changes can make a big difference, and you have the power to improve.",
            'High': "Thank you for being proactive about your health. This information gives you the opportunity to make positive changes with support.",
            'Possible Diabetes': "We understand this may feel overwhelming, but you're not alone. With proper care and support, you can manage this effectively."
        };
        
        return supportMessages[this.assessmentData.category] || supportMessages['Increased'];
    }

    getConfidenceLevel() {
        // Calculate confidence based on number of risk factors and score consistency
        const riskFactors = this.extractRiskFactors();
        const baseConfidence = 85;
        const factorBonus = Math.min(riskFactors.length * 2, 10);
        return Math.min(baseConfidence + factorBonus, 95);
    }

    getPriorityLevel() {
        const score = this.assessmentData.score;
        if (score < 3) return 'low';
        if (score < 10) return 'medium';
        if (score < 15) return 'high';
        return 'urgent';
    }

    getPriorityLabel() {
        const priorities = {
            'low': 'Maintenance Priority',
            'medium': 'Moderate Priority',
            'high': 'High Priority',
            'urgent': 'Urgent Priority'
        };
        return priorities[this.getPriorityLevel()];
    }

    generateRiskFactorsChart() {
        const riskFactors = this.extractRiskFactors();
        const maxPoints = Math.max(...riskFactors.map(f => f.points), 5);
        
        return riskFactors.map(factor => `
            <div class="factor-bar">
                <div class="factor-info">
                    <span class="factor-name">${factor.factorName}</span>
                    <span class="factor-points">${factor.points} pts</span>
                </div>
                <div class="factor-bar-container">
                    <div class="factor-bar-fill ${factor.impact.level}" 
                         style="width: ${(factor.points / maxPoints) * 100}%"></div>
                </div>
                <div class="factor-status">
                    ${factor.modifiable ? 
                        '<span class="modifiable-badge">✓ Modifiable</span>' : 
                        '<span class="fixed-badge">Fixed Factor</span>'
                    }
                </div>
            </div>
        `).join('');
    }

    generateScoreBreakdown() {
        return this.assessmentData.questionResponses.map(qr => {
            if (qr.response > 0) {
                return `
                    <div class="score-item">
                        <span class="score-factor">${this.getRiskFactorTitle(qr.questionId)}</span>
                        <span class="score-points">+${qr.response}</span>
                    </div>
                `;
            }
            return '';
        }).join('');
    }

    setupInteractiveElements() {
        // Methodology toggle
        const toggleBtn = document.getElementById('toggle-methodology');
        const content = document.getElementById('methodology-content');
        
        if (toggleBtn && content) {
            toggleBtn.addEventListener('click', () => {
                content.classList.toggle('collapsed');
                const icon = toggleBtn.querySelector('.toggle-icon');
                const text = toggleBtn.querySelector('.toggle-text');
                
                if (content.classList.contains('collapsed')) {
                    icon.textContent = '▼';
                    text.textContent = 'Show Details';
                } else {
                    icon.textContent = '▲';
                    text.textContent = 'Hide Details';
                }
            });
        }

        // Action buttons
        const createPlanBtn = document.getElementById('create-health-plan');
        const shareBtn = document.getElementById('share-results');
        
        if (createPlanBtn) {
            createPlanBtn.addEventListener('click', () => {
                this.createHealthPlan();
            });
        }
        
        if (shareBtn) {
            shareBtn.addEventListener('click', () => {
                this.shareResults();
            });
        }
    }

    createHealthPlan() {
        // Navigate to health plan creation or show modal
        if (window.glucoApp && window.glucoApp.showHealthPlan) {
            window.glucoApp.showHealthPlan(this.assessmentData);
        } else {
            this.showHealthPlanModal();
        }
    }

    shareResults() {
        // Generate shareable summary
        const summary = this.generateShareableSummary();
        
        if (navigator.share) {
            navigator.share({
                title: 'My Diabetes Risk Assessment Results',
                text: summary,
                url: window.location.href
            });
        } else {
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(summary).then(() => {
                this.showSuccess('Results copied to clipboard!');
            });
        }
    }

    generateShareableSummary() {
        return `Diabetes Risk Assessment Results:
        
Risk Score: ${this.assessmentData.score}
Risk Category: ${this.assessmentData.category}
Date: ${new Date(this.assessmentData.date).toLocaleDateString()}

Key Risk Factors:
${this.extractRiskFactors().map(f => `• ${f.factorName}: ${f.points} points`).join('\n')}

This assessment was completed using WHO/ADA guidelines. Please consult with a healthcare provider for medical advice.`;
    }

    showFallbackExplanation(container, error) {
        container.innerHTML = `
            <div class="ai-insights-container fallback">
                <div class="fallback-notice">
                    <div class="notice-icon">ℹ️</div>
                    <div class="notice-content">
                        <h4>Health Insights</h4>
                        <p>AI-powered insights are currently unavailable. Here are your results based on established medical guidelines:</p>
                    </div>
                </div>
                
                <div class="ai-explanation-card">
                    <div class="ai-content">
                        <div class="explanation-text">${this.getFallbackExplanation()}</div>
                    </div>
                </div>
                
                <div class="action-plan-card">
                    <h4>💡 Your Action Plan</h4>
                    <div class="recommendations-content">
                        ${this.getFallbackRecommendations()}
                    </div>
                </div>
                
                <div class="retry-ai">
                    <button class="btn-secondary" id="retry-ai-explanation">Try AI Insights Again</button>
                </div>
            </div>
        `;
        
        // Add retry functionality
        document.getElementById('retry-ai-explanation')?.addEventListener('click', () => {
            this.generateAIExplanation();
        });
    }

    async generatePersonalizedRecommendations() {
        if (!window.aiService || !window.aiService.gemini.initialized) {
            return this.getFallbackRecommendations();
        }

        try {
            const userData = {
                riskScore: this.assessmentData.score,
                riskCategory: this.assessmentData.category,
                riskFactors: this.assessmentData.responses,
                age: this.assessmentData.responses.age || 0,
                hasHighBP: this.assessmentData.responses.high_blood_pressure === 2,
                isInactive: this.assessmentData.responses.physical_activity === 2,
                hasWeightConcerns: this.assessmentData.responses.bmi > 0,
                hasFamilyHistory: this.assessmentData.responses.family_history > 0,
                hasPrediabetes: this.assessmentData.responses.prediabetes === 5
            };

            const recommendations = await window.aiService.getPersonalizedRecommendations(userData);
            return this.formatRecommendations(recommendations);
        } catch (error) {
            console.error('Failed to generate personalized recommendations:', error);
            return this.getFallbackRecommendations();
        }
    }

    formatRecommendations(recommendations) {
        // If recommendations is a string, format it as HTML
        if (typeof recommendations === 'string') {
            // Split by lines and format as list items
            const lines = recommendations.split('\n').filter(line => line.trim());
            const formattedLines = lines.map(line => {
                const trimmed = line.trim();
                if (trimmed.startsWith('•') || trimmed.startsWith('-') || trimmed.startsWith('*')) {
                    return `<li>${trimmed.substring(1).trim()}</li>`;
                } else if (trimmed.length > 0) {
                    return `<li>${trimmed}</li>`;
                }
                return '';
            }).filter(line => line);

            return `<ul class="recommendation-list">${formattedLines.join('')}</ul>`;
        }
        
        return recommendations;
    }

    setupMethodologyModal() {
        const showMethodologyBtn = document.getElementById('show-methodology');
        if (showMethodologyBtn) {
            showMethodologyBtn.addEventListener('click', () => {
                this.showMethodologyModal();
            });
        }
    }

    showMethodologyModal() {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content methodology-modal">
                <div class="modal-header">
                    <h3>Risk Assessment Methodology</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="methodology-content">
                        <h4>Evidence-Based Scoring</h4>
                        <p>Our risk assessment is based on validated WHO and ADA (American Diabetes Association) guidelines for diabetes risk screening.</p>
                        
                        <h4>Risk Factor Weights</h4>
                        <div class="factor-weights">
                            <div class="weight-item">
                                <strong>Age:</strong> 
                                <span>45-54 years (+2), 55-64 years (+3), 65+ years (+4)</span>
                            </div>
                            <div class="weight-item">
                                <strong>Gender:</strong> 
                                <span>Male (+1), Female (0)</span>
                            </div>
                            <div class="weight-item">
                                <strong>Family History:</strong> 
                                <span>Extended family (+2), Immediate family (+5)</span>
                            </div>
                            <div class="weight-item">
                                <strong>Blood Pressure:</strong> 
                                <span>High BP history (+2)</span>
                            </div>
                            <div class="weight-item">
                                <strong>Physical Activity:</strong> 
                                <span>Inactive lifestyle (+2)</span>
                            </div>
                            <div class="weight-item">
                                <strong>BMI:</strong> 
                                <span>Overweight (+1), Obese (+3)</span>
                            </div>
                            <div class="weight-item">
                                <strong>Gestational Diabetes:</strong> 
                                <span>Previous diagnosis (+1)</span>
                            </div>
                            <div class="weight-item">
                                <strong>Prediabetes:</strong> 
                                <span>Previous diagnosis (+5)</span>
                            </div>
                        </div>
                        
                        <h4>Risk Categories</h4>
                        <div class="risk-categories">
                            <div class="category-item low">
                                <strong>Low Risk (0-2 points):</strong> Low likelihood of developing diabetes
                            </div>
                            <div class="category-item increased">
                                <strong>Increased Risk (3-9 points):</strong> Elevated risk, lifestyle changes recommended
                            </div>
                            <div class="category-item high">
                                <strong>High Risk (10-14 points):</strong> High likelihood, medical consultation advised
                            </div>
                            <div class="category-item possible">
                                <strong>Possible Diabetes (15+ points):</strong> May already have diabetes, immediate medical attention recommended
                            </div>
                        </div>
                        
                        <h4>AI Enhancement</h4>
                        <p>Our AI provides personalized explanations and recommendations based on your specific risk profile, making the results more actionable and easier to understand.</p>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn-secondary modal-close">Close</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Close modal functionality
        modal.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', () => {
                document.body.removeChild(modal);
            });
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
    }

    getFallbackExplanation() {
        const category = this.assessmentData.category;
        const score = this.assessmentData.score;
        const responses = this.assessmentData.responses;

        // Create personalized explanation based on specific risk factors
        let explanation = '';
        let encouragement = '';
        let nextSteps = '';

        switch (category) {
            case 'Low':
                explanation = `Congratulations! Your risk score of ${score} indicates you're doing an excellent job managing your health. Your current lifestyle choices are effectively supporting your metabolic wellness.`;
                encouragement = `This is wonderful news and shows that your healthy habits are paying off. You're on the right path to preventing diabetes.`;
                nextSteps = `Continue your current healthy lifestyle, maintain regular check-ups with your healthcare provider, and consider yourself a role model for diabetes prevention.`;
                break;
                
            case 'Increased':
                explanation = `Your risk score of ${score} shows you have some risk factors for diabetes, but this is manageable and gives you a valuable opportunity to take preventive action.`;
                encouragement = `The good news is that many of these risk factors can be improved with lifestyle changes. You have the power to significantly reduce your risk.`;
                nextSteps = `Focus on regular physical activity (150 minutes per week), healthy eating with plenty of vegetables and whole grains, and maintaining a healthy weight. Small, consistent changes can make a big difference.`;
                break;
                
            case 'High':
                explanation = `Your risk score of ${score} indicates several factors that put you at higher risk for diabetes. While this may feel concerning, it's important to know that this risk can be significantly reduced with the right approach.`;
                encouragement = `You're taking an important first step by completing this assessment. Many people have successfully reduced their diabetes risk from this level through dedicated lifestyle changes.`;
                nextSteps = `Consider consulting with your healthcare provider to create a personalized prevention plan. Focus on structured physical activity, nutritional counseling, and regular monitoring of your health metrics.`;
                break;
                
            case 'Possible Diabetes':
                explanation = `Your risk score of ${score} suggests you may already have prediabetes or diabetes. This is serious, but please know that early detection is actually a positive thing - it means you can take action now.`;
                encouragement = `While this news may be overwhelming, remember that diabetes and prediabetes are manageable conditions. Many people live full, healthy lives with proper care and lifestyle management.`;
                nextSteps = `Please schedule an appointment with your healthcare provider as soon as possible for proper testing (fasting glucose or HbA1c). Early intervention can prevent complications and help you maintain your quality of life.`;
                break;
        }

        // Add specific factor mentions
        const factorMentions = [];
        if (responses.physical_activity === 2) {
            factorMentions.push('increasing your physical activity');
        }
        if (responses.bmi > 0) {
            factorMentions.push('working toward a healthy weight');
        }
        if (responses.high_blood_pressure === 2) {
            factorMentions.push('managing your blood pressure');
        }

        if (factorMentions.length > 0) {
            explanation += ` Key areas for improvement include ${factorMentions.join(', ')}.`;
        }

        return `${explanation} ${encouragement} ${nextSteps}`;
    }

    getFallbackRecommendations() {
        const responses = this.assessmentData.responses;
        const category = this.assessmentData.category;
        const recommendations = [];

        // Personalized recommendations based on risk factors
        if (responses.physical_activity === 2) {
            recommendations.push('Start with 10-15 minutes of daily walking and gradually increase to 30 minutes most days of the week');
            recommendations.push('Try activities you enjoy like dancing, swimming, or gardening to make exercise sustainable');
        }

        if (responses.bmi > 0) {
            recommendations.push('Focus on portion control and eating slowly to help with weight management');
            recommendations.push('Fill half your plate with vegetables at each meal to increase nutrients while managing calories');
        }

        if (responses.high_blood_pressure === 2) {
            recommendations.push('Reduce sodium intake by cooking at home more often and reading food labels');
            recommendations.push('Practice stress-reduction techniques like deep breathing or meditation');
        }

        if (responses.family_history > 0) {
            recommendations.push('Schedule regular health screenings since family history increases your risk');
            recommendations.push('Share your family history with your healthcare provider for personalized monitoring');
        }

        if (responses.prediabetes === 5) {
            recommendations.push('Follow up with your healthcare provider regularly to monitor your blood sugar levels');
            recommendations.push('Consider joining a diabetes prevention program in your community');
        }

        // General recommendations based on risk category
        if (category === 'Low') {
            recommendations.push('Continue your healthy habits and maintain regular health check-ups');
            recommendations.push('Stay informed about diabetes prevention and share your knowledge with family and friends');
        } else {
            recommendations.push('Eat a balanced diet rich in vegetables, lean proteins, and whole grains');
            recommendations.push('Stay hydrated with water instead of sugary drinks');
            recommendations.push('Get 7-9 hours of quality sleep each night for optimal metabolic health');
        }

        if (category === 'High' || category === 'Possible Diabetes') {
            recommendations.push('Schedule an appointment with your healthcare provider to discuss your results');
            recommendations.push('Consider working with a registered dietitian for personalized nutrition guidance');
        }

        // Format as HTML list
        return `<ul class="recommendation-list">${recommendations.map(rec => `<li>${rec}</li>`).join('')}</ul>`;
    }

    async saveAssessment() {
        try {
            // Get current user
            const currentUser = this.getCurrentUser();
            if (!currentUser) {
                this.showError('Please log in to save your assessment.');
                return;
            }

            // Enhanced assessment data structure for Kiro RiskAssessments table
            const assessmentRecord = {
                user_id: currentUser.id,
                date: new Date().toISOString(),
                score: this.assessmentData.score,
                category: this.assessmentData.category,
                responses: this.assessmentData.responses,
                questionResponses: this.assessmentData.questionResponses,
                aiExplanation: this.assessmentData.aiExplanation || null,
                aiRecommendations: this.assessmentData.aiRecommendations || null,
                riskFactors: this.extractRiskFactors(),
                recommendations: this.generateStandardRecommendations(),
                metadata: {
                    version: '2.0',
                    questionnaire: 'WHO_ADA_2024',
                    completionTime: this.getCompletionTime(),
                    deviceInfo: this.getDeviceInfo()
                }
            };

            // Save to Kiro RiskAssessments table
            if (window.kiroDb) {
                const savedAssessment = await window.kiroDb.saveAssessment(currentUser.id, assessmentRecord);
                
                // Update user's latest assessment reference
                await this.updateUserLatestAssessment(currentUser.id, savedAssessment);
            } else {
                // Fallback to localStorage with queue for sync
                this.saveToLocalStorageWithSync(assessmentRecord);
            }

            // Update user data in app
            if (window.glucoApp) {
                window.glucoApp.userData.riskScore = this.assessmentData.score;
                window.glucoApp.userData.riskCategory = this.assessmentData.category;
                window.glucoApp.userData.lastAssessmentDate = this.assessmentData.date;
                window.glucoApp.userData.hasCompletedAssessment = true;
                await window.glucoApp.saveUserData();
            }

            // Notify dashboard of assessment completion
            if (window.enhancedDashboard) {
                // Trigger dashboard refresh to show new assessment data
                setTimeout(async () => {
                    await window.enhancedDashboard.refreshDashboard();
                }, 1000);
            }

            // Dispatch custom event for assessment completion
            document.dispatchEvent(new CustomEvent('assessmentCompleted', {
                detail: {
                    score: this.assessmentData.score,
                    category: this.assessmentData.category,
                    date: this.assessmentData.date,
                    userId: currentUser.id
                }
            }));

            // Show success message and completion animation
            this.showSuccess('Risk assessment saved successfully!');
            this.showCompletionAnimation();
            
            // Track analytics
            this.trackAssessmentCompletion(assessmentRecord);

            // Trigger motivational notification after assessment completion
            if (window.notificationUI) {
                setTimeout(() => {
                    window.notificationUI.sendMotivationalMessage({
                        trigger: 'assessment_completed',
                        riskScore: this.assessmentData.score,
                        riskCategory: this.assessmentData.category,
                        improvement: this.calculateImprovement()
                    });
                }, 2000);
            }

            // Navigate to dashboard after delay
            setTimeout(() => {
                if (window.glucoApp) {
                    window.glucoApp.showDashboard();
                }
            }, 3000);

        } catch (error) {
            console.error('Failed to save assessment:', error);
            this.showAssessmentSaveError(error);
        }
    }

    extractRiskFactors() {
        const riskFactors = [];
        
        this.assessmentData.questionResponses.forEach(qr => {
            if (qr.response > 0) {
                const question = this.questions.find(q => q.id === qr.questionId);
                const option = question.options.find(opt => opt.value === qr.response);
                
                riskFactors.push({
                    factorId: qr.questionId,
                    factorName: this.getRiskFactorTitle(qr.questionId),
                    points: qr.response,
                    description: qr.selectedOption,
                    impact: this.getRiskFactorImpact(qr.questionId, qr.response),
                    modifiable: this.isModifiableRiskFactor(qr.questionId)
                });
            }
        });
        
        return riskFactors;
    }

    isModifiableRiskFactor(factorId) {
        const modifiableFactors = ['physical_activity', 'bmi', 'high_blood_pressure'];
        return modifiableFactors.includes(factorId);
    }

    generateStandardRecommendations() {
        const category = this.assessmentData.category;
        const riskFactors = this.extractRiskFactors();
        
        const recommendations = {
            immediate: [],
            shortTerm: [],
            longTerm: [],
            lifestyle: [],
            medical: []
        };

        // Category-based recommendations
        switch (category) {
            case 'Low':
                recommendations.immediate.push('Continue your excellent health habits');
                recommendations.lifestyle.push('Maintain regular physical activity', 'Keep a balanced diet');
                recommendations.longTerm.push('Schedule annual health check-ups');
                break;
                
            case 'Increased':
                recommendations.immediate.push('Consider lifestyle modifications');
                recommendations.shortTerm.push('Increase physical activity to 150 minutes per week');
                recommendations.lifestyle.push('Focus on weight management', 'Reduce processed foods');
                recommendations.medical.push('Discuss prevention strategies with your doctor');
                break;
                
            case 'High':
                recommendations.immediate.push('Schedule a medical consultation within 2-4 weeks');
                recommendations.shortTerm.push('Begin structured exercise program', 'Start diabetes prevention diet');
                recommendations.medical.push('Request HbA1c and glucose tolerance tests');
                recommendations.longTerm.push('Consider diabetes prevention program enrollment');
                break;
                
            case 'Possible Diabetes':
                recommendations.immediate.push('Schedule urgent medical consultation within 1 week');
                recommendations.medical.push('Request immediate blood glucose testing', 'Discuss medication options if needed');
                recommendations.shortTerm.push('Begin intensive lifestyle intervention');
                break;
        }

        // Risk factor-specific recommendations
        riskFactors.forEach(factor => {
            if (factor.modifiable) {
                switch (factor.factorId) {
                    case 'physical_activity':
                        recommendations.lifestyle.push('Start with 10-minute daily walks', 'Join a fitness class or group');
                        break;
                    case 'bmi':
                        recommendations.lifestyle.push('Aim for 5-10% weight loss', 'Consider nutritionist consultation');
                        break;
                    case 'high_blood_pressure':
                        recommendations.medical.push('Monitor blood pressure regularly', 'Discuss BP management with doctor');
                        break;
                }
            }
        });

        return recommendations;
    }

    async updateUserLatestAssessment(userId, assessment) {
        try {
            if (window.kiroDb && window.kiroDb.updateUser) {
                await window.kiroDb.updateUser(userId, {
                    latestRiskAssessment: {
                        id: assessment.id,
                        date: assessment.date,
                        score: assessment.score,
                        category: assessment.category
                    },
                    lastAssessmentDate: assessment.date
                });
            }
        } catch (error) {
            console.warn('Failed to update user latest assessment:', error);
        }
    }

    trackAssessmentCompletion(assessment) {
        try {
            // Analytics tracking
            if (window.analytics) {
                window.analytics.track('risk_assessment_completed', {
                    score: assessment.score,
                    category: assessment.category,
                    hasAIExplanation: !!assessment.aiExplanation,
                    completionTime: assessment.metadata.completionTime
                });
            }
            
            // Custom event for other components
            document.dispatchEvent(new CustomEvent('riskAssessmentCompleted', {
                detail: { assessment }
            }));
        } catch (error) {
            console.warn('Failed to track assessment completion:', error);
        }
    }

    showCompletionAnimation() {
        const resultContainer = document.getElementById('assessment-result');
        if (resultContainer) {
            resultContainer.classList.add('assessment-completed');
            
            // Add success animation
            const animation = document.createElement('div');
            animation.className = 'completion-animation';
            animation.innerHTML = `
                <div class="success-checkmark">
                    <div class="check-icon">
                        <span class="icon-line line-tip"></span>
                        <span class="icon-line line-long"></span>
                        <div class="icon-circle"></div>
                        <div class="icon-fix"></div>
                    </div>
                </div>
                <div class="completion-message">
                    <h3>Assessment Complete!</h3>
                    <p>Your results have been saved securely.</p>
                </div>
            `;
            
            resultContainer.appendChild(animation);
            
            // Remove animation after delay
            setTimeout(() => {
                if (resultContainer.contains(animation)) {
                    resultContainer.removeChild(animation);
                }
            }, 3000);
        }
    }

    saveToLocalStorageWithSync(assessmentRecord) {
        try {
            // Save to localStorage
            const assessments = JSON.parse(localStorage.getItem('glucobalance_assessments') || '[]');
            assessmentRecord.id = `local_${Date.now()}`;
            assessments.push(assessmentRecord);
            localStorage.setItem('glucobalance_assessments', JSON.stringify(assessments));
            
            // Queue for sync when online
            if (window.offlineManager) {
                window.offlineManager.queueOperation('create', 'assessments', assessmentRecord);
            }
        } catch (error) {
            console.error('Failed to save to localStorage:', error);
            throw new Error('Unable to save assessment locally');
        }
    }

    showAssessmentSaveError(error) {
        const errorModal = document.createElement('div');
        errorModal.className = 'modal-overlay error-modal';
        errorModal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header error">
                    <h3>⚠️ Save Failed</h3>
                </div>
                <div class="modal-body">
                    <p>We couldn't save your assessment right now. This might be due to:</p>
                    <ul>
                        <li>Network connectivity issues</li>
                        <li>Temporary server problems</li>
                        <li>Storage limitations</li>
                    </ul>
                    <p><strong>Your results are still available on this page.</strong></p>
                </div>
                <div class="modal-footer">
                    <button class="btn-primary" id="retry-save">Try Again</button>
                    <button class="btn-secondary" id="continue-without-save">Continue</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(errorModal);
        
        document.getElementById('retry-save').addEventListener('click', () => {
            document.body.removeChild(errorModal);
            this.saveAssessment();
        });
        
        document.getElementById('continue-without-save').addEventListener('click', () => {
            document.body.removeChild(errorModal);
            if (window.glucoApp && window.glucoApp.showDashboard) {
                window.glucoApp.showDashboard();
            }
        });
    }

    getCompletionTime() {
        // Calculate time taken to complete assessment
        if (this.startTime) {
            return Math.round((Date.now() - this.startTime) / 1000); // seconds
        }
        return null;
    }

    getDeviceInfo() {
        return {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            language: navigator.language,
            screenResolution: `${screen.width}x${screen.height}`,
            timestamp: new Date().toISOString()
        };
    }

    getCurrentUser() {
        // Try to get user from auth service first
        if (window.authService && window.authService.isAuthenticated()) {
            return window.authService.getCurrentUser();
        }
        
        // Fallback to app user data
        if (window.glucoApp && window.glucoApp.userData.id) {
            return window.glucoApp.userData;
        }
        
        return null;
    }

    restartAssessment() {
        this.currentQuestionIndex = 0;
        this.responses = {};
        this.assessmentData = null;
        
        // Show assessment form and hide results
        const assessmentForm = document.querySelector('.assessment-form');
        const resultContainer = document.getElementById('assessment-result');
        
        if (assessmentForm) assessmentForm.style.display = 'block';
        if (resultContainer) resultContainer.style.display = 'none';
        
        this.startAssessment();
    }

    // Assessment History Management
    async getAssessmentHistory(userId, limit = 10) {
        try {
            if (window.kiroDb) {
                return await window.kiroDb.getUserAssessments(userId, limit);
            }
            return [];
        } catch (error) {
            console.error('Failed to get assessment history:', error);
            return [];
        }
    }

    async displayAssessmentHistory(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const currentUser = this.getCurrentUser();
        if (!currentUser) {
            container.innerHTML = '<p>Please log in to view assessment history.</p>';
            return;
        }

        try {
            const history = await this.getAssessmentHistory(currentUser.id);
            
            if (history.length === 0) {
                container.innerHTML = '<p>No previous assessments found.</p>';
                return;
            }

            const historyHTML = `
                <div class="assessment-history">
                    <h3>Assessment History</h3>
                    <div class="history-list">
                        ${history.map(assessment => `
                            <div class="history-item">
                                <div class="history-date">${new Date(assessment.date).toLocaleDateString()}</div>
                                <div class="history-score">
                                    <span class="score-number">${assessment.score}</span>
                                    <span class="score-category risk-${assessment.category.toLowerCase().replace(' ', '-')}">${assessment.category}</span>
                                </div>
                                <button class="btn-link view-details" data-assessment-id="${assessment.id}">View Details</button>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;

            container.innerHTML = historyHTML;

            // Add event listeners for view details
            container.querySelectorAll('.view-details').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const assessmentId = e.target.dataset.assessmentId;
                    this.showAssessmentDetails(assessmentId, history);
                });
            });

        } catch (error) {
            console.error('Failed to display assessment history:', error);
            container.innerHTML = '<p>Failed to load assessment history.</p>';
        }
    }

    showAssessmentDetails(assessmentId, history) {
        const assessment = history.find(a => a.id == assessmentId);
        if (!assessment) return;

        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Assessment Details</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="assessment-summary">
                        <p><strong>Date:</strong> ${new Date(assessment.date).toLocaleDateString()}</p>
                        <p><strong>Risk Score:</strong> ${assessment.score}</p>
                        <p><strong>Risk Category:</strong> ${assessment.category}</p>
                    </div>
                    ${assessment.aiExplanation ? `
                        <div class="ai-explanation">
                            <h4>AI Insights</h4>
                            <p>${assessment.aiExplanation}</p>
                        </div>
                    ` : ''}
                </div>
                <div class="modal-footer">
                    <button class="btn-secondary modal-close">Close</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Close modal functionality
        modal.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', () => {
                document.body.removeChild(modal);
            });
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
    }

    showError(message) {
        if (window.glucoApp) {
            window.glucoApp.showNotification(message, 'error');
        } else {
            alert(message);
        }
    }

    showSuccess(message) {
        if (window.glucoApp) {
            window.glucoApp.showNotification(message, 'success');
        } else {
            alert(message);
        }
    }

    calculateImprovement() {
        // Calculate if user's risk has improved compared to previous assessments
        try {
            const currentUser = window.authService?.getCurrentUser();
            if (!currentUser || !window.kiroDb) return null;

            // This would need to be implemented to compare with previous assessments
            // For now, return a simple improvement indicator
            return {
                hasImproved: this.assessmentData.score < 15, // Arbitrary threshold
                previousScore: null, // Would need to fetch from database
                trend: 'stable'
            };
        } catch (error) {
            console.error('Failed to calculate improvement:', error);
            return null;
        }
    }
}

// Initialize risk assessment engine
window.riskAssessment = new RiskAssessmentEngine();