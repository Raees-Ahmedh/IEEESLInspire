-- Quick test data for analytics dashboard
-- Run this in your database to test analytics

-- Insert minimal test users with proper audit info for growth tracking
INSERT INTO users (user_type, email, password_hash, first_name, last_name, role, is_active, audit_info)
VALUES 
  ('student', 'test.student1@example.com', '$2b$10$test', 'Test', 'Student1', 'student', true, 
   '{"created_at": "' || (NOW() - INTERVAL '10 days')::timestamp || '", "created_by": 1}'),
  ('student', 'test.student2@example.com', '$2b$10$test', 'Test', 'Student2', 'student', true,
   '{"created_at": "' || (NOW() - INTERVAL '5 days')::timestamp || '", "created_by": 1}'),
  ('manager', 'test.manager@example.com', '$2b$10$test', 'Test', 'Manager', 'manager', true,
   '{"created_at": "' || (NOW() - INTERVAL '15 days')::timestamp || '", "created_by": 1}')
ON CONFLICT (email) DO NOTHING;

-- Insert test search analytics
INSERT INTO search_analytics (user_id, search_criteria, results_count, session_id, created_at)
VALUES 
  (1, '{"keyword": "engineering", "feeType": "free"}', 5, 'test_session_1', NOW() - INTERVAL '1 day'),
  (2, '{"keyword": "medicine", "universityType": "government"}', 3, 'test_session_2', NOW() - INTERVAL '2 days'),
  (1, '{"studyMode": "fulltime", "courseType": "internal"}', 0, 'test_session_3', NOW() - INTERVAL '3 days'),
  (3, '{"feeType": "paid", "keyword": "business"}', 8, 'test_session_4', NOW() - INTERVAL '5 days');

-- Insert test tasks with proper audit info
INSERT INTO tasks (assigned_to, assigned_by, title, description, status, priority, audit_info, completed_at)
VALUES 
  (2, 1, 'Test Task 1', 'Update university data', 'complete', 'medium',
   '{"created_at": "' || (NOW() - INTERVAL '7 days')::timestamp || '", "created_by": 1}',
   NOW() - INTERVAL '2 days'),
  (3, 1, 'Test Task 2', 'Review course information', 'ongoing', 'high',
   '{"created_at": "' || (NOW() - INTERVAL '5 days')::timestamp || '", "created_by": 1}',
   NULL),
  (2, 1, 'Test Task 3', 'Create content', 'todo', 'low',
   '{"created_at": "' || (NOW() - INTERVAL '3 days')::timestamp || '", "created_by": 1}',
   NULL);

-- Update existing data to ensure some completion status variety
UPDATE universities SET image_url = NULL WHERE university_id = 1;
UPDATE courses SET description = NULL WHERE course_id = 1;