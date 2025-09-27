// Simple test script to verify analytics API
const testAnalyticsAPI = async () => {
  console.log('🧪 Testing Analytics API...');
  
  try {
    const response = await fetch('http://localhost:4000/api/admin/analytics/dashboard/summary');
    console.log('📊 Response Status:', response.status);
    
    if (!response.ok) {
      console.error('❌ API Error:', response.status, response.statusText);
      return;
    }
    
    const data = await response.json();
    console.log('✅ API Response:', JSON.stringify(data, null, 2));
    
    // Test the full overview endpoint
    const overviewResponse = await fetch('http://localhost:4000/api/admin/analytics/dashboard/overview');
    if (overviewResponse.ok) {
      const overviewData = await overviewResponse.json();
      console.log('✅ Overview API working:', !!overviewData.success);
    }
    
  } catch (error) {
    console.error('❌ API Test Failed:', error.message);
  }
};

// Run the test
testAnalyticsAPI();