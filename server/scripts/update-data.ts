import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateData() {
  try {
    console.log('Starting data update...');

    // Update framework_id for the three courses
    console.log('Updating framework_id values...');
    await prisma.$executeRaw`UPDATE courses SET framework_id = 1 WHERE course_id = 1`;
    await prisma.$executeRaw`UPDATE courses SET framework_id = 2 WHERE course_id = 2`;
    await prisma.$executeRaw`UPDATE courses SET framework_id = 3 WHERE course_id = 3`;
    console.log('✅ Framework IDs updated successfully');

    // Update material_ids arrays for the three courses
    console.log('Updating material_ids arrays...');
    await prisma.$executeRaw`UPDATE courses SET material_ids = ARRAY[1] WHERE course_id = 1`;
    await prisma.$executeRaw`UPDATE courses SET material_ids = ARRAY[2] WHERE course_id = 2`;
    await prisma.$executeRaw`UPDATE courses SET material_ids = ARRAY[3] WHERE course_id = 3`;
    console.log('✅ Material IDs updated successfully');

    // Verify the updates with raw query to avoid type issues
    console.log('Verifying updates...');
    const updatedCourses = await prisma.$queryRaw`
      SELECT course_id as id, name, framework_id, material_ids 
      FROM courses 
      WHERE course_id IN (1, 2, 3)
    ` as Array<{
      id: number;
      name: string;
      framework_id: number | null;
      material_ids: number[] | null;
    }>;

    console.log('Updated courses:');
    updatedCourses.forEach(course => {
      console.log(`Course ${course.id}: ${course.name}`);
      console.log(`  Framework ID: ${course.framework_id}`);
      console.log(`  Material IDs: ${JSON.stringify(course.material_ids)}`);
      console.log('---');
    });

    console.log('🎉 Data update completed successfully!');
  } catch (error) {
    console.error('❌ Error updating data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the update
updateData()
  .then(() => {
    console.log('Script completed successfully');
  })
  .catch((error) => {
    console.error('Failed to update data:', error);
  });