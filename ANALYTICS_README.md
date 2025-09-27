# Admin Dashboard Analytics System

This comprehensive analytics system provides 7 key metrics for monitoring and managing your educational platform. The system includes PostgreSQL queries, TypeScript services, REST API endpoints, and React components.

## 🚀 Features

### 7 Key Analytics Metrics:

1. **Database Completion Status** - Track completeness of Universities and Courses data
2. **Task Status Breakdown** - Monitor task distribution across different statuses
3. **Task Assignment & Duration Analytics** - Analyze workflow efficiency and completion times
4. **User Growth Trends** - Track platform growth by user role over time
5. **Search & Filter Usage** - Identify most popular search criteria and filters
6. **Search Performance Summary** - Monitor search effectiveness and user experience
7. **Top Bookmarked Courses** - Discover most popular programs based on user engagement

## 📁 File Structure

```
server/
├── src/
│   ├── controllers/
│   │   └── adminAnalyticsController.ts     # REST API controllers
│   ├── services/
│   │   └── adminAnalyticsService.ts        # Database service layer
│   ├── routes/
│   │   └── adminAnalyticsRoutes.ts         # API route definitions
│   └── queries/
│       ├── adminDashboardAnalytics.sql     # Complete SQL queries
│       └── sampleAnalyticsData.sql         # Sample data for testing

client/
└── src/
    └── components/
        ├── AdminStatistics.tsx             # Full-featured component (requires chart.js)
        └── AdminStatisticsSimple.tsx       # Simple component (no external deps)
```

## 🛠 Installation & Setup

### 1. Install Dependencies

#### Server Dependencies (Already included in your project)
- `@prisma/client` - Database ORM
- `express` - Web framework
- `cors` - CORS middleware

#### Client Dependencies
```bash
cd client
npm install chart.js react-chartjs-2 @heroicons/react
```

### 2. Database Setup

#### Add Sample Data (Optional - for testing)
```sql
-- Run the sample data script to test analytics
psql -U your_username -d your_database -f server/src/queries/sampleAnalyticsData.sql
```

### 3. Server Integration

#### Update your main server file (`server/index.ts`):
```typescript
// Add import
import adminAnalyticsRoutes from './src/routes/adminAnalyticsRoutes';

// Add route
app.use('/api/admin/analytics', adminAnalyticsRoutes);
```

### 4. Client Integration

#### Option A: Use the Full-Featured Component (with Charts)
```tsx
import AdminStatistics from './components/AdminStatistics';

// In your admin dashboard
<AdminStatistics />
```

#### Option B: Use the Simple Component (no external dependencies)
```tsx
import AdminStatisticsSimple from './components/AdminStatisticsSimple';

// In your admin dashboard
<AdminStatisticsSimple />
```

## 🔌 API Endpoints

All endpoints require authentication and admin/manager role:

```
GET /api/admin/analytics/dashboard/overview     # All analytics data
GET /api/admin/analytics/dashboard/summary      # Dashboard summary only
GET /api/admin/analytics/database/completion    # Database completion status
GET /api/admin/analytics/tasks/status           # Task status breakdown
GET /api/admin/analytics/tasks/duration         # Task duration analytics
GET /api/admin/analytics/users/growth           # User growth trends
GET /api/admin/analytics/search/filters         # Search filter usage
GET /api/admin/analytics/search/performance     # Search performance
GET /api/admin/analytics/courses/bookmarked     # Top bookmarked courses
GET /api/admin/analytics/date-range             # Analytics by date range
GET /api/admin/analytics/export                 # Export analytics data
```

## 📊 Example API Response

```json
{
  "success": true,
  "message": "Analytics data retrieved successfully",
  "data": {
    "databaseCompletion": [
      {
        "entityType": "Universities",
        "totalCount": 25,
        "completeCount": 20,
        "incompleteCount": 5,
        "completionPercentage": 80.00
      }
    ],
    "taskStatusBreakdown": [
      {
        "status": "todo",
        "taskCount": 15,
        "percentage": 45.45,
        "displayStatus": "To Do"
      }
    ],
    "dashboardSummary": {
      "totalActiveUniversities": 25,
      "totalActiveCourses": 150,
      "totalActiveUsers": 1250,
      "searchesLast30Days": 890
    },
    "generatedAt": "2025-01-27T10:30:00.000Z"
  }
}
```

## 🔍 SQL Queries Usage

You can run the individual queries directly in your database:

```sql
-- Example: Get database completion status
WITH university_completion AS (
  SELECT 
    COUNT(*) AS total_universities,
    COUNT(CASE 
      WHEN image_url IS NOT NULL 
           AND contact_info IS NOT NULL 
           AND logo_url IS NOT NULL 
           AND website IS NOT NULL
      THEN 1 
    END) AS complete_universities
  FROM universities
  WHERE is_active = true
)
SELECT 
  'Universities' AS entity_type,
  total_universities AS total_count,
  complete_universities AS complete_count,
  ROUND((complete_universities::DECIMAL / total_universities) * 100, 2) AS completion_percentage
FROM university_completion;
```

## 🎯 Customization

### Adding New Metrics

1. **Add SQL Query**: Update `adminDashboardAnalytics.sql`
2. **Update Service**: Add method to `adminAnalyticsService.ts`
3. **Update Controller**: Add endpoint to `adminAnalyticsController.ts`
4. **Update Routes**: Add route to `adminAnalyticsRoutes.ts`
5. **Update Component**: Add visualization to React component

### Modifying Time Ranges

Most queries use 30-day windows by default. You can modify the time ranges:

```sql
-- Change from 30 days to 90 days
WHERE created_at >= CURRENT_DATE - INTERVAL '90 days'

-- Change from 12 months to 6 months
WHERE (audit_info->>'created_at')::date >= CURRENT_DATE - INTERVAL '6 months'
```

### Performance Optimization

For large datasets, consider:

1. **Indexing**: Add database indexes on frequently queried columns
2. **Caching**: Implement Redis caching for expensive queries
3. **Pagination**: Add pagination for large result sets
4. **Background Jobs**: Use cron jobs for heavy analytics calculations

## 🔒 Security Considerations

- All endpoints require authentication (`authenticateToken` middleware)
- Admin/Manager role required (`requireAdmin` middleware)
- Input validation on date ranges and parameters
- SQL injection protection via parameterized queries

## 🐛 Troubleshooting

### Common Issues:

1. **"Cannot find module 'chart.js'"**
   ```bash
   npm install chart.js react-chartjs-2
   ```

2. **"Authentication required"**
   - Ensure user is logged in
   - Check JWT token in localStorage
   - Verify user has admin/manager role

3. **"No data available"**
   - Run sample data script for testing
   - Check database connectivity
   - Verify audit_info fields contain proper timestamps

4. **Performance issues**
   - Add database indexes
   - Reduce date ranges
   - Implement caching

### Database Indexes for Better Performance:

```sql
-- Create indexes for better query performance
CREATE INDEX idx_search_analytics_created_at ON search_analytics(created_at);
CREATE INDEX idx_student_bookmarks_audit_info ON student_bookmarks USING GIN(audit_info);
CREATE INDEX idx_tasks_audit_info ON tasks USING GIN(audit_info);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_audit_info ON users USING GIN(audit_info);
```

## 📈 Dashboard Screenshots

The analytics dashboard provides:
- **Overview Tab**: Summary cards, completion status, task breakdown
- **Tasks Tab**: Detailed task analytics and duration metrics
- **Users Tab**: User growth trends and role distribution
- **Search Tab**: Search performance and filter usage analytics
- **Courses Tab**: Most bookmarked courses and engagement metrics

## 🔄 Auto-Refresh

The dashboard automatically refreshes data and provides a manual refresh button. You can set up automatic refresh intervals:

```typescript
// Auto-refresh every 5 minutes
useEffect(() => {
  const interval = setInterval(fetchAnalyticsData, 5 * 60 * 1000);
  return () => clearInterval(interval);
}, []);
```

## 📝 Support

For questions or issues:
1. Check the troubleshooting section above
2. Review the SQL queries for data requirements
3. Ensure proper authentication and permissions
4. Verify database schema matches expected structure

---

**Ready to use!** The analytics system is now fully integrated and ready to provide insights into your educational platform's performance and usage patterns.