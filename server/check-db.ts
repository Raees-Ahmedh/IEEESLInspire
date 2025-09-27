// Check database records quickly
import { prisma } from './src/config/database';

async function checkDatabaseCounts() {
  try {
    console.log('🔍 Checking database counts...');
    
    const userCount = await prisma.user.count();
    const courseCount = await prisma.course.count();
    const universityCount = await prisma.university.count();
    const bookmarkCount = await prisma.studentBookmark.count();
    
    console.log('📊 Database Counts:');
    console.log(`👥 Users: ${userCount}`);
    console.log(`📚 Courses: ${courseCount}`);
    console.log(`🏛️ Universities: ${universityCount}`);
    console.log(`🔖 Bookmarks: ${bookmarkCount}`);
    
    if (userCount === 0 && courseCount === 0 && universityCount === 0) {
      console.log('❌ Database appears to be empty! This explains the loading issue.');
    } else {
      console.log('✅ Database has data, checking service logic...');
    }
    
  } catch (error) {
    console.error('❌ Database check failed:', error);
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
}

checkDatabaseCounts();