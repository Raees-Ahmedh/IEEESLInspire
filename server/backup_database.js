const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

async function backupDatabase() {
  try {
    console.log('🔄 Starting complete database backup...');
    
    // Get all data from EVERY table in the database
    const [
      users,
      courses,
      universities,
      frameworks,
      events,
      newsArticles,
      tasks,
      userPermissions,
      studentBookmarks,
      studentProfiles,
      faculties,
      departments,
      majorFields,
      subFields,
      courseRequirements,
      subjects,
      streams,
      validCombinations,
      careerPathways,
      studentApplications,
      taskComments,
      userActivityLogs,
      searchAnalytics,
      courseAnalytics,
      courseMaterials,
      systemSettings
    ] = await Promise.all([
      prisma.user.findMany(),
      prisma.course.findMany(),
      prisma.university.findMany(),
      prisma.framework.findMany(),
      prisma.event.findMany(),
      prisma.newsArticle.findMany(),
      prisma.task.findMany(),
      prisma.userPermission.findMany(),
      prisma.studentBookmark.findMany(),
      prisma.studentProfile.findMany(),
      prisma.faculty.findMany(),
      prisma.department.findMany(),
      prisma.majorField.findMany(),
      prisma.subField.findMany(),
      prisma.courseRequirement.findMany(),
      prisma.subject.findMany(),
      prisma.stream.findMany(),
      prisma.validCombination.findMany(),
      prisma.careerPathway.findMany(),
      prisma.studentApplication.findMany(),
      prisma.taskComment.findMany(),
      prisma.userActivityLog.findMany(),
      prisma.searchAnalytics.findMany(),
      prisma.courseAnalytics.findMany(),
      prisma.courseMaterial.findMany(),
      prisma.systemSetting.findMany()
    ]);

    const backup = {
      // Core data
      users,
      courses,
      universities,
      frameworks,
      events,
      newsArticles,
      tasks,
      userPermissions,
      studentBookmarks,
      studentProfiles,
      
      // Academic structure
      faculties,
      departments,
      majorFields,
      subFields,
      courseRequirements,
      subjects,
      streams,
      validCombinations,
      careerPathways,
      
      // Student data
      studentApplications,
      
      // System data
      taskComments,
      userActivityLogs,
      searchAnalytics,
      courseAnalytics,
      courseMaterials,
      systemSettings,
      
      // Metadata
      exportedAt: new Date().toISOString(),
      version: '2.0',
      totalRecords: {
        users: users.length,
        courses: courses.length,
        universities: universities.length,
        frameworks: frameworks.length,
        events: events.length,
        newsArticles: newsArticles.length,
        tasks: tasks.length,
        userPermissions: userPermissions.length,
        studentBookmarks: studentBookmarks.length,
        studentProfiles: studentProfiles.length,
        faculties: faculties.length,
        departments: departments.length,
        majorFields: majorFields.length,
        subFields: subFields.length,
        courseRequirements: courseRequirements.length,
        subjects: subjects.length,
        streams: streams.length,
        validCombinations: validCombinations.length,
        careerPathways: careerPathways.length,
        studentApplications: studentApplications.length,
        taskComments: taskComments.length,
        userActivityLogs: userActivityLogs.length,
        searchAnalytics: searchAnalytics.length,
        courseAnalytics: courseAnalytics.length,
        courseMaterials: courseMaterials.length,
        systemSettings: systemSettings.length
      }
    };

    // Create backup directory
    const backupDir = 'database_backup';
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir);
    }

    // Save main backup
    const backupFile = `${backupDir}/complete_backup_${new Date().toISOString().split('T')[0]}.json`;
    fs.writeFileSync(backupFile, JSON.stringify(backup, null, 2));
    
    console.log('✅ Complete database backup created!');
    console.log(`📁 Backup saved to: ${backupFile}`);
    console.log(`📊 Total records backed up (COMPLETE DATABASE):`);
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
    console.log(`   🏛️  Faculties: ${backup.totalRecords.faculties}`);
    console.log(`   🏢 Departments: ${backup.totalRecords.departments}`);
    console.log(`   📖 Major Fields: ${backup.totalRecords.majorFields}`);
    console.log(`   📝 Sub Fields: ${backup.totalRecords.subFields}`);
    console.log(`   📋 Course Requirements: ${backup.totalRecords.courseRequirements}`);
    console.log(`   📚 Subjects: ${backup.totalRecords.subjects}`);
    console.log(`   🌊 Streams: ${backup.totalRecords.streams}`);
    console.log(`   🔗 Valid Combinations: ${backup.totalRecords.validCombinations}`);
    console.log(`   💼 Career Pathways: ${backup.totalRecords.careerPathways}`);
    console.log(`   📝 Student Applications: ${backup.totalRecords.studentApplications}`);
    console.log(`   💬 Task Comments: ${backup.totalRecords.taskComments}`);
    console.log(`   📊 User Activity Logs: ${backup.totalRecords.userActivityLogs}`);
    console.log(`   🔍 Search Analytics: ${backup.totalRecords.searchAnalytics}`);
    console.log(`   📈 Course Analytics: ${backup.totalRecords.courseAnalytics}`);
    console.log(`   📄 Course Materials: ${backup.totalRecords.courseMaterials}`);
    console.log(`   ⚙️  System Settings: ${backup.totalRecords.systemSettings}`);
    console.log(`📅 Backup date: ${backup.exportedAt}`);
    
  } catch (error) {
    console.error('❌ Backup failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

backupDatabase();
