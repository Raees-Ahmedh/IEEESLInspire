// Statistics Controller - Comprehensive Dashboard API
import { Request, Response } from 'express';
import { simpleAdvancedAnalyticsService } from '../services/simpleAdvancedAnalyticsService';

export class StatisticsController {
  
  async getStatistics(req: Request, res: Response) {
    try {
      console.log('🚀 Statistics endpoint called...');
      const startTime = Date.now();

      // Get all statistics data
      const analyticsData = await simpleAdvancedAnalyticsService.getAllAdvancedAnalytics();
      
      const endTime = Date.now();
      const executionTime = endTime - startTime;
      
      console.log(`✅ Statistics completed in ${executionTime}ms`);
      console.log(`📊 Data sections: ${Object.keys(analyticsData).length}`);

      // Add performance metadata
      const responseData = {
        success: true,
        data: analyticsData,
        performance: {
          execution_time_ms: executionTime,
          timestamp: new Date().toISOString(),
          api_version: '1.0.0'
        }
      };

      return res.status(200).json(responseData);
      
    } catch (error) {
      console.error('❌ Error in statistics endpoint:', error);
      
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch statistics data',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    }
  }

  // Aliases for backward compatibility with routes
  async getAdvancedAnalytics(req: Request, res: Response) {
    try {
      console.log('🚀 Advanced Analytics endpoint called...');
      const startTime = Date.now();

      // Get all statistics data
      const analyticsData = await simpleAdvancedAnalyticsService.getAllAdvancedAnalytics();
      
      const endTime = Date.now();
      const executionTime = endTime - startTime;
      
      console.log(`✅ Advanced Analytics completed in ${executionTime}ms`);
      console.log(`📊 Data sections: ${Object.keys(analyticsData).length}`);

      // Add performance metadata
      const responseData = {
        success: true,
        data: analyticsData,
        performance: {
          execution_time_ms: executionTime,
          timestamp: new Date().toISOString(),
          api_version: '1.0.0'
        }
      };

      return res.status(200).json(responseData);
      
    } catch (error) {
      console.error('❌ Error in advanced analytics endpoint:', error);
      
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch advanced analytics data',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    }
  }

  // Individual section endpoints for targeted queries
  
  async getDataIntegrityHealth(req: Request, res: Response) {
    try {
      console.log('🔍 Data integrity health endpoint called...');
      
      const [databaseCompletion, dataAgeReport, streamMappingIntegrity] = await Promise.all([
        simpleAdvancedAnalyticsService.getDatabaseCompletionStatus(),
        simpleAdvancedAnalyticsService.getDataAgeReport(),
        simpleAdvancedAnalyticsService.getStreamMappingIntegrity()
      ]);

      return res.status(200).json({
        success: true,
        data: {
          database_completion: databaseCompletion,
          data_age_report: dataAgeReport,
          stream_mapping_integrity: streamMappingIntegrity
        }
      });
    } catch (error) {
      console.error('❌ Error in data integrity health endpoint:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch data integrity health metrics'
      });
    }
  }

  async getTeamPerformance(req: Request, res: Response) {
    try {
      console.log('👥 Team performance endpoint called...');
      
      const [taskStatusBreakdown, taskAssignmentDuration, newsPublishingQueue] = await Promise.all([
        simpleAdvancedAnalyticsService.getTaskStatusBreakdown(),
        simpleAdvancedAnalyticsService.getTaskAssignmentDuration(),
        simpleAdvancedAnalyticsService.getNewsPublishingQueue()
      ]);

      return res.status(200).json({
        success: true,
        data: {
          task_status_breakdown: taskStatusBreakdown,
          task_assignment_duration: taskAssignmentDuration,
          news_publishing_queue: newsPublishingQueue
        }
      });
    } catch (error) {
      console.error('❌ Error in team performance endpoint:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch team performance metrics'
      });
    }
  }

  async getUserEngagementInsights(req: Request, res: Response) {
    try {
      console.log('📈 User engagement insights endpoint called...');
      
      const [userGrowthTrends, searchAnalytics, topBookmarkedCourses] = await Promise.all([
        simpleAdvancedAnalyticsService.getUserGrowthTrends(),
        simpleAdvancedAnalyticsService.getSearchAnalytics(),
        simpleAdvancedAnalyticsService.getTopBookmarkedCourses()
      ]);

      return res.status(200).json({
        success: true,
        data: {
          user_growth_trends: userGrowthTrends,
          search_analytics: searchAnalytics,
          top_bookmarked_courses: topBookmarkedCourses
        }
      });
    } catch (error) {
      console.error('❌ Error in user engagement insights endpoint:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch user engagement insights'
      });
    }
  }
}

export const statisticsController = new StatisticsController();
// Backward compatibility
export const advancedAnalyticsController = statisticsController;