import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Helper function to convert BigInt values to numbers in query results
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

export interface DatabaseCompletionStatus {
  entityType: string;
  totalCount: number;
  completeCount: number;
  incompleteCount: number;
  completionPercentage: number;
}

export interface TaskStatusBreakdown {
  status: string;
  taskCount: number;
  percentage: number;
  displayStatus: string;
}

export interface TaskDurationAnalytics {
  status: string;
  assigneeRole: string;
  taskCount: number;
  avgDurationHours: number;
  minDurationHours: number;
  maxDurationHours: number;
  completedWithin24h: number;
  completedAfter1week: number;
  quickCompletionRate: number;
}

export interface UserGrowthTrends {
  periodMonth: string;
  userRole: string;
  newUsersCount: number;
  cumulativeTotal: number;
  previousTotal: number;
  growthRatePercentage: number;
}

export interface SearchFilterUsage {
  filterCategory: string;
  filterValue: string;
  usageCount: number;
  usagePercentage: number;
  rankInCategory: number;
}

export interface SearchPerformanceSummary {
  totalSearches: number;
  avgResultsPerQuery: number;
  zeroResultSearches: number;
  zeroResultPercentage: number;
  successfulSearches: number;
  successRatePercentage: number;
  uniqueUsersSearching: number;
  uniqueSessions: number;
  avgSearchesPerUser: number;
  searchesLast7Days: number;
  searchesLast30Days: number;
  avgDailySearches7d: number;
  avgDailySearches30d: number;
}

export interface DailySearchTrend {
  dateLabel: string;
  dailySearchCount: number;
  avgResults: number;
}

export interface TopBookmarkedCourse {
  popularityRank: number;
  courseId: number;
  courseName: string;
  courseCode: string;
  universityName: string;
  universityType: string;
  facultyName: string;
  departmentName: string;
  feeType: string;
  studyMode: string;
  durationMonths: number;
  bookmarkCount: number;
  uniqueUsersBookmarked: number;
  recentBookmarks7d: number;
  recentBookmarks30d: number;
  bookmarkToViewRatio: number;
  activityLevel: string;
  popularityCategory: string;
}

export interface DashboardSummary {
  totalActiveUniversities: number;
  totalActiveCourses: number;
  totalActiveUsers: number;
  totalStudents: number;
  totalAdmins: number;
  totalManagers: number;
  searchesLast30Days: number;
  bookmarksLast30Days: number;
  tasksCreatedLast30Days: number;
  tasksTodo: number;
  tasksOngoing: number;
  tasksComplete: number;
}

class AdminAnalyticsService {
  
  /**
   * Get database completion status for universities and courses
   */
  async getDatabaseCompletionStatus(): Promise<DatabaseCompletionStatus[]> {
    const query = `
      WITH university_completion AS (
        SELECT 
          COUNT(*) AS total_universities,
          COUNT(CASE 
            WHEN image_url IS NOT NULL 
                 AND contact_info IS NOT NULL 
                 AND logo_url IS NOT NULL 
                 AND website IS NOT NULL
            THEN 1 
          END) AS complete_universities,
          COUNT(CASE 
            WHEN image_url IS NULL 
                 OR contact_info IS NULL 
                 OR logo_url IS NULL 
                 OR website IS NULL
            THEN 1 
          END) AS incomplete_universities
        FROM universities
        WHERE is_active = true
      ),
      
      course_completion AS (
        SELECT 
          COUNT(*) AS total_courses,
          COUNT(CASE 
            WHEN name IS NOT NULL 
                 AND description IS NOT NULL 
                 AND requirement_id IS NOT NULL 
                 AND course_url IS NOT NULL
            THEN 1 
          END) AS complete_courses,
          COUNT(CASE 
            WHEN name IS NULL 
                 OR description IS NULL 
                 OR requirement_id IS NULL 
                 OR course_url IS NULL
            THEN 1 
          END) AS incomplete_courses
        FROM courses
        WHERE is_active = true
      )
      
      SELECT 
        'Universities' AS entity_type,
        total_universities AS total_count,
        complete_universities AS complete_count,
        incomplete_universities AS incomplete_count,
        ROUND((complete_universities::DECIMAL / NULLIF(total_universities, 0)) * 100, 2) AS completion_percentage
      FROM university_completion
      
      UNION ALL
      
      SELECT 
        'Courses' AS entity_type,
        total_courses AS total_count,
        complete_courses AS complete_count,
        incomplete_courses AS incomplete_count,
        ROUND((complete_courses::DECIMAL / NULLIF(total_courses, 0)) * 100, 2) AS completion_percentage
      FROM course_completion
      ORDER BY entity_type;
    `;

    const results = await prisma.$queryRawUnsafe<DatabaseCompletionStatus[]>(query);
    return convertBigIntToNumber(results);
  }

  /**
   * Get task status breakdown
   */
  async getTaskStatusBreakdown(): Promise<TaskStatusBreakdown[]> {
    const query = `
      WITH task_status_counts AS (
        SELECT 
          status,
          COUNT(*) AS task_count
        FROM tasks
        WHERE audit_info->>'created_at' >= (CURRENT_DATE - INTERVAL '30 days')::text
          OR audit_info->>'created_at' IS NULL
        GROUP BY status
      ),
      
      total_tasks AS (
        SELECT SUM(task_count) AS total_count
        FROM task_status_counts
      )
      
      SELECT 
        tsc.status,
        tsc.task_count,
        ROUND((tsc.task_count::DECIMAL / NULLIF(tt.total_count, 0)) * 100, 2) AS percentage,
        CASE 
          WHEN tsc.status = 'todo' THEN 'To Do'
          WHEN tsc.status = 'ongoing' THEN 'Ongoing'
          WHEN tsc.status = 'complete' THEN 'Complete'
          WHEN tsc.status = 'cancelled' THEN 'Cancelled'
          ELSE INITCAP(tsc.status)
        END AS display_status
      FROM task_status_counts tsc
      CROSS JOIN total_tasks tt
      ORDER BY 
        CASE tsc.status
          WHEN 'todo' THEN 1
          WHEN 'ongoing' THEN 2
          WHEN 'complete' THEN 3
          WHEN 'cancelled' THEN 4
          ELSE 5
        END;
    `;

    const results = await prisma.$queryRawUnsafe<TaskStatusBreakdown[]>(query);
    return convertBigIntToNumber(results);
  }

  /**
   * Get task duration analytics
   */
  async getTaskDurationAnalytics(): Promise<TaskDurationAnalytics[]> {
    const query = `
      WITH task_durations AS (
        SELECT 
          t.task_id,
          t.status,
          t.title,
          CONCAT(u_assignee.first_name, ' ', u_assignee.last_name) AS assignee_name,
          u_assignee.role AS assignee_role,
          CONCAT(u_assigner.first_name, ' ', u_assigner.last_name) AS assigner_name,
          
          CASE 
            WHEN t.completed_at IS NOT NULL AND t.audit_info->>'created_at' IS NOT NULL THEN
              EXTRACT(EPOCH FROM (t.completed_at - (t.audit_info->>'created_at')::timestamp)) / 3600
            ELSE NULL
          END AS duration_hours,
          
          (t.audit_info->>'created_at')::timestamp AS created_at,
          t.completed_at,
          t.priority
          
        FROM tasks t
        INNER JOIN users u_assignee ON t.assigned_to = u_assignee.user_id
        INNER JOIN users u_assigner ON t.assigned_by = u_assigner.user_id
        WHERE (t.audit_info->>'created_at')::date >= CURRENT_DATE - INTERVAL '90 days'
          OR t.audit_info->>'created_at' IS NULL
      )
      
      SELECT 
        status,
        assignee_role,
        COUNT(*) AS task_count,
        ROUND(AVG(duration_hours), 2) AS avg_duration_hours,
        ROUND(MIN(duration_hours), 2) AS min_duration_hours,
        ROUND(MAX(duration_hours), 2) AS max_duration_hours,
        
        COUNT(CASE WHEN duration_hours <= 24 THEN 1 END) AS completed_within_24h,
        COUNT(CASE WHEN duration_hours > 168 THEN 1 END) AS completed_after_1week,
        
        ROUND((COUNT(CASE WHEN duration_hours <= 24 THEN 1 END)::DECIMAL / 
               NULLIF(COUNT(CASE WHEN duration_hours IS NOT NULL THEN 1 END), 0)) * 100, 2) AS quick_completion_rate
        
      FROM task_durations
      WHERE status IN ('complete', 'ongoing', 'cancelled')
      GROUP BY status, assignee_role
      ORDER BY status, assignee_role;
    `;

    const results = await prisma.$queryRawUnsafe<TaskDurationAnalytics[]>(query);
    return convertBigIntToNumber(results);
  }

  /**
   * Get user growth trends
   */
  async getUserGrowthTrends(): Promise<UserGrowthTrends[]> {
    const query = `
      WITH user_creation_data AS (
        SELECT 
          user_id,
          role,
          (audit_info->>'created_at')::date AS creation_date,
          EXTRACT(YEAR FROM (audit_info->>'created_at')::date) AS creation_year,
          EXTRACT(MONTH FROM (audit_info->>'created_at')::date) AS creation_month,
          DATE_TRUNC('month', (audit_info->>'created_at')::date) AS creation_month_start
        FROM users
        WHERE audit_info->>'created_at' IS NOT NULL
          AND is_active = true
          AND (audit_info->>'created_at')::date >= CURRENT_DATE - INTERVAL '12 months'
      ),
      
      monthly_user_counts AS (
        SELECT 
          creation_month_start AS period_date,
          role,
          COUNT(*) AS new_users_count
        FROM user_creation_data
        GROUP BY creation_month_start, role
      ),
      
      cumulative_counts AS (
        SELECT 
          period_date,
          role,
          new_users_count,
          SUM(new_users_count) OVER (
            PARTITION BY role 
            ORDER BY period_date 
            ROWS UNBOUNDED PRECEDING
          ) AS cumulative_total
        FROM monthly_user_counts
      )
      
      SELECT 
        TO_CHAR(period_date, 'YYYY-MM') AS period_month,
        CASE 
          WHEN role = 'admin' THEN 'Admin'
          WHEN role = 'manager' THEN 'Manager'
          WHEN role = 'student' THEN 'Student'
          WHEN role = 'editor' THEN 'Editor'
          ELSE INITCAP(role)
        END AS user_role,
        new_users_count,
        cumulative_total,
        
        LAG(cumulative_total) OVER (PARTITION BY role ORDER BY period_date) AS previous_total,
        CASE 
          WHEN LAG(cumulative_total) OVER (PARTITION BY role ORDER BY period_date) > 0 THEN
            ROUND(((cumulative_total - LAG(cumulative_total) OVER (PARTITION BY role ORDER BY period_date))::DECIMAL / 
                   LAG(cumulative_total) OVER (PARTITION BY role ORDER BY period_date)) * 100, 2)
          ELSE 0
        END AS growth_rate_percentage
      
      FROM cumulative_counts
      ORDER BY period_date DESC, role;
    `;

    const results = await prisma.$queryRawUnsafe<UserGrowthTrends[]>(query);
    return convertBigIntToNumber(results);
  }

  /**
   * Get search filter usage analytics
   */
  async getSearchFilterUsage(): Promise<SearchFilterUsage[]> {
    const query = `
      WITH search_criteria_analysis AS (
        SELECT 
          search_id,
          search_criteria,
          search_criteria->>'feeType' AS fee_type_filter,
          search_criteria->>'studyMode' AS study_mode_filter,
          search_criteria->>'courseType' AS course_type_filter,
          search_criteria->>'universityType' AS university_type_filter,
          search_criteria->>'stream' AS stream_filter,
          search_criteria->>'keyword' AS keyword_search,
          created_at
        FROM search_analytics
        WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
      ),
      
      filter_usage AS (
        SELECT 'Fee Type' AS filter_category, fee_type_filter AS filter_value, COUNT(*) AS usage_count
        FROM search_criteria_analysis 
        WHERE fee_type_filter IS NOT NULL AND fee_type_filter != ''
        GROUP BY fee_type_filter
        
        UNION ALL
        
        SELECT 'Study Mode' AS filter_category, study_mode_filter AS filter_value, COUNT(*) AS usage_count
        FROM search_criteria_analysis 
        WHERE study_mode_filter IS NOT NULL AND study_mode_filter != ''
        GROUP BY study_mode_filter
        
        UNION ALL
        
        SELECT 'Course Type' AS filter_category, course_type_filter AS filter_value, COUNT(*) AS usage_count
        FROM search_criteria_analysis 
        WHERE course_type_filter IS NOT NULL AND course_type_filter != ''
        GROUP BY course_type_filter
        
        UNION ALL
        
        SELECT 'University Type' AS filter_category, university_type_filter AS filter_value, COUNT(*) AS usage_count
        FROM search_criteria_analysis 
        WHERE university_type_filter IS NOT NULL AND university_type_filter != ''
        GROUP BY university_type_filter
      ),
      
      total_usage AS (
        SELECT SUM(usage_count) AS total_filter_usage
        FROM filter_usage
      )
      
      SELECT 
        fu.filter_category,
        fu.filter_value,
        fu.usage_count,
        ROUND((fu.usage_count::DECIMAL / NULLIF(tu.total_filter_usage, 0)) * 100, 2) AS usage_percentage,
        ROW_NUMBER() OVER (PARTITION BY fu.filter_category ORDER BY fu.usage_count DESC) AS rank_in_category
      
      FROM filter_usage fu
      CROSS JOIN total_usage tu
      WHERE fu.usage_count > 0
      ORDER BY fu.filter_category, fu.usage_count DESC;
    `;

    const results = await prisma.$queryRawUnsafe<SearchFilterUsage[]>(query);
    return convertBigIntToNumber(results);
  }

  /**
   * Get search performance summary
   */
  async getSearchPerformanceSummary(): Promise<SearchPerformanceSummary> {
    const query = `
      WITH search_performance AS (
        SELECT 
          COUNT(*) AS total_searches,
          AVG(COALESCE(results_count, 0)) AS avg_results_per_query,
          COUNT(CASE WHEN COALESCE(results_count, 0) = 0 THEN 1 END) AS zero_result_searches,
          COUNT(CASE WHEN results_count > 0 THEN 1 END) AS successful_searches,
          COUNT(CASE WHEN results_count >= 10 THEN 1 END) AS high_result_searches,
          
          COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) AS searches_last_7_days,
          COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) AS searches_last_30_days,
          
          COUNT(DISTINCT user_id) AS unique_users_searching,
          COUNT(DISTINCT session_id) AS unique_sessions
          
        FROM search_analytics
        WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
      )
      
      SELECT 
        sp.total_searches,
        ROUND(sp.avg_results_per_query, 2) AS avg_results_per_query,
        sp.zero_result_searches,
        ROUND((sp.zero_result_searches::DECIMAL / NULLIF(sp.total_searches, 0)) * 100, 2) AS zero_result_percentage,
        
        sp.successful_searches,
        ROUND((sp.successful_searches::DECIMAL / NULLIF(sp.total_searches, 0)) * 100, 2) AS success_rate_percentage,
        
        sp.unique_users_searching,
        sp.unique_sessions,
        ROUND(sp.total_searches::DECIMAL / NULLIF(sp.unique_users_searching, 0), 2) AS avg_searches_per_user,
        
        sp.searches_last_7_days,
        sp.searches_last_30_days,
        ROUND((sp.searches_last_7_days::DECIMAL / 7), 1) AS avg_daily_searches_7d,
        ROUND((sp.searches_last_30_days::DECIMAL / 30), 1) AS avg_daily_searches_30d
      
      FROM search_performance sp;
    `;

    const results = await prisma.$queryRawUnsafe<SearchPerformanceSummary[]>(query);
    const convertedResults = convertBigIntToNumber(results);
    return convertedResults[0] || {};
  }

  /**
   * Get daily search trends
   */
  async getDailySearchTrends(): Promise<DailySearchTrend[]> {
    const query = `
      SELECT 
        TO_CHAR(search_date, 'YYYY-MM-DD') AS date_label,
        daily_search_count,
        ROUND(daily_avg_results, 1) AS avg_results
      FROM (
        SELECT 
          created_at::date AS search_date,
          COUNT(*) AS daily_search_count,
          AVG(COALESCE(results_count, 0)) AS daily_avg_results
        FROM search_analytics
        WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
        GROUP BY created_at::date
        ORDER BY search_date DESC
      ) AS daily_trends;
    `;

    const results = await prisma.$queryRawUnsafe<DailySearchTrend[]>(query);
    return convertBigIntToNumber(results);
  }

  /**
   * Get top bookmarked courses
   */
  async getTopBookmarkedCourses(limit: number = 20): Promise<TopBookmarkedCourse[]> {
    const query = `
      WITH course_bookmark_stats AS (
        SELECT 
          sb.course_id,
          COUNT(*) AS bookmark_count,
          COUNT(DISTINCT sb.user_id) AS unique_users_bookmarked,
          
          COUNT(CASE WHEN (sb.audit_info->>'created_at')::date >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) AS recent_bookmarks_7d,
          COUNT(CASE WHEN (sb.audit_info->>'created_at')::date >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) AS recent_bookmarks_30d
          
        FROM student_bookmarks sb
        GROUP BY sb.course_id
      ),
      
      course_details_with_bookmarks AS (
        SELECT 
          cbs.course_id,
          c.name AS course_name,
          c.course_code,
          c.fee_type,
          c.study_mode,
          c.course_type,
          c.duration_months,
          u.name AS university_name,
          u.type AS university_type,
          f.name AS faculty_name,
          d.name AS department_name,
          
          cbs.bookmark_count,
          cbs.unique_users_bookmarked,
          cbs.recent_bookmarks_7d,
          cbs.recent_bookmarks_30d,
          
          ROW_NUMBER() OVER (ORDER BY cbs.bookmark_count DESC) AS popularity_rank,
          
          CASE 
            WHEN ca.view_count > 0 THEN 
              ROUND((cbs.bookmark_count::DECIMAL / ca.view_count) * 100, 2)
            ELSE NULL
          END AS bookmark_to_view_ratio
        
        FROM course_bookmark_stats cbs
        INNER JOIN courses c ON cbs.course_id = c.course_id
        INNER JOIN universities u ON c.university_id = u.university_id
        INNER JOIN faculties f ON c.faculty_id = f.faculty_id
        INNER JOIN departments d ON c.department_id = d.department_id
        LEFT JOIN course_analytics ca ON c.course_id = ca.course_id
        WHERE c.is_active = true
          AND u.is_active = true
      )
      
      SELECT 
        popularity_rank,
        course_id,
        course_name,
        course_code,
        university_name,
        university_type,
        faculty_name,
        department_name,
        fee_type,
        study_mode,
        duration_months,
        bookmark_count,
        unique_users_bookmarked,
        recent_bookmarks_7d,
        recent_bookmarks_30d,
        bookmark_to_view_ratio,
        
        CASE 
          WHEN recent_bookmarks_7d > 0 THEN 'High Activity'
          WHEN recent_bookmarks_30d > 0 THEN 'Moderate Activity'
          ELSE 'Low Activity'
        END AS activity_level,
        
        CASE 
          WHEN popularity_rank <= 5 THEN 'Top 5'
          WHEN popularity_rank <= 10 THEN 'Top 10'
          WHEN popularity_rank <= 20 THEN 'Top 20'
          ELSE 'Others'
        END AS popularity_category
      
      FROM course_details_with_bookmarks
      ORDER BY bookmark_count DESC, recent_bookmarks_30d DESC
      LIMIT $1;
    `;

    const results = await prisma.$queryRawUnsafe<TopBookmarkedCourse[]>(query, limit);
    return convertBigIntToNumber(results);
  }

  /**
   * Get dashboard summary
   */
  async getDashboardSummary(): Promise<DashboardSummary> {
    const query = `
      SELECT 
        (SELECT COUNT(*) FROM universities WHERE is_active = true) AS total_active_universities,
        (SELECT COUNT(*) FROM courses WHERE is_active = true) AS total_active_courses,
        (SELECT COUNT(*) FROM users WHERE is_active = true) AS total_active_users,
        
        (SELECT COUNT(*) FROM users WHERE role = 'student' AND is_active = true) AS total_students,
        (SELECT COUNT(*) FROM users WHERE role = 'admin' AND is_active = true) AS total_admins,
        (SELECT COUNT(*) FROM users WHERE role = 'manager' AND is_active = true) AS total_managers,
        
        (SELECT COUNT(*) FROM search_analytics WHERE created_at >= CURRENT_DATE - INTERVAL '30 days') AS searches_last_30_days,
        (SELECT COUNT(*) FROM student_bookmarks WHERE (audit_info->>'created_at')::date >= CURRENT_DATE - INTERVAL '30 days') AS bookmarks_last_30_days,
        (SELECT COUNT(*) FROM tasks WHERE (audit_info->>'created_at')::date >= CURRENT_DATE - INTERVAL '30 days') AS tasks_created_last_30_days,
        
        (SELECT COUNT(*) FROM tasks WHERE status = 'todo') AS tasks_todo,
        (SELECT COUNT(*) FROM tasks WHERE status = 'ongoing') AS tasks_ongoing,
        (SELECT COUNT(*) FROM tasks WHERE status = 'complete') AS tasks_complete;
    `;

    const results = await prisma.$queryRawUnsafe<DashboardSummary[]>(query);
    const convertedResults = convertBigIntToNumber(results);
    return convertedResults[0] || {};
  }

  /**
   * Get all analytics data in one call for dashboard
   */
  async getAllAnalytics() {
    try {
      const [
        databaseCompletion,
        taskStatusBreakdown,
        taskDurationAnalytics,
        userGrowthTrends,
        searchFilterUsage,
        searchPerformanceSummary,
        dailySearchTrends,
        topBookmarkedCourses,
        dashboardSummary
      ] = await Promise.all([
        this.getDatabaseCompletionStatus(),
        this.getTaskStatusBreakdown(),
        this.getTaskDurationAnalytics(),
        this.getUserGrowthTrends(),
        this.getSearchFilterUsage(),
        this.getSearchPerformanceSummary(),
        this.getDailySearchTrends(),
        this.getTopBookmarkedCourses(20),
        this.getDashboardSummary()
      ]);

      return {
        databaseCompletion,
        taskStatusBreakdown,
        taskDurationAnalytics,
        userGrowthTrends,
        searchFilterUsage,
        searchPerformanceSummary,
        dailySearchTrends,
        topBookmarkedCourses,
        dashboardSummary,
        generatedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      throw new Error('Failed to fetch analytics data');
    }
  }
}

export default new AdminAnalyticsService();