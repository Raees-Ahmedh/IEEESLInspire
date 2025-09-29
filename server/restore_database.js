const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

async function restoreDatabase() {
  try {
    console.log('🔄 Starting database restore...');
    
    // Find the latest backup file
    const backupDir = 'database_backup';
    if (!fs.existsSync(backupDir)) {
      console.error('❌ No backup directory found!');
      return;
    }
    
    const files = fs.readdirSync(backupDir).filter(f => f.endsWith('.json'));
    if (files.length === 0) {
      console.error('❌ No backup files found!');
      return;
    }
    
    const latestBackup = files.sort().pop();
    const backupFile = `${backupDir}/${latestBackup}`;
    
    console.log(`📁 Restoring from: ${backupFile}`);
    
    const backup = JSON.parse(fs.readFileSync(backupFile, 'utf8'));
    
    console.log(`📊 Found backup from: ${backup.exportedAt}`);
    console.log('⚠️  This will clear all existing data!');
    
    // Clear existing data in REVERSE dependency order (be careful!)
    console.log('🗑️  Clearing existing data in correct order...');
    
    // Step 1: Clear dependent tables first
    await prisma.studentBookmark.deleteMany();
    await prisma.studentApplication.deleteMany();
    await prisma.studentProfile.deleteMany();
    await prisma.userPermission.deleteMany();
    await prisma.taskComment.deleteMany();
    await prisma.task.deleteMany();
    await prisma.newsArticle.deleteMany();
    await prisma.event.deleteMany();
    await prisma.courseAnalytics.deleteMany();
    await prisma.courseMaterial.deleteMany();
    await prisma.searchAnalytics.deleteMany();
    await prisma.userActivityLog.deleteMany();
    await prisma.systemSetting.deleteMany();
    
    // Step 2: Clear courses and related academic data
    await prisma.course.deleteMany();
    await prisma.courseRequirement.deleteMany();
    await prisma.validCombination.deleteMany();
    await prisma.department.deleteMany();
    await prisma.faculty.deleteMany();
    await prisma.subField.deleteMany();
    await prisma.majorField.deleteMany();
    await prisma.subject.deleteMany();
    await prisma.stream.deleteMany();
    await prisma.careerPathway.deleteMany();
    
    // Step 3: Clear independent tables
    await prisma.framework.deleteMany();
    await prisma.university.deleteMany();
    await prisma.user.deleteMany();
    
    console.log('✅ Database cleared successfully');
    
    // Restore data in CORRECT dependency order
    console.log('📥 Restoring data in correct dependency order...');
    
    // Step 1: Restore independent tables first
    console.log('📥 Step 1: Restoring independent tables...');
    if (backup.users?.length > 0) {
      await prisma.user.createMany({ data: backup.users });
      console.log(`   ✅ Users: ${backup.users.length} records`);
    }
    
    if (backup.universities?.length > 0) {
      await prisma.university.createMany({ data: backup.universities });
      console.log(`   ✅ Universities: ${backup.universities.length} records`);
    }
    
    if (backup.frameworks?.length > 0) {
      await prisma.framework.createMany({ data: backup.frameworks });
      console.log(`   ✅ Frameworks: ${backup.frameworks.length} records`);
    }
    
    // Step 2: Restore academic structure
    console.log('📥 Step 2: Restoring academic structure...');
    if (backup.majorFields?.length > 0) {
      await prisma.majorField.createMany({ data: backup.majorFields });
      console.log(`   ✅ Major Fields: ${backup.majorFields.length} records`);
    }
    
    if (backup.subFields?.length > 0) {
      await prisma.subField.createMany({ data: backup.subFields });
      console.log(`   ✅ Sub Fields: ${backup.subFields.length} records`);
    }
    
    if (backup.subjects?.length > 0) {
      await prisma.subject.createMany({ data: backup.subjects });
      console.log(`   ✅ Subjects: ${backup.subjects.length} records`);
    }
    
    if (backup.streams?.length > 0) {
      await prisma.stream.createMany({ data: backup.streams });
      console.log(`   ✅ Streams: ${backup.streams.length} records`);
    }
    
    if (backup.careerPathways?.length > 0) {
      await prisma.careerPathway.createMany({ data: backup.careerPathways });
      console.log(`   ✅ Career Pathways: ${backup.careerPathways.length} records`);
    }
    
    // Step 3: Restore university structure
    console.log('📥 Step 3: Restoring university structure...');
    if (backup.faculties?.length > 0) {
      await prisma.faculty.createMany({ data: backup.faculties });
      console.log(`   ✅ Faculties: ${backup.faculties.length} records`);
    }
    
    if (backup.departments?.length > 0) {
      await prisma.department.createMany({ data: backup.departments });
      console.log(`   ✅ Departments: ${backup.departments.length} records`);
    }
    
    // Step 4: Restore courses and requirements
    console.log('📥 Step 4: Restoring courses and requirements...');
    if (backup.courseRequirements?.length > 0) {
      await prisma.courseRequirement.createMany({ data: backup.courseRequirements });
      console.log(`   ✅ Course Requirements: ${backup.courseRequirements.length} records`);
    }
    
    if (backup.courses?.length > 0) {
      await prisma.course.createMany({ data: backup.courses });
      console.log(`   ✅ Courses: ${backup.courses.length} records`);
    }
    
    if (backup.validCombinations?.length > 0) {
      await prisma.validCombination.createMany({ data: backup.validCombinations });
      console.log(`   ✅ Valid Combinations: ${backup.validCombinations.length} records`);
    }
    
    // Step 5: Restore user-related data
    console.log('📥 Step 5: Restoring user-related data...');
    if (backup.studentProfiles?.length > 0) {
      await prisma.studentProfile.createMany({ data: backup.studentProfiles });
      console.log(`   ✅ Student Profiles: ${backup.studentProfiles.length} records`);
    }
    
    if (backup.userPermissions?.length > 0) {
      await prisma.userPermission.createMany({ data: backup.userPermissions });
      console.log(`   ✅ User Permissions: ${backup.userPermissions.length} records`);
    }
    
    if (backup.studentBookmarks?.length > 0) {
      await prisma.studentBookmark.createMany({ data: backup.studentBookmarks });
      console.log(`   ✅ Student Bookmarks: ${backup.studentBookmarks.length} records`);
    }
    
    if (backup.studentApplications?.length > 0) {
      await prisma.studentApplication.createMany({ data: backup.studentApplications });
      console.log(`   ✅ Student Applications: ${backup.studentApplications.length} records`);
    }
    
    // Step 6: Restore content and system data
    console.log('📥 Step 6: Restoring content and system data...');
    if (backup.events?.length > 0) {
      await prisma.event.createMany({ data: backup.events });
      console.log(`   ✅ Events: ${backup.events.length} records`);
    }
    
    if (backup.newsArticles?.length > 0) {
      await prisma.newsArticle.createMany({ data: backup.newsArticles });
      console.log(`   ✅ News Articles: ${backup.newsArticles.length} records`);
    }
    
    if (backup.tasks?.length > 0) {
      await prisma.task.createMany({ data: backup.tasks });
      console.log(`   ✅ Tasks: ${backup.tasks.length} records`);
    }
    
    if (backup.taskComments?.length > 0) {
      await prisma.taskComment.createMany({ data: backup.taskComments });
      console.log(`   ✅ Task Comments: ${backup.taskComments.length} records`);
    }
    
    // Step 7: Restore analytics and materials
    console.log('📥 Step 7: Restoring analytics and materials...');
    if (backup.courseMaterials?.length > 0) {
      await prisma.courseMaterial.createMany({ data: backup.courseMaterials });
      console.log(`   ✅ Course Materials: ${backup.courseMaterials.length} records`);
    }
    
    if (backup.courseAnalytics?.length > 0) {
      await prisma.courseAnalytics.createMany({ data: backup.courseAnalytics });
      console.log(`   ✅ Course Analytics: ${backup.courseAnalytics.length} records`);
    }
    
    if (backup.searchAnalytics?.length > 0) {
      await prisma.searchAnalytics.createMany({ data: backup.searchAnalytics });
      console.log(`   ✅ Search Analytics: ${backup.searchAnalytics.length} records`);
    }
    
    if (backup.userActivityLogs?.length > 0) {
      await prisma.userActivityLog.createMany({ data: backup.userActivityLogs });
      console.log(`   ✅ User Activity Logs: ${backup.userActivityLogs.length} records`);
    }
    
    if (backup.systemSettings?.length > 0) {
      await prisma.systemSetting.createMany({ data: backup.systemSettings });
      console.log(`   ✅ System Settings: ${backup.systemSettings.length} records`);
    }
    
    console.log('✅ Database restored successfully!');
    console.log(`📊 Restored from backup created: ${backup.exportedAt}`);
    console.log(`📈 Records restored:`);
    console.log(`   👥 Users: ${backup.totalRecords.users}`);
    console.log(`   📚 Courses: ${backup.totalRecords.courses}`);
    console.log(`   🏫 Universities: ${backup.totalRecords.universities}`);
    console.log(`   📋 Frameworks: ${backup.totalRecords.frameworks}`);
    console.log(`   📅 Events: ${backup.totalRecords.events}`);
    console.log(`   📰 News: ${backup.totalRecords.newsArticles}`);
    console.log(`   ✅ Tasks: ${backup.totalRecords.tasks}`);
    console.log(`   🔐 Permissions: ${backup.totalRecords.userPermissions}`);
    console.log(`   🔖 Bookmarks: ${backup.totalRecords.studentBookmarks}`);
    console.log(`   👤 Profiles: ${backup.totalRecords.studentProfiles}`);
    
  } catch (error) {
    console.error('❌ Restore failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

restoreDatabase();
