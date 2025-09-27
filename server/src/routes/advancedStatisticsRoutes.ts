// Statistics Routes - Comprehensive Dashboard Endpoints
import express from 'express';
import { statisticsController } from '../controllers/advancedAnalyticsController';

const router = express.Router();

// Main statistics endpoint - returns all three sections
router.get('/advanced', statisticsController.getAdvancedAnalytics);

// Individual section endpoints for targeted queries
router.get('/data-integrity', statisticsController.getDataIntegrityHealth);
router.get('/team-performance', statisticsController.getTeamPerformance);
router.get('/user-engagement', statisticsController.getUserEngagementInsights);

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Statistics API is healthy',
    timestamp: new Date().toISOString(),
    endpoints: [
      'GET /api/statistics/advanced - Complete analytics dashboard',
      'GET /api/statistics/data-integrity - Data integrity & health metrics',
      'GET /api/statistics/team-performance - Team performance & task management',
      'GET /api/statistics/user-engagement - User engagement & product insights',
      'GET /api/statistics/health - API health check'
    ]
  });
});

export default router;