import { Router } from 'express';
import adminAnalyticsController from '../controllers/adminAnalyticsController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

// Middleware to ensure user is authenticated and has admin privileges
const requireAdmin = (req: any, res: any, next: any) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'manager')) {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Access denied. Admin or Manager role required.'
    });
  }
};

// TEMPORARY: Remove authentication for testing
// TODO: Re-enable authentication in production
// router.use(authenticateToken);
// router.use(requireAdmin);

// Main analytics endpoints
router.get('/dashboard/overview', adminAnalyticsController.getAllAnalytics);
router.get('/dashboard/summary', adminAnalyticsController.getDashboardSummary);

// Individual analytics endpoints
router.get('/database/completion', adminAnalyticsController.getDatabaseCompletion);
router.get('/tasks/status', adminAnalyticsController.getTaskStatusBreakdown);
router.get('/tasks/duration', adminAnalyticsController.getTaskDurationAnalytics);
router.get('/users/growth', adminAnalyticsController.getUserGrowthTrends);
router.get('/search/filters', adminAnalyticsController.getSearchFilterUsage);
router.get('/search/performance', adminAnalyticsController.getSearchPerformance);
router.get('/courses/bookmarked', adminAnalyticsController.getTopBookmarkedCourses);

// Advanced analytics endpoints
router.get('/date-range', adminAnalyticsController.getAnalyticsByDateRange);
router.get('/export', adminAnalyticsController.exportAnalytics);

export default router;