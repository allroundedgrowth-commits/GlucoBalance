// GlucoBalance AI Integration Verification Script
// Run this in the browser console to verify AI integration

async function verifyAIIntegration() {
    console.log('🔍 Verifying GlucoBalance AI Integration...\n');
    
    // Check if AI classes are loaded
    console.log('1. Checking AI class availability...');
    if (typeof GeminiAI !== 'undefined' && typeof AIService !== 'undefined') {
        console.log('✅ AI classes loaded successfully');
    } else {
        console.log('❌ AI classes not found');
        return;
    }
    
    // Check if AI service is initialized
    console.log('\n2. Checking AI service initialization...');
    if (window.aiService && window.geminiAI) {
        console.log('✅ AI service instances created');
        
        const status = window.aiService.getStatus();
        console.log(`   Status: ${status.available ? 'Available' : 'Not Available'}`);
        console.log(`   Source: ${status.source || 'None'}`);
        console.log(`   Fallback Mode: ${status.fallbackMode ? 'Yes' : 'No'}`);
    } else {
        console.log('❌ AI service instances not found');
        return;
    }
    
    // Test API key initialization
    console.log('\n3. Testing API key initialization...');
    const apiKey = 'AIzaSyDvMbUBFIrZFQjOOFih5ck_yEwHlXia2Js';
    const initSuccess = window.geminiAI.initialize(apiKey, 'test');
    
    if (initSuccess) {
        console.log('✅ API key initialization successful');
    } else {
        console.log('❌ API key initialization failed');
        return;
    }
    
    // Test risk explanation generation
    console.log('\n4. Testing risk explanation generation...');
    const testData = {
        age: 3,
        gender: 1,
        family_history: 2,
        high_blood_pressure: 2,
        physical_activity: 2,
        bmi: 3,
        gestational_diabetes: 0,
        prediabetes: 0
    };
    
    try {
        console.log('   Generating AI explanation...');
        const explanation = await window.aiService.getRiskExplanation(13, testData);
        console.log('✅ AI explanation generated successfully');
        console.log(`   Length: ${explanation.length} characters`);
        console.log(`   Preview: "${explanation.substring(0, 100)}..."`);
    } catch (error) {
        console.log('❌ AI explanation generation failed:', error.message);
    }
    
    // Test fallback content
    console.log('\n5. Testing fallback content...');
    const fallbackExplanation = window.geminiAI.getFallbackResponse('risk', { riskScore: 13 });
    if (fallbackExplanation && fallbackExplanation.length > 0) {
        console.log('✅ Fallback content available');
        console.log(`   Length: ${fallbackExplanation.length} characters`);
    } else {
        console.log('❌ Fallback content not available');
    }
    
    // Test risk factor analysis
    console.log('\n6. Testing risk factor analysis...');
    const riskFactors = window.geminiAI.analyzeRiskFactors(testData);
    if (riskFactors && riskFactors.length > 0) {
        console.log('✅ Risk factor analysis working');
        console.log(`   Identified ${riskFactors.length} risk factors`);
        riskFactors.forEach(factor => {
            console.log(`   - ${factor.factor}: ${factor.points} points (${factor.impact} impact)`);
        });
    } else {
        console.log('❌ Risk factor analysis failed');
    }
    
    console.log('\n🎉 AI Integration Verification Complete!');
    console.log('\nNext steps:');
    console.log('- Open test-ai-integration.html to test in UI');
    console.log('- Open test-risk-assessment.html to see full integration');
    console.log('- Complete a risk assessment to see AI explanations');
}

// Auto-run verification
verifyAIIntegration().catch(error => {
    console.error('❌ Verification failed:', error);
});