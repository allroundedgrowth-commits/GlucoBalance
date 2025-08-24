// GlucoBalance - Doctor Report Generation System
class DoctorReportService {
    constructor() {
        this.db = window.kiroDb;
        this.ai = window.aiService || window.geminiAI;
        this.reportCache = new Map();
        this.init();
    }

    init() {
        console.log('Doctor Report Service initialized');
    }

    // Main method to generate comprehensive doctor report
    async generateDoctorReport(userId, options = {}) {
        try {
            const reportOptions = {
                days: options.days || 30,
                includeAIAnalysis: options.includeAIAnalysis !== false,
                format: options.format || 'clinical',
                ...options
            };

            // Step 1: Aggregate 30-day health data across all metrics
            const healthData = await this.aggregateHealthData(userId, reportOptions.days);
            
            // Step 2: Generate AI analysis and insights
            let aiAnalysis = null;
            if (reportOptions.includeAIAnalysis && this.ai) {
                aiAnalysis = await this.generateAIAnalysis(healthData, reportOptions);
            }

            // Step 3: Create professional report structure
            const report = await this.formatClinicalReport(healthData, aiAnalysis, reportOptions);

            // Step 4: Cache report for potential re-use
            const cacheKey = `${userId}-${reportOptions.days}-${Date.now()}`;
            this.reportCache.set(cacheKey, report);

            return {
                success: true,
                report: report,
                cacheKey: cacheKey,
                generatedAt: new Date().toISOString(),
                dataRange: {
                    startDate: healthData.dateRange.startDate,
                    endDate: healthData.dateRange.endDate,
                    totalDays: reportOptions.days
                }
            };

        } catch (error) {
            console.error('Doctor report generation failed:', error);
            throw new Error(`Failed to generate doctor report: ${error.message}`);
        }
    }

    // Aggregate 30-day health data across all metrics
    async aggregateHealthData(userId, days = 30) {
        const endDate = new Date();
        const startDate = new Date(endDate.getTime() - (days * 24 * 60 * 60 * 1000));

        try {
            // Fetch all health data types in parallel
            const [assessments, moods, nutritionPlans, progressData, userData] = await Promise.all([
                this.db.getUserAssessments(userId, 10), // Get more assessments for trend analysis
                this.db.getUserMoods(userId, days),
                this.db.getUserNutritionPlans(userId, 5),
                this.db.getUserProgress(userId, null, days),
                this.db.getUser(userId)
            ]);

            // Process and analyze the data
            const processedData = {
                patient: {
                    id: userId,
                    name: userData?.name || 'Patient',
                    age: userData?.age || null,
                    gender: userData?.gender || null,
                    registrationDate: userData?.createdAt || null
                },
                dateRange: {
                    startDate: startDate.toISOString().split('T')[0],
                    endDate: endDate.toISOString().split('T')[0],
                    totalDays: days
                },
                riskAssessments: this.processRiskAssessments(assessments, startDate, endDate),
                mentalHealth: this.processMentalHealthData(moods, startDate, endDate),
                nutrition: this.processNutritionData(nutritionPlans, startDate, endDate),
                progressMetrics: this.processProgressData(progressData, startDate, endDate),
                summary: {}
            };

            // Generate summary statistics
            processedData.summary = this.generateDataSummary(processedData);

            return processedData;

        } catch (error) {
            console.error('Health data aggregation failed:', error);
            throw new Error(`Data aggregation failed: ${error.message}`);
        }
    }

    // Process risk assessment data for clinical reporting
    processRiskAssessments(assessments, startDate, endDate) {
        const filteredAssessments = assessments.filter(assessment => {
            const assessmentDate = new Date(assessment.createdAt);
            return assessmentDate >= startDate && assessmentDate <= endDate;
        });

        const processed = {
            totalAssessments: filteredAssessments.length,
            assessments: filteredAssessments.map(assessment => ({
                date: assessment.createdAt.split('T')[0],
                score: assessment.riskScore || assessment.score,
                category: assessment.category || this.getRiskCategory(assessment.riskScore || assessment.score),
                responses: assessment.responses || {},
                aiExplanation: assessment.explanation || assessment.aiExplanation
            })),
            trends: {},
            clinicalInsights: {}
        };

        if (processed.totalAssessments > 0) {
            // Calculate trends
            processed.trends = this.calculateRiskTrends(processed.assessments);
            
            // Generate clinical insights
            processed.clinicalInsights = this.generateRiskClinicalInsights(processed.assessments);
        }

        return processed;
    }

    // Process mental health/mood data for clinical reporting
    processMentalHealthData(moods, startDate, endDate) {
        const filteredMoods = moods.filter(mood => {
            const moodDate = new Date(mood.date);
            return moodDate >= startDate && moodDate <= endDate;
        });

        const processed = {
            totalEntries: filteredMoods.length,
            moodEntries: filteredMoods.map(mood => ({
                date: mood.date,
                score: mood.mood,
                notes: mood.notes || '',
                aiSupport: mood.aiAffirmation || mood.supportMessage
            })),
            statistics: {},
            clinicalAssessment: {}
        };

        if (processed.totalEntries > 0) {
            processed.statistics = this.calculateMoodStatistics(processed.moodEntries);
            processed.clinicalAssessment = this.generateMoodClinicalAssessment(processed.moodEntries);
        }

        return processed;
    }

    // Process nutrition data for clinical reporting
    processNutritionData(nutritionPlans, startDate, endDate) {
        const filteredPlans = nutritionPlans.filter(plan => {
            const planDate = new Date(plan.createdAt);
            return planDate >= startDate && planDate <= endDate;
        });

        return {
            totalPlans: filteredPlans.length,
            plans: filteredPlans.map(plan => ({
                date: plan.createdAt.split('T')[0],
                type: plan.planType || '3-day',
                cuisine: plan.cuisine || 'general',
                adherence: plan.adherence || 0,
                restrictions: plan.restrictions || plan.dietaryRestrictions || []
            })),
            adherenceAnalysis: this.calculateNutritionAdherence(filteredPlans),
            clinicalRecommendations: this.generateNutritionClinicalRecommendations(filteredPlans)
        };
    }

    // Process general progress data
    processProgressData(progressData, startDate, endDate) {
        const filteredProgress = progressData.filter(progress => {
            const progressDate = new Date(progress.date);
            return progressDate >= startDate && progressDate <= endDate;
        });

        const groupedByMetric = {};
        filteredProgress.forEach(progress => {
            if (!groupedByMetric[progress.metricType]) {
                groupedByMetric[progress.metricType] = [];
            }
            groupedByMetric[progress.metricType].push({
                date: progress.date,
                value: progress.value,
                metadata: progress.metadata || {}
            });
        });

        return {
            totalEntries: filteredProgress.length,
            metricTypes: Object.keys(groupedByMetric),
            metrics: groupedByMetric,
            trends: this.calculateProgressTrends(groupedByMetric)
        };
    }

    // Generate comprehensive data summary
    generateDataSummary(processedData) {
        return {
            dataCompleteness: this.assessDataCompleteness(processedData),
            keyFindings: this.identifyKeyFindings(processedData),
            riskProfile: this.generateRiskProfile(processedData),
            engagementLevel: this.assessEngagementLevel(processedData),
            clinicalPriorities: this.identifyClinicalPriorities(processedData)
        };
    }

    // Generate AI analysis for clinician-ready report formatting
    async generateAIAnalysis(healthData, options = {}) {
        if (!this.ai || !this.ai.isAvailable()) {
            return this.generateFallbackAnalysis(healthData);
        }

        try {
            const analysisPrompt = this.buildClinicalAnalysisPrompt(healthData, options);
            
            const aiResponse = await this.ai.generateContent(analysisPrompt, {
                healthData: healthData,
                reportType: 'clinical',
                audience: 'healthcare_provider'
            });

            return {
                executiveSummary: await this.extractExecutiveSummary(aiResponse),
                clinicalInsights: await this.extractClinicalInsights(aiResponse),
                riskFactorAnalysis: await this.extractRiskFactorAnalysis(aiResponse),
                recommendations: await this.extractRecommendations(aiResponse),
                followUpSuggestions: await this.extractFollowUpSuggestions(aiResponse),
                fullAnalysis: aiResponse
            };

        } catch (error) {
            console.error('AI analysis generation failed:', error);
            return this.generateFallbackAnalysis(healthData);
        }
    }

    // Build clinical analysis prompt for Gemini AI
    buildClinicalAnalysisPrompt(healthData, options) {
        const prompt = `As a clinical data analyst specializing in diabetes prevention and management, provide a comprehensive analysis of this patient's 30-day health data for healthcare providers.

PATIENT PROFILE:
- Name: ${healthData.patient.name}
- Age: ${healthData.patient.age || 'Not specified'}
- Gender: ${healthData.patient.gender || 'Not specified'}
- Data Period: ${healthData.dateRange.startDate} to ${healthData.dateRange.endDate}

DIABETES RISK ASSESSMENT DATA:
- Total Assessments: ${healthData.riskAssessments.totalAssessments}
- Latest Risk Score: ${healthData.riskAssessments.assessments[0]?.score || 'Not available'}
- Risk Category: ${healthData.riskAssessments.assessments[0]?.category || 'Not assessed'}
- Risk Trend: ${JSON.stringify(healthData.riskAssessments.trends)}

MENTAL HEALTH DATA:
- Total Mood Entries: ${healthData.mentalHealth.totalEntries}
- Average Mood: ${healthData.mentalHealth.statistics?.averageMood || 'Not available'}
- Mood Trend: ${healthData.mentalHealth.statistics?.trend || 'Not available'}

NUTRITION DATA:
- Meal Plans Generated: ${healthData.nutrition.totalPlans}
- Average Adherence: ${healthData.nutrition.adherenceAnalysis?.averageAdherence || 'Not tracked'}

ENGAGEMENT DATA:
- Data Completeness: ${healthData.summary.dataCompleteness?.overall || 'Not assessed'}%
- Engagement Level: ${healthData.summary.engagementLevel || 'Not assessed'}

Please provide a clinical analysis including:

1. EXECUTIVE SUMMARY (2-3 sentences)
   - Overall patient status and key findings

2. CLINICAL INSIGHTS (bullet points)
   - Diabetes risk assessment interpretation
   - Mental health status evaluation
   - Lifestyle adherence patterns
   - Data quality and engagement assessment

3. RISK FACTOR ANALYSIS
   - Primary risk factors identified
   - Modifiable vs non-modifiable factors
   - Trend analysis and progression

4. CLINICAL RECOMMENDATIONS
   - Immediate interventions needed
   - Lifestyle modification priorities
   - Monitoring recommendations
   - Referral considerations

5. FOLLOW-UP SUGGESTIONS
   - Recommended follow-up timeline
   - Additional assessments needed
   - Patient education priorities

Use medical terminology appropriate for healthcare providers. Focus on actionable insights and evidence-based recommendations. Limit response to 400-500 words total.`;

        return prompt;
    }

    // Format clinical report with professional layout and medical terminology
    async formatClinicalReport(healthData, aiAnalysis, options = {}) {
        const report = {
            header: this.generateReportHeader(healthData, options),
            patientSummary: this.generatePatientSummary(healthData),
            executiveSummary: aiAnalysis?.executiveSummary || this.generateFallbackExecutiveSummary(healthData),
            clinicalFindings: this.generateClinicalFindings(healthData, aiAnalysis),
            riskAssessment: this.generateRiskAssessmentSection(healthData),
            mentalHealthAssessment: this.generateMentalHealthSection(healthData),
            lifestyleFactors: this.generateLifestyleSection(healthData),
            trendAnalysis: this.generateTrendAnalysisSection(healthData),
            recommendations: aiAnalysis?.recommendations || this.generateFallbackRecommendations(healthData),
            followUp: aiAnalysis?.followUpSuggestions || this.generateFallbackFollowUp(healthData),
            dataQuality: this.generateDataQualitySection(healthData),
            footer: this.generateReportFooter()
        };

        return report;
    }

    // Generate professional report header
    generateReportHeader(healthData, options) {
        return {
            title: 'COMPREHENSIVE DIABETES PREVENTION HEALTH REPORT',
            subtitle: 'Generated by GlucoBalance Digital Health Platform',
            patientId: healthData.patient.id,
            patientName: healthData.patient.name,
            reportDate: new Date().toISOString().split('T')[0],
            reportPeriod: `${healthData.dateRange.startDate} to ${healthData.dateRange.endDate}`,
            reportType: 'Clinical Summary Report',
            generatedBy: 'AI-Enhanced Health Analytics System'
        };
    }

    // Generate patient summary section
    generatePatientSummary(healthData) {
        return {
            demographics: {
                name: healthData.patient.name,
                age: healthData.patient.age || 'Not specified',
                gender: healthData.patient.gender || 'Not specified',
                registrationDate: healthData.patient.registrationDate?.split('T')[0] || 'Not available'
            },
            engagementMetrics: {
                totalDataPoints: this.calculateTotalDataPoints(healthData),
                engagementLevel: healthData.summary.engagementLevel || 'Moderate',
                dataCompleteness: healthData.summary.dataCompleteness?.overall || 0,
                activeDays: this.calculateActiveDays(healthData)
            }
        };
    }

    // Generate clinical findings section
    generateClinicalFindings(healthData, aiAnalysis) {
        return {
            keyFindings: aiAnalysis?.clinicalInsights || this.generateFallbackFindings(healthData),
            riskProfile: healthData.summary.riskProfile || 'Not assessed',
            clinicalPriorities: healthData.summary.clinicalPriorities || [],
            alertsAndConcerns: this.identifyAlertsAndConcerns(healthData)
        };
    }

    // Generate risk assessment section with medical terminology
    generateRiskAssessmentSection(healthData) {
        const riskData = healthData.riskAssessments;
        
        return {
            assessmentSummary: {
                totalAssessments: riskData.totalAssessments,
                latestScore: riskData.assessments[0]?.score || null,
                latestCategory: riskData.assessments[0]?.category || 'Not assessed',
                assessmentDate: riskData.assessments[0]?.date || null
            },
            riskFactorAnalysis: this.analyzeRiskFactors(riskData.assessments),
            trendAnalysis: riskData.trends || {},
            clinicalInterpretation: this.generateRiskClinicalInterpretation(riskData)
        };
    }

    // Generate mental health assessment section
    generateMentalHealthSection(healthData) {
        const mentalHealthData = healthData.mentalHealth;
        
        return {
            moodAssessment: {
                totalEntries: mentalHealthData.totalEntries,
                averageMood: mentalHealthData.statistics?.averageMood || null,
                moodRange: mentalHealthData.statistics?.range || null,
                trend: mentalHealthData.statistics?.trend || 'Stable'
            },
            clinicalObservations: mentalHealthData.clinicalAssessment || {},
            psychosocialFactors: this.assessPsychosocialFactors(mentalHealthData),
            mentalHealthRecommendations: this.generateMentalHealthRecommendations(mentalHealthData)
        };
    }

    // Generate lifestyle factors section
    generateLifestyleSection(healthData) {
        return {
            nutritionalAdherence: {
                mealPlansGenerated: healthData.nutrition.totalPlans,
                averageAdherence: healthData.nutrition.adherenceAnalysis?.averageAdherence || null,
                dietaryPatterns: healthData.nutrition.adherenceAnalysis?.patterns || []
            },
            behavioralPatterns: this.analyzeBehavioralPatterns(healthData),
            lifestyleRecommendations: healthData.nutrition.clinicalRecommendations || []
        };
    }

    // Generate trend analysis section with key insights
    generateTrendAnalysisSection(healthData) {
        return {
            riskScoreTrends: healthData.riskAssessments.trends || {},
            moodTrends: healthData.mentalHealth.statistics || {},
            adherenceTrends: healthData.nutrition.adherenceAnalysis || {},
            progressTrends: healthData.progressMetrics.trends || {},
            clinicalSignificance: this.assessTrendSignificance(healthData)
        };
    }

    // Generate data quality assessment
    generateDataQualitySection(healthData) {
        return {
            completeness: healthData.summary.dataCompleteness || {},
            reliability: this.assessDataReliability(healthData),
            limitations: this.identifyDataLimitations(healthData),
            recommendations: this.generateDataCollectionRecommendations(healthData)
        };
    }

    // Generate report footer
    generateReportFooter() {
        return {
            disclaimer: 'This report is generated by GlucoBalance AI-enhanced health analytics for informational purposes. Clinical decisions should be based on comprehensive patient evaluation and professional medical judgment.',
            generatedAt: new Date().toISOString(),
            version: '1.0',
            contact: 'For questions about this report, please consult with the patient\'s healthcare provider.'
        };
    }

    // Helper methods for calculations and analysis
    calculateTotalDataPoints(healthData) {
        return (
            healthData.riskAssessments.totalAssessments +
            healthData.mentalHealth.totalEntries +
            healthData.nutrition.totalPlans +
            healthData.progressMetrics.totalEntries
        );
    }

    calculateActiveDays(healthData) {
        const uniqueDates = new Set();
        
        // Add dates from all data sources
        healthData.riskAssessments.assessments.forEach(a => uniqueDates.add(a.date));
        healthData.mentalHealth.moodEntries.forEach(m => uniqueDates.add(m.date));
        healthData.nutrition.plans.forEach(p => uniqueDates.add(p.date));
        
        return uniqueDates.size;
    }

    getRiskCategory(score) {
        if (score < 7) return 'Low Risk';
        if (score < 15) return 'Increased Risk';
        if (score < 20) return 'High Risk';
        return 'Possible Diabetes';
    }

    // Calculate risk trends
    calculateRiskTrends(assessments) {
        if (assessments.length < 2) return { trend: 'Insufficient data', change: 0 };
        
        const scores = assessments.map(a => a.score).filter(s => s !== null);
        if (scores.length < 2) return { trend: 'Insufficient data', change: 0 };
        
        const latest = scores[0];
        const previous = scores[scores.length - 1];
        const change = latest - previous;
        
        let trend = 'Stable';
        if (change > 2) trend = 'Increasing';
        else if (change < -2) trend = 'Decreasing';
        
        return { trend, change, latest, previous };
    }

    // Calculate mood statistics
    calculateMoodStatistics(moodEntries) {
        if (moodEntries.length === 0) return {};
        
        const scores = moodEntries.map(m => m.score);
        const sum = scores.reduce((a, b) => a + b, 0);
        const average = sum / scores.length;
        const min = Math.min(...scores);
        const max = Math.max(...scores);
        
        // Calculate trend
        let trend = 'Stable';
        if (scores.length >= 7) {
            const recent = scores.slice(0, 3).reduce((a, b) => a + b, 0) / 3;
            const older = scores.slice(-3).reduce((a, b) => a + b, 0) / 3;
            
            if (recent > older + 0.5) trend = 'Improving';
            else if (recent < older - 0.5) trend = 'Declining';
        }
        
        return {
            averageMood: Math.round(average * 10) / 10,
            range: { min, max },
            trend,
            totalEntries: scores.length,
            variability: this.calculateVariability(scores)
        };
    }

    calculateVariability(scores) {
        if (scores.length < 2) return 0;
        
        const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
        const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length;
        return Math.sqrt(variance);
    }

    // Generate fallback analysis when AI is not available
    generateFallbackAnalysis(healthData) {
        return {
            executiveSummary: this.generateFallbackExecutiveSummary(healthData),
            clinicalInsights: this.generateFallbackFindings(healthData),
            riskFactorAnalysis: 'Risk factor analysis requires AI service for detailed insights.',
            recommendations: this.generateFallbackRecommendations(healthData),
            followUpSuggestions: this.generateFallbackFollowUp(healthData)
        };
    }

    generateFallbackExecutiveSummary(healthData) {
        const riskScore = healthData.riskAssessments.assessments[0]?.score;
        const avgMood = healthData.mentalHealth.statistics?.averageMood;
        const engagement = healthData.summary.engagementLevel;
        
        return `Patient demonstrates ${engagement || 'moderate'} engagement with digital health monitoring over the ${healthData.dateRange.totalDays}-day period. ${riskScore ? `Current diabetes risk score: ${riskScore} (${this.getRiskCategory(riskScore)}).` : 'Diabetes risk assessment pending.'} ${avgMood ? `Mental health status shows average mood rating of ${avgMood}/5.` : 'Mental health data limited.'} Continued monitoring and lifestyle interventions recommended.`;
    }

    generateFallbackFindings(healthData) {
        const findings = [];
        
        if (healthData.riskAssessments.totalAssessments > 0) {
            const latest = healthData.riskAssessments.assessments[0];
            findings.push(`Diabetes risk assessment completed with score of ${latest.score} (${latest.category})`);
        }
        
        if (healthData.mentalHealth.totalEntries > 0) {
            const stats = healthData.mentalHealth.statistics;
            findings.push(`Mental health monitoring shows ${stats.totalEntries} mood entries with average rating ${stats.averageMood}/5`);
        }
        
        if (healthData.nutrition.totalPlans > 0) {
            findings.push(`Nutrition engagement: ${healthData.nutrition.totalPlans} meal plans generated`);
        }
        
        return findings;
    }

    generateFallbackRecommendations(healthData) {
        const recommendations = [];
        
        const riskScore = healthData.riskAssessments.assessments[0]?.score;
        if (riskScore >= 15) {
            recommendations.push('Consider referral for diabetes screening and lifestyle counseling');
            recommendations.push('Implement structured diabetes prevention program');
        }
        
        const avgMood = healthData.mentalHealth.statistics?.averageMood;
        if (avgMood && avgMood < 3) {
            recommendations.push('Assess for depression and anxiety; consider mental health referral');
        }
        
        if (healthData.summary.dataCompleteness?.overall < 50) {
            recommendations.push('Encourage increased engagement with digital health monitoring');
        }
        
        return recommendations;
    }

    generateFallbackFollowUp(healthData) {
        return [
            'Schedule follow-up appointment in 3-6 months',
            'Continue digital health monitoring and data collection',
            'Review lifestyle modifications and adherence at next visit'
        ];
    }

    // Additional helper methods for comprehensive analysis
    assessDataCompleteness(processedData) {
        const totalPossibleDays = processedData.dateRange.totalDays;
        const moodDays = processedData.mentalHealth.totalEntries;
        const assessmentDays = processedData.riskAssessments.totalAssessments;
        
        return {
            overall: Math.round(((moodDays + assessmentDays) / (totalPossibleDays * 2)) * 100),
            mood: Math.round((moodDays / totalPossibleDays) * 100),
            assessments: assessmentDays > 0 ? 100 : 0,
            nutrition: processedData.nutrition.totalPlans > 0 ? 100 : 0
        };
    }

    identifyKeyFindings(processedData) {
        const findings = [];
        
        // Risk assessment findings
        if (processedData.riskAssessments.totalAssessments > 0) {
            const latest = processedData.riskAssessments.assessments[0];
            findings.push({
                category: 'Diabetes Risk',
                finding: `Current risk score: ${latest.score} (${latest.category})`,
                significance: latest.score >= 15 ? 'High' : 'Moderate'
            });
        }
        
        // Mental health findings
        if (processedData.mentalHealth.totalEntries > 0) {
            const stats = processedData.mentalHealth.statistics;
            findings.push({
                category: 'Mental Health',
                finding: `Average mood: ${stats.averageMood}/5, Trend: ${stats.trend}`,
                significance: stats.averageMood < 3 ? 'High' : 'Low'
            });
        }
        
        return findings;
    }

    generateRiskProfile(processedData) {
        const riskData = processedData.riskAssessments;
        if (riskData.totalAssessments === 0) return 'Not assessed';
        
        const latest = riskData.assessments[0];
        return {
            currentRisk: latest.category,
            score: latest.score,
            trend: riskData.trends?.trend || 'Stable',
            lastAssessed: latest.date
        };
    }

    assessEngagementLevel(processedData) {
        const completeness = processedData.summary.dataCompleteness?.overall || 0;
        
        if (completeness >= 70) return 'High';
        if (completeness >= 40) return 'Moderate';
        return 'Low';
    }

    identifyClinicalPriorities(processedData) {
        const priorities = [];
        
        // High diabetes risk
        const riskScore = processedData.riskAssessments.assessments[0]?.score;
        if (riskScore >= 20) {
            priorities.push({ priority: 'Immediate diabetes screening', urgency: 'High' });
        } else if (riskScore >= 15) {
            priorities.push({ priority: 'Lifestyle intervention program', urgency: 'Moderate' });
        }
        
        // Mental health concerns
        const avgMood = processedData.mentalHealth.statistics?.averageMood;
        if (avgMood && avgMood < 2.5) {
            priorities.push({ priority: 'Mental health assessment', urgency: 'High' });
        }
        
        // Low engagement
        if (processedData.summary.engagementLevel === 'Low') {
            priorities.push({ priority: 'Patient engagement strategies', urgency: 'Moderate' });
        }
        
        return priorities;
    }

    // Extract AI analysis components
    async extractExecutiveSummary(aiResponse) {
        // Extract executive summary section from AI response
        const summaryMatch = aiResponse.match(/EXECUTIVE SUMMARY[:\s]*\n(.*?)(?=\n\d+\.|$)/s);
        return summaryMatch ? summaryMatch[1].trim() : aiResponse.substring(0, 200) + '...';
    }

    async extractClinicalInsights(aiResponse) {
        // Extract clinical insights section
        const insightsMatch = aiResponse.match(/CLINICAL INSIGHTS[:\s]*\n(.*?)(?=\n\d+\.|$)/s);
        if (insightsMatch) {
            return insightsMatch[1].split('\n').filter(line => line.trim().startsWith('-') || line.trim().startsWith('•')).map(line => line.trim().substring(1).trim());
        }
        return ['Clinical insights require AI analysis for detailed interpretation.'];
    }

    async extractRecommendations(aiResponse) {
        // Extract recommendations section
        const recMatch = aiResponse.match(/CLINICAL RECOMMENDATIONS[:\s]*\n(.*?)(?=\n\d+\.|$)/s);
        if (recMatch) {
            return recMatch[1].split('\n').filter(line => line.trim().startsWith('-') || line.trim().startsWith('•')).map(line => line.trim().substring(1).trim());
        }
        return ['Recommendations require AI analysis for personalized guidance.'];
    }

    async extractFollowUpSuggestions(aiResponse) {
        // Extract follow-up suggestions
        const followUpMatch = aiResponse.match(/FOLLOW-UP SUGGESTIONS[:\s]*\n(.*?)(?=\n\d+\.|$)/s);
        if (followUpMatch) {
            return followUpMatch[1].split('\n').filter(line => line.trim().startsWith('-') || line.trim().startsWith('•')).map(line => line.trim().substring(1).trim());
        }
        return ['Follow-up timeline to be determined based on clinical assessment.'];
    }

    // Additional analysis methods
    analyzeRiskFactors(assessments) {
        if (assessments.length === 0) return {};
        
        const latest = assessments[0];
        const responses = latest.responses || {};
        
        return {
            modifiableFactors: this.identifyModifiableFactors(responses),
            nonModifiableFactors: this.identifyNonModifiableFactors(responses),
            primaryConcerns: this.identifyPrimaryConcerns(responses)
        };
    }

    identifyModifiableFactors(responses) {
        const modifiable = [];
        
        if (responses.physical_activity === 2) modifiable.push('Physical inactivity');
        if (responses.bmi > 0) modifiable.push('Body weight management');
        if (responses.high_blood_pressure === 2) modifiable.push('Blood pressure control');
        
        return modifiable;
    }

    identifyNonModifiableFactors(responses) {
        const nonModifiable = [];
        
        if (responses.age >= 2) nonModifiable.push('Age-related risk');
        if (responses.gender === 1) nonModifiable.push('Male gender');
        if (responses.family_history > 0) nonModifiable.push('Family history of diabetes');
        
        return nonModifiable;
    }

    identifyPrimaryConcerns(responses) {
        const concerns = [];
        
        if (responses.prediabetes === 5) concerns.push('Previous prediabetes diagnosis');
        if (responses.gestational_diabetes === 1) concerns.push('History of gestational diabetes');
        if (responses.bmi >= 3) concerns.push('Significant weight concerns');
        
        return concerns;
    }

    // Get cached report
    getCachedReport(cacheKey) {
        return this.reportCache.get(cacheKey);
    }

    // Clear report cache
    clearCache() {
        this.reportCache.clear();
    }
}

// Initialize the doctor report service
window.doctorReportService = new DoctorReportService();
//# sourceMappingURL=doctor-report.js.map