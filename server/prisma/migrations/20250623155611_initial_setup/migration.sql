-- CreateEnum
CREATE TYPE "FrameworkType" AS ENUM ('SLQF', 'NVQ');

-- CreateTable
CREATE TABLE "universities" (
    "university_id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "type" VARCHAR(50) NOT NULL,
    "uni_code" VARCHAR(20),
    "address" TEXT,
    "contact_info" JSONB,
    "website" VARCHAR(255),
    "additional_details" JSONB,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "audit_info" JSONB NOT NULL,

    CONSTRAINT "universities_pkey" PRIMARY KEY ("university_id")
);

-- CreateTable
CREATE TABLE "faculties" (
    "faculty_id" SERIAL NOT NULL,
    "university_id" INTEGER NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "audit_info" JSONB NOT NULL,

    CONSTRAINT "faculties_pkey" PRIMARY KEY ("faculty_id")
);

-- CreateTable
CREATE TABLE "departments" (
    "department_id" SERIAL NOT NULL,
    "faculty_id" INTEGER NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "audit_info" JSONB NOT NULL,

    CONSTRAINT "departments_pkey" PRIMARY KEY ("department_id")
);

-- CreateTable
CREATE TABLE "major_fields" (
    "major_id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "audit_info" JSONB NOT NULL,

    CONSTRAINT "major_fields_pkey" PRIMARY KEY ("major_id")
);

-- CreateTable
CREATE TABLE "sub_fields" (
    "subfield_id" SERIAL NOT NULL,
    "major_id" INTEGER NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "audit_info" JSONB NOT NULL,

    CONSTRAINT "sub_fields_pkey" PRIMARY KEY ("subfield_id")
);

-- CreateTable
CREATE TABLE "frameworks" (
    "framework_id" SERIAL NOT NULL,
    "type" "FrameworkType" NOT NULL,
    "qualification_category" VARCHAR(50) NOT NULL,
    "level" INTEGER NOT NULL,
    "year" INTEGER,

    CONSTRAINT "frameworks_pkey" PRIMARY KEY ("framework_id")
);

-- CreateTable
CREATE TABLE "courses" (
    "course_id" SERIAL NOT NULL,
    "university_id" INTEGER NOT NULL,
    "faculty_id" INTEGER NOT NULL,
    "department_id" INTEGER NOT NULL,
    "subfield_id" INTEGER[],
    "requirement_id" INTEGER,
    "career_id" INTEGER[],
    "name" VARCHAR(255) NOT NULL,
    "specialisation" TEXT[],
    "course_code" VARCHAR(50),
    "course_url" VARCHAR(255) NOT NULL,
    "framework_level" INTEGER,
    "study_mode" VARCHAR(20) NOT NULL,
    "course_type" VARCHAR(20) NOT NULL,
    "fee_type" VARCHAR(20) NOT NULL,
    "fee_amount" DECIMAL(12,2),
    "duration_months" INTEGER,
    "description" TEXT,
    "Zscore" JSONB,
    "additional_details" JSONB,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "audit_info" JSONB NOT NULL,

    CONSTRAINT "courses_pkey" PRIMARY KEY ("course_id")
);

-- CreateTable
CREATE TABLE "course_requirements" (
    "requirement_id" SERIAL NOT NULL,
    "course_id" INTEGER,
    "min_requirement" VARCHAR(50) NOT NULL,
    "stream" INTEGER[],
    "rule_subjectBasket" JSONB,
    "rule_subjectGrades" JSONB,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "audit_info" JSONB NOT NULL,

    CONSTRAINT "course_requirements_pkey" PRIMARY KEY ("requirement_id")
);

-- CreateTable
CREATE TABLE "subjects" (
    "subject_id" SERIAL NOT NULL,
    "code" VARCHAR(10) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "level" VARCHAR(5) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "audit_info" JSONB NOT NULL,

    CONSTRAINT "subjects_pkey" PRIMARY KEY ("subject_id")
);

-- CreateTable
CREATE TABLE "streams" (
    "stream_id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "stream_rule" JSONB,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "audit_info" JSONB NOT NULL,

    CONSTRAINT "streams_pkey" PRIMARY KEY ("stream_id")
);

-- CreateTable
CREATE TABLE "valid_combinations" (
    "combination_id" SERIAL NOT NULL,
    "subject_1" INTEGER NOT NULL,
    "subject_2" INTEGER NOT NULL,
    "subject_3" INTEGER NOT NULL,
    "course_id" INTEGER[],
    "audit_info" JSONB NOT NULL,

    CONSTRAINT "valid_combinations_pkey" PRIMARY KEY ("combination_id")
);

-- CreateTable
CREATE TABLE "career_pathways" (
    "career_id" SERIAL NOT NULL,
    "job_title" VARCHAR(255) NOT NULL,
    "industry" VARCHAR(255),
    "description" TEXT,
    "salary_range" VARCHAR(100),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "audit_info" JSONB NOT NULL,

    CONSTRAINT "career_pathways_pkey" PRIMARY KEY ("career_id")
);

-- CreateTable
CREATE TABLE "users" (
    "user_id" SERIAL NOT NULL,
    "user_type" VARCHAR(100) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "first_name" VARCHAR(100),
    "last_name" VARCHAR(100),
    "phone" VARCHAR(20),
    "role" VARCHAR(20) NOT NULL DEFAULT 'student',
    "profile_data" JSONB,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_login" TIMESTAMP(3),
    "audit_info" JSONB NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "user_permissions" (
    "permission_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "permission_type" VARCHAR(100) NOT NULL,
    "resource_type" VARCHAR(100) NOT NULL,
    "permission_details" JSONB,
    "granted_by" INTEGER NOT NULL,
    "granted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "audit_info" JSONB NOT NULL,

    CONSTRAINT "user_permissions_pkey" PRIMARY KEY ("permission_id")
);

-- CreateTable
CREATE TABLE "student_profiles" (
    "profile_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "ol_results" JSONB,
    "al_results" JSONB,
    "highest_qualification" VARCHAR(100),
    "preferences" JSONB,
    "career_interests" JSONB,
    "audit_info" JSONB NOT NULL,

    CONSTRAINT "student_profiles_pkey" PRIMARY KEY ("profile_id")
);

-- CreateTable
CREATE TABLE "student_bookmarks" (
    "bookmark_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "course_id" INTEGER NOT NULL,
    "notes" TEXT,
    "audit_info" JSONB NOT NULL,

    CONSTRAINT "student_bookmarks_pkey" PRIMARY KEY ("bookmark_id")
);

-- CreateTable
CREATE TABLE "student_applications" (
    "application_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "selected_subjects" JSONB NOT NULL,
    "subject_grades" JSONB,
    "eligible_courses" JSONB,
    "audit_info" JSONB NOT NULL,

    CONSTRAINT "student_applications_pkey" PRIMARY KEY ("application_id")
);

-- CreateTable
CREATE TABLE "news_articles" (
    "article_id" SERIAL NOT NULL,
    "author_id" INTEGER NOT NULL,
    "approved_by" INTEGER,
    "title" VARCHAR(500) NOT NULL,
    "content" TEXT NOT NULL,
    "category" VARCHAR(50),
    "status" VARCHAR(20) NOT NULL DEFAULT 'draft',
    "tags" JSONB,
    "publish_date" TIMESTAMP(3),
    "audit_info" JSONB NOT NULL,

    CONSTRAINT "news_articles_pkey" PRIMARY KEY ("article_id")
);

-- CreateTable
CREATE TABLE "events" (
    "event_id" SERIAL NOT NULL,
    "created_by" INTEGER NOT NULL,
    "title" VARCHAR(500) NOT NULL,
    "description" TEXT,
    "event_type" VARCHAR(50),
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3),
    "location" VARCHAR(255),
    "is_public" BOOLEAN NOT NULL DEFAULT true,
    "audit_info" JSONB NOT NULL,

    CONSTRAINT "events_pkey" PRIMARY KEY ("event_id")
);

-- CreateTable
CREATE TABLE "tasks" (
    "task_id" SERIAL NOT NULL,
    "assigned_to" INTEGER NOT NULL,
    "assigned_by" INTEGER NOT NULL,
    "title" VARCHAR(500) NOT NULL,
    "description" TEXT,
    "task_type" VARCHAR(50),
    "status" VARCHAR(20) NOT NULL DEFAULT 'todo',
    "priority" VARCHAR(10) NOT NULL DEFAULT 'medium',
    "due_date" TIMESTAMP(3),
    "task_data" JSONB,
    "completed_at" TIMESTAMP(3),
    "audit_info" JSONB NOT NULL,

    CONSTRAINT "tasks_pkey" PRIMARY KEY ("task_id")
);

-- CreateTable
CREATE TABLE "task_comments" (
    "comment_id" SERIAL NOT NULL,
    "task_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "comment" TEXT NOT NULL,
    "audit_info" JSONB NOT NULL,

    CONSTRAINT "task_comments_pkey" PRIMARY KEY ("comment_id")
);

-- CreateTable
CREATE TABLE "user_activity_logs" (
    "log_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "action_type" VARCHAR(100) NOT NULL,
    "resource_type" VARCHAR(100),
    "resource_id" INTEGER,
    "action_data" JSONB,
    "ip_address" INET,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_activity_logs_pkey" PRIMARY KEY ("log_id")
);

-- CreateTable
CREATE TABLE "search_analytics" (
    "search_id" SERIAL NOT NULL,
    "user_id" INTEGER,
    "search_criteria" JSONB NOT NULL,
    "results_count" INTEGER,
    "clicked_results" JSONB,
    "session_id" VARCHAR(255),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "search_analytics_pkey" PRIMARY KEY ("search_id")
);

-- CreateTable
CREATE TABLE "course_analytics" (
    "analytics_id" SERIAL NOT NULL,
    "course_id" INTEGER NOT NULL,
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "bookmark_count" INTEGER NOT NULL DEFAULT 0,
    "application_count" INTEGER NOT NULL DEFAULT 0,
    "analytics_date" DATE NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "course_analytics_pkey" PRIMARY KEY ("analytics_id")
);

-- CreateTable
CREATE TABLE "course_materials" (
    "material_id" SERIAL NOT NULL,
    "course_id" INTEGER NOT NULL,
    "material_type" VARCHAR(50) NOT NULL,
    "file_name" VARCHAR(255) NOT NULL,
    "file_path" VARCHAR(500) NOT NULL,
    "file_type" VARCHAR(20),
    "file_size" INTEGER,
    "uploaded_by" INTEGER NOT NULL,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "audit_info" JSONB NOT NULL,

    CONSTRAINT "course_materials_pkey" PRIMARY KEY ("material_id")
);

-- CreateTable
CREATE TABLE "system_settings" (
    "setting_id" SERIAL NOT NULL,
    "setting_key" VARCHAR(100) NOT NULL,
    "setting_value" JSONB NOT NULL,
    "description" TEXT,
    "updated_by" INTEGER NOT NULL,
    "audit_info" JSONB NOT NULL,

    CONSTRAINT "system_settings_pkey" PRIMARY KEY ("setting_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "universities_uni_code_key" ON "universities"("uni_code");

-- CreateIndex
CREATE UNIQUE INDEX "courses_course_code_key" ON "courses"("course_code");

-- CreateIndex
CREATE UNIQUE INDEX "subjects_code_key" ON "subjects"("code");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "student_profiles_user_id_key" ON "student_profiles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "system_settings_setting_key_key" ON "system_settings"("setting_key");

-- AddForeignKey
ALTER TABLE "faculties" ADD CONSTRAINT "faculties_university_id_fkey" FOREIGN KEY ("university_id") REFERENCES "universities"("university_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "departments" ADD CONSTRAINT "departments_faculty_id_fkey" FOREIGN KEY ("faculty_id") REFERENCES "faculties"("faculty_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sub_fields" ADD CONSTRAINT "sub_fields_major_id_fkey" FOREIGN KEY ("major_id") REFERENCES "major_fields"("major_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "courses" ADD CONSTRAINT "courses_university_id_fkey" FOREIGN KEY ("university_id") REFERENCES "universities"("university_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "courses" ADD CONSTRAINT "courses_faculty_id_fkey" FOREIGN KEY ("faculty_id") REFERENCES "faculties"("faculty_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "courses" ADD CONSTRAINT "courses_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("department_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "courses" ADD CONSTRAINT "courses_framework_level_fkey" FOREIGN KEY ("framework_level") REFERENCES "frameworks"("framework_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "courses" ADD CONSTRAINT "courses_requirement_id_fkey" FOREIGN KEY ("requirement_id") REFERENCES "course_requirements"("requirement_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "valid_combinations" ADD CONSTRAINT "valid_combinations_subject_1_fkey" FOREIGN KEY ("subject_1") REFERENCES "subjects"("subject_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "valid_combinations" ADD CONSTRAINT "valid_combinations_subject_2_fkey" FOREIGN KEY ("subject_2") REFERENCES "subjects"("subject_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "valid_combinations" ADD CONSTRAINT "valid_combinations_subject_3_fkey" FOREIGN KEY ("subject_3") REFERENCES "subjects"("subject_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_permissions" ADD CONSTRAINT "user_permissions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_permissions" ADD CONSTRAINT "user_permissions_granted_by_fkey" FOREIGN KEY ("granted_by") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_profiles" ADD CONSTRAINT "student_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_bookmarks" ADD CONSTRAINT "student_bookmarks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_bookmarks" ADD CONSTRAINT "student_bookmarks_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("course_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_applications" ADD CONSTRAINT "student_applications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "news_articles" ADD CONSTRAINT "news_articles_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "news_articles" ADD CONSTRAINT "news_articles_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_assigned_to_fkey" FOREIGN KEY ("assigned_to") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_assigned_by_fkey" FOREIGN KEY ("assigned_by") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_comments" ADD CONSTRAINT "task_comments_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "tasks"("task_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_comments" ADD CONSTRAINT "task_comments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_activity_logs" ADD CONSTRAINT "user_activity_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "search_analytics" ADD CONSTRAINT "search_analytics_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_analytics" ADD CONSTRAINT "course_analytics_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("course_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_materials" ADD CONSTRAINT "course_materials_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("course_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_materials" ADD CONSTRAINT "course_materials_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "system_settings" ADD CONSTRAINT "system_settings_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;
