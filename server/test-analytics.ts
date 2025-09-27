// Quick test script for optimized analytics
import { optimizedAnalyticsService } from './src/services/optimizedAnalyticsService';

async function testOptimizedAnalytics() {
  console.log('🧪 Testing optimized analytics service...');
  
  try {
    const data = await optimizedAnalyticsService.getAllAnalytics();
    console.log('✅ Analytics data received:');
    console.log('- Dashboard metrics:', Object.keys(data.dashboard_metrics || {}));
    console.log('- User analytics:', Object.keys(data.user_analytics || {}));
    console.log('- Course analytics:', Object.keys(data.course_analytics || {}));
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error testing analytics:', error);
    process.exit(1);
  }
}

testOptimizedAnalytics();