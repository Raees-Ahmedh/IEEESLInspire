-- AlterTable
ALTER TABLE "course_requirements" ADD COLUMN     "rule_OLGrades" JSONB;

-- AlterTable
ALTER TABLE "universities" ADD COLUMN     "recognition_criteria" TEXT[];
