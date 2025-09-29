-- Add courseId to course_materials table
ALTER TABLE "course_materials" ADD COLUMN "course_id" INTEGER;

-- Add foreign key constraint
ALTER TABLE "course_materials" 
ADD CONSTRAINT "course_materials_course_id_fkey" 
FOREIGN KEY ("course_id") REFERENCES "courses"("course_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Add index for better performance
CREATE INDEX "course_materials_course_id_idx" ON "course_materials"("course_id");
