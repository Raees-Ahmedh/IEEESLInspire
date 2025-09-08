import { PrismaClient } from "@prisma/client";
import type { JsonValue } from "@prisma/client/runtime/library";

const prisma = new PrismaClient();

/**
 * Script to update courses with valid combination IDs
 * This script should be run after generating valid combinations
 */
class CourseValidCombinationUpdater {
  /**
   * Main function to update all courses with their valid combinations
   */
  async updateAllCourses(): Promise<void> {
    try {
      console.log("🚀 Starting course-combination linking process...");

      // Get all active courses
      const courses = await prisma.course.findMany({
        where: { isActive: true },
        include: {
          requirements: {
            select: {
              stream: true,
              ruleSubjectBasket: true,
              ruleSubjectGrades: true,
            },
          },
        },
      });

      console.log(`📋 Found ${courses.length} courses to process...`);

      let updatedCount = 0;
      let errorCount = 0;

      for (const course of courses) {
        try {
          console.log(
            `\n🔄 Processing course: ${course.name} (ID: ${course.id})`
          );

          // Get valid combinations for this course's requirements
          const validCombinationIds = await this.getValidCombinationsForCourse(
            course
          );

          if (validCombinationIds.length > 0) {
            // Update the course with valid combination IDs
            await this.updateCourseValidCombinations(
              course.id,
              validCombinationIds
            );
            updatedCount++;
            console.log(
              `   ✅ Added ${validCombinationIds.length} valid combinations`
            );
          } else {
            console.log(`   ⚠️  No valid combinations found for this course`);
          }
        } catch (error) {
          console.error(`   ❌ Error processing course ${course.id}: ${error}`);
          errorCount++;
        }
      }

      console.log("\n📊 UPDATE SUMMARY");
      console.log("═".repeat(40));
      console.log(`Successfully updated: ${updatedCount} courses`);
      console.log(`Errors encountered: ${errorCount} courses`);
      console.log(`Total processed: ${courses.length} courses`);

      // Display verification
      await this.displayVerification();
    } catch (error) {
      console.error("❌ Error in main update process:", error);
      throw error;
    }
  }

  /**
   * Get valid combination IDs for a specific course based on its requirements
   */
  private async getValidCombinationsForCourse(course: any): Promise<number[]> {
    if (!course.requirements || !course.requirements.stream) {
      return [];
    }

    const streamIds = course.requirements.stream;

    // Get all valid combinations for the course's required streams
    const validCombinations = await prisma.validCombination.findMany({
      where: {
        streamId: { in: streamIds },
      },
      select: { id: true },
    });

    return validCombinations.map((combo) => combo.id);
  }

  /**
   * Update a specific course with valid combination IDs
   */
  private async updateCourseValidCombinations(
    courseId: number,
    combinationIds: number[]
  ): Promise<void> {
    try {
      // Get current course_id arrays from valid_combinations table
      const existingCombinations = await prisma.validCombination.findMany({
        where: { id: { in: combinationIds } },
        select: { id: true, courseId: true },
      });

      // Update each combination to include this course ID
      for (const combination of existingCombinations) {
        const currentCourseIds = combination.courseId || [];

        // Only add if not already present
        if (!currentCourseIds.includes(courseId)) {
          const updatedCourseIds = [...currentCourseIds, courseId];

          await prisma.validCombination.update({
            where: { id: combination.id },
            data: {
              courseId: updatedCourseIds,
              auditInfo: {
                updatedBy: "system-course-updater",
                updatedAt: new Date().toISOString(),
                lastCourseAdded: courseId,
              },
            },
          });
        }
      }
    } catch (error) {
      console.error(`Error updating course ${courseId}:`, error);
      throw error;
    }
  }

  /**
   * Add a specific course to a specific combination
   */
  async addCourseToValidCombination(
    combinationId: number,
    courseId: number
  ): Promise<void> {
    try {
      const combination = await prisma.validCombination.findUnique({
        where: { id: combinationId },
        select: { courseId: true },
      });

      if (!combination) {
        throw new Error(`Valid combination with ID ${combinationId} not found`);
      }

      const currentCourseIds = combination.courseId || [];

      if (!currentCourseIds.includes(courseId)) {
        const updatedCourseIds = [...currentCourseIds, courseId];

        await prisma.validCombination.update({
          where: { id: combinationId },
          data: {
            courseId: updatedCourseIds,
            auditInfo: {
              updatedBy: "system-manual-add",
              updatedAt: new Date().toISOString(),
              manuallyAddedCourse: courseId,
            },
          },
        });

        console.log(
          `✅ Added course ${courseId} to combination ${combinationId}`
        );
      } else {
        console.log(
          `ℹ️  Course ${courseId} already exists in combination ${combinationId}`
        );
      }
    } catch (error) {
      console.error(`Error adding course to combination:`, error);
      throw error;
    }
  }

  /**
   * Remove a specific course from a specific combination
   */
  async removeCourseFromValidCombination(
    combinationId: number,
    courseId: number
  ): Promise<void> {
    try {
      const combination = await prisma.validCombination.findUnique({
        where: { id: combinationId },
        select: { courseId: true },
      });

      if (!combination) {
        throw new Error(`Valid combination with ID ${combinationId} not found`);
      }

      const currentCourseIds = combination.courseId || [];
      const updatedCourseIds = currentCourseIds.filter((id) => id !== courseId);

      await prisma.validCombination.update({
        where: { id: combinationId },
        data: {
          courseId: updatedCourseIds,
          auditInfo: {
            updatedBy: "system-manual-remove",
            updatedAt: new Date().toISOString(),
            manuallyRemovedCourse: courseId,
          },
        },
      });

      console.log(
        `✅ Removed course ${courseId} from combination ${combinationId}`
      );
    } catch (error) {
      console.error(`Error removing course from combination:`, error);
      throw error;
    }
  }

  /**
   * Display verification of the updates
   */
  private async displayVerification(): Promise<void> {
    console.log("\n🔍 VERIFICATION");
    console.log("═".repeat(40));

    // Count combinations with courses
    const combinationsWithCourses = await prisma.validCombination.count({
      where: {
        courseId: { isEmpty: false },
      },
    });

    const totalCombinations = await prisma.validCombination.count();

    console.log(`Combinations with courses: ${combinationsWithCourses}`);
    console.log(`Total combinations: ${totalCombinations}`);
    console.log(
      `Coverage: ${(
        (combinationsWithCourses / totalCombinations) *
        100
      ).toFixed(1)}%`
    );

    // Show sample combinations with courses
    console.log("\n📋 Sample Combinations with Courses:");
    const sampleCombinations = await prisma.validCombination.findMany({
      where: {
        courseId: { isEmpty: false },
      },
      take: 5,
      include: {
        subjectOne: { select: { name: true } },
        subjectTwo: { select: { name: true } },
        subjectThree: { select: { name: true } },
        stream: { select: { name: true } },
      },
    });

    sampleCombinations.forEach((combo, index) => {
      console.log(`${index + 1}. ${combo.stream.name}:`);
      console.log(
        `   ${combo.subjectOne.name} + ${combo.subjectTwo.name} + ${combo.subjectThree.name}`
      );
      console.log(`   Courses: [${combo.courseId.join(", ")}]`);
    });
  }

  /**
   * Get statistics about combinations and courses
   */
  async getStatistics(): Promise<void> {
    console.log("\n📈 DETAILED STATISTICS");
    console.log("═".repeat(50));

    // Get combinations by stream
    const streamStats = await prisma.stream.findMany({
      where: {
        isActive: true,
        id: { not: 7 }, // Exclude Common stream
      },
      include: {
        validCombinations: {
          select: {
            id: true,
            courseId: true,
          },
        },
      },
    });

    for (const stream of streamStats) {
      const totalCombinations = stream.validCombinations.length;
      const combinationsWithCourses = stream.validCombinations.filter(
        (c) => c.courseId.length > 0
      ).length;
      const totalCourseLinks = stream.validCombinations.reduce(
        (sum, c) => sum + c.courseId.length,
        0
      );

      console.log(`${stream.name}:`);
      console.log(`  Total combinations: ${totalCombinations}`);
      console.log(`  With courses: ${combinationsWithCourses}`);
      console.log(`  Total course links: ${totalCourseLinks}`);
      console.log(
        `  Avg courses per combination: ${
          totalCombinations > 0
            ? (totalCourseLinks / totalCombinations).toFixed(2)
            : 0
        }`
      );
      console.log("");
    }
  }

  /**
   * Clear all course associations from valid combinations
   */
  async clearAllCourseAssociations(): Promise<void> {
    console.log(
      "🗑️  Clearing all course associations from valid combinations..."
    );

    const result = await prisma.validCombination.updateMany({
      data: {
        courseId: [],
        auditInfo: {
          clearedBy: "system-clear-all",
          clearedAt: new Date().toISOString(),
        },
      },
    });

    console.log(
      `✅ Cleared course associations from ${result.count} combinations`
    );
  }
}

// Main execution function
async function main(): Promise<void> {
  const updater = new CourseValidCombinationUpdater();

  try {
    // Default to update-all command
    await updater.updateAllCourses();
    console.log("\n🎉 Script completed successfully!");
  } catch (error) {
    console.error("💥 Script failed:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
    console.log("🔌 Database connection closed gracefully");
  }
}

// Execute the script
main().catch((error) => {
  console.error("Unhandled error:", error);
  throw error;
});

export { CourseValidCombinationUpdater };
