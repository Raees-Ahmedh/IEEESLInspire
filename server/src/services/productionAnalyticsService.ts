import { PrismaClient } from '@prisma/client';

// Production Analytics Service - Updated
const prisma = new PrismaClient();

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

// Helper function to safely parse decimal values
function parseDecimal(value: any): number {
  if (value === undefined || value === null) return 0;
  if (typeof value === 'number') return value;
  if (typeof value === 'object' && value.d && Array.isArray(value.d)) {
    // Handle PostgreSQL decimal format properly
    const digits = value.d;
    const scale = value.e || 0;
    let result = 0;
    for (let i = 0; i < digits.length; i++) {
      result = result * 10000 + digits[i];
    }
    return result / Math.pow(10, scale);
  }
  return Number(value) || 0;
}

export interface DashboardMetrics {
  totalCourses: number;
  recentBookmarks: number;
  activeUsers: number;
  pendingTasks: number;
}

export interface DatabaseCompletionMetrics {
  courses: {
    total: number;
    complete: number;
    incomplete: number;
    percentage: number;
  };
  universities: {
    total: number;
    complete: number;
    incomplete: number;
    percentage: number;
  };
}

export interface UserAnalytics {
  roleDistribution: {
    admin: number;
    manager: number;
    editor: number;
    student: number;
  };
  activity: {
    newUsersThisMonth: number;
    activeUsers30Days: number;
    growthRate: number;
  };
}

export interface TaskAnalytics {
  statusBreakdown: {
    todo: number;
    ongoing: number;
    complete: number;
    overdue: number;
  };
  performance: {
    avgCompletionTime: number;
    completionRateThisMonth: number;
    completionRateLastMonth: number;
  };
}

export interface CourseAnalytics {
  byStatus: {
    published: number;
    draft: number;
    archived: number;
  };
  byUniversity: Array<{
    universityName: string;
    courseCount: number;
  }>;
  coursesAddedThisMonth: number;
  topBookmarkedCourses: Array<{
    id: number;
    name: string;
    bookmarkCount: number;
    universityName: string;
  }>;
  recentlyUpdated: Array<{
    id: number;
    name: string;
    lastUpdated: string;
  }>;
}

export interface SearchAnalytics {
  totalSearchesToday: number;
  totalSearchesThisWeek: number;
  avgResultsPerSearch: number;
  zeroResultRate: number;
  popularSearchTerms: Array<{
    term: string;
    count: number;
  }>;
}

export class ProductionAnalyticsService {
  
  /**
   * Get dashboard header metrics
   */
  async getDashboardMetrics(): Promise<DashboardMetrics> {
    const [totalCourses, recentBookmarks, activeUsers, pendingTasks] = await Promise.all([
      // Total active courses
      prisma.course.count({
        where: { isActive: true }
      }),
      
      // Bookmarks in last 30 days
      prisma.studentBookmark.count({
        where: {
          auditInfo: {
            path: ['created_at'],
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
          }
        }
      }),
      
      // Users active in last 90 days
      prisma.user.count({
        where: {
          OR: [
            {
              lastLogin: {
                gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
              }
            },
            {
              auditInfo: {
                path: ['updated_at'],
                gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()
              }
            }
          ]
        }
      }),
      
      // Pending tasks (todo + ongoing)
      prisma.task.count({
        where: {
          status: {
            in: ['todo', 'ongoing']
          }
        }
      })
    ]);

    return {
      totalCourses: convertBigIntToNumber(totalCourses),
      recentBookmarks: convertBigIntToNumber(recentBookmarks),
      activeUsers: convertBigIntToNumber(activeUsers),
      pendingTasks: convertBigIntToNumber(pendingTasks)
    };
  }

  /**
   * Get database completion status with accurate percentage calculations
   */
  async getDatabaseCompletionMetrics(): Promise<DatabaseCompletionMetrics> {
    // Course completion - complete if all required fields are present
    const courseQuery = `
      WITH course_completion AS (
        SELECT 
          COUNT(*) AS total_courses,
          COUNT(CASE 
            WHEN name IS NOT NULL 
                 AND description IS NOT NULL 
                 AND requirement_id IS NOT NULL 
                 AND university_id IS NOT NULL
            THEN 1 
          END) AS complete_courses
        FROM courses
        WHERE is_active = true
      )
      SELECT 
        total_courses,
        complete_courses,
        (total_courses - complete_courses) AS incomplete_courses,
        CASE 
          WHEN total_courses = 0 THEN 0
          ELSE ROUND((complete_courses::DECIMAL / total_courses) * 100, 2)
        END AS completion_percentage
      FROM course_completion;
    `;

    // University completion - complete if required fields are present
    const universityQuery = `
      WITH university_completion AS (
        SELECT 
          COUNT(*) AS total_universities,
          COUNT(CASE 
            WHEN name IS NOT NULL 
                 AND image_url IS NOT NULL 
                 AND contact_info IS NOT NULL
            THEN 1 
          END) AS complete_universities
        FROM universities
        WHERE is_active = true
      )
      SELECT 
        total_universities,
        complete_universities,
        (total_universities - complete_universities) AS incomplete_universities,
        CASE 
          WHEN total_universities = 0 THEN 0
          ELSE ROUND((complete_universities::DECIMAL / total_universities) * 100, 2)
        END AS completion_percentage
      FROM university_completion;
    `;

    const [courseResults, universityResults] = await Promise.all([
      prisma.$queryRawUnsafe(courseQuery),
      prisma.$queryRawUnsafe(universityQuery)
    ]);

    const courseData = convertBigIntToNumber(courseResults)[0];
    const universityData = convertBigIntToNumber(universityResults)[0];

    return {
      courses: {
        total: courseData.total_courses,
        complete: courseData.complete_courses,
        incomplete: courseData.incomplete_courses,
        percentage: parseDecimal(courseData.completion_percentage)
      },
      universities: {
        total: universityData.total_universities,
        complete: universityData.complete_universities,
        incomplete: universityData.incomplete_universities,
        percentage: parseDecimal(universityData.completion_percentage)
      }
    };
  }

  /**
   * Get user analytics including role distribution and activity trends
   */
  async getUserAnalytics(): Promise<UserAnalytics> {
    // Role distribution
    const roleDistribution = await prisma.user.groupBy({
      by: ['role'],
      _count: {
        id: true
      },
      where: {
        isActive: true
      }
    });

    // Convert to expected format
    const roles = {
      admin: 0,
      manager: 0,
      editor: 0,
      student: 0
    };

    roleDistribution.forEach(item => {
      if (item.role in roles) {
        roles[item.role as keyof typeof roles] = convertBigIntToNumber(item._count.id);
      }
    });

    // Activity trends
    const currentMonth = new Date();
    const lastMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
    const thisMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);

    const [newUsersThisMonth, activeUsers30Days, newUsersLastMonth] = await Promise.all([
      // New users this month
      prisma.user.count({
        where: {
          auditInfo: {
            path: ['created_at'],
            gte: thisMonth.toISOString()
          }
        }
      }),
      
      // Active users in last 30 days
      prisma.user.count({
        where: {
          lastLogin: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        }
      }),
      
      // New users last month for growth calculation
      prisma.user.count({
        where: {
          auditInfo: {
            path: ['created_at'],
            gte: lastMonth.toISOString(),
            lt: thisMonth.toISOString()
          }
        }
      })
    ]);

    const growthRate = convertBigIntToNumber(newUsersLastMonth) > 0 
      ? ((convertBigIntToNumber(newUsersThisMonth) - convertBigIntToNumber(newUsersLastMonth)) / convertBigIntToNumber(newUsersLastMonth)) * 100 
      : 0;

    return {
      roleDistribution: roles,
      activity: {
        newUsersThisMonth: convertBigIntToNumber(newUsersThisMonth),
        activeUsers30Days: convertBigIntToNumber(activeUsers30Days),
        growthRate: Math.round(growthRate * 100) / 100
      }
    };
  }

  /**
   * Get task analytics including status breakdown and performance metrics
   */
  async getTaskAnalytics(): Promise<TaskAnalytics> {
    // Task status breakdown
    const statusBreakdown = await prisma.task.groupBy({
      by: ['status'],
      _count: {
        id: true
      }
    });

    const statuses = {
      todo: 0,
      ongoing: 0,
      complete: 0,
      overdue: 0
    };

    statusBreakdown.forEach(item => {
      if (item.status in statuses) {
        statuses[item.status as keyof typeof statuses] = convertBigIntToNumber(item._count.id);
      }
    });

    // Add overdue tasks (due date passed but not completed)
    const overdueTasks = await prisma.task.count({
      where: {
        dueDate: {
          lt: new Date()
        },
        status: {
          in: ['todo', 'ongoing']
        }
      }
    });

    statuses.overdue = convertBigIntToNumber(overdueTasks);

    // Performance metrics
    const currentMonth = new Date();
    const lastMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
    const thisMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);

    const [completedTasksThisMonth, completedTasksLastMonth, avgCompletionTime] = await Promise.all([
      prisma.task.count({
        where: {
          status: 'complete',
          completedAt: {
            gte: thisMonth
          }
        }
      }),
      
      prisma.task.count({
        where: {
          status: 'complete',
          completedAt: {
            gte: lastMonth,
            lt: thisMonth
          }
        }
      }),
      
      // Average completion time calculation would need more complex query
      prisma.$queryRaw`
        SELECT AVG(EXTRACT(EPOCH FROM (completed_at - (audit_info->>'created_at')::timestamp))/3600) as avg_hours
        FROM tasks 
        WHERE status = 'complete' 
        AND completed_at IS NOT NULL 
        AND audit_info->>'created_at' IS NOT NULL
      `
    ]);

    const completionRateThisMonth = convertBigIntToNumber(completedTasksThisMonth);
    const completionRateLastMonth = convertBigIntToNumber(completedTasksLastMonth);

    return {
      statusBreakdown: statuses,
      performance: {
        avgCompletionTime: convertBigIntToNumber((avgCompletionTime as any)[0]?.avg_hours || 0),
        completionRateThisMonth,
        completionRateLastMonth
      }
    };
  }

  /**
   * Get course analytics including status, distribution, and top courses
   */
  async getCourseAnalytics(): Promise<CourseAnalytics> {
    const currentMonth = new Date();
    const thisMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);

    const [byUniversity, coursesAddedThisMonth, topBookmarkedCourses] = await Promise.all([
      // Courses by university
      prisma.university.findMany({
        select: {
          name: true,
          _count: {
            select: {
              courses: {
                where: {
                  isActive: true
                }
              }
            }
          }
        },
        where: {
          isActive: true
        }
      }),
      
      // Courses added this month
      prisma.course.count({
        where: {
          isActive: true,
          auditInfo: {
            path: ['created_at'],
            gte: thisMonth.toISOString()
          }
        }
      }),
      
      // Top bookmarked courses
      prisma.$queryRaw`
        SELECT 
          c.course_id,
          c.name,
          u.name as university_name,
          COUNT(sb.bookmark_id) as bookmark_count
        FROM courses c
        LEFT JOIN student_bookmarks sb ON c.course_id = sb.course_id
        LEFT JOIN universities u ON c.university_id = u.university_id
        WHERE c.is_active = true
        GROUP BY c.course_id, c.name, u.name
        ORDER BY bookmark_count DESC
        LIMIT 5
      `
    ]);

    // Recently updated courses
    const recentlyUpdated = await prisma.course.findMany({
      select: {
        id: true,
        name: true,
        auditInfo: true
      },
      where: {
        isActive: true
      },
      orderBy: {
        id: 'desc'
      },
      take: 5
    });

    return {
      byStatus: {
        published: 0, // Would need status field in schema
        draft: 0,
        archived: 0
      },
      byUniversity: byUniversity.map(u => ({
        universityName: u.name,
        courseCount: convertBigIntToNumber(u._count.courses)
      })),
      coursesAddedThisMonth: convertBigIntToNumber(coursesAddedThisMonth),
      topBookmarkedCourses: convertBigIntToNumber(topBookmarkedCourses).map((course: any) => ({
        id: course.course_id,
        name: course.name,
        bookmarkCount: course.bookmark_count,
        universityName: course.university_name
      })),
      recentlyUpdated: recentlyUpdated.map(course => ({
        id: course.id,
        name: course.name,
        lastUpdated: new Date().toISOString() // Would extract from auditInfo
      }))
    };
  }

  /**
   * Get search analytics
   */
  async getSearchAnalytics(): Promise<SearchAnalytics> {
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const startOfWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [totalSearchesToday, totalSearchesThisWeek, avgResults, zeroResults, popularTerms] = await Promise.all([
      // Searches today
      prisma.searchAnalytics.count({
        where: {
          createdAt: {
            gte: startOfToday
          }
        }
      }),
      
      // Searches this week
      prisma.searchAnalytics.count({
        where: {
          createdAt: {
            gte: startOfWeek
          }
        }
      }),
      
      // Average results per search
      prisma.searchAnalytics.aggregate({
        _avg: {
          resultsCount: true
        }
      }),
      
      // Zero result searches
      prisma.searchAnalytics.count({
        where: {
          resultsCount: 0
        }
      }),
      
      // Popular search terms (would need to parse searchCriteria JSON)
      prisma.$queryRaw`
        SELECT 
          search_criteria->>'query' as term,
          COUNT(*) as count
        FROM search_analytics 
        WHERE search_criteria->>'query' IS NOT NULL
        GROUP BY search_criteria->>'query'
        ORDER BY count DESC
        LIMIT 10
      `
    ]);

    const totalSearches = convertBigIntToNumber(totalSearchesThisWeek);
    const zeroResultCount = convertBigIntToNumber(zeroResults);

    return {
      totalSearchesToday: convertBigIntToNumber(totalSearchesToday),
      totalSearchesThisWeek: totalSearches,
      avgResultsPerSearch: Math.round((avgResults._avg.resultsCount || 0) * 100) / 100,
      zeroResultRate: totalSearches > 0 ? Math.round((zeroResultCount / totalSearches) * 100 * 100) / 100 : 0,
      popularSearchTerms: convertBigIntToNumber(popularTerms).map((term: any) => ({
        term: term.term,
        count: term.count
      }))
    };
  }

  /**
   * Get all analytics data for the dashboard
   */
  async getAllAnalytics() {
    try {
      const [
        dashboardMetrics,
        databaseCompletion,
        userAnalytics,
        taskAnalytics,
        courseAnalytics,
        searchAnalytics
      ] = await Promise.all([
        this.getDashboardMetrics(),
        this.getDatabaseCompletionMetrics(),
        this.getUserAnalytics(),
        this.getTaskAnalytics(),
        this.getCourseAnalytics(),
        this.getSearchAnalytics()
      ]);

      return {
        dashboardMetrics,
        databaseCompletion,
        userAnalytics,
        taskAnalytics,
        courseAnalytics,
        searchAnalytics,
        generatedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error in getAllAnalytics:', error);
      throw error;
    }
  }
}

export const productionAnalyticsService = new ProductionAnalyticsService();