// GlucoBalance - Doctor Report Verification Script
class DoctorReportVerification {
    constructor() {
        this.testResults = [];
        this.mockUserId = 'verify-user-' + Date.now();
        this.reportService = null;
        this.reportUI = null;
    }

    async runVerification() {
        console.log('🏥 Starting Doctor Report System Verification...\n');
        
        try {
            // Initialize services
            await this.initializeServices();
            
            // Run verification tests
            await this.verifyServiceInitialization();
            await this.verifyMockDataGeneration();
            await this.verifyDataAggregation();
            await this.verifyAIAnalysis();
            await this.verifyReportGeneration();
            await this.verifyReportFormatting();
            await this.verifyUIComponents();
            
            // Display results
            this.displayResults();
            
        } catch (error) {
            console.error('❌ Verification failed:', error);
            this.addResult('CRITICAL', 'Verification process failed', error.message);
            this.displayResults();
        }
    }

    async initializeServices() {
        console.log('🔧 Initializing services...');
        
        // Wait for services to be available
        let attempts = 0;
        while ((!window.doctorReportService || !window.doctorReportUI) && attempts < 10) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        
        this.reportService = window.doctorReportService;
        this.reportUI = window.doctorReportUI;
        
        if (!this.reportService) {
            throw new Error('Doctor Report Service not available');
        }
        
        if (!this.reportUI) {
            throw new Error('Doctor Report UI not available');
        }
        
        console.log('✅ Services initialized successfully');
    }

    async verifyServiceInitialization() {
        console.log('🔍 Verifying service initialization...');
        
        try {
            // Check report service
            if (this.reportService && typeof this.reportService.generateDoctorReport === 'function') {
                this.addResult('PASS', 'Doctor Report Service', 'Service initialized with required methods');
            } else {
                this.addResult('FAIL', 'Doctor Report Service', 'Service missing or incomplete');
            }
            
            // Check report UI
            if (this.reportUI && typeof this.reportUI.createDoctorReportPage === 'function') {
                this.addResult('PASS', 'Doctor Report UI', 'UI component initialized with required methods');
            } else {
                this.addResult('FAIL', 'Doctor Report UI', 'UI component missing or incomplete');
            }
            
            // Check database integration
            if (window.kiroDb) {
                this.addResult('PASS', 'Database Integration', 'Kiro database available for data operations');
            } else {
                this.addResult('WARN', 'Database Integration', 'Database not available - using fallback storage');
            }
            
            // Check AI integration
            if (window.aiService || window.geminiAI) {
                this.addResult('PASS', 'AI Integration', 'AI service available for report analysis');
            } else {
                this.addResult('WARN', 'AI Integration', 'AI service not available - using fallback content');
            }
            
        } catch (error) {
            this.addResult('FAIL', 'Service Initialization', error.message);
        }
    }

    async verifyMockDataGeneration() {
        console.log('📊 Verifying mock data generation...');
        
        try {
            // Create mock user
            const mockUser = {
                id: this.mockUserId,
                name: 'Test Patient',
                age: 45,
                gender: 'male',
                email: 'test@example.com',
                createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()
            };

            if (window.kiroDb) {
                await window.kiroDb.createUser(mockUser);
                this.addResult('PASS', 'Mock User Creation', 'Test user created successfully');
            }

            // Generate mock health data
            await this.generateMockHealthData();
            this.addResult('PASS', 'Mock Data Generation', 'Comprehensive health data generated for testing');
            
        } catch (error) {
            this.addResult('FAIL', 'Mock Data Generation', error.message);
        }
    }

    async generateMockHealthData() {
        const today = new Date();
        
        // Generate risk assessments
        const assessments = [
            {
                date: new Date(today.getTime() - 25 * 24 * 60 * 60 * 1000).toISOString(),
                riskScore: 18,
                category: 'High Risk',
                responses: { age: 3, gender: 1, family_history: 5, bmi: 3 },
                explanation: 'High risk due to multiple factors'
            },
            {
                date: new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
                riskScore: 16,
                category: 'High Risk',
                responses: { age: 3, gender: 1, family_history: 5, bmi: 2 },
                explanation: 'Slight improvement with lifestyle changes'
            }
        ];

        for (const assessment of assessments) {
            if (window.kiroDb) {
                await window.kiroDb.saveAssessment(this.mockUserId, assessment);
            }
        }

        // Generate mood data
        for (let i = 0; i < 30; i++) {
            const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
            const dateStr = date.toISOString().split('T')[0];
            const mood = Math.floor(Math.random() * 5) + 1;
            
            if (window.kiroDb) {
                await window.kiroDb.saveMood(this.mockUserId, dateStr, mood, 'Test mood entry');
            }
        }

        // Generate nutrition plans
        const nutritionPlans = [
            {
                planType: '3-day',
                cuisine: 'mediterranean',
                adherence: 0.85,
                createdAt: new Date(today.getTime() - 20 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                planType: '3-day',
                cuisine: 'general',
                adherence: 0.72,
                createdAt: new Date(today.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString()
            }
        ];

        for (const plan of nutritionPlans) {
            if (window.kiroDb) {
                await window.kiroDb.saveNutritionPlan(this.mockUserId, plan);
            }
        }
    }

    async verifyDataAggregation() {
        console.log('📈 Verifying data aggregation...');
        
        try {
            const healthData = await this.reportService.aggregateHealthData(this.mockUserId, 30);
            
            // Verify data structure
            if (healthData.patient && healthData.dateRange && healthData.summary) {
                this.addResult('PASS', 'Data Structure', 'Health data properly structured with all required sections');
            } else {
                this.addResult('FAIL', 'Data Structure', 'Health data missing required sections');
            }
            
            // Verify data content
            const hasRiskData = healthData.riskAssessments && healthData.riskAssessments.totalAssessments > 0;
            const hasMoodData = healthData.mentalHealth && healthData.mentalHealth.totalEntries > 0;
            const hasNutritionData = healthData.nutrition && healthData.nutrition.totalPlans > 0;
            
            if (hasRiskData && hasMoodData && hasNutritionData) {
                this.addResult('PASS', 'Data Completeness', 'All health data types successfully aggregated');
            } else {
                this.addResult('WARN', 'Data Completeness', 'Some health data types missing or incomplete');
            }
            
            // Verify date range
            if (healthData.dateRange.totalDays === 30) {
                this.addResult('PASS', 'Date Range Processing', '30-day period correctly processed');
            } else {
                this.addResult('FAIL', 'Date Range Processing', 'Incorrect date range calculation');
            }
            
        } catch (error) {
            this.addResult('FAIL', 'Data Aggregation', error.message);
        }
    }

    async verifyAIAnalysis() {
        console.log('🤖 Verifying AI analysis...');
        
        try {
            const healthData = await this.reportService.aggregateHealthData(this.mockUserId, 30);
            const aiAnalysis = await this.reportService.generateAIAnalysis(healthData);
            
            // Verify AI analysis structure
            if (aiAnalysis.executiveSummary && aiAnalysis.clinicalInsights && aiAnalysis.recommendations) {
                this.addResult('PASS', 'AI Analysis Structure', 'AI analysis contains all required components');
            } else {
                this.addResult('FAIL', 'AI Analysis Structure', 'AI analysis missing required components');
            }
            
            // Verify content quality
            if (aiAnalysis.executiveSummary.length > 50) {
                this.addResult('PASS', 'AI Content Quality', 'Executive summary generated with adequate detail');
            } else {
                this.addResult('WARN', 'AI Content Quality', 'AI content may be using fallback responses');
            }
            
            // Verify recommendations
            if (Array.isArray(aiAnalysis.recommendations) && aiAnalysis.recommendations.length > 0) {
                this.addResult('PASS', 'AI Recommendations', 'Clinical recommendations generated successfully');
            } else {
                this.addResult('WARN', 'AI Recommendations', 'Limited or no recommendations generated');
            }
            
        } catch (error) {
            this.addResult('FAIL', 'AI Analysis', error.message);
        }
    }

    async verifyReportGeneration() {
        console.log('📋 Verifying report generation...');
        
        try {
            const reportResult = await this.reportService.generateDoctorReport(this.mockUserId, {
                days: 30,
                includeAIAnalysis: true,
                format: 'clinical'
            });
            
            // Verify report result structure
            if (reportResult.success && reportResult.report && reportResult.cacheKey) {
                this.addResult('PASS', 'Report Generation', 'Doctor report generated successfully');
            } else {
                this.addResult('FAIL', 'Report Generation', 'Report generation failed or incomplete');
            }
            
            // Verify report sections
            const report = reportResult.report;
            const requiredSections = [
                'header', 'patientSummary', 'executiveSummary', 'clinicalFindings',
                'riskAssessment', 'mentalHealthAssessment', 'recommendations', 'footer'
            ];
            
            const missingSections = requiredSections.filter(section => !report[section]);
            
            if (missingSections.length === 0) {
                this.addResult('PASS', 'Report Completeness', 'All required report sections present');
            } else {
                this.addResult('FAIL', 'Report Completeness', `Missing sections: ${missingSections.join(', ')}`);
            }
            
            // Verify medical terminology
            const executiveSummary = report.executiveSummary || '';
            const hasMedicalTerms = /diabetes|risk|assessment|clinical|patient|health/i.test(executiveSummary);
            
            if (hasMedicalTerms) {
                this.addResult('PASS', 'Medical Terminology', 'Report contains appropriate medical terminology');
            } else {
                this.addResult('WARN', 'Medical Terminology', 'Limited medical terminology detected');
            }
            
        } catch (error) {
            this.addResult('FAIL', 'Report Generation', error.message);
        }
    }

    async verifyReportFormatting() {
        console.log('🎨 Verifying report formatting...');
        
        try {
            const reportResult = await this.reportService.generateDoctorReport(this.mockUserId, { days: 30 });
            const formattedHTML = this.reportUI.formatReportForDisplay(reportResult.report);
            
            // Verify HTML structure
            if (formattedHTML.includes('clinical-report') && formattedHTML.includes('report-section')) {
                this.addResult('PASS', 'HTML Formatting', 'Report properly formatted for display');
            } else {
                this.addResult('FAIL', 'HTML Formatting', 'Report formatting incomplete or incorrect');
            }
            
            // Verify professional layout elements
            const hasHeader = formattedHTML.includes('report-header');
            const hasSections = formattedHTML.includes('Executive Summary');
            const hasFooter = formattedHTML.includes('report-footer');
            
            if (hasHeader && hasSections && hasFooter) {
                this.addResult('PASS', 'Professional Layout', 'Report includes all professional layout elements');
            } else {
                this.addResult('WARN', 'Professional Layout', 'Some layout elements may be missing');
            }
            
        } catch (error) {
            this.addResult('FAIL', 'Report Formatting', error.message);
        }
    }

    async verifyUIComponents() {
        console.log('🖥️ Verifying UI components...');
        
        try {
            // Test UI page creation
            this.reportUI.createDoctorReportPage();
            const reportPage = document.getElementById('doctor-report-page');
            
            if (reportPage) {
                this.addResult('PASS', 'UI Page Creation', 'Doctor report page created successfully');
            } else {
                this.addResult('FAIL', 'UI Page Creation', 'Failed to create doctor report page');
            }
            
            // Test UI components
            const hasGenerator = reportPage && reportPage.querySelector('.report-generator');
            const hasProgress = reportPage && reportPage.querySelector('.report-progress');
            const hasDisplay = reportPage && reportPage.querySelector('.report-display');
            
            if (hasGenerator && hasProgress && hasDisplay) {
                this.addResult('PASS', 'UI Components', 'All UI components present and accessible');
            } else {
                this.addResult('WARN', 'UI Components', 'Some UI components may be missing');
            }
            
            // Test user interaction elements
            const generateBtn = reportPage && reportPage.querySelector('#generate-report-btn');
            const downloadBtn = reportPage && reportPage.querySelector('#download-pdf-btn');
            
            if (generateBtn && downloadBtn) {
                this.addResult('PASS', 'User Interactions', 'Interactive elements properly configured');
            } else {
                this.addResult('WARN', 'User Interactions', 'Some interactive elements may be missing');
            }
            
        } catch (error) {
            this.addResult('FAIL', 'UI Components', error.message);
        }
    }

    addResult(status, component, message) {
        this.testResults.push({
            status,
            component,
            message,
            timestamp: new Date().toISOString()
        });
    }

    displayResults() {
        console.log('\n📊 DOCTOR REPORT VERIFICATION RESULTS\n');
        console.log('='.repeat(60));
        
        const statusCounts = {
            PASS: 0,
            WARN: 0,
            FAIL: 0,
            CRITICAL: 0
        };
        
        this.testResults.forEach(result => {
            const icon = {
                PASS: '✅',
                WARN: '⚠️',
                FAIL: '❌',
                CRITICAL: '🚨'
            }[result.status];
            
            console.log(`${icon} ${result.status.padEnd(8)} | ${result.component.padEnd(25)} | ${result.message}`);
            statusCounts[result.status]++;
        });
        
        console.log('='.repeat(60));
        console.log(`\n📈 SUMMARY:`);
        console.log(`   ✅ Passed: ${statusCounts.PASS}`);
        console.log(`   ⚠️  Warnings: ${statusCounts.WARN}`);
        console.log(`   ❌ Failed: ${statusCounts.FAIL}`);
        console.log(`   🚨 Critical: ${statusCounts.CRITICAL}`);
        
        const totalTests = this.testResults.length;
        const successRate = ((statusCounts.PASS / totalTests) * 100).toFixed(1);
        
        console.log(`\n🎯 Success Rate: ${successRate}%`);
        
        if (statusCounts.CRITICAL > 0) {
            console.log('\n🚨 CRITICAL ISSUES DETECTED - System may not function properly');
        } else if (statusCounts.FAIL > 0) {
            console.log('\n⚠️  Some components failed - Review and fix issues');
        } else if (statusCounts.WARN > 0) {
            console.log('\n✅ System functional with minor warnings');
        } else {
            console.log('\n🎉 ALL TESTS PASSED - Doctor Report System fully functional!');
        }
        
        console.log('\n' + '='.repeat(60));
    }
}

// Auto-run verification when script loads
if (typeof window !== 'undefined') {
    // Browser environment
    window.addEventListener('load', () => {
        setTimeout(() => {
            const verification = new DoctorReportVerification();
            verification.runVerification();
        }, 2000); // Wait for all services to initialize
    });
} else {
    // Node.js environment
    const verification = new DoctorReportVerification();
    verification.runVerification();
}