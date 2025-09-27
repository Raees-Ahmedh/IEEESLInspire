import { Request, Response } from 'express';
import { productionAnalyticsService } from '../services/productionAnalyticsService';

export class ProductionAnalyticsController {
  
  /**
   * Get all analytics data for the dashboard
   */
  async getAllAnalytics(req: Request, res: Response) {
    try {
      const data = await productionAnalyticsService.getAllAnalytics();
      
      res.json({
        success: true,
        message: 'Production analytics data retrieved successfully',
        data
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
   * Get dashboard header metrics only
   */
  async getDashboardMetrics(req: Request, res: Response) {
    try {
      const data = await productionAnalyticsService.getDashboardMetrics();
      
      res.json({
        success: true,
        message: 'Dashboard metrics retrieved successfully',
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

  /**
   * Get database completion metrics
   */
  async getDatabaseCompletion(req: Request, res: Response) {
    try {
      const data = await productionAnalyticsService.getDatabaseCompletionMetrics();
      
      res.json({
        success: true,
        message: 'Database completion metrics retrieved successfully',
        data
      });
    } catch (error) {
      console.error('Error in getDatabaseCompletion:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve database completion metrics',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get user analytics
   */
  async getUserAnalytics(req: Request, res: Response) {
    try {
      const data = await productionAnalyticsService.getUserAnalytics();
      
      res.json({
        success: true,
        message: 'User analytics retrieved successfully',
        data
      });
    } catch (error) {
      console.error('Error in getUserAnalytics:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve user analytics',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get task analytics
   */
  async getTaskAnalytics(req: Request, res: Response) {
    try {
      const data = await productionAnalyticsService.getTaskAnalytics();
      
      res.json({
        success: true,
        message: 'Task analytics retrieved successfully',
        data
      });
    } catch (error) {
      console.error('Error in getTaskAnalytics:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve task analytics',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get course analytics
   */
  async getCourseAnalytics(req: Request, res: Response) {
    try {
      const data = await productionAnalyticsService.getCourseAnalytics();
      
      res.json({
        success: true,
        message: 'Course analytics retrieved successfully',
        data
      });
    } catch (error) {
      console.error('Error in getCourseAnalytics:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve course analytics',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get search analytics
   */
  async getSearchAnalytics(req: Request, res: Response) {
    try {
      const data = await productionAnalyticsService.getSearchAnalytics();
      
      res.json({
        success: true,
        message: 'Search analytics retrieved successfully',
        data
      });
    } catch (error) {
      console.error('Error in getSearchAnalytics:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve search analytics',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}

export const productionAnalyticsController = new ProductionAnalyticsController();