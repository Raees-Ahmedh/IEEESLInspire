import { prisma } from '../src/config/database';

async function createSavedCoursesForUser(userId: number) {
  try {
    console.log(`🔖 Seeding saved courses for user ID ${userId}...`);

    const existing = await prisma.studentBookmark.findMany({
      where: { userId }
    });

    if (existing.length > 0) {
      console.log(`⚠️ User ID ${userId} already has ${existing.length} saved course(s). Skipping creation.`);
      return;
    }

    const now = new Date().toISOString();
    const bookmarks = [
      {
        userId,
        courseId: 2,
        notes: 'Highly interested in AI program.',
        auditInfo: {
          createdAt: now,
          createdBy: 'seed-script',
          updatedAt: now,
          updatedBy: 'seed-script'
        }
      },
    //   {
    //     userId,
    //     courseId: 102,
    //     notes: 'Second choice – good university.',
    //     auditInfo: {
    //       createdAt: now,
    //       createdBy: 'seed-script',
    //       updatedAt: now,
    //       updatedBy: 'seed-script'
    //     }
    //   },
    //   {
    //     userId,
    //     courseId: 103,
    //     notes: null,
    //     auditInfo: {
    //       createdAt: now,
    //       createdBy: 'seed-script',
    //       updatedAt: now,
    //       updatedBy: 'seed-script'
    //     }
    //   }
    ];

    const created = await prisma.studentBookmark.createMany({
      data: bookmarks
    });

    console.log(`✅ Successfully created ${created.count} saved courses for user ID ${userId}.`);

  } catch (error) {
    console.error('❌ Error seeding saved courses:', error);
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  await createSavedCoursesForUser(6);
}

main();
