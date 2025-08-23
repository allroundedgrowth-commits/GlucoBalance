// GlucoBalance - PDF Export Service
class PDFExportService {
    constructor() {
        this.jsPDFLoaded = false;
        this.init();
    }

    async init() {
        console.log('PDF Export Service initialized');
        await this.loadJsPDF();
    }

    // Load jsPDF library dynamically
    async loadJsPDF() {
        return new Promise((resolve, reject) => {
            if (window.jsPDF) {
                this.jsPDFLoaded = true;
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
            script.onload = () => {
                this.jsPDFLoaded = true;
                console.log('jsPDF library loaded successfully');
                resolve();
            };
            script.onerror = () => {
                console.error('Failed to load jsPDF library');
                reject(new Error('Failed to load PDF library'));
            };
            document.head.appendChild(script);
        });
    }

    // Generate PDF from doctor report
    async generateReportPDF(report, options = {}) {
        if (!this.jsPDFLoaded) {
            await this.loadJsPDF();
        }

        if (!window.jsPDF) {
            throw new Error('PDF library not available');
        }

        try {
            const { jsPDF } = window.jsPDF;
            const doc = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            // Set up document properties
            doc.setProperties({
                title: 'GlucoBalance Health Report',
                subject: 'Comprehensive Diabetes Prevention Health Report',
                author: 'GlucoBalance AI Health Platform',
                creator: 'GlucoBalance PDF Export Service'
            });

            // Generate PDF content
            await this.addReportHeader(doc, report.header);
            await this.addExecutiveSummary(doc, report.executiveSummary);
            await this.addPatientSummary(doc, report.patientSummary);
            await this.addClinicalFindings(doc, report.clinicalFindings);
            await this.addRiskAssessment(doc, report.riskAssessment);
            await this.addMentalHealthAssessment(doc, report.mentalHealthAssessment);
            await this.addLifestyleFactors(doc, report.lifestyleFactors);
            await this.addTrendAnalysis(doc, report.trendAnalysis);
            await this.addRecommendations(doc, report.recommendations);
            await this.addFollowUp(doc, report.followUp);
            await this.addDataQuality(doc, report.dataQuality);
            await this.addReportFooter(doc, report.footer);

            // Generate plain language summary on separate page
            if (options.includePlainLanguage !== false) {
                await this.addPlainLanguageSummary(doc, report);
            }

            return doc;

        } catch (error) {
            console.error('PDF generation failed:', error);
            throw new Error(`PDF generation failed: ${error.message}`);
        }
    }

    // Add professional report header
    async addReportHeader(doc, header) {
        let yPosition = 20;

        // Add logo/header background
        doc.setFillColor(0, 127, 255); // Azure Blue
        doc.rect(0, 0, 210, 40, 'F');

        // Title
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text(header.title, 105, 15, { align: 'center' });

        // Subtitle
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.text(header.subtitle, 105, 25, { align: 'center' });

        // Reset text color
        doc.setTextColor(0, 0, 0);
        yPosition = 50;

        // Patient and report information
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text('PATIENT INFORMATION', 20, yPosition);
        yPosition += 8;

        doc.setFont('helvetica', 'normal');
        doc.text(`Patient Name: ${header.patientName}`, 20, yPosition);
        yPosition += 6;
        doc.text(`Patient ID: ${header.patientId}`, 20, yPosition);
        yPosition += 6;
        doc.text(`Report Date: ${header.reportDate}`, 20, yPosition);
        yPosition += 6;
        doc.text(`Report Period: ${header.reportPeriod}`, 20, yPosition);
        yPosition += 6;
        doc.text(`Report Type: ${header.reportType}`, 20, yPosition);

        return yPosition + 15;
    }

    // Add executive summary section
    async addExecutiveSummary(doc, executiveSummary) {
        let yPosition = this.checkPageBreak(doc, 80);

        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 127, 255);
        doc.text('EXECUTIVE SUMMARY', 20, yPosition);
        yPosition += 10;

        doc.setTextColor(0, 0, 0);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');

        const summaryLines = doc.splitTextToSize(executiveSummary, 170);
        summaryLines.forEach(line => {
            yPosition = this.checkPageBreak(doc, yPosition + 5);
            doc.text(line, 20, yPosition);
        });

        return yPosition + 10;
    }

    // Add patient summary section
    async addPatientSummary(doc, patientSummary) {
        let yPosition = this.checkPageBreak(doc, 120);

        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 127, 255);
        doc.text('PATIENT DEMOGRAPHICS & ENGAGEMENT', 20, yPosition);
        yPosition += 10;

        doc.setTextColor(0, 0, 0);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');

        // Demographics
        const demographics = patientSummary.demographics;
        doc.text(`Age: ${demographics.age}`, 20, yPosition);
        doc.text(`Gender: ${demographics.gender}`, 80, yPosition);
        yPosition += 6;
        doc.text(`Registration Date: ${demographics.registrationDate}`, 20, yPosition);
        yPosition += 10;

        // Engagement metrics
        const engagement = patientSummary.engagementMetrics;
        doc.setFont('helvetica', 'bold');
        doc.text('Engagement Metrics:', 20, yPosition);
        yPosition += 6;

        doc.setFont('helvetica', 'normal');
        doc.text(`Total Data Points: ${engagement.totalDataPoints}`, 20, yPosition);
        doc.text(`Active Days: ${engagement.activeDays}`, 100, yPosition);
        yPosition += 6;
        doc.text(`Engagement Level: ${engagement.engagementLevel}`, 20, yPosition);
        doc.text(`Data Completeness: ${engagement.dataCompleteness}%`, 100, yPosition);

        return yPosition + 10;
    }

    // Add clinical findings section
    async addClinicalFindings(doc, clinicalFindings) {
        let yPosition = this.checkPageBreak(doc, 150);

        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 127, 255);
        doc.text('CLINICAL FINDINGS', 20, yPosition);
        yPosition += 10;

        doc.setTextColor(0, 0, 0);
        doc.setFontSize(10);

        // Key findings
        if (clinicalFindings.keyFindings && Array.isArray(clinicalFindings.keyFindings)) {
            doc.setFont('helvetica', 'bold');
            doc.text('Key Clinical Insights:', 20, yPosition);
            yPosition += 6;

            doc.setFont('helvetica', 'normal');
            clinicalFindings.keyFindings.forEach(finding => {
                yPosition = this.checkPageBreak(doc, yPosition + 5);
                const findingLines = doc.splitTextToSize(`• ${finding}`, 170);
                findingLines.forEach(line => {
                    doc.text(line, 25, yPosition);
                    yPosition += 5;
                });
            });
        }

        // Alerts and concerns
        if (clinicalFindings.alertsAndConcerns && clinicalFindings.alertsAndConcerns.length > 0) {
            yPosition += 5;
            doc.setFont('helvetica', 'bold');
            doc.text('Clinical Alerts & Concerns:', 20, yPosition);
            yPosition += 6;

            doc.setFont('helvetica', 'normal');
            clinicalFindings.alertsAndConcerns.forEach(alert => {
                yPosition = this.checkPageBreak(doc, yPosition + 5);
                const alertLines = doc.splitTextToSize(`⚠ ${alert}`, 170);
                alertLines.forEach(line => {
                    doc.text(line, 25, yPosition);
                    yPosition += 5;
                });
            });
        }

        return yPosition + 10;
    }

    // Add risk assessment section
    async addRiskAssessment(doc, riskAssessment) {
        let yPosition = this.checkPageBreak(doc, 180);

        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 127, 255);
        doc.text('DIABETES RISK ASSESSMENT', 20, yPosition);
        yPosition += 10;

        doc.setTextColor(0, 0, 0);
        doc.setFontSize(10);

        const summary = riskAssessment.assessmentSummary;

        // Risk score display
        doc.setFont('helvetica', 'bold');
        doc.text('Current Risk Status:', 20, yPosition);
        yPosition += 6;

        doc.setFont('helvetica', 'normal');
        doc.text(`Risk Score: ${summary.latestScore || 'Not assessed'}`, 20, yPosition);
        doc.text(`Risk Category: ${summary.latestCategory || 'Not assessed'}`, 100, yPosition);
        yPosition += 6;
        doc.text(`Assessment Date: ${summary.assessmentDate || 'Not available'}`, 20, yPosition);
        doc.text(`Total Assessments: ${summary.totalAssessments}`, 100, yPosition);
        yPosition += 10;

        // Clinical interpretation
        if (riskAssessment.clinicalInterpretation) {
            doc.setFont('helvetica', 'bold');
            doc.text('Clinical Interpretation:', 20, yPosition);
            yPosition += 6;

            doc.setFont('helvetica', 'normal');
            const interpretationLines = doc.splitTextToSize(riskAssessment.clinicalInterpretation, 170);
            interpretationLines.forEach(line => {
                yPosition = this.checkPageBreak(doc, yPosition + 5);
                doc.text(line, 20, yPosition);
            });
        }

        return yPosition + 10;
    }

    // Add mental health assessment section
    async addMentalHealthAssessment(doc, mentalHealth) {
        let yPosition = this.checkPageBreak(doc, 210);

        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 127, 255);
        doc.text('MENTAL HEALTH & MOOD ASSESSMENT', 20, yPosition);
        yPosition += 10;

        doc.setTextColor(0, 0, 0);
        doc.setFontSize(10);

        const mood = mentalHealth.moodAssessment;

        // Mood metrics
        doc.setFont('helvetica', 'bold');
        doc.text('Mood Assessment Summary:', 20, yPosition);
        yPosition += 6;

        doc.setFont('helvetica', 'normal');
        doc.text(`Total Mood Entries: ${mood.totalEntries}`, 20, yPosition);
        doc.text(`Average Mood: ${mood.averageMood || 'N/A'}/5`, 100, yPosition);
        yPosition += 6;
        doc.text(`Mood Trend: ${mood.trend || 'Stable'}`, 20, yPosition);
        yPosition += 10;

        // Mental health recommendations
        if (mentalHealth.mentalHealthRecommendations && mentalHealth.mentalHealthRecommendations.length > 0) {
            doc.setFont('helvetica', 'bold');
            doc.text('Mental Health Recommendations:', 20, yPosition);
            yPosition += 6;

            doc.setFont('helvetica', 'normal');
            mentalHealth.mentalHealthRecommendations.forEach(rec => {
                yPosition = this.checkPageBreak(doc, yPosition + 5);
                const recLines = doc.splitTextToSize(`• ${rec}`, 170);
                recLines.forEach(line => {
                    doc.text(line, 25, yPosition);
                    yPosition += 5;
                });
            });
        }

        return yPosition + 10;
    }

    // Add lifestyle factors section
    async addLifestyleFactors(doc, lifestyle) {
        let yPosition = this.checkPageBreak(doc, 240);

        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 127, 255);
        doc.text('LIFESTYLE & BEHAVIORAL FACTORS', 20, yPosition);
        yPosition += 10;

        doc.setTextColor(0, 0, 0);
        doc.setFontSize(10);

        // Nutritional adherence
        doc.setFont('helvetica', 'bold');
        doc.text('Nutritional Adherence:', 20, yPosition);
        yPosition += 6;

        doc.setFont('helvetica', 'normal');
        const nutrition = lifestyle.nutritionalAdherence;
        doc.text(`Meal Plans Generated: ${nutrition.mealPlansGenerated}`, 20, yPosition);
        doc.text(`Average Adherence: ${nutrition.averageAdherence || 'Not tracked'}`, 100, yPosition);
        yPosition += 10;

        // Lifestyle recommendations
        if (lifestyle.lifestyleRecommendations && lifestyle.lifestyleRecommendations.length > 0) {
            doc.setFont('helvetica', 'bold');
            doc.text('Lifestyle Recommendations:', 20, yPosition);
            yPosition += 6;

            doc.setFont('helvetica', 'normal');
            lifestyle.lifestyleRecommendations.forEach(rec => {
                yPosition = this.checkPageBreak(doc, yPosition + 5);
                const recLines = doc.splitTextToSize(`• ${rec}`, 170);
                recLines.forEach(line => {
                    doc.text(line, 25, yPosition);
                    yPosition += 5;
                });
            });
        }

        return yPosition + 10;
    }

    // Add trend analysis section
    async addTrendAnalysis(doc, trends) {
        let yPosition = this.checkPageBreak(doc, 270);

        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 127, 255);
        doc.text('TREND ANALYSIS', 20, yPosition);
        yPosition += 10;

        doc.setTextColor(0, 0, 0);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');

        // Risk score trends
        doc.setFont('helvetica', 'bold');
        doc.text('Risk Score Trends:', 20, yPosition);
        yPosition += 6;

        doc.setFont('helvetica', 'normal');
        const riskTrendText = JSON.stringify(trends.riskScoreTrends) !== '{}' ? 
            'Trend data available for analysis' : 'Insufficient data for trend analysis';
        doc.text(riskTrendText, 20, yPosition);
        yPosition += 8;

        // Mood trends
        doc.setFont('helvetica', 'bold');
        doc.text('Mood Trends:', 20, yPosition);
        yPosition += 6;

        doc.setFont('helvetica', 'normal');
        doc.text(trends.moodTrends.trend || 'Stable mood pattern observed', 20, yPosition);
        yPosition += 8;

        // Clinical significance
        if (trends.clinicalSignificance) {
            doc.setFont('helvetica', 'bold');
            doc.text('Clinical Significance:', 20, yPosition);
            yPosition += 6;

            doc.setFont('helvetica', 'normal');
            const significanceLines = doc.splitTextToSize(trends.clinicalSignificance, 170);
            significanceLines.forEach(line => {
                yPosition = this.checkPageBreak(doc, yPosition + 5);
                doc.text(line, 20, yPosition);
            });
        }

        return yPosition + 10;
    }

    // Add recommendations section
    async addRecommendations(doc, recommendations) {
        let yPosition = this.checkPageBreak(doc, 300);

        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 127, 255);
        doc.text('CLINICAL RECOMMENDATIONS', 20, yPosition);
        yPosition += 10;

        doc.setTextColor(0, 0, 0);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');

        if (!Array.isArray(recommendations) || recommendations.length === 0) {
            doc.text('No specific recommendations at this time. Continue current monitoring and lifestyle practices.', 20, yPosition);
        } else {
            recommendations.forEach(rec => {
                yPosition = this.checkPageBreak(doc, yPosition + 5);
                const recLines = doc.splitTextToSize(`• ${rec}`, 170);
                recLines.forEach(line => {
                    doc.text(line, 25, yPosition);
                    yPosition += 5;
                });
            });
        }

        return yPosition + 10;
    }

    // Add follow-up section
    async addFollowUp(doc, followUp) {
        let yPosition = this.checkPageBreak(doc, 330);

        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 127, 255);
        doc.text('FOLLOW-UP RECOMMENDATIONS', 20, yPosition);
        yPosition += 10;

        doc.setTextColor(0, 0, 0);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');

        if (!Array.isArray(followUp) || followUp.length === 0) {
            doc.text('Standard follow-up care as clinically indicated.', 20, yPosition);
        } else {
            followUp.forEach(item => {
                yPosition = this.checkPageBreak(doc, yPosition + 5);
                const itemLines = doc.splitTextToSize(`• ${item}`, 170);
                itemLines.forEach(line => {
                    doc.text(line, 25, yPosition);
                    yPosition += 5;
                });
            });
        }

        return yPosition + 10;
    }

    // Add data quality section
    async addDataQuality(doc, dataQuality) {
        let yPosition = this.checkPageBreak(doc, 360);

        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 127, 255);
        doc.text('DATA QUALITY ASSESSMENT', 20, yPosition);
        yPosition += 10;

        doc.setTextColor(0, 0, 0);
        doc.setFontSize(10);

        // Quality metrics
        doc.setFont('helvetica', 'bold');
        doc.text('Data Quality Metrics:', 20, yPosition);
        yPosition += 6;

        doc.setFont('helvetica', 'normal');
        doc.text(`Completeness: ${dataQuality.completeness?.overall || 'Not assessed'}%`, 20, yPosition);
        doc.text(`Reliability: ${dataQuality.reliability || 'Good'}`, 100, yPosition);
        yPosition += 10;

        // Limitations
        if (dataQuality.limitations && dataQuality.limitations.length > 0) {
            doc.setFont('helvetica', 'bold');
            doc.text('Data Limitations:', 20, yPosition);
            yPosition += 6;

            doc.setFont('helvetica', 'normal');
            dataQuality.limitations.forEach(limitation => {
                yPosition = this.checkPageBreak(doc, yPosition + 5);
                const limitationLines = doc.splitTextToSize(`• ${limitation}`, 170);
                limitationLines.forEach(line => {
                    doc.text(line, 25, yPosition);
                    yPosition += 5;
                });
            });
            yPosition += 5;
        }

        // Data collection recommendations
        if (dataQuality.recommendations && dataQuality.recommendations.length > 0) {
            doc.setFont('helvetica', 'bold');
            doc.text('Data Collection Recommendations:', 20, yPosition);
            yPosition += 6;

            doc.setFont('helvetica', 'normal');
            dataQuality.recommendations.forEach(rec => {
                yPosition = this.checkPageBreak(doc, yPosition + 5);
                const recLines = doc.splitTextToSize(`• ${rec}`, 170);
                recLines.forEach(line => {
                    doc.text(line, 25, yPosition);
                    yPosition += 5;
                });
            });
        }

        return yPosition + 10;
    }

    // Add report footer
    async addReportFooter(doc, footer) {
        // Add new page for footer if needed
        doc.addPage();
        let yPosition = 20;

        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 127, 255);
        doc.text('REPORT DISCLAIMER & INFORMATION', 20, yPosition);
        yPosition += 15;

        doc.setTextColor(0, 0, 0);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');

        const disclaimerLines = doc.splitTextToSize(footer.disclaimer, 170);
        disclaimerLines.forEach(line => {
            doc.text(line, 20, yPosition);
            yPosition += 5;
        });

        yPosition += 15;

        // Generation info
        doc.setFont('helvetica', 'bold');
        doc.text('Report Generation Information:', 20, yPosition);
        yPosition += 8;

        doc.setFont('helvetica', 'normal');
        doc.text(`Generated: ${new Date(footer.generatedAt).toLocaleString()}`, 20, yPosition);
        yPosition += 5;
        doc.text(`Version: ${footer.version}`, 20, yPosition);
        yPosition += 5;
        doc.text(`Contact: ${footer.contact}`, 20, yPosition);

        return yPosition;
    }

    // Add plain language summary page
    async addPlainLanguageSummary(doc, report) {
        doc.addPage();
        let yPosition = 20;

        // Header
        doc.setFillColor(0, 127, 255);
        doc.rect(0, 0, 210, 30, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('PLAIN LANGUAGE SUMMARY', 105, 20, { align: 'center' });

        doc.setTextColor(0, 0, 0);
        yPosition = 45;

        // Generate plain language content
        const plainLanguageContent = this.generatePlainLanguageSummary(report);

        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');

        Object.entries(plainLanguageContent).forEach(([section, content]) => {
            yPosition = this.checkPageBreak(doc, yPosition + 15);

            // Section header
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(0, 127, 255);
            doc.text(section.toUpperCase(), 20, yPosition);
            yPosition += 8;

            // Section content
            doc.setTextColor(0, 0, 0);
            doc.setFont('helvetica', 'normal');
            const contentLines = doc.splitTextToSize(content, 170);
            contentLines.forEach(line => {
                yPosition = this.checkPageBreak(doc, yPosition + 5);
                doc.text(line, 20, yPosition);
            });
            yPosition += 5;
        });

        return yPosition;
    }

    // Generate plain language summary content
    generatePlainLanguageSummary(report) {
        const summary = {};

        // What this report shows
        summary['What This Report Shows'] = `This report summarizes your health information from the past 30 days using the GlucoBalance app. It includes your diabetes risk assessment, mood tracking, nutrition plans, and overall health trends. This information can help you and your healthcare provider understand your health status and make informed decisions about your care.`;

        // Your diabetes risk
        const riskScore = report.riskAssessment?.assessmentSummary?.latestScore;
        const riskCategory = report.riskAssessment?.assessmentSummary?.latestCategory;
        if (riskScore && riskCategory) {
            summary['Your Diabetes Risk'] = `Your current diabetes risk score is ${riskScore}, which puts you in the "${riskCategory}" category. ${this.getRiskExplanation(riskCategory)} Regular monitoring and healthy lifestyle choices can help manage this risk.`;
        }

        // Your mood and mental health
        const avgMood = report.mentalHealthAssessment?.moodAssessment?.averageMood;
        const moodTrend = report.mentalHealthAssessment?.moodAssessment?.trend;
        if (avgMood) {
            summary['Your Mood and Mental Health'] = `Over the past month, your average mood rating was ${avgMood} out of 5. Your mood trend is ${moodTrend || 'stable'}. Mental health is an important part of overall wellness, and tracking your mood helps identify patterns that might affect your health.`;
        }

        // Your nutrition and lifestyle
        const mealPlans = report.lifestyleFactors?.nutritionalAdherence?.mealPlansGenerated;
        const adherence = report.lifestyleFactors?.nutritionalAdherence?.averageAdherence;
        if (mealPlans) {
            summary['Your Nutrition and Lifestyle'] = `You generated ${mealPlans} meal plans during this period${adherence ? ` with an average adherence rate of ${Math.round(adherence * 100)}%` : ''}. Following a healthy eating plan is one of the most effective ways to prevent diabetes and maintain good health.`;
        }

        // What to do next
        const hasRecommendations = report.recommendations && Array.isArray(report.recommendations) && report.recommendations.length > 0;
        if (hasRecommendations) {
            summary['What To Do Next'] = `Based on your health data, here are the key recommendations: ${report.recommendations.slice(0, 2).join('. ')}. Discuss these recommendations with your healthcare provider to create a personalized plan for your health.`;
        } else {
            summary['What To Do Next'] = `Continue using the GlucoBalance app to track your health metrics. Maintain healthy eating habits, stay physically active, and monitor your mood regularly. Share this report with your healthcare provider during your next appointment.`;
        }

        // Questions for your doctor
        summary['Questions for Your Doctor'] = `Consider asking your healthcare provider: "What do these results mean for my health?" "Should I make any changes to my lifestyle?" "How often should I monitor these metrics?" "Are there any additional tests or screenings I should consider?" Your doctor can help interpret these results in the context of your overall health.`;

        return summary;
    }

    // Get risk explanation for plain language
    getRiskExplanation(category) {
        switch (category?.toLowerCase()) {
            case 'low risk':
                return 'This means you have a lower chance of developing diabetes, but it\'s still important to maintain healthy habits.';
            case 'increased risk':
                return 'This means you have a higher than average chance of developing diabetes. Making healthy lifestyle changes can help reduce this risk.';
            case 'high risk':
                return 'This means you have a significant chance of developing diabetes. It\'s important to work with your healthcare provider on prevention strategies.';
            case 'possible diabetes':
                return 'This suggests you may already have diabetes. You should see your healthcare provider as soon as possible for proper testing and diagnosis.';
            default:
                return 'Your healthcare provider can help explain what this means for your health.';
        }
    }

    // Check if we need a page break and add one if necessary
    checkPageBreak(doc, yPosition, minSpace = 20) {
        if (yPosition > 280 - minSpace) {
            doc.addPage();
            return 20;
        }
        return yPosition;
    }

    // Download PDF file
    async downloadPDF(doc, filename = null) {
        if (!filename) {
            const timestamp = new Date().toISOString().split('T')[0];
            filename = `glucobalance-health-report-${timestamp}.pdf`;
        }

        doc.save(filename);
        return filename;
    }

    // Get PDF as blob for sharing
    async getPDFBlob(doc) {
        return doc.output('blob');
    }

    // Get PDF as data URL for preview
    async getPDFDataURL(doc) {
        return doc.output('dataurlstring');
    }

    // Generate personalized data collection suggestions
    generateDataCollectionSuggestions(healthData) {
        const suggestions = [];
        const completeness = healthData.summary?.dataCompleteness || {};

        // Risk assessment suggestions
        if ((completeness.assessments || 0) < 50) {
            suggestions.push({
                category: 'Risk Assessment',
                suggestion: 'Complete diabetes risk assessments more regularly (recommended: monthly) to track changes in your risk profile over time.',
                priority: 'High',
                action: 'Take a risk assessment in the GlucoBalance app'
            });
        }

        // Mood tracking suggestions
        if ((completeness.mood || 0) < 70) {
            suggestions.push({
                category: 'Mood Tracking',
                suggestion: 'Log your daily mood more consistently to help identify patterns and triggers that affect your mental health.',
                priority: 'Medium',
                action: 'Set daily reminders to log your mood'
            });
        }

        // Nutrition suggestions
        if ((completeness.nutrition || 0) < 30) {
            suggestions.push({
                category: 'Nutrition Planning',
                suggestion: 'Generate and follow more meal plans to improve your dietary habits and diabetes prevention efforts.',
                priority: 'High',
                action: 'Create a new meal plan and track your adherence'
            });
        }

        // General engagement suggestions
        if ((completeness.overall || 0) < 50) {
            suggestions.push({
                category: 'Overall Engagement',
                suggestion: 'Increase your overall app usage to provide more comprehensive data for better health insights and recommendations.',
                priority: 'Medium',
                action: 'Set up daily notifications and reminders'
            });
        }

        return suggestions;
    }

    // Add data collection suggestions to PDF
    async addDataCollectionSuggestions(doc, healthData) {
        const suggestions = this.generateDataCollectionSuggestions(healthData);
        
        if (suggestions.length === 0) {
            return;
        }

        let yPosition = this.checkPageBreak(doc, 400);

        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 127, 255);
        doc.text('PERSONALIZED DATA COLLECTION SUGGESTIONS', 20, yPosition);
        yPosition += 10;

        doc.setTextColor(0, 0, 0);
        doc.setFontSize(10);

        suggestions.forEach(suggestion => {
            yPosition = this.checkPageBreak(doc, yPosition + 15);

            // Category and priority
            doc.setFont('helvetica', 'bold');
            doc.text(`${suggestion.category} (Priority: ${suggestion.priority})`, 20, yPosition);
            yPosition += 6;

            // Suggestion text
            doc.setFont('helvetica', 'normal');
            const suggestionLines = doc.splitTextToSize(suggestion.suggestion, 170);
            suggestionLines.forEach(line => {
                doc.text(line, 20, yPosition);
                yPosition += 5;
            });

            // Action
            doc.setFont('helvetica', 'italic');
            doc.text(`Recommended Action: ${suggestion.action}`, 20, yPosition);
            yPosition += 8;
        });

        return yPosition;
    }
}

// Initialize PDF Export Service
window.pdfExportService = new PDFExportService();