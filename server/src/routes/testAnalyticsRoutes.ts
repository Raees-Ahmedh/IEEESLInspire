// Simple test endpoint
import { Router } from 'express';
import { getSimpleAnalytics } from '../controllers/simpleAnalyticsController';

const router = Router();

// Simple test endpoint
router.get('/test-analytics', (req, res) => {
  console.log('🧪 Test analytics endpoint hit!');
  res.json({
    success: true,
    message: 'Test endpoint working!',
    timestamp: new Date().toISOString(),
    data: {
      test_metric: 42,
      status: 'ok'
    }
  });
});

// Simple working analytics endpoint
router.get('/simple-analytics', getSimpleAnalytics);

export default router;