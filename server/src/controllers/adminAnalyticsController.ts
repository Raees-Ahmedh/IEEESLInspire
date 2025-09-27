import { Request, Response } from 'express';
import adminAnalyticsService from '../services/adminAnalyticsService';

class AdminAnalyticsController {
  
  /**
   * Get all analytics data for admin dashboard
   */
  async getAllAnalytics(req: Request, res: Response) {
    try {
      const analyticsData = await adminAnalyticsService.getAllAnalytics();
      
      res.status(200).json({
        success: true,
        message: 'Analytics data retrieved successfully',
        data: analyticsData
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
   * Get database completion status
   */
  async getDatabaseCompletion(req: Request, res: Response) {
    try {
      const data = await adminAnalyticsService.getDatabaseCompletionStatus();
      
      res.status(200).json({
        success: true,
        message: 'Database completion status retrieved successfully',
        data
      });
    } catch (error) {
      console.error('Error in getDatabaseCompletion:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve database completion status',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get task status breakdown
   */
  async getTaskStatusBreakdown(req: Request, res: Response) {
    try {
      const data = await adminAnalyticsService.getTaskStatusBreakdown();
      
      res.status(200).json({
        success: true,
        message: 'Task status breakdown retrieved successfully',
        data
      });
    } catch (error) {
      console.error('Error in getTaskStatusBreakdown:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve task status breakdown',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get task duration analytics
   */
  async getTaskDurationAnalytics(req: Request, res: Response) {
    try {
      const data = await adminAnalyticsService.getTaskDurationAnalytics();
      
      res.status(200).json({
        success: true,
        message: 'Task duration analytics retrieved successfully',
        data
      });
    } catch (error) {
      console.error('Error in getTaskDurationAnalytics:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve task duration analytics',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get user growth trends
   */
  async getUserGrowthTrends(req: Request, res: Response) {
    try {
      const data = await adminAnalyticsService.getUserGrowthTrends();
      
      res.status(200).json({
        success: true,
        message: 'User growth trends retrieved successfully',
        data
      });
    } catch (error) {
      console.error('Error in getUserGrowthTrends:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve user growth trends',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get search filter usage
   */
  async getSearchFilterUsage(req: Request, res: Response) {
    try {
      const data = await adminAnalyticsService.getSearchFilterUsage();
      
      res.status(200).json({
        success: true,
        message: 'Search filter usage retrieved successfully',
        data
      });
    } catch (error) {
      console.error('Error in getSearchFilterUsage:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve search filter usage',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get search performance summary
   */
  async getSearchPerformance(req: Request, res: Response) {
    try {
      const performanceSummary = await adminAnalyticsService.getSearchPerformanceSummary();
      const dailyTrends = await adminAnalyticsService.getDailySearchTrends();
      
      res.status(200).json({
        success: true,
        message: 'Search performance data retrieved successfully',
        data: {
          summary: performanceSummary,
          dailyTrends
        }
      });
    } catch (error) {
      console.error('Error in getSearchPerformance:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve search performance data',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get top bookmarked courses
   */
  async getTopBookmarkedCourses(req: Request, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const data = await adminAnalyticsService.getTopBookmarkedCourses(limit);
      
      res.status(200).json({
        success: true,
        message: 'Top bookmarked courses retrieved successfully',
        data,
        meta: {
          limit,
          count: data.length
        }
      });
    } catch (error) {
      console.error('Error in getTopBookmarkedCourses:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve top bookmarked courses',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get dashboard summary
   */
  async getDashboardSummary(req: Request, res: Response) {
    try {
      const data = await adminAnalyticsService.getDashboardSummary();
      
      res.status(200).json({
        success: true,
        message: 'Dashboard summary retrieved successfully',
        data
      });
    } catch (error) {
      console.error('Error in getDashboardSummary:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve dashboard summary',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get analytics by date range
   */
  async getAnalyticsByDateRange(req: Request, res: Response) {
    try {
      const { startDate, endDate, metrics } = req.query;
      
      // Basic validation
      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: 'Start date and end date are required'
        });
      }

      // For now, return all analytics (in a real implementation, you'd modify queries to use date range)
      const analyticsData = await adminAnalyticsService.getAllAnalytics();
      
      res.status(200).json({
        success: true,
        message: 'Analytics data for date range retrieved successfully',
        data: analyticsData,
        meta: {
          startDate,
          endDate,
          requestedMetrics: metrics
        }
      });
    } catch (error) {
      console.error('Error in getAnalyticsByDateRange:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve analytics data for date range',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Export analytics data as CSV (placeholder for future implementation)
   */
  async exportAnalytics(req: Request, res: Response) {
    try {
      const { format = 'json' } = req.query;
      
      const analyticsData = await adminAnalyticsService.getAllAnalytics();
      
      if (format === 'csv') {
        // In a real implementation, you would convert to CSV format
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="analytics_export.csv"');
        
        // For now, return JSON (implement CSV conversion as needed)
        res.status(200).json(analyticsData);
      } else {
        res.status(200).json({
          success: true,
          message: 'Analytics data exported successfully',
          data: analyticsData,
          format
        });
      }
    } catch (error) {
      console.error('Error in exportAnalytics:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to export analytics data',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}

export default new AdminAnalyticsController();