// Simple analytics controller
import { Request, Response } from 'express';
import { simpleAnalyticsService } from '../services/simpleAnalyticsService';

export const getSimpleAnalytics = async (req: Request, res: Response) => {
  try {
    console.log('🚀 Simple analytics endpoint called');
    
    const startTime = Date.now();
    const result = await simpleAnalyticsService.getBasicStats();
    const endTime = Date.now();
    
    console.log(`✅ Simple analytics completed in ${endTime - startTime}ms`);
    
    res.json(result);
  } catch (error) {
    console.error('❌ Simple analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch analytics data',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};