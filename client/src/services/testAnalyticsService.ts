// Simple API service for testing analytics endpoints
// This would normally use your existing API service with authentication

const API_BASE_URL = 'http://localhost:4000'; // Adjust this to your server URL

export const testAnalyticsAPI = async () => {
  try {
    // Test the simple analytics endpoint that we know works
    const response = await fetch(`${API_BASE_URL}/api/admin/simple-analytics`);
    
    console.log('📊 Response Status:', response.status);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('📈 Analytics Data:', data);
    
    if (data.success) {
      return data.data;
    } else {
      throw new Error('API returned unsuccessful response');
    }
  } catch (error) {
    console.error('❌ API Error:', error);
    throw error;
  }
};

export const getAllAnalytics = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/analytics/dashboard/overview`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching analytics:', error);
    throw error;
  }
};

export default {
  testAnalyticsAPI,
  getAllAnalytics
};