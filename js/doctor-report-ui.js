// GlucoBalance - Doctor Report UI Component
class DoctorReportUI {
    constructor() {
        this.reportService = window.doctorReportService;
        this.currentUser = null;
        this.generatedReports = new Map();
        this.init();
    }

    init() {
        console.log('Doctor Report UI initialized');
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Listen for auth state changes
        document.addEventListener('authStateChanged', (event) => {
            if (event.detail.isAuthenticated && event.detail.user) {
                this.currentUser = event.detail.user;
            } else {
                this.currentUser = null;
            }
        });
    }

    // Create doctor report page
    createDoctorReportPage() {
        const reportPageHTML = `
        <div id="doctor-report-page" class="page">
            <header class="app-header">
                <div class="container">
                    <h1>📋 Doctor Report Generator</h1>
                    <p class="page-subtitle">Generate comprehensive health reports for healthcare providers</p>
                </div>
            </header>
            
            <main class="container">
                <!-- Report Generation Section -->
                <div class="card report-generator">
                    <div class="card-header">
                        <h3><span class="icon">🤖</span> AI-Enhanced Clinical Report</h3>
                        <p>Generate a comprehensive 30-day health summary with AI analysis for your healthcare provider</p>
                    </div>
                    
                    <div class="report-options">
                        <div class="form-group">
                            <label for="report-period">Report Period</label>
                            <select id="report-period" class="form-control">
                                <option value="30">Last 30 days (Recommended)</option>
                                <option value="60">Last 60 days</option>
                                <option value="90">Last 90 days</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label>Report Features</label>
                            <div class="checkbox-group">
                                <label class="checkbox-label">
                                    <input type="checkbox" id="include-ai-analysis" checked>
                                    <span class="checkmark"></span>
                                    Include AI Analysis & Insights
                                </label>
                                <label class="checkbox-label">
                                    <input type="checkbox" id="include-trend-analysis" checked>
                                    <span class="checkmark"></span>
                                    Include Trend Analysis
                                </label>
                                <label class="checkbox-label">
                                    <input type="checkbox" id="include-recommendations" checked>
                                    <span class="checkmark"></span>
                                    Include Clinical Recommendations
                                </label>
                            </div>
                        </div>
                        
                        <div class="form-actions">
                            <button id="generate-report-btn" class="btn-primary">
                                <span class="icon">📊</span>
                                Generate Clinical Report
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Data Preview Section -->
                <div class="card data-preview" id="data-preview-section" style="display: none;">
                    <div class="card-header">
                        <h3>📈 Data Summary</h3>
                        <p>Preview of data that will be included in your report</p>
                    </div>
                    <div id="data-preview-content">
                        <!-- Data preview will be populated here -->
                    </div>
                </div>

                <!-- Report Generation Progress -->
                <div class="card report-progress" id="report-progress-section" style="display: none;">
                    <div class="card-header">
                        <h3>⚡ Generating Report</h3>
                    </div>
                    <div class="progress-container">
                        <div class="progress-bar">
                            <div class="progress-fill" id="report-progress-bar" style="width: 0%"></div>
                        </div>
                        <div class="progress-steps">
                            <div class="progress-step" id="step-data">
                                <span class="step-icon">📊</span>
                                <span class="step-text">Aggregating Health Data</span>
                            </div>
                            <div class="progress-step" id="step-ai">
                                <span class="step-icon">🤖</span>
                                <span class="step-text">AI Analysis & Insights</span>
                            </div>
                            <div class="progress-step" id="step-format">
                                <span class="step-icon">📋</span>
                                <span class="step-text">Formatting Clinical Report</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Generated Report Display -->
                <div class="card report-display" id="report-display-section" style="display: none;">
                    <div class="card-header">
                        <h3>📄 Generated Report</h3>
                        <div class="report-actions">
                            <button id="download-pdf-btn" class="btn-secondary">
                                <span class="icon">📥</span>
                                Download PDF
                            </button>
                            <button id="share-report-btn" class="btn-secondary">
                                <span class="icon">📤</span>
                                Share Report
                            </button>
                            <button id="print-report-btn" class="btn-secondary">
                                <span class="icon">🖨️</span>
                                Print Report
                            </button>
                        </div>
                    </div>
                    <div id="report-content" class="report-content">
                        <!-- Generated report will be displayed here -->
                    </div>
                </div>

                <!-- Previous Reports -->
                <div class="card previous-reports" id="previous-reports-section">
                    <div class="card-header">
                        <h3>📚 Previous Reports</h3>
                        <p>Access your previously generated reports</p>
                    </div>
                    <div id="previous-reports-list">
                        <div class="empty-state">
                            <span class="icon">📋</span>
                            <p>No previous reports generated</p>
                            <small>Generate your first report to see it here</small>
                        </div>
                    </div>
                </div>
            </main>
        </div>`;

        // Add to app if not already present
        if (!document.getElementById('doctor-report-page')) {
            document.getElementById('app').insertAdjacentHTML('beforeend', reportPageHTML);
            this.initializeReportPage();
        }
    }

    // Initialize report page functionality
    initializeReportPage() {
        // Generate report button
        document.getElementById('generate-report-btn')?.addEventListener('click', () => {
            this.generateReport();
        });

        // Download PDF button
        document.getElementById('download-pdf-btn')?.addEventListener('click', () => {
            this.downloadReportAsPDF();
        });

        // Share report button
        document.getElementById('share-report-btn')?.addEventListener('click', () => {
            this.shareReport();
        });

        // Print report button
        document.getElementById('print-report-btn')?.addEventListener('click', () => {
            this.printReport();
        });

        // Load previous reports
        this.loadPreviousReports();
    }

    // Main report generation method
    async generateReport() {
        if (!this.currentUser) {
            this.showError('Please log in to generate a report');
            return;
        }

        try {
            // Get report options
            const options = this.getReportOptions();
            
            // Show progress
            this.showReportProgress();
            
            // Step 1: Preview data
            this.updateProgress(20, 'step-data');
            const dataPreview = await this.previewReportData(options.days);
            this.showDataPreview(dataPreview);
            
            // Step 2: Generate report with AI analysis
            this.updateProgress(50, 'step-ai');
            const reportResult = await this.reportService.generateDoctorReport(this.currentUser.id, options);
            
            // Step 3: Format and display
            this.updateProgress(80, 'step-format');
            await this.displayGeneratedReport(reportResult);
            
            // Complete
            this.updateProgress(100, 'complete');
            
            // Store report for future access
            this.storeGeneratedReport(reportResult);
            
            // Update previous reports list
            this.updatePreviousReportsList();
            
        } catch (error) {
            console.error('Report generation failed:', error);
            this.showError('Failed to generate report: ' + error.message);
            this.hideReportProgress();
        }
    }

    // Get report generation options from UI
    getReportOptions() {
        return {
            days: parseInt(document.getElementById('report-period')?.value || '30'),
            includeAIAnalysis: document.getElementById('include-ai-analysis')?.checked !== false,
            includeTrendAnalysis: document.getElementById('include-trend-analysis')?.checked !== false,
            includeRecommendations: document.getElementById('include-recommendations')?.checked !== false,
            format: 'clinical'
        };
    }

    // Preview report data before generation
    async previewReportData(days = 30) {
        try {
            const healthData = await this.reportService.aggregateHealthData(this.currentUser.id, days);
            return {
                totalDataPoints: this.calculateTotalDataPoints(healthData),
                riskAssessments: healthData.riskAssessments.totalAssessments,
                moodEntries: healthData.mentalHealth.totalEntries,
                nutritionPlans: healthData.nutrition.totalPlans,
                progressEntries: healthData.progressMetrics.totalEntries,
                dataCompleteness: healthData.summary.dataCompleteness?.overall || 0,
                dateRange: healthData.dateRange
            };
        } catch (error) {
            console.error('Data preview failed:', error);
            throw error;
        }
    }

    // Show data preview
    showDataPreview(preview) {
        const previewSection = document.getElementById('data-preview-section');
        const previewContent = document.getElementById('data-preview-content');
        
        if (!previewSection || !previewContent) return;
        
        previewContent.innerHTML = `
            <div class="data-summary-grid">
                <div class="data-metric">
                    <div class="metric-value">${preview.totalDataPoints}</div>
                    <div class="metric-label">Total Data Points</div>
                </div>
                <div class="data-metric">
                    <div class="metric-value">${preview.riskAssessments}</div>
                    <div class="metric-label">Risk Assessments</div>
                </div>
                <div class="data-metric">
                    <div class="metric-value">${preview.moodEntries}</div>
                    <div class="metric-label">Mood Entries</div>
                </div>
                <div class="data-metric">
                    <div class="metric-value">${preview.nutritionPlans}</div>
                    <div class="metric-label">Nutrition Plans</div>
                </div>
            </div>
            
            <div class="data-quality-indicator">
                <div class="quality-bar">
                    <div class="quality-fill" style="width: ${preview.dataCompleteness}%"></div>
                </div>
                <div class="quality-text">
                    Data Completeness: ${preview.dataCompleteness}%
                    <span class="quality-status ${this.getQualityStatus(preview.dataCompleteness)}">
                        ${this.getQualityLabel(preview.dataCompleteness)}
                    </span>
                </div>
            </div>
            
            <div class="date-range-info">
                <strong>Report Period:</strong> ${preview.dateRange.startDate} to ${preview.dateRange.endDate}
            </div>
        `;
        
        previewSection.style.display = 'block';
    }

    // Show report generation progress
    showReportProgress() {
        const progressSection = document.getElementById('report-progress-section');
        if (progressSection) {
            progressSection.style.display = 'block';
            this.updateProgress(10, 'start');
        }
    }

    // Hide report progress
    hideReportProgress() {
        const progressSection = document.getElementById('report-progress-section');
        if (progressSection) {
            progressSection.style.display = 'none';
        }
    }

    // Update progress bar and steps
    updateProgress(percentage, currentStep) {
        const progressBar = document.getElementById('report-progress-bar');
        if (progressBar) {
            progressBar.style.width = `${percentage}%`;
        }

        // Update step indicators
        const steps = ['step-data', 'step-ai', 'step-format'];
        steps.forEach(step => {
            const stepElement = document.getElementById(step);
            if (stepElement) {
                stepElement.classList.remove('active', 'completed');
                
                if (step === currentStep) {
                    stepElement.classList.add('active');
                } else if (steps.indexOf(step) < steps.indexOf(currentStep)) {
                    stepElement.classList.add('completed');
                }
            }
        });
    }

    // Display generated report
    async displayGeneratedReport(reportResult) {
        const displaySection = document.getElementById('report-display-section');
        const reportContent = document.getElementById('report-content');
        
        if (!displaySection || !reportContent) return;
        
        // Format report for display
        const formattedReport = this.formatReportForDisplay(reportResult.report);
        reportContent.innerHTML = formattedReport;
        
        // Show the report section
        displaySection.style.display = 'block';
        
        // Hide progress section
        this.hideReportProgress();
        
        // Scroll to report
        displaySection.scrollIntoView({ behavior: 'smooth' });
    }

    // Format report for HTML display
    formatReportForDisplay(report) {
        return `
            <div class="clinical-report">
                <!-- Report Header -->
                <div class="report-header">
                    <h1>${report.header.title}</h1>
                    <div class="report-subtitle">${report.header.subtitle}</div>
                    <div class="report-meta">
                        <div class="meta-item">
                            <strong>Patient:</strong> ${report.header.patientName}
                        </div>
                        <div class="meta-item">
                            <strong>Report Date:</strong> ${report.header.reportDate}
                        </div>
                        <div class="meta-item">
                            <strong>Period:</strong> ${report.header.reportPeriod}
                        </div>
                    </div>
                </div>

                <!-- Executive Summary -->
                <div class="report-section">
                    <h2>Executive Summary</h2>
                    <div class="summary-content">
                        ${report.executiveSummary}
                    </div>
                </div>

                <!-- Patient Summary -->
                <div class="report-section">
                    <h2>Patient Demographics & Engagement</h2>
                    <div class="patient-summary">
                        <div class="summary-grid">
                            <div class="summary-item">
                                <label>Age:</label>
                                <span>${report.patientSummary.demographics.age}</span>
                            </div>
                            <div class="summary-item">
                                <label>Gender:</label>
                                <span>${report.patientSummary.demographics.gender}</span>
                            </div>
                            <div class="summary-item">
                                <label>Engagement Level:</label>
                                <span class="engagement-${report.patientSummary.engagementMetrics.engagementLevel.toLowerCase()}">
                                    ${report.patientSummary.engagementMetrics.engagementLevel}
                                </span>
                            </div>
                            <div class="summary-item">
                                <label>Data Completeness:</label>
                                <span>${report.patientSummary.engagementMetrics.dataCompleteness}%</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Clinical Findings -->
                <div class="report-section">
                    <h2>Clinical Findings</h2>
                    <div class="clinical-findings">
                        ${this.formatClinicalFindings(report.clinicalFindings)}
                    </div>
                </div>

                <!-- Risk Assessment -->
                <div class="report-section">
                    <h2>Diabetes Risk Assessment</h2>
                    <div class="risk-assessment">
                        ${this.formatRiskAssessment(report.riskAssessment)}
                    </div>
                </div>

                <!-- Mental Health Assessment -->
                <div class="report-section">
                    <h2>Mental Health & Mood Assessment</h2>
                    <div class="mental-health-assessment">
                        ${this.formatMentalHealthAssessment(report.mentalHealthAssessment)}
                    </div>
                </div>

                <!-- Lifestyle Factors -->
                <div class="report-section">
                    <h2>Lifestyle & Behavioral Factors</h2>
                    <div class="lifestyle-factors">
                        ${this.formatLifestyleFactors(report.lifestyleFactors)}
                    </div>
                </div>

                <!-- Trend Analysis -->
                <div class="report-section">
                    <h2>Trend Analysis</h2>
                    <div class="trend-analysis">
                        ${this.formatTrendAnalysis(report.trendAnalysis)}
                    </div>
                </div>

                <!-- Recommendations -->
                <div class="report-section">
                    <h2>Clinical Recommendations</h2>
                    <div class="recommendations">
                        ${this.formatRecommendations(report.recommendations)}
                    </div>
                </div>

                <!-- Follow-up -->
                <div class="report-section">
                    <h2>Follow-up Recommendations</h2>
                    <div class="follow-up">
                        ${this.formatFollowUp(report.followUp)}
                    </div>
                </div>

                <!-- Data Quality -->
                <div class="report-section">
                    <h2>Data Quality Assessment</h2>
                    <div class="data-quality">
                        ${this.formatDataQuality(report.dataQuality)}
                    </div>
                </div>

                <!-- Report Footer -->
                <div class="report-footer">
                    <div class="disclaimer">
                        ${report.footer.disclaimer}
                    </div>
                    <div class="generation-info">
                        Generated: ${report.footer.generatedAt} | Version: ${report.footer.version}
                    </div>
                </div>
            </div>
        `;
    }

    // Format clinical findings section
    formatClinicalFindings(findings) {
        let html = '';
        
        if (findings.keyFindings && Array.isArray(findings.keyFindings)) {
            html += '<h3>Key Clinical Insights</h3><ul>';
            findings.keyFindings.forEach(finding => {
                html += `<li>${finding}</li>`;
            });
            html += '</ul>';
        }
        
        if (findings.alertsAndConcerns && findings.alertsAndConcerns.length > 0) {
            html += '<h3>Clinical Alerts & Concerns</h3><ul>';
            findings.alertsAndConcerns.forEach(alert => {
                html += `<li class="alert-item">${alert}</li>`;
            });
            html += '</ul>';
        }
        
        return html || '<p>No significant clinical findings identified.</p>';
    }

    // Format risk assessment section
    formatRiskAssessment(riskAssessment) {
        const summary = riskAssessment.assessmentSummary;
        
        return `
            <div class="risk-summary">
                <div class="risk-score-display">
                    <div class="score-value">${summary.latestScore || 'N/A'}</div>
                    <div class="score-category risk-${(summary.latestCategory || '').toLowerCase().replace(' ', '-')}">${summary.latestCategory || 'Not assessed'}</div>
                </div>
                <div class="risk-details">
                    <p><strong>Assessment Date:</strong> ${summary.assessmentDate || 'Not available'}</p>
                    <p><strong>Total Assessments:</strong> ${summary.totalAssessments}</p>
                </div>
            </div>
            
            ${riskAssessment.clinicalInterpretation ? `
                <div class="clinical-interpretation">
                    <h3>Clinical Interpretation</h3>
                    <p>${riskAssessment.clinicalInterpretation}</p>
                </div>
            ` : ''}
        `;
    }

    // Format mental health assessment section
    formatMentalHealthAssessment(mentalHealth) {
        const mood = mentalHealth.moodAssessment;
        
        return `
            <div class="mood-summary">
                <div class="mood-metrics">
                    <div class="metric">
                        <label>Total Entries:</label>
                        <span>${mood.totalEntries}</span>
                    </div>
                    <div class="metric">
                        <label>Average Mood:</label>
                        <span>${mood.averageMood || 'N/A'}/5</span>
                    </div>
                    <div class="metric">
                        <label>Trend:</label>
                        <span class="trend-${(mood.trend || '').toLowerCase()}">${mood.trend || 'Stable'}</span>
                    </div>
                </div>
            </div>
            
            ${mentalHealth.mentalHealthRecommendations && mentalHealth.mentalHealthRecommendations.length > 0 ? `
                <div class="mental-health-recommendations">
                    <h3>Mental Health Recommendations</h3>
                    <ul>
                        ${mentalHealth.mentalHealthRecommendations.map(rec => `<li>${rec}</li>`).join('')}
                    </ul>
                </div>
            ` : ''}
        `;
    }

    // Format lifestyle factors section
    formatLifestyleFactors(lifestyle) {
        return `
            <div class="nutrition-summary">
                <h3>Nutritional Adherence</h3>
                <div class="nutrition-metrics">
                    <div class="metric">
                        <label>Meal Plans Generated:</label>
                        <span>${lifestyle.nutritionalAdherence.mealPlansGenerated}</span>
                    </div>
                    <div class="metric">
                        <label>Average Adherence:</label>
                        <span>${lifestyle.nutritionalAdherence.averageAdherence || 'Not tracked'}</span>
                    </div>
                </div>
            </div>
            
            ${lifestyle.lifestyleRecommendations && lifestyle.lifestyleRecommendations.length > 0 ? `
                <div class="lifestyle-recommendations">
                    <h3>Lifestyle Recommendations</h3>
                    <ul>
                        ${lifestyle.lifestyleRecommendations.map(rec => `<li>${rec}</li>`).join('')}
                    </ul>
                </div>
            ` : ''}
        `;
    }

    // Format trend analysis section
    formatTrendAnalysis(trends) {
        return `
            <div class="trends-summary">
                <div class="trend-item">
                    <h3>Risk Score Trends</h3>
                    <p>${JSON.stringify(trends.riskScoreTrends) !== '{}' ? 'Trend data available for analysis' : 'Insufficient data for trend analysis'}</p>
                </div>
                
                <div class="trend-item">
                    <h3>Mood Trends</h3>
                    <p>${trends.moodTrends.trend || 'Stable mood pattern observed'}</p>
                </div>
                
                ${trends.clinicalSignificance ? `
                    <div class="clinical-significance">
                        <h3>Clinical Significance</h3>
                        <p>${trends.clinicalSignificance}</p>
                    </div>
                ` : ''}
            </div>
        `;
    }

    // Format recommendations section
    formatRecommendations(recommendations) {
        if (!Array.isArray(recommendations) || recommendations.length === 0) {
            return '<p>No specific recommendations at this time. Continue current monitoring and lifestyle practices.</p>';
        }
        
        return `
            <ul class="recommendations-list">
                ${recommendations.map(rec => `<li>${rec}</li>`).join('')}
            </ul>
        `;
    }

    // Format follow-up section
    formatFollowUp(followUp) {
        if (!Array.isArray(followUp) || followUp.length === 0) {
            return '<p>Standard follow-up care as clinically indicated.</p>';
        }
        
        return `
            <ul class="follow-up-list">
                ${followUp.map(item => `<li>${item}</li>`).join('')}
            </ul>
        `;
    }

    // Format data quality section
    formatDataQuality(dataQuality) {
        return `
            <div class="data-quality-summary">
                <div class="quality-metrics">
                    <div class="metric">
                        <label>Completeness:</label>
                        <span>${dataQuality.completeness?.overall || 'Not assessed'}%</span>
                    </div>
                    <div class="metric">
                        <label>Reliability:</label>
                        <span>${dataQuality.reliability || 'Good'}</span>
                    </div>
                </div>
                
                ${dataQuality.limitations && dataQuality.limitations.length > 0 ? `
                    <div class="limitations">
                        <h3>Data Limitations</h3>
                        <ul>
                            ${dataQuality.limitations.map(limitation => `<li>${limitation}</li>`).join('')}
                        </ul>
                    </div>
                ` : ''}
                
                ${dataQuality.recommendations && dataQuality.recommendations.length > 0 ? `
                    <div class="data-recommendations">
                        <h3>Data Collection Recommendations</h3>
                        <ul>
                            ${dataQuality.recommendations.map(rec => `<li>${rec}</li>`).join('')}
                        </ul>
                    </div>
                ` : ''}
            </div>
        `;
    }

    // Helper methods
    calculateTotalDataPoints(healthData) {
        return (
            healthData.riskAssessments.totalAssessments +
            healthData.mentalHealth.totalEntries +
            healthData.nutrition.totalPlans +
            healthData.progressMetrics.totalEntries
        );
    }

    // Download report as PDF
    async downloadReportAsPDF() {
        try {
            if (!this.currentReport) {
                this.showError('No report available to download');
                return;
            }

            this.showMessage('Generating PDF report...', 'info');

            // Ensure PDF service is available
            if (!window.pdfExportService) {
                throw new Error('PDF export service not available');
            }

            // Generate PDF
            const pdfDoc = await window.pdfExportService.generateReportPDF(this.currentReport, {
                includePlainLanguage: true
            });

            // Download the PDF
            const filename = await window.pdfExportService.downloadPDF(pdfDoc);
            
            this.showMessage(`PDF report downloaded successfully: ${filename}`, 'success');

        } catch (error) {
            console.error('PDF download failed:', error);
            this.showError(`Failed to download PDF: ${error.message}`);
        }
    }

    // Share report functionality
    async shareReport() {
        try {
            if (!this.currentReport) {
                this.showError('No report available to share');
                return;
            }

            // Check if Web Share API is available
            if (navigator.share && window.pdfExportService) {
                // Generate PDF for sharing
                const pdfDoc = await window.pdfExportService.generateReportPDF(this.currentReport);
                const pdfBlob = await window.pdfExportService.getPDFBlob(pdfDoc);
                
                const file = new File([pdfBlob], 'glucobalance-health-report.pdf', {
                    type: 'application/pdf'
                });

                await navigator.share({
                    title: 'GlucoBalance Health Report',
                    text: 'My comprehensive health report from GlucoBalance',
                    files: [file]
                });

                this.showMessage('Report shared successfully!', 'success');
            } else {
                // Fallback: Copy report link or show sharing options
                this.showSharingOptions();
            }

        } catch (error) {
            console.error('Report sharing failed:', error);
            this.showError(`Failed to share report: ${error.message}`);
        }
    }

    // Show sharing options modal
    showSharingOptions() {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Share Report</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <p>Choose how you'd like to share your health report:</p>
                    <div class="sharing-options">
                        <button id="share-download-pdf" class="btn-primary">
                            <span class="icon">📥</span>
                            Download PDF to Share
                        </button>
                        <button id="share-email" class="btn-secondary">
                            <span class="icon">📧</span>
                            Email Report
                        </button>
                        <button id="share-print" class="btn-secondary">
                            <span class="icon">🖨️</span>
                            Print Report
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Event listeners
        modal.querySelector('.modal-close').addEventListener('click', () => {
            document.body.removeChild(modal);
        });

        modal.querySelector('#share-download-pdf').addEventListener('click', () => {
            document.body.removeChild(modal);
            this.downloadReportAsPDF();
        });

        modal.querySelector('#share-email').addEventListener('click', () => {
            document.body.removeChild(modal);
            this.emailReport();
        });

        modal.querySelector('#share-print').addEventListener('click', () => {
            document.body.removeChild(modal);
            this.printReport();
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
    }

    // Email report functionality
    async emailReport() {
        try {
            if (!this.currentReport) {
                this.showError('No report available to email');
                return;
            }

            const reportSummary = this.generateEmailSummary(this.currentReport);
            const subject = encodeURIComponent('GlucoBalance Health Report');
            const body = encodeURIComponent(reportSummary);
            
            const mailtoLink = `mailto:?subject=${subject}&body=${body}`;
            window.open(mailtoLink);

            this.showMessage('Email client opened with report summary', 'success');

        } catch (error) {
            console.error('Email report failed:', error);
            this.showError(`Failed to email report: ${error.message}`);
        }
    }

    // Generate email summary
    generateEmailSummary(report) {
        return `
GlucoBalance Health Report Summary

Patient: ${report.header.patientName}
Report Period: ${report.header.reportPeriod}
Generated: ${report.header.reportDate}

EXECUTIVE SUMMARY:
${report.executiveSummary}

KEY FINDINGS:
${report.clinicalFindings.keyFindings ? report.clinicalFindings.keyFindings.map(f => `• ${f}`).join('\n') : 'No significant findings'}

DIABETES RISK:
Score: ${report.riskAssessment?.assessmentSummary?.latestScore || 'Not assessed'}
Category: ${report.riskAssessment?.assessmentSummary?.latestCategory || 'Not assessed'}

RECOMMENDATIONS:
${Array.isArray(report.recommendations) ? report.recommendations.map(r => `• ${r}`).join('\n') : 'Continue current monitoring and lifestyle practices'}

This report was generated by the GlucoBalance AI-enhanced health platform. 
For the complete detailed report with charts and analysis, please download the PDF version.

Disclaimer: This report is for informational purposes only and should not replace professional medical advice.
        `.trim();
    }

    // Print report functionality
    printReport() {
        try {
            if (!this.currentReport) {
                this.showError('No report available to print');
                return;
            }

            const reportContent = document.getElementById('report-content');
            if (!reportContent) {
                this.showError('Report content not found');
                return;
            }

            const printWindow = window.open('', '_blank');
            printWindow.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>GlucoBalance Health Report</title>
                    <style>
                        body { 
                            font-family: Arial, sans-serif; 
                            margin: 20px; 
                            line-height: 1.6;
                            color: #333;
                        }
                        .clinical-report { 
                            max-width: 800px; 
                            margin: 0 auto; 
                        }
                        .report-header { 
                            text-align: center;
                            border-bottom: 2px solid #007FFF; 
                            padding-bottom: 20px; 
                            margin-bottom: 30px; 
                        }
                        .report-section { 
                            margin-bottom: 25px; 
                            page-break-inside: avoid;
                        }
                        h1, h2, h3 { 
                            color: #007FFF; 
                        }
                        h2 {
                            border-bottom: 1px solid #dee2e6;
                            padding-bottom: 5px;
                        }
                        .summary-grid {
                            display: grid;
                            grid-template-columns: repeat(2, 1fr);
                            gap: 10px;
                            margin: 15px 0;
                        }
                        .summary-item {
                            display: flex;
                            justify-content: space-between;
                            padding: 8px;
                            background: #f8f9fa;
                            border-radius: 3px;
                        }
                        .engagement-high { color: #28a745; font-weight: bold; }
                        .engagement-moderate { color: #ffc107; font-weight: bold; }
                        .engagement-low { color: #dc3545; font-weight: bold; }
                        .risk-low-risk { color: #28a745; }
                        .risk-increased-risk { color: #ffc107; }
                        .risk-high-risk { color: #fd7e14; }
                        .risk-possible-diabetes { color: #dc3545; }
                        .trend-improving { color: #28a745; }
                        .trend-stable { color: #6c757d; }
                        .trend-declining { color: #dc3545; }
                        .report-footer {
                            margin-top: 40px;
                            padding-top: 20px;
                            border-top: 1px solid #dee2e6;
                            font-size: 12px;
                            color: #6c757d;
                        }
                        @media print {
                            body { margin: 0; }
                            .report-section { page-break-inside: avoid; }
                        }
                    </style>
                </head>
                <body>
                    ${reportContent.innerHTML}
                </body>
                </html>
            `);
            printWindow.document.close();
            printWindow.print();

            this.showMessage('Report sent to printer', 'success');

        } catch (error) {
            console.error('Print report failed:', error);
            this.showError(`Failed to print report: ${error.message}`);
        }
    }

    // Store generated report for future access
    storeGeneratedReport(reportResult) {
        this.currentReport = reportResult.report;
        this.generatedReports.set(reportResult.cacheKey, {
            report: reportResult.report,
            generatedAt: reportResult.generatedAt,
            dataRange: reportResult.dataRange,
            cacheKey: reportResult.cacheKey
        });

        // Also store in localStorage for persistence
        try {
            const storedReports = JSON.parse(localStorage.getItem('glucobalance-reports') || '[]');
            storedReports.unshift({
                cacheKey: reportResult.cacheKey,
                generatedAt: reportResult.generatedAt,
                dataRange: reportResult.dataRange,
                patientName: reportResult.report.header.patientName
            });

            // Keep only last 10 reports
            if (storedReports.length > 10) {
                storedReports.splice(10);
            }

            localStorage.setItem('glucobalance-reports', JSON.stringify(storedReports));
        } catch (error) {
            console.warn('Failed to store report in localStorage:', error);
        }
    }

    // Set current user (for testing)
    setCurrentUser(user) {
        this.currentUser = user;
    }

    // Show message to user
    showMessage(message, type = 'info') {
        // Create or update message display
        let messageDiv = document.getElementById('report-message');
        if (!messageDiv) {
            messageDiv = document.createElement('div');
            messageDiv.id = 'report-message';
            messageDiv.className = 'message-display';
            
            const container = document.querySelector('.container') || document.body;
            container.insertBefore(messageDiv, container.firstChild);
        }

        messageDiv.className = `message-display ${type}`;
        messageDiv.innerHTML = `
            <span class="message-text">${message}</span>
            <button class="message-close">&times;</button>
        `;

        // Auto-hide after 5 seconds
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.parentNode.removeChild(messageDiv);
            }
        }, 5000);

        // Close button
        messageDiv.querySelector('.message-close').addEventListener('click', () => {
            if (messageDiv.parentNode) {
                messageDiv.parentNode.removeChild(messageDiv);
            }
        });
    }

    // Show error message
    showError(message) {
        this.showMessage(message, 'error');
    }

    getQualityStatus(percentage) {
        if (percentage >= 70) return 'excellent';
        if (percentage >= 50) return 'good';
        if (percentage >= 30) return 'fair';
        return 'poor';
    }

    getQualityLabel(percentage) {
        if (percentage >= 70) return 'Excellent';
        if (percentage >= 50) return 'Good';
        if (percentage >= 30) return 'Fair';
        return 'Poor';
    }

    // Store generated report
    storeGeneratedReport(reportResult) {
        const reportId = `report_${Date.now()}`;
        this.generatedReports.set(reportId, {
            ...reportResult,
            id: reportId,
            generatedAt: new Date().toISOString()
        });
        
        // Also store in localStorage for persistence
        try {
            const storedReports = JSON.parse(localStorage.getItem('glucobalance-reports') || '[]');
            storedReports.unshift({
                id: reportId,
                generatedAt: new Date().toISOString(),
                period: reportResult.dataRange,
                summary: reportResult.report.executiveSummary.substring(0, 100) + '...'
            });
            
            // Keep only last 10 reports
            if (storedReports.length > 10) {
                storedReports.splice(10);
            }
            
            localStorage.setItem('glucobalance-reports', JSON.stringify(storedReports));
        } catch (error) {
            console.error('Failed to store report metadata:', error);
        }
    }

    // Load previous reports
    loadPreviousReports() {
        try {
            const storedReports = JSON.parse(localStorage.getItem('glucobalance-reports') || '[]');
            this.updatePreviousReportsList(storedReports);
        } catch (error) {
            console.error('Failed to load previous reports:', error);
        }
    }

    // Update previous reports list
    updatePreviousReportsList(reports = null) {
        const reportsList = document.getElementById('previous-reports-list');
        if (!reportsList) return;
        
        if (!reports) {
            try {
                reports = JSON.parse(localStorage.getItem('glucobalance-reports') || '[]');
            } catch (error) {
                reports = [];
            }
        }
        
        if (reports.length === 0) {
            reportsList.innerHTML = `
                <div class="empty-state">
                    <span class="icon">📋</span>
                    <p>No previous reports generated</p>
                    <small>Generate your first report to see it here</small>
                </div>
            `;
            return;
        }
        
        reportsList.innerHTML = reports.map(report => `
            <div class="report-item" data-report-id="${report.id}">
                <div class="report-info">
                    <div class="report-date">${new Date(report.generatedAt).toLocaleDateString()}</div>
                    <div class="report-period">${report.period?.startDate} - ${report.period?.endDate}</div>
                    <div class="report-summary">${report.summary}</div>
                </div>
                <div class="report-actions">
                    <button class="btn-small view-report-btn" data-report-id="${report.id}">View</button>
                    <button class="btn-small download-report-btn" data-report-id="${report.id}">Download</button>
                </div>
            </div>
        `).join('');
        
        // Add event listeners for report actions
        reportsList.querySelectorAll('.view-report-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const reportId = e.target.dataset.reportId;
                this.viewPreviousReport(reportId);
            });
        });
        
        reportsList.querySelectorAll('.download-report-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const reportId = e.target.dataset.reportId;
                this.downloadPreviousReport(reportId);
            });
        });
    }

    // Download report as PDF (placeholder - would need PDF library)
    downloadReportAsPDF() {
        // For now, create a text version
        const reportContent = document.getElementById('report-content');
        if (!reportContent) return;
        
        const reportText = this.extractTextFromReport(reportContent);
        this.downloadTextFile(reportText, `glucobalance-report-${new Date().toISOString().split('T')[0]}.txt`);
        
        this.showSuccess('Report downloaded successfully!');
    }

    // Extract text from report HTML
    extractTextFromReport(reportElement) {
        // Create a clean text version of the report
        const clone = reportElement.cloneNode(true);
        
        // Remove unwanted elements
        clone.querySelectorAll('button, .report-actions').forEach(el => el.remove());
        
        // Convert to text with basic formatting
        return clone.innerText || clone.textContent || '';
    }

    // Download text file
    downloadTextFile(content, filename) {
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // Share report (placeholder)
    shareReport() {
        if (navigator.share) {
            navigator.share({
                title: 'GlucoBalance Health Report',
                text: 'My comprehensive health report from GlucoBalance',
                url: window.location.href
            });
        } else {
            // Fallback - copy to clipboard
            this.copyReportLink();
        }
    }

    // Print report
    printReport() {
        const reportContent = document.getElementById('report-content');
        if (!reportContent) return;
        
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head>
                    <title>GlucoBalance Health Report</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 20px; }
                        .clinical-report { max-width: 800px; margin: 0 auto; }
                        .report-section { margin-bottom: 30px; }
                        h1, h2, h3 { color: #007FFF; }
                        .report-header { border-bottom: 2px solid #007FFF; padding-bottom: 20px; margin-bottom: 30px; }
                        .summary-grid, .mood-metrics { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
                        .metric { display: flex; justify-content: space-between; padding: 5px 0; }
                        ul { padding-left: 20px; }
                        .report-footer { border-top: 1px solid #ccc; padding-top: 20px; margin-top: 30px; font-size: 12px; }
                    </style>
                </head>
                <body>
                    ${reportContent.innerHTML}
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    }

    // View previous report
    viewPreviousReport(reportId) {
        const report = this.generatedReports.get(reportId);
        if (report) {
            this.displayGeneratedReport(report);
        } else {
            this.showError('Report not found');
        }
    }

    // Download previous report
    downloadPreviousReport(reportId) {
        const report = this.generatedReports.get(reportId);
        if (report) {
            const reportText = this.formatReportAsText(report.report);
            this.downloadTextFile(reportText, `glucobalance-report-${reportId}.txt`);
        } else {
            this.showError('Report not found');
        }
    }

    // Format report as plain text
    formatReportAsText(report) {
        return `
GLUCOBALANCE COMPREHENSIVE HEALTH REPORT
${report.header.title}
${report.header.subtitle}

Patient: ${report.header.patientName}
Report Date: ${report.header.reportDate}
Period: ${report.header.reportPeriod}

EXECUTIVE SUMMARY
${report.executiveSummary}

CLINICAL FINDINGS
${Array.isArray(report.clinicalFindings.keyFindings) ? report.clinicalFindings.keyFindings.join('\n') : 'No significant findings'}

RECOMMENDATIONS
${Array.isArray(report.recommendations) ? report.recommendations.map(r => `• ${r}`).join('\n') : 'No specific recommendations'}

FOLLOW-UP
${Array.isArray(report.followUp) ? report.followUp.map(f => `• ${f}`).join('\n') : 'Standard follow-up care'}

${report.footer.disclaimer}
Generated: ${report.footer.generatedAt}
        `.trim();
    }

    // Utility methods
    showError(message) {
        if (window.errorHandler) {
            window.errorHandler.showUserError(message, 'error');
        } else {
            alert('Error: ' + message);
        }
    }

    showSuccess(message) {
        if (window.errorHandler) {
            window.errorHandler.showUserError(message, 'success');
        } else {
            // Create temporary success notification
            const notification = document.createElement('div');
            notification.className = 'success-notification';
            notification.textContent = message;
            notification.style.cssText = `
                position: fixed; top: 20px; right: 20px; z-index: 1000;
                background: #4CAF50; color: white; padding: 15px 20px;
                border-radius: 5px; box-shadow: 0 2px 10px rgba(0,0,0,0.2);
            `;
            document.body.appendChild(notification);
            
            setTimeout(() => {
                notification.remove();
            }, 3000);
        }
    }

    // Set current user (called from main app)
    setCurrentUser(user) {
        this.currentUser = user;
    }
}

// Initialize the doctor report UI
window.doctorReportUI = new DoctorReportUI();