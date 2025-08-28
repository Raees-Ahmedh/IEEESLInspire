/*
  Warnings:

  - You are about to drop the column `course_id` on the `course_materials` table. All the data in the column will be lost.
  - You are about to drop the column `framework_level` on the `courses` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "course_materials" DROP CONSTRAINT "course_materials_course_id_fkey";

-- DropForeignKey
ALTER TABLE "courses" DROP CONSTRAINT "courses_framework_level_fkey";

-- AlterTable
ALTER TABLE "course_materials" DROP COLUMN "course_id";

-- AlterTable
ALTER TABLE "courses" DROP COLUMN "framework_level",
ADD COLUMN     "framework_id" INTEGER,
ADD COLUMN     "material_ids" INTEGER[];

-- AddForeignKey
ALTER TABLE "courses" ADD CONSTRAINT "courses_framework_id_fkey" FOREIGN KEY ("framework_id") REFERENCES "frameworks"("framework_id") ON DELETE SET NULL ON UPDATE CASCADE;
