import { Router } from 'express';
import { optimizedAnalyticsController } from '../controllers/optimizedAnalyticsController';

const router = Router();

// Optimized Production Analytics Routes
router.get('/production', optimizedAnalyticsController.getAllAnalytics);
router.get('/production/dashboard', optimizedAnalyticsController.getDashboardMetrics);

// Keep other routes but they'll be faster now
router.get('/production/database', optimizedAnalyticsController.getAllAnalytics);
router.get('/production/users', optimizedAnalyticsController.getAllAnalytics);
router.get('/production/tasks', optimizedAnalyticsController.getAllAnalytics);
router.get('/production/courses', optimizedAnalyticsController.getAllAnalytics);
router.get('/production/search', optimizedAnalyticsController.getAllAnalytics);

export default router;