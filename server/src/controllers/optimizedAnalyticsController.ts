import { Request, Response } from 'express';
import { optimizedAnalyticsService } from '../services/optimizedAnalyticsService';

export class OptimizedAnalyticsController {
  
  /**
   * Get all analytics data for the dashboard - optimized version
   */
  async getAllAnalytics(req: Request, res: Response) {
    try {
      console.log('🚀 Getting optimized analytics data...');
      const startTime = Date.now();
      
      const data = await optimizedAnalyticsService.getAllAnalytics();
      
      const endTime = Date.now();
      console.log(`✅ Analytics fetched in ${endTime - startTime}ms`);
      
      res.status(200).json({
        success: true,
        message: 'Optimized analytics data retrieved successfully',
        data,
        performance: {
          fetch_time_ms: endTime - startTime,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Error in getAllAnalytics:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve analytics data',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get dashboard metrics only
   */
  async getDashboardMetrics(req: Request, res: Response) {
    try {
      const data = await optimizedAnalyticsService.getDashboardMetrics();
      res.status(200).json({
        success: true,
        data
      });
    } catch (error) {
      console.error('Error in getDashboardMetrics:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve dashboard metrics',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}

export const optimizedAnalyticsController = new OptimizedAnalyticsController();