// Advanced Analytics Service - Comprehensive Database Analysis
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Helper function to safely parse JSON audit info
function parseAuditInfo(auditInfo: any) {
  try {
    if (typeof auditInfo === 'string') {
      return JSON.parse(auditInfo);
    }
    return auditInfo || {};
  } catch (error) {
    return {};
  }
}

// Helper function to convert BigInt values to numbers
function convertBigIntToNumber(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }
  
  if (typeof obj === 'bigint') {
    return Number(obj);
  }
  
  if (Array.isArray(obj)) {
    return obj.map(convertBigIntToNumber);
  }
  
  if (typeof obj === 'object') {
    const converted: any = {};
    for (const [key, value] of Object.entries(obj)) {
      converted[key] = convertBigIntToNumber(value);
    }
    return converted;
  }
  
  return obj;
}

export class AdvancedAnalyticsService {

  // ============================================================================
  // I. DATA INTEGRITY & HEALTH (Admin Focus)
  // ============================================================================

  async getDatabaseCompletionStatus() {
    console.log('🔍 Analyzing database completion status...');
    
    try {
      // Course completion analysis
      const [totalCourses, coursesWithRequirements] = await Promise.all([
        prisma.course.count(),
        prisma.course.count({
          where: {
            requirementId: { not: null }
          }
        })
      ]);

      // University completion analysis
      const [totalUniversities, universitiesComplete] = await Promise.all([
        prisma.university.count(),
        prisma.university.count({
          where: {
            AND: [
              { imageUrl: { not: null as any } },
              { contactInfo: { not: null as any } }
            ]
          }
        })
      ]);

      const courseCompletion = totalCourses > 0 ? ((coursesWithRequirements / totalCourses) * 100).toFixed(1) : '0.0';
      const universityCompletion = totalUniversities > 0 ? ((universitiesComplete / totalUniversities) * 100).toFixed(1) : '0.0';

      return {
        courses: {
          total: totalCourses,
          with_requirements: coursesWithRequirements,
          missing_requirements: totalCourses - coursesWithRequirements,
          completion_percentage: `${courseCompletion}%`
        },
        universities: {
          total: totalUniversities,
          complete_profile: universitiesComplete,
          incomplete_profile: totalUniversities - universitiesComplete,
          completion_percentage: `${universityCompletion}%`
        },
        overall_health_score: ((parseFloat(courseCompletion) + parseFloat(universityCompletion)) / 2).toFixed(1) + '%'
      };
    } catch (error) {
      console.error('Error getting database completion status:', error);
      return {
        courses: { total: 0, with_requirements: 0, missing_requirements: 0, completion_percentage: '0%' },
        universities: { total: 0, complete_profile: 0, incomplete_profile: 0, completion_percentage: '0%' },
        overall_health_score: '0%'
      };
    }
  }

  async getDataAgeReport() {
    console.log('🔍 Analyzing data recency...');
    
    try {
      // Get universities with their audit info
      const universities = await prisma.university.findMany({
        select: {
          id: true,
          name: true,
          auditInfo: true
        }
      });

      // Get courses with their audit info
      const courses = await prisma.course.findMany({
        select: {
          id: true,
          name: true,
          auditInfo: true
        }
      });

      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      // Analyze university data age
      const universityAgeAnalysis = universities.map(uni => {
        const audit = parseAuditInfo(uni.auditInfo);
        const updatedAt = audit.updatedAt ? new Date(audit.updatedAt) : null;
        const createdAt = audit.createdAt ? new Date(audit.createdAt) : null;
        const lastUpdate = updatedAt || createdAt || null;
        
        return {
          id: uni.id,
          name: uni.name,
          last_updated: lastUpdate ? lastUpdate.toISOString() : null,
          days_since_update: lastUpdate ? Math.floor((now.getTime() - lastUpdate.getTime()) / (24 * 60 * 60 * 1000)) : null,
          is_recent: lastUpdate ? lastUpdate > thirtyDaysAgo : false
        };
      });

      // Analyze course data age
      const courseAgeAnalysis = courses.map(course => {
        const audit = parseAuditInfo(course.auditInfo);
        const updatedAt = audit.updatedAt ? new Date(audit.updatedAt) : null;
        const createdAt = audit.createdAt ? new Date(audit.createdAt) : null;
        const lastUpdate = updatedAt || createdAt || null;
        
        return {
          id: course.id,
          name: course.name,
          last_updated: lastUpdate ? lastUpdate.toISOString() : null,
          days_since_update: lastUpdate ? Math.floor((now.getTime() - lastUpdate.getTime()) / (24 * 60 * 60 * 1000)) : null,
          is_recent: lastUpdate ? lastUpdate > thirtyDaysAgo : false
        };
      });

      const recentUniversities = universityAgeAnalysis.filter(u => u.is_recent).length;
      const recentCourses = courseAgeAnalysis.filter(c => c.is_recent).length;

      return {
        universities: {
          total: universities.length,
          recently_updated: recentUniversities,
          stale_count: universities.length - recentUniversities,
          details: universityAgeAnalysis.slice(0, 10) // Top 10 for summary
        },
        courses: {
          total: courses.length,
          recently_updated: recentCourses,
          stale_count: courses.length - recentCourses,
          details: courseAgeAnalysis.slice(0, 10) // Top 10 for summary
        }
      };
    } catch (error) {
      console.error('Error getting data age report:', error);
      return {
        universities: { total: 0, recently_updated: 0, stale_count: 0, details: [] },
        courses: { total: 0, recently_updated: 0, stale_count: 0, details: [] }
      };
    }
  }

  async getStreamMappingIntegrity() {
    console.log('🔍 Analyzing stream/subject mapping integrity...');
    
    try {
      const [totalCourses, coursesWithoutRequirements] = await Promise.all([
        prisma.course.count(),
        prisma.course.count({
          where: {
            requirementId: null
          }
        })
      ]);

      const mappingIntegrity = totalCourses > 0 ? (((totalCourses - coursesWithoutRequirements) / totalCourses) * 100).toFixed(1) : '0.0';

      return {
        total_courses: totalCourses,
        courses_with_requirements: totalCourses - coursesWithoutRequirements,
        courses_without_requirements: coursesWithoutRequirements,
        mapping_integrity_score: `${mappingIntegrity}%`
      };
    } catch (error) {
      console.error('Error getting stream mapping integrity:', error);
      return {
        total_courses: 0,
        courses_with_requirements: 0,
        courses_without_requirements: 0,
        mapping_integrity_score: '0%'
      };
    }
  }

  // ============================================================================
  // II. TEAM PERFORMANCE & TASK MANAGEMENT (Manager Focus)
  // ============================================================================

  async getTaskStatusBreakdown() {
    console.log('🔍 Analyzing task status breakdown...');
    
    try {
      const taskStatusCounts = await prisma.task.groupBy({
        by: ['status'],
        _count: {
          status: true
        }
      });

      const totalTasks = await prisma.task.count();
      
      const statusBreakdown = taskStatusCounts.map(item => ({
        status: item.status,
        count: Number(item._count.status),
        percentage: totalTasks > 0 ? ((Number(item._count.status) / totalTasks) * 100).toFixed(1) + '%' : '0%'
      }));

      return {
        total_tasks: totalTasks,
        status_breakdown: statusBreakdown,
        summary: {
          completed: statusBreakdown.find(s => s.status === 'completed')?.count || 0,
          pending: statusBreakdown.find(s => s.status === 'pending')?.count || 0,
          in_progress: statusBreakdown.find(s => s.status === 'in_progress')?.count || 0
        }
      };
    } catch (error) {
      console.error('Error getting task status breakdown:', error);
      return {
        total_tasks: 0,
        status_breakdown: [],
        summary: { completed: 0, pending: 0, in_progress: 0 }
      };
    }
  }

  async getTaskAssignmentDuration() {
    console.log('🔍 Analyzing task assignment and duration...');
    
    try {
      const completedTasks = await prisma.task.findMany({
        where: {
          status: 'complete',
          completedAt: { not: null }
        },
        include: {
          assignee: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              role: true
            }
          }
        }
      });

      const taskDurations = completedTasks.map(task => {
        // Get creation time from auditInfo since assignedAt doesn't exist
        const audit = parseAuditInfo(task.auditInfo);
        const createdAt = audit.createdAt ? new Date(audit.createdAt) : new Date();
        const completedAt = new Date(task.completedAt!);
        const durationHours = Math.abs(completedAt.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
        
        return {
          task_id: task.id,
          user_id: task.assignedTo,
          user_name: task.assignee ? `${task.assignee.firstName || ''} ${task.assignee.lastName || ''}`.trim() : 'Unknown',
          user_role: task.assignee?.role || 'unknown',
          duration_hours: Math.round(durationHours * 100) / 100,
          created_at: createdAt,
          completed_at: task.completedAt
        };
      });

      // Group by user
      const userPerformance = taskDurations.reduce((acc, task) => {
        const userId = task.user_id;
        if (!acc[userId]) {
          acc[userId] = {
            user_id: userId,
            user_name: task.user_name,
            user_role: task.user_role,
            tasks_completed: 0,
            total_duration_hours: 0,
            average_duration_hours: 0
          };
        }
        acc[userId].tasks_completed++;
        acc[userId].total_duration_hours += task.duration_hours;
        acc[userId].average_duration_hours = acc[userId].total_duration_hours / acc[userId].tasks_completed;
        return acc;
      }, {} as any);

      const performanceArray = Object.values(userPerformance);
      const avgDuration = taskDurations.length > 0 ? 
        taskDurations.reduce((sum, task) => sum + task.duration_hours, 0) / taskDurations.length : 0;

      return {
        completed_tasks_count: completedTasks.length,
        average_completion_time_hours: Math.round(avgDuration * 100) / 100,
        user_performance: performanceArray,
        recent_completions: taskDurations.slice(-10) // Last 10 completed tasks
      };
    } catch (error) {
      console.error('Error getting task assignment duration:', error);
      return {
        completed_tasks_count: 0,
        average_completion_time_hours: 0,
        user_performance: [],
        recent_completions: []
      };
    }
  }

  async getNewsPublishingQueue() {
    console.log('🔍 Analyzing news publishing queue...');
    
    try {
      const newsStatusCounts = await prisma.newsArticle.groupBy({
        by: ['status'],
        _count: {
          status: true
        }
      });

      const pendingWithoutApprover = await prisma.newsArticle.findMany({
        where: {
          status: 'pending',
          approvedBy: null
        },
        select: {
          id: true,
          title: true,
          category: true,
          publishDate: true,
          author: {
            select: {
              id: true,
              firstName: true,
              lastName: true
            }
          }
        },
        orderBy: {
          publishDate: 'asc'
        }
      });

      const statusBreakdown = newsStatusCounts.map(item => ({
        status: item.status,
        count: Number(item._count.status)
      }));

      return {
        status_breakdown: statusBreakdown,
        pending_without_approver: {
          count: pendingWithoutApprover.length,
          articles: pendingWithoutApprover.map(article => ({
            id: article.id,
            title: article.title,
            category: article.category,
            publish_date: article.publishDate,
            author_name: article.author ? `${article.author.firstName} ${article.author.lastName}` : 'Unknown'
          }))
        },
        summary: {
          draft: statusBreakdown.find(s => s.status === 'draft')?.count || 0,
          pending: statusBreakdown.find(s => s.status === 'pending')?.count || 0,
          published: statusBreakdown.find(s => s.status === 'published')?.count || 0
        }
      };
    } catch (error) {
      console.error('Error getting news publishing queue:', error);
      return {
        status_breakdown: [],
        pending_without_approver: { count: 0, articles: [] },
        summary: { draft: 0, pending: 0, published: 0 }
      };
    }
  }

  // ============================================================================
  // III. USER ENGAGEMENT & PRODUCT INSIGHTS (Student/Business Focus)
  // ============================================================================

  async getUserGrowthTrends() {
    console.log('🔍 Analyzing user growth trends...');
    
    try {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          role: true,
          auditInfo: true
        }
      });

      // Parse creation dates from auditInfo
      const userCreationData = users.map(user => {
        const audit = parseAuditInfo(user.auditInfo);
        const createdAt = audit.createdAt ? new Date(audit.createdAt) : new Date();
        return {
          id: user.id,
          role: user.role,
          created_at: createdAt,
          created_date: createdAt.toISOString().split('T')[0] // YYYY-MM-DD format
        };
      });

      // Group by date and role
      const growthByDate = userCreationData.reduce((acc, user) => {
        const date = user.created_date;
        if (!acc[date]) {
          acc[date] = { date, student: 0, manager: 0, admin: 0, total: 0 };
        }
        acc[date][user.role] = (acc[date][user.role] || 0) + 1;
        acc[date].total++;
        return acc;
      }, {} as any);

      const growthTrend = Object.values(growthByDate)
        .sort((a: any, b: any) => a.date.localeCompare(b.date))
        .slice(-30); // Last 30 days

      // Role distribution
      const roleDistribution = users.reduce((acc, user) => {
        acc[user.role] = (acc[user.role] || 0) + 1;
        return acc;
      }, {} as any);

      return {
        total_users: users.length,
        role_distribution: roleDistribution,
        growth_trend: growthTrend,
        recent_registrations: userCreationData
          .sort((a, b) => b.created_at.getTime() - a.created_at.getTime())
          .slice(0, 10) // 10 most recent users
      };
    } catch (error) {
      console.error('Error getting user growth trends:', error);
      return {
        total_users: 0,
        role_distribution: {},
        growth_trend: [],
        recent_registrations: []
      };
    }
  }

  async getSearchAnalytics() {
    console.log('🔍 Analyzing search analytics...');
    
    try {
      // Check if SearchAnalytics table exists and has data
      const searchCount = await prisma.searchAnalytics?.count().catch(() => 0) || 0;
      
      if (searchCount === 0) {
        // Return mock data based on actual usage patterns
        return {
          total_searches: 0,
          average_results: '0.0',
          zero_result_searches: 0,
          zero_result_percentage: '0%',
          top_search_criteria: [],
          last_30_days_summary: {
            total_searches: 0,
            average_results: '0.0',
            success_rate: '0%'
          },
          note: 'No search analytics data available'
        };
      }

      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      
      // Get recent search analytics
      const recentSearches = await prisma.searchAnalytics.findMany({
        where: {
          createdAt: {
            gte: thirtyDaysAgo
          }
        },
        select: {
          searchCriteria: true,
          resultsCount: true,
          createdAt: true
        }
      });

      // Calculate metrics
      const totalSearches = recentSearches.length;
      const totalResults = recentSearches.reduce((sum, search) => sum + (search.resultsCount || 0), 0);
      const averageResults = totalSearches > 0 ? (totalResults / totalSearches).toFixed(1) : '0.0';
      const zeroResultSearches = recentSearches.filter(s => (s.resultsCount || 0) === 0).length;
      const zeroResultPercentage = totalSearches > 0 ? ((zeroResultSearches / totalSearches) * 100).toFixed(1) + '%' : '0%';

      // Parse search criteria to find most used filters
      const criteriaUsage = recentSearches.reduce((acc, search) => {
        try {
          const criteria = typeof search.searchCriteria === 'string' 
            ? JSON.parse(search.searchCriteria) 
            : search.searchCriteria;
          
          Object.keys(criteria || {}).forEach(key => {
            if (criteria[key] && criteria[key] !== '') {
              acc[key] = (acc[key] || 0) + 1;
            }
          });
        } catch (e) {
          // Skip invalid JSON
        }
        return acc;
      }, {} as any);

      const topCriteria = Object.entries(criteriaUsage)
        .map(([key, count]) => ({ criteria: key, usage_count: count as number }))
        .sort((a, b) => b.usage_count - a.usage_count)
        .slice(0, 10);

      return {
        total_searches: totalSearches,
        average_results: averageResults,
        zero_result_searches: zeroResultSearches,
        zero_result_percentage: zeroResultPercentage,
        top_search_criteria: topCriteria,
        last_30_days_summary: {
          total_searches: totalSearches,
          average_results: averageResults,
          success_rate: totalSearches > 0 ? (((totalSearches - zeroResultSearches) / totalSearches) * 100).toFixed(1) + '%' : '0%'
        }
      };
    } catch (error) {
      console.error('Error getting search analytics:', error);
      return {
        total_searches: 0,
        average_results: '0.0',
        zero_result_searches: 0,
        zero_result_percentage: '0%',
        top_search_criteria: [],
        last_30_days_summary: {
          total_searches: 0,
          average_results: '0.0',
          success_rate: '0%'
        }
      };
    }
  }

  async getTopBookmarkedCourses() {
    console.log('🔍 Analyzing top bookmarked courses...');
    
    try {
      const bookmarkCounts = await prisma.studentBookmark.groupBy({
        by: ['courseId'],
        _count: {
          courseId: true
        },
        orderBy: {
          _count: {
            courseId: 'desc'
          }
        },
        take: 20
      });

      const courseIds = bookmarkCounts.map(b => b.courseId);
      const courses = await prisma.course.findMany({
        where: {
          id: { in: courseIds }
        },
        include: {
          university: {
            select: {
              id: true,
              name: true
            }
          }
        }
      });

      const topBookmarkedCourses = bookmarkCounts.map(bookmark => {
        const course = courses.find(c => c.id === bookmark.courseId);
        return {
          course_id: bookmark.courseId,
          course_name: course?.name || 'Unknown Course',
          university_name: course?.university?.name || 'Unknown University',
          bookmark_count: Number(bookmark._count.courseId),
          course_details: course ? {
            id: course.id,
            name: course.name,
            medium: course.medium,
            university_id: course.universityId
          } : null
        };
      });

      const totalBookmarks = await prisma.studentBookmark.count();
      const uniqueCourses = await prisma.studentBookmark.findMany({
        distinct: ['courseId'],
        select: { courseId: true }
      });

      return {
        total_bookmarks: totalBookmarks,
        unique_courses_bookmarked: uniqueCourses.length,
        average_bookmarks_per_course: uniqueCourses.length > 0 ? (totalBookmarks / uniqueCourses.length).toFixed(1) : '0.0',
        top_bookmarked_courses: topBookmarkedCourses
      };
    } catch (error) {
      console.error('Error getting top bookmarked courses:', error);
      return {
        total_bookmarks: 0,
        unique_courses_bookmarked: 0,
        average_bookmarks_per_course: '0.0',
        top_bookmarked_courses: []
      };
    }
  }

  // ============================================================================
  // MAIN ANALYTICS AGGREGATOR
  // ============================================================================

  async getAllAdvancedAnalytics() {
    try {
      console.log('🚀 Fetching all advanced analytics data...');
      const startTime = Date.now();

      const [
        databaseCompletion,
        dataAgeReport,
        streamMappingIntegrity,
        taskStatusBreakdown,
        taskAssignmentDuration,
        newsPublishingQueue,
        userGrowthTrends,
        searchAnalytics,
        topBookmarkedCourses
      ] = await Promise.allSettled([
        this.getDatabaseCompletionStatus(),
        this.getDataAgeReport(),
        this.getStreamMappingIntegrity(),
        this.getTaskStatusBreakdown(),
        this.getTaskAssignmentDuration(),
        this.getNewsPublishingQueue(),
        this.getUserGrowthTrends(),
        this.getSearchAnalytics(),
        this.getTopBookmarkedCourses()
      ]);

      const endTime = Date.now();
      console.log(`✅ Advanced analytics completed in ${endTime - startTime}ms`);

      const result = {
        // I. Data Integrity & Health (Admin Focus)
        data_integrity_health: {
          database_completion: databaseCompletion.status === 'fulfilled' ? databaseCompletion.value : null,
          data_age_report: dataAgeReport.status === 'fulfilled' ? dataAgeReport.value : null,
          stream_mapping_integrity: streamMappingIntegrity.status === 'fulfilled' ? streamMappingIntegrity.value : null
        },
        
        // II. Team Performance & Task Management (Manager Focus)
        team_performance: {
          task_status_breakdown: taskStatusBreakdown.status === 'fulfilled' ? taskStatusBreakdown.value : null,
          task_assignment_duration: taskAssignmentDuration.status === 'fulfilled' ? taskAssignmentDuration.value : null,
          news_publishing_queue: newsPublishingQueue.status === 'fulfilled' ? newsPublishingQueue.value : null
        },
        
        // III. User Engagement & Product Insights (Student/Business Focus)
        user_engagement_insights: {
          user_growth_trends: userGrowthTrends.status === 'fulfilled' ? userGrowthTrends.value : null,
          search_analytics: searchAnalytics.status === 'fulfilled' ? searchAnalytics.value : null,
          top_bookmarked_courses: topBookmarkedCourses.status === 'fulfilled' ? topBookmarkedCourses.value : null
        },
        
        // Metadata
        metadata: {
          generated_at: new Date().toISOString(),
          execution_time_ms: endTime - startTime,
          data_freshness: 'real-time'
        }
      };

      return convertBigIntToNumber(result);
    } catch (error) {
      console.error('Error getting all advanced analytics:', error);
      throw error;
    }
  }
}

export const advancedAnalyticsService = new AdvancedAnalyticsService();