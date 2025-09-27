-- Sample data for testing analytics queries
-- Insert this data to test your analytics dashboard

-- Insert sample search analytics data
INSERT INTO search_analytics (user_id, search_criteria, results_count, clicked_results, session_id, created_at)
VALUES 
  (1, '{"feeType": "free", "studyMode": "fulltime", "keyword": "engineering"}', 15, '{"course_id": [1,2,3]}', 'session_001', NOW() - INTERVAL '1 day'),
  (2, '{"feeType": "paid", "studyMode": "parttime", "universityType": "government"}', 8, '{"course_id": [4,5]}', 'session_002', NOW() - INTERVAL '2 days'),
  (3, '{"courseType": "internal", "stream": "physical_science"}', 12, '{"course_id": [6,7,8]}', 'session_003', NOW() - INTERVAL '3 days'),
  (1, '{"feeType": "free", "keyword": "computer science"}', 0, NULL, 'session_004', NOW() - INTERVAL '5 days'),
  (4, '{"universityType": "private", "studyMode": "fulltime"}', 22, '{"course_id": [9,10,11,12]}', 'session_005', NOW() - INTERVAL '7 days'),
  (2, '{"feeType": "paid", "courseType": "external"}', 5, '{"course_id": [13]}', 'session_006', NOW() - INTERVAL '10 days'),
  (5, '{"keyword": "medicine", "universityType": "government"}', 18, '{"course_id": [14,15,16]}', 'session_007', NOW() - INTERVAL '15 days'),
  (3, '{"studyMode": "parttime", "feeType": "free"}', 3, '{"course_id": [17]}', 'session_008', NOW() - INTERVAL '20 days'),
  (6, '{"stream": "biological_science", "courseType": "internal"}', 9, '{"course_id": [18,19]}', 'session_009', NOW() - INTERVAL '25 days'),
  (1, '{"keyword": "business"}', 14, '{"course_id": [20,21,22]}', 'session_010', NOW() - INTERVAL '28 days');

-- Insert sample student bookmarks with proper audit_info
INSERT INTO student_bookmarks (user_id, course_id, notes, audit_info)
VALUES 
  (1, 1, 'Interested in this engineering program', 
   '{"created_at": "' || (NOW() - INTERVAL '1 day')::timestamp || '", "created_by": 1}'),
  (1, 2, 'Good alternative option', 
   '{"created_at": "' || (NOW() - INTERVAL '2 days')::timestamp || '", "created_by": 1}'),
  (2, 1, 'Recommended by counselor', 
   '{"created_at": "' || (NOW() - INTERVAL '3 days')::timestamp || '", "created_by": 2}'),
  (2, 3, 'Excellent faculty reviews', 
   '{"created_at": "' || (NOW() - INTERVAL '5 days')::timestamp || '", "created_by": 2}'),
  (3, 2, 'Close to home', 
   '{"created_at": "' || (NOW() - INTERVAL '7 days')::timestamp || '", "created_by": 3}'),
  (3, 4, 'Affordable fees', 
   '{"created_at": "' || (NOW() - INTERVAL '10 days')::timestamp || '", "created_by": 3}'),
  (4, 1, 'Top choice for engineering', 
   '{"created_at": "' || (NOW() - INTERVAL '12 days')::timestamp || '", "created_by": 4}'),
  (5, 5, 'Interested in medicine', 
   '{"created_at": "' || (NOW() - INTERVAL '15 days')::timestamp || '", "created_by": 5}'),
  (5, 6, 'Second choice medical school', 
   '{"created_at": "' || (NOW() - INTERVAL '18 days')::timestamp || '", "created_by": 5}'),
  (6, 1, 'Best engineering program in the country', 
   '{"created_at": "' || (NOW() - INTERVAL '20 days')::timestamp || '", "created_by": 6}');

-- Insert sample tasks with proper audit_info and completion dates
INSERT INTO tasks (assigned_to, assigned_by, title, description, task_type, status, priority, due_date, task_data, completed_at, audit_info)
VALUES 
  (2, 1, 'Update University Information', 'Update contact details for University of Colombo', 'data_entry', 'complete', 'medium', 
   NOW() + INTERVAL '7 days', '{"university_id": 1}', NOW() - INTERVAL '2 days',
   '{"created_at": "' || (NOW() - INTERVAL '5 days')::timestamp || '", "created_by": 1}'),
  
  (3, 1, 'Review Course Descriptions', 'Review and approve new course descriptions', 'review', 'ongoing', 'high', 
   NOW() + INTERVAL '3 days', '{"course_ids": [1,2,3]}', NULL,
   '{"created_at": "' || (NOW() - INTERVAL '3 days')::timestamp || '", "created_by": 1}'),
  
  (4, 2, 'Create Content for Homepage', 'Design new banner for homepage', 'content_creation', 'todo', 'low', 
   NOW() + INTERVAL '14 days', '{"section": "homepage_banner"}', NULL,
   '{"created_at": "' || (NOW() - INTERVAL '1 day')::timestamp || '", "created_by": 2}'),
  
  (2, 1, 'Fix Database Issues', 'Resolve data inconsistencies in course requirements', 'course_update', 'complete', 'urgent', 
   NOW() + INTERVAL '1 day', '{"affected_courses": [10,11,12]}', NOW() - INTERVAL '12 hours',
   '{"created_at": "' || (NOW() - INTERVAL '2 days')::timestamp || '", "created_by": 1}'),
  
  (5, 3, 'Validate University Partnerships', 'Confirm partnership status with private universities', 'review', 'ongoing', 'medium', 
   NOW() + INTERVAL '10 days', '{"university_types": ["private"]}', NULL,
   '{"created_at": "' || (NOW() - INTERVAL '7 days')::timestamp || '", "created_by": 3}'),
  
  (3, 2, 'Update Course Fee Information', 'Update fee structures for 2024', 'data_entry', 'cancelled', 'low', 
   NOW() - INTERVAL '2 days', '{"academic_year": "2024"}', NULL,
   '{"created_at": "' || (NOW() - INTERVAL '10 days')::timestamp || '", "created_by": 2}'),
  
  (4, 1, 'Generate Monthly Reports', 'Create analytics reports for management', 'content_creation', 'todo', 'medium', 
   NOW() + INTERVAL '5 days', '{"report_type": "monthly_analytics"}', NULL,
   '{"created_at": "' || (NOW() - INTERVAL '1 day')::timestamp || '", "created_by": 1}'),
  
  (2, 3, 'Quality Check Course Data', 'Verify completeness of course information', 'review', 'complete', 'high', 
   NOW() + INTERVAL '2 days', '{"check_type": "completeness"}', NOW() - INTERVAL '6 hours',
   '{"created_at": "' || (NOW() - INTERVAL '4 days')::timestamp || '", "created_by": 3}');

-- Update users with proper audit_info for growth tracking
UPDATE users 
SET audit_info = '{"created_at": "' || (NOW() - INTERVAL '30 days')::timestamp || '", "created_by": 1}'
WHERE user_id = 1;

UPDATE users 
SET audit_info = '{"created_at": "' || (NOW() - INTERVAL '25 days')::timestamp || '", "created_by": 1}'
WHERE user_id = 2;

UPDATE users 
SET audit_info = '{"created_at": "' || (NOW() - INTERVAL '20 days')::timestamp || '", "created_by": 1}'
WHERE user_id = 3;

UPDATE users 
SET audit_info = '{"created_at": "' || (NOW() - INTERVAL '15 days')::timestamp || '", "created_by": 1}'
WHERE user_id = 4;

UPDATE users 
SET audit_info = '{"created_at": "' || (NOW() - INTERVAL '10 days')::timestamp || '", "created_by": 1}'
WHERE user_id = 5;

UPDATE users 
SET audit_info = '{"created_at": "' || (NOW() - INTERVAL '5 days')::timestamp || '", "created_by": 1}'
WHERE user_id = 6;

-- Update universities to have some incomplete data for testing database completion
UPDATE universities 
SET image_url = NULL, contact_info = NULL 
WHERE university_id = 2;

UPDATE universities 
SET logo_url = NULL, website = NULL 
WHERE university_id = 3;

-- Update courses to have some incomplete data for testing
UPDATE courses 
SET description = NULL, requirement_id = NULL 
WHERE course_id IN (2, 4, 6);

UPDATE courses 
SET course_url = NULL 
WHERE course_id IN (8, 10);

-- Insert some course analytics data
INSERT INTO course_analytics (course_id, view_count, bookmark_count, application_count, analytics_date, updated_at)
VALUES 
  (1, 150, 4, 2, CURRENT_DATE, NOW()),
  (2, 120, 3, 1, CURRENT_DATE, NOW()),
  (3, 89, 2, 0, CURRENT_DATE, NOW()),
  (4, 76, 2, 1, CURRENT_DATE, NOW()),
  (5, 95, 2, 1, CURRENT_DATE, NOW()),
  (6, 67, 1, 0, CURRENT_DATE, NOW());

-- Commit the transaction
COMMIT;