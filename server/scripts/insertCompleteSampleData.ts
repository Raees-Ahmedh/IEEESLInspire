// scripts/insertCompleteSampleData.ts
import { prisma } from '../src/config/database';

// Comprehensive script to insert 3 sample rows into every table
async function insertCompleteSampleData() {
  try {
    console.log('🚀 Starting comprehensive sample data insertion for all tables...');
    
    const auditInfo = {
      created_at: new Date().toISOString(),
      created_by: 'system',
      source: 'comprehensive_sample_script'
    };

    // Check if data already exists
    const existingUsers = await prisma.user.count();
    if (existingUsers > 0) {
      console.log('⚠️  Sample data already exists. Skipping to avoid duplicates.');
      console.log('💡 Delete existing data if you want to re-run this script.');
      return;
    }

    // Step 1: Create Users (Independent table)
    console.log('\n👥 Step 1: Creating Users...');
    const users = await prisma.user.createMany({
      data: [
        {
          userType: 'student',
          email: 'john.doe@student.edu.lk',
          passwordHash: '$2b$10$hashedPasswordExample1234567890',
          firstName: 'John',
          lastName: 'Doe',
          phone: '+94771234567',
          role: 'student',
          profileData: {
            dateOfBirth: '2005-03-15',
            school: 'Colombo International School'
          },
          isActive: true,
          auditInfo: auditInfo
        },
        {
          userType: 'admin',
          email: 'admin@uniguide.lk',
          passwordHash: '$2b$10$hashedPasswordExample1234567891',
          firstName: 'Sarah',
          lastName: 'Silva',
          phone: '+94712345678',
          role: 'admin',
          profileData: {
            position: 'System Administrator',
            department: 'IT'
          },
          isActive: true,
          lastLogin: new Date(),
          auditInfo: auditInfo
        },
        {
          userType: 'manager',
          email: 'manager@uniguide.lk',
          passwordHash: '$2b$10$hashedPasswordExample1234567892',
          firstName: 'Priya',
          lastName: 'Fernando',
          phone: '+94723456789',
          role: 'manager',
          profileData: {
            position: 'Content Manager',
            department: 'Academic Affairs'
          },
          isActive: true,
          auditInfo: auditInfo
        }
      ]
    });
    console.log(`   ✅ Created ${users.count} users`);

    // Get created user IDs
    const createdUsers = await prisma.user.findMany({ orderBy: { id: 'asc' } });
    const [studentUser, adminUser, managerUser] = createdUsers;

    // Step 2: Create MajorFields (Independent)
    console.log('\n📚 Step 2: Creating Major Fields...');
    const majorFields = await prisma.majorField.createMany({
      data: [
        {
          name: 'Engineering and Technology',
          description: 'Programs related to engineering, computer science, and technology',
          isActive: true,
          auditInfo: auditInfo
        },
        {
          name: 'Business and Management',
          description: 'Business administration, finance, marketing, and management programs',
          isActive: true,
          auditInfo: auditInfo
        },
        {
          name: 'Health and Medicine',
          description: 'Medical, nursing, pharmacy, and health science programs',
          isActive: true,
          auditInfo: auditInfo
        }
      ]
    });
    console.log(`   ✅ Created ${majorFields.count} major fields`);

    // Get created major field IDs
    const createdMajorFields = await prisma.majorField.findMany({ orderBy: { id: 'asc' } });

    // Step 3: Create SubFields (Depends on MajorFields)
    console.log('\n📖 Step 3: Creating Sub Fields...');
    const subFields = await prisma.subField.createMany({
      data: [
        {
          majorId: createdMajorFields[0].id,
          name: 'Computer Science and Information Technology',
          description: 'Software engineering, data science, cybersecurity, and IT',
          isActive: true,
          auditInfo: auditInfo
        },
        {
          majorId: createdMajorFields[0].id,
          name: 'Civil and Construction Engineering',
          description: 'Civil engineering, architecture, construction management',
          isActive: true,
          auditInfo: auditInfo
        },
        {
          majorId: createdMajorFields[1].id,
          name: 'Business Administration',
          description: 'General business management, operations, strategy',
          isActive: true,
          auditInfo: auditInfo
        }
      ]
    });
    console.log(`   ✅ Created ${subFields.count} sub fields`);

    // Step 4: Create Frameworks (Independent)
    console.log('\n🏗️ Step 4: Creating Frameworks...');
    const frameworks = await prisma.framework.createMany({
      data: [
        {
          type: 'SLQF',
          qualificationCategory: 'Bachelor Degree',
          level: 6,
          year: 2025
        },
        {
          type: 'SLQF',
          qualificationCategory: 'Master Degree',
          level: 7,
          year: 2025
        },
        {
          type: 'NVQ',
          qualificationCategory: 'Diploma',
          level: 5,
          year: 2025
        }
      ]
    });
    console.log(`   ✅ Created ${frameworks.count} frameworks`);

    // Step 5: Create Universities (Independent)
    console.log('\n🏛️ Step 5: Creating Universities...');
    const universities = await prisma.university.createMany({
      data: [
        {
          name: 'University of Colombo',
          type: 'government',
          uniCode: 'UOC',
          address: 'College House, University of Colombo, Colombo 03',
          contactInfo: {
            phone: '+94112581835',
            email: 'info@cmb.ac.lk'
          },
          website: 'https://www.cmb.ac.lk',
          isActive: true,
          auditInfo: auditInfo
        },
        {
          name: 'University of Moratuwa',
          type: 'government',
          uniCode: 'UOM',
          address: 'Bandaranayake Mawatha, Moratuwa 10400',
          contactInfo: {
            phone: '+94112640406',
            email: 'info@mrt.ac.lk'
          },
          website: 'https://www.mrt.ac.lk',
          isActive: true,
          auditInfo: auditInfo
        },
        {
          name: 'SLIIT (Sri Lanka Institute of Information Technology)',
          type: 'private',
          uniCode: 'SLIIT',
          address: 'New Kandy Road, Malabe',
          contactInfo: {
            phone: '+94112413901',
            email: 'info@sliit.lk'
          },
          website: 'https://www.sliit.lk',
          isActive: true,
          auditInfo: auditInfo
        }
      ]
    });
    console.log(`   ✅ Created ${universities.count} universities`);

    // Get created university IDs
    const createdUniversities = await prisma.university.findMany({ orderBy: { id: 'asc' } });

    // Step 6: Create Faculties (Depends on Universities)
    console.log('\n🏫 Step 6: Creating Faculties...');
    const faculties = await prisma.faculty.createMany({
      data: [
        {
          universityId: createdUniversities[0].id,
          name: 'Faculty of Science',
          isActive: true,
          auditInfo: auditInfo
        },
        {
          universityId: createdUniversities[1].id,
          name: 'Faculty of Engineering',
          isActive: true,
          auditInfo: auditInfo
        },
        {
          universityId: createdUniversities[2].id,
          name: 'Faculty of Computing',
          isActive: true,
          auditInfo: auditInfo
        }
      ]
    });
    console.log(`   ✅ Created ${faculties.count} faculties`);

    // Get created faculty IDs
    const createdFaculties = await prisma.faculty.findMany({ orderBy: { id: 'asc' } });

    // Step 7: Create Departments (Depends on Faculties)
    console.log('\n🏢 Step 7: Creating Departments...');
    const departments = await prisma.department.createMany({
      data: [
        {
          facultyId: createdFaculties[0].id,
          name: 'Department of Computer Science',
          isActive: true,
          auditInfo: auditInfo
        },
        {
          facultyId: createdFaculties[1].id,
          name: 'Department of Civil Engineering',
          isActive: true,
          auditInfo: auditInfo
        },
        {
          facultyId: createdFaculties[2].id,
          name: 'Department of Software Engineering',
          isActive: true,
          auditInfo: auditInfo
        }
      ]
    });
    console.log(`   ✅ Created ${departments.count} departments`);

    // Get created department IDs
    const createdDepartments = await prisma.department.findMany({ orderBy: { id: 'asc' } });

    // Step 8: Create CareerPathways (Independent)
    console.log('\n💼 Step 8: Creating Career Pathways...');
    const careerPathways = await prisma.careerPathway.createMany({
      data: [
        {
          jobTitle: 'Software Engineer',
          industry: 'Information Technology',
          description: 'Design, develop, and maintain software applications and systems',
          salaryRange: 'LKR 80,000 - 300,000',
          isActive: true,
          auditInfo: auditInfo
        },
        {
          jobTitle: 'Civil Engineer',
          industry: 'Construction & Infrastructure',
          description: 'Plan, design, and oversee construction of infrastructure projects',
          salaryRange: 'LKR 60,000 - 250,000',
          isActive: true,
          auditInfo: auditInfo
        },
        {
          jobTitle: 'Business Analyst',
          industry: 'Business Services',
          description: 'Analyze business processes and recommend improvements',
          salaryRange: 'LKR 70,000 - 200,000',
          isActive: true,
          auditInfo: auditInfo
        }
      ]
    });
    console.log(`   ✅ Created ${careerPathways.count} career pathways`);

    // Get created career pathway IDs
    const createdCareerPathways = await prisma.careerPathway.findMany({ orderBy: { id: 'asc' } });

    // Step 9: Create Streams (Independent)
    console.log('\n🌊 Step 9: Creating Streams...');
    const streams = await prisma.stream.createMany({
      data: [
        {
          name: 'Physical Science',
          streamRule: {
            requiredSubjects: ['Mathematics', 'Physics', 'Chemistry'],
            description: 'For engineering and science programs'
          },
          isActive: true,
          auditInfo: auditInfo
        },
        {
          name: 'Biological Science',
          streamRule: {
            requiredSubjects: ['Biology', 'Chemistry', 'Physics/Mathematics'],
            description: 'For medical and biological science programs'
          },
          isActive: true,
          auditInfo: auditInfo
        },
        {
          name: 'Commerce',
          streamRule: {
            requiredSubjects: ['Economics', 'Business Studies', 'Accounting'],
            description: 'For business and management programs'
          },
          isActive: true,
          auditInfo: auditInfo
        }
      ]
    });
    console.log(`   ✅ Created ${streams.count} streams`);

    // Step 10: Create CourseRequirements (Independent)
    console.log('\n📋 Step 10: Creating Course Requirements...');
    const courseRequirements = await prisma.courseRequirement.createMany({
      data: [
        {
          minRequirement: 'ALPass',
          stream: [1],
          ruleSubjectBasket: {
            required: ['Mathematics', 'Physics', 'Chemistry'],
            alternatives: []
          },
          ruleSubjectGrades: {
            minimumGrades: { 'Mathematics': 'C', 'Physics': 'C', 'Chemistry': 'C' }
          },
          isActive: true,
          auditInfo: auditInfo
        },
        {
          minRequirement: 'ALPass',
          stream: [2],
          ruleSubjectBasket: {
            required: ['Biology', 'Chemistry'],
            alternatives: ['Physics', 'Mathematics']
          },
          ruleSubjectGrades: {
            minimumGrades: { 'Biology': 'C', 'Chemistry': 'C' }
          },
          isActive: true,
          auditInfo: auditInfo
        },
        {
          minRequirement: 'ALPass',
          stream: [3],
          ruleSubjectBasket: {
            required: ['Economics', 'Business Studies'],
            alternatives: ['Accounting', 'Geography']
          },
          ruleSubjectGrades: {
            minimumGrades: { 'Economics': 'C', 'Business Studies': 'C' }
          },
          isActive: true,
          auditInfo: auditInfo
        }
      ]
    });
    console.log(`   ✅ Created ${courseRequirements.count} course requirements`);

    // Get created requirement IDs
    const createdRequirements = await prisma.courseRequirement.findMany({ orderBy: { id: 'asc' } });
    const createdFrameworks = await prisma.framework.findMany({ orderBy: { id: 'asc' } });
    const createdSubFields = await prisma.subField.findMany({ orderBy: { id: 'asc' } });

    // Step 11: Create Courses (Depends on Universities, Faculties, Departments, Requirements)
    console.log('\n📚 Step 11: Creating Courses...');
    const courses = await prisma.course.createMany({
      data: [
        {
          universityId: createdUniversities[0].id,
          facultyId: createdFaculties[0].id,
          departmentId: createdDepartments[0].id,
          subfieldId: [createdSubFields[0].id],
          requirementId: createdRequirements[0].id,
          careerId: [createdCareerPathways[0].id],
          name: 'Bachelor of Science in Computer Science',
          specialisation: ['Software Engineering', 'Data Science', 'Cybersecurity'],
          courseCode: 'CS001',
          courseUrl: 'https://cmb.ac.lk/computer-science',
          frameworkLevel: createdFrameworks[0].id,
          studyMode: 'fulltime',
          courseType: 'internal',
          feeType: 'free',
          feeAmount: null,
          durationMonths: 48,
          description: 'Comprehensive computer science program covering software development, algorithms, and system design.',
          zscore: {
            district: { "Colombo": 1.8500, "Gampaha": 1.8200 },
            stream: "Physical Science",
            minimum: 1.7500
          },
          additionalDetails: {
            intake: 50,
            applicationDeadline: '2025-08-31'
          },
          isActive: true,
          auditInfo: auditInfo
        },
        {
          universityId: createdUniversities[1].id,
          facultyId: createdFaculties[1].id,
          departmentId: createdDepartments[1].id,
          subfieldId: [createdSubFields[1].id],
          requirementId: createdRequirements[0].id,
          careerId: [createdCareerPathways[1].id],
          name: 'Bachelor of Science in Civil Engineering',
          specialisation: ['Structural Engineering', 'Transportation Engineering', 'Environmental Engineering'],
          courseCode: 'CE001',
          courseUrl: 'https://mrt.ac.lk/civil-engineering',
          frameworkLevel: createdFrameworks[0].id,
          studyMode: 'fulltime',
          courseType: 'internal',
          feeType: 'free',
          feeAmount: null,
          durationMonths: 48,
          description: 'Professional civil engineering program with focus on infrastructure development.',
          zscore: {
            district: { "Colombo": 1.9000, "Kandy": 1.8500 },
            stream: "Physical Science",
            minimum: 1.8000
          },
          additionalDetails: {
            intake: 40,
            applicationDeadline: '2025-08-31'
          },
          isActive: true,
          auditInfo: auditInfo
        },
        {
          universityId: createdUniversities[2].id,
          facultyId: createdFaculties[2].id,
          departmentId: createdDepartments[2].id,
          subfieldId: [createdSubFields[0].id],
          requirementId: createdRequirements[0].id,
          careerId: [createdCareerPathways[0].id, createdCareerPathways[2].id],
          name: 'Bachelor of Science in Software Engineering',
          specialisation: ['Mobile Development', 'Web Development', 'Enterprise Systems'],
          courseCode: 'SE001',
          courseUrl: 'https://sliit.lk/software-engineering',
          frameworkLevel: createdFrameworks[0].id,
          studyMode: 'fulltime',
          courseType: 'internal',
          feeType: 'paid',
          feeAmount: 350000.00,
          durationMonths: 48,
          description: 'Industry-focused software engineering program with practical training.',
          zscore: {
            district: { "Colombo": 1.6000, "Gampaha": 1.5500 },
            stream: "Physical Science",
            minimum: 1.5000
          },
          additionalDetails: {
            intake: 60,
            applicationDeadline: '2025-09-15'
          },
          isActive: true,
          auditInfo: auditInfo
        }
      ]
    });
    console.log(`   ✅ Created ${courses.count} courses`);

    // Get created course IDs
    const createdCourses = await prisma.course.findMany({ orderBy: { id: 'asc' } });

    // Step 12: Create UserPermissions (Depends on Users)
    console.log('\n🔐 Step 12: Creating User Permissions...');
    const userPermissions = await prisma.userPermission.createMany({
      data: [
        {
          userId: managerUser.id,
          permissionType: 'MANAGE_COURSES',
          resourceType: 'COURSE',
          permissionDetails: { allowedActions: ['create', 'update', 'delete'] },
          grantedBy: adminUser.id,
          isActive: true,
          auditInfo: auditInfo
        },
        {
          userId: managerUser.id,
          permissionType: 'MANAGE_NEWS',
          resourceType: 'NEWS_ARTICLE',
          permissionDetails: { allowedActions: ['create', 'update', 'publish'] },
          grantedBy: adminUser.id,
          isActive: true,
          auditInfo: auditInfo
        },
        {
          userId: studentUser.id,
          permissionType: 'VIEW_COURSES',
          resourceType: 'COURSE',
          permissionDetails: { allowedActions: ['read', 'bookmark'] },
          grantedBy: adminUser.id,
          isActive: true,
          auditInfo: auditInfo
        }
      ]
    });
    console.log(`   ✅ Created ${userPermissions.count} user permissions`);

    // Step 13: Create StudentProfiles (Depends on Users)
    console.log('\n👨‍🎓 Step 13: Creating Student Profiles...');
    const studentProfile = await prisma.studentProfile.create({
      data: {
        userId: studentUser.id,
        olResults: {
          subjects: [
            { subject: 'Mathematics', grade: 'A' },
            { subject: 'Science', grade: 'A' },
            { subject: 'English', grade: 'B' }
          ],
          year: 2022
        },
        alResults: {
          stream: 'Physical Science',
          subjects: [
            { subject: 'Combined Mathematics', grade: 'B' },
            { subject: 'Physics', grade: 'C' },
            { subject: 'Chemistry', grade: 'C' }
          ],
          year: 2024,
          zscore: 1.7800
        },
        highestQualification: 'GCE Advanced Level',
        preferences: {
          studyMode: ['fulltime'],
          feeType: ['free', 'paid'],
          location: ['Colombo', 'Gampaha']
        },
        careerInterests: [createdCareerPathways[0].id, createdCareerPathways[2].id],
        auditInfo: auditInfo
      }
    });
    console.log(`   ✅ Created 1 student profile`);

    // Step 14: Create StudentBookmarks (Depends on Users and Courses)
    console.log('\n🔖 Step 14: Creating Student Bookmarks...');
    const studentBookmarks = await prisma.studentBookmark.createMany({
      data: [
        {
          userId: studentUser.id,
          courseId: createdCourses[0].id,
          notes: 'Very interested in this computer science program. The specializations look great!',
          auditInfo: auditInfo
        },
        {
          userId: studentUser.id,
          courseId: createdCourses[2].id,
          notes: 'SLIIT software engineering program seems practical and industry-focused.',
          auditInfo: auditInfo
        },
        {
          userId: studentUser.id,
          courseId: createdCourses[1].id,
          notes: 'Civil engineering at UoM is highly reputed but requires higher Z-score.',
          auditInfo: auditInfo
        }
      ]
    });
    console.log(`   ✅ Created ${studentBookmarks.count} student bookmarks`);

    // Step 15: Create StudentApplications (Depends on Users)
    console.log('\n📝 Step 15: Creating Student Applications...');
    const studentApplications = await prisma.studentApplication.createMany({
      data: [
        {
          userId: studentUser.id,
          selectedSubjects: {
            stream: 'Physical Science',
            subjects: [
              { id: 1, name: 'Combined Mathematics', grade: 'B' },
              { id: 2, name: 'Physics', grade: 'C' },
              { id: 3, name: 'Chemistry', grade: 'C' }
            ]
          },
          subjectGrades: {
            zscore: 1.7800,
            district: 'Colombo'
          },
          eligibleCourses: [createdCourses[0].id, createdCourses[2].id],
          auditInfo: auditInfo
        }
      ]
    });
    console.log(`   ✅ Created ${studentApplications.count} student applications`);

    // Step 16: Create NewsArticles (Depends on Users)
    console.log('\n📰 Step 16: Creating News Articles...');
    const newsArticles = await prisma.newsArticle.createMany({
      data: [
        {
          authorId: managerUser.id,
          approvedBy: adminUser.id,
          title: 'University of Colombo Opens Applications for Computer Science Degree',
          content: 'The University of Colombo Faculty of Science announces the opening of applications for the Bachelor of Science in Computer Science program for the academic year 2025/2026.',
          category: 'intake',
          status: 'published',
          tags: ['UOC', 'Computer Science', 'Applications'],
          publishDate: new Date(),
          auditInfo: auditInfo
        },
        {
          authorId: managerUser.id,
          title: 'New Scholarship Program for Engineering Students',
          content: 'A new scholarship program has been announced for outstanding students pursuing engineering degrees at state universities.',
          category: 'scholarship',
          status: 'pending',
          tags: ['Engineering', 'Scholarship', 'State Universities'],
          auditInfo: auditInfo
        },
        {
          authorId: managerUser.id,
          approvedBy: adminUser.id,
          title: 'SLIIT Introduces New Software Engineering Specializations',
          content: 'SLIIT has introduced new specialization tracks in Mobile Development and Enterprise Systems for its Software Engineering program.',
          category: 'general',
          status: 'published',
          tags: ['SLIIT', 'Software Engineering', 'Specializations'],
          publishDate: new Date(),
          auditInfo: auditInfo
        }
      ]
    });
    console.log(`   ✅ Created ${newsArticles.count} news articles`);

    // Step 17: Create Events (Depends on Users)
    console.log('\n📅 Step 17: Creating Events...');
    const events = await prisma.event.createMany({
      data: [
        {
          createdBy: managerUser.id,
          title: 'University Application Deadline',
          description: 'Final deadline for submitting university applications for the 2025/2026 academic year',
          eventType: 'deadline',
          startDate: new Date('2025-08-31'),
          location: 'Online',
          isPublic: true,
          auditInfo: auditInfo
        },
        {
          createdBy: managerUser.id,
          title: 'SLI Higher Education Expo 2025',
          description: 'Annual higher education exhibition featuring universities and institutes',
          eventType: 'SLI',
          startDate: new Date('2025-07-15'),
          endDate: new Date('2025-07-17'),
          location: 'BMICH, Colombo',
          isPublic: true,
          auditInfo: auditInfo
        },
        {
          createdBy: adminUser.id,
          title: 'System Maintenance Window',
          description: 'Scheduled maintenance for the university guide platform',
          eventType: 'maintenance',
          startDate: new Date('2025-06-30T02:00:00Z'),
          endDate: new Date('2025-06-30T06:00:00Z'),
          location: 'System',
          isPublic: false,
          auditInfo: auditInfo
        }
      ]
    });
    console.log(`   ✅ Created ${events.count} events`);

    // Step 18: Create Tasks (Depends on Users)
    console.log('\n✅ Step 18: Creating Tasks...');
    const tasks = await prisma.task.createMany({
      data: [
        {
          assignedTo: managerUser.id,
          assignedBy: adminUser.id,
          title: 'Update Course Information for 2025/2026',
          description: 'Review and update all course details, fees, and entry requirements for the upcoming academic year',
          taskType: 'course_update',
          status: 'ongoing',
          priority: 'high',
          dueDate: new Date('2025-07-31'),
          taskData: {
            courses: [createdCourses[0].id, createdCourses[1].id, createdCourses[2].id],
            fields: ['fees', 'requirements', 'description']
          },
          auditInfo: auditInfo
        },
        {
          assignedTo: managerUser.id,
          assignedBy: adminUser.id,
          title: 'Create News Article for Scholarship Program',
          description: 'Write and publish article about the new engineering scholarship program',
          taskType: 'content_creation',
          status: 'todo',
          priority: 'medium',
          dueDate: new Date('2025-07-15'),
          taskData: {
            articleType: 'scholarship',
            targetAudience: 'engineering_students'
          },
          auditInfo: auditInfo
        },
        {
          assignedTo: managerUser.id,
          assignedBy: adminUser.id,
          title: 'Review Student Applications',
          description: 'Review pending student applications and provide recommendations',
          taskType: 'review',
          status: 'todo',
          priority: 'medium',
          dueDate: new Date('2025-07-20'),
          taskData: {
            applicationCount: 25,
            priority: 'first_time_applicants'
          },
          auditInfo: auditInfo
        }
      ]
    });
    console.log(`   ✅ Created ${tasks.count} tasks`);

    // Get created task IDs
    const createdTasks = await prisma.task.findMany({ orderBy: { id: 'asc' } });

    // Step 19: Create TaskComments (Depends on Tasks and Users)
    console.log('\n💬 Step 19: Creating Task Comments...');
    const taskComments = await prisma.taskComment.createMany({
      data: [
        {
          taskId: createdTasks[0].id,
          userId: managerUser.id,
          comment: 'Started working on updating course fees. Will focus on government universities first.',
          auditInfo: auditInfo
        },
        {
          taskId: createdTasks[0].id,
          userId: adminUser.id,
          comment: 'Good approach. Please ensure all fee changes are verified with the respective universities.',
          auditInfo: auditInfo
        },
        {
          taskId: createdTasks[1].id,
          userId: managerUser.id,
          comment: 'Researching scholarship eligibility criteria. Will have draft ready by next week.',
          auditInfo: auditInfo
        }
      ]
    });
    console.log(`   ✅ Created ${taskComments.count} task comments`);

    // Step 20: Create UserActivityLogs (Depends on Users)
    console.log('\n📊 Step 20: Creating User Activity Logs...');
    const userActivityLogs = await prisma.userActivityLog.createMany({
      data: [
        {
          userId: studentUser.id,
          actionType: 'LOGIN',
          resourceType: 'USER',
          resourceId: studentUser.id,
          actionData: { loginMethod: 'email', success: true },
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        {
          userId: studentUser.id,
          actionType: 'BOOKMARK_COURSE',
          resourceType: 'COURSE',
          resourceId: createdCourses[0].id,
          actionData: { courseCode: 'CS001', courseName: 'Computer Science' },
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        {
          userId: managerUser.id,
          actionType: 'UPDATE_COURSE',
          resourceType: 'COURSE',
          resourceId: createdCourses[1].id,
          actionData: { field: 'description', oldValue: 'old description', newValue: 'updated description' },
          ipAddress: '10.0.0.50',
          userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        }
      ]
    });
    console.log(`   ✅ Created ${userActivityLogs.count} user activity logs`);

    // Step 21: Create SearchAnalytics (Depends on Users)
    console.log('\n🔍 Step 21: Creating Search Analytics...');
    const searchAnalytics = await prisma.searchAnalytics.createMany({
      data: [
        {
          userId: studentUser.id,
          searchCriteria: {
            stream: 'Physical Science',
            feeType: 'free',
            studyMode: 'fulltime',
            keywords: 'computer science'
          },
          resultsCount: 5,
          clickedResults: [createdCourses[0].id, createdCourses[2].id],
          sessionId: 'session_123456'
        },
        {
          userId: null, // Anonymous user
          searchCriteria: {
            majorField: 'Engineering and Technology',
            location: 'Colombo',
            feeType: 'any'
          },
          resultsCount: 8,
          clickedResults: [createdCourses[1].id],
          sessionId: 'session_789012'
        },
        {
          userId: studentUser.id,
          searchCriteria: {
            careerPathway: 'Software Engineer',
            zscore: 1.7000,
            district: 'Colombo'
          },
          resultsCount: 3,
          clickedResults: [createdCourses[0].id],
          sessionId: 'session_345678'
        }
      ]
    });
    console.log(`   ✅ Created ${searchAnalytics.count} search analytics records`);

    // Step 22: Create CourseAnalytics (Depends on Courses)
    console.log('\n📈 Step 22: Creating Course Analytics...');
    const courseAnalytics = await prisma.courseAnalytics.createMany({
      data: [
        {
          courseId: createdCourses[0].id,
          viewCount: 156,
          bookmarkCount: 23,
          applicationCount: 12,
          analyticsDate: new Date('2025-06-01')
        },
        {
          courseId: createdCourses[1].id,
          viewCount: 89,
          bookmarkCount: 15,
          applicationCount: 8,
          analyticsDate: new Date('2025-06-01')
        },
        {
          courseId: createdCourses[2].id,
          viewCount: 134,
          bookmarkCount: 31,
          applicationCount: 18,
          analyticsDate: new Date('2025-06-01')
        }
      ]
    });
    console.log(`   ✅ Created ${courseAnalytics.count} course analytics records`);

    // Step 23: Create CourseMaterials (Depends on Courses and Users)
    console.log('\n📄 Step 23: Creating Course Materials...');
    const courseMaterials = await prisma.courseMaterial.createMany({
      data: [
        {
          courseId: createdCourses[0].id,
          materialType: 'syllabus',
          fileName: 'CS001_Syllabus_2025.pdf',
          filePath: '/uploads/courses/cs001/syllabus_2025.pdf',
          fileType: 'pdf',
          fileSize: 2048576,
          uploadedBy: managerUser.id,
          auditInfo: auditInfo
        },
        {
          courseId: createdCourses[0].id,
          materialType: 'brochure',
          fileName: 'CS001_Program_Brochure.pdf',
          filePath: '/uploads/courses/cs001/brochure.pdf',
          fileType: 'pdf',
          fileSize: 1536000,
          uploadedBy: managerUser.id,
          auditInfo: auditInfo
        },
        {
          courseId: createdCourses[1].id,
          materialType: 'handbook',
          fileName: 'CE001_Student_Handbook.pdf',
          filePath: '/uploads/courses/ce001/handbook.pdf',
          fileType: 'pdf',
          fileSize: 3072000,
          uploadedBy: managerUser.id,
          auditInfo: auditInfo
        }
      ]
    });
    console.log(`   ✅ Created ${courseMaterials.count} course materials`);

    // Step 24: Create SystemSettings (Depends on Users)
    console.log('\n⚙️ Step 24: Creating System Settings...');
    const systemSettings = await prisma.systemSetting.createMany({
      data: [
        {
          settingKey: 'application_deadline_2025',
          settingValue: {
            government_universities: '2025-08-31',
            private_institutes: '2025-09-15',
            vocational_courses: '2025-09-30'
          },
          description: 'Application deadlines for different institution types for 2025/2026 academic year',
          updatedBy: adminUser.id,
          auditInfo: auditInfo
        },
        {
          settingKey: 'zscore_calculation_method',
          settingValue: {
            current_method: 'standardized',
            parameters: {
              mean_adjustment: true,
              district_normalization: true,
              subject_weightings: { 'Mathematics': 1.2, 'Science': 1.1, 'Languages': 1.0 }
            }
          },
          description: 'Configuration for Z-score calculation methodology',
          updatedBy: adminUser.id,
          auditInfo: auditInfo
        },
        {
          settingKey: 'system_maintenance_schedule',
          settingValue: {
            weekly: { day: 'Sunday', time: '02:00-06:00', timezone: 'Asia/Colombo' },
            monthly: { date: 'last_sunday', time: '01:00-08:00', timezone: 'Asia/Colombo' },
            emergency_contact: 'tech-support@uniguide.lk'
          },
          description: 'Regular system maintenance schedule and emergency contacts',
          updatedBy: adminUser.id,
          auditInfo: auditInfo
        }
      ]
    });
    console.log(`   ✅ Created ${systemSettings.count} system settings`);

    // Note: We're skipping Subject and ValidCombination tables as per your request (without subjects table)

    // Final Summary
    console.log('\n🎉 Sample Data Insertion Complete!');
    console.log('═══════════════════════════════════════════════════════════════');
    
    const finalCounts = {
      users: await prisma.user.count(),
      majorFields: await prisma.majorField.count(),
      subFields: await prisma.subField.count(),
      frameworks: await prisma.framework.count(),
      universities: await prisma.university.count(),
      faculties: await prisma.faculty.count(),
      departments: await prisma.department.count(),
      careerPathways: await prisma.careerPathway.count(),
      streams: await prisma.stream.count(),
      courseRequirements: await prisma.courseRequirement.count(),
      courses: await prisma.course.count(),
      userPermissions: await prisma.userPermission.count(),
      studentProfiles: await prisma.studentProfile.count(),
      studentBookmarks: await prisma.studentBookmark.count(),
      studentApplications: await prisma.studentApplication.count(),
      newsArticles: await prisma.newsArticle.count(),
      events: await prisma.event.count(),
      tasks: await prisma.task.count(),
      taskComments: await prisma.taskComment.count(),
      userActivityLogs: await prisma.userActivityLog.count(),
      searchAnalytics: await prisma.searchAnalytics.count(),
      courseAnalytics: await prisma.courseAnalytics.count(),
      courseMaterials: await prisma.courseMaterial.count(),
      systemSettings: await prisma.systemSetting.count()
    };
    
    console.log('\n📊 Database Summary:');
    console.log('───────────────────────────────────────────────────────────────');
    Object.entries(finalCounts).forEach(([table, count]) => {
      console.log(`   ${table.padEnd(20)}: ${count.toString().padStart(3)} records`);
    });
    
    const totalRecords = Object.values(finalCounts).reduce((sum, count) => sum + count, 0);
    console.log('───────────────────────────────────────────────────────────────');
    console.log(`   ${'TOTAL'.padEnd(20)}: ${totalRecords.toString().padStart(3)} records`);
    console.log('═══════════════════════════════════════════════════════════════');
    
    console.log('\n✨ Key Features Created:');
    console.log('   🎓 3 Universities (UOC, UOM, SLIIT)');
    console.log('   📚 3 Courses (Computer Science, Civil Engineering, Software Engineering)');
    console.log('   👥 3 Users (Student, Admin, Manager) with different roles');
    console.log('   🔖 Student bookmarks and applications');
    console.log('   📰 News articles and events');
    console.log('   ✅ Task management system');
    console.log('   📊 Analytics and activity tracking');
    console.log('   ⚙️ System settings and configurations');
    
    console.log('\n🚀 Ready to test your application with comprehensive sample data!');
    console.log('💡 You can now start your server and test all API endpoints.');
    
  } catch (error) {
    console.error('❌ Error inserting sample data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
    console.log('🔌 Database connection closed gracefully');
  }
}

// Run the script
async function main() {
  try {
    await insertCompleteSampleData();
  } catch (error) {
    console.error('💥 Script failed:', error);
    console.log('🔌 Database connection closed gracefully');
  }
}

// Execute the main function
main();