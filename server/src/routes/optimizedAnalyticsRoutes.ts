// server/src/routes/optimizedAnalyticsRoutes.ts
import { Router } from 'express';
import { OptimizedAnalyticsController } from '../controllers/optimizedAnalyticsController';

const router = Router();
const optimizedAnalyticsController = new OptimizedAnalyticsController();

// Optimized analytics endpoint for fast performance
router.get('/optimized-analytics', (req, res) => optimizedAnalyticsController.getAllAnalytics(req, res));

export default router;