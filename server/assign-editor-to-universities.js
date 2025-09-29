// server/assign-editor-to-universities.js
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function assignEditorToUniversities() {
  try {
    console.log('🔍 Finding editor user...');
    
    // Find the editor user
    const editor = await prisma.user.findFirst({
      where: {
        role: 'editor'
      }
    });

    if (!editor) {
      console.log('❌ No editor found. Please create an editor first.');
      return;
    }

    console.log('✅ Found editor:', editor.email);

    // Get some universities to assign
    const universities = await prisma.university.findMany({
      where: {
        isActive: true
      },
      take: 3 // Assign to first 3 universities
    });

    if (universities.length === 0) {
      console.log('❌ No universities found.');
      return;
    }

    console.log('✅ Found universities:', universities.map(u => u.name));

    // Create university assignments for the editor
    for (const university of universities) {
      console.log(`🔍 Creating assignment for ${university.name}...`);
      
      const assignment = await prisma.userPermission.create({
        data: {
          userId: editor.id,
          permissionType: 'university_editor',
          permissionDetails: {
            universityId: university.id,
            permissions: {
              canAddCourses: true,
              canEditCourses: true,
              canDeleteCourses: false,
              canManageMaterials: true,
              canViewAnalytics: true
            }
          },
          grantedBy: editor.id, // Self-granted for now
          grantedAt: new Date(),
          isActive: true,
          auditInfo: {
            createdAt: new Date().toISOString(),
            createdBy: 'system@admin.com',
            updatedAt: new Date().toISOString(),
            updatedBy: 'system@admin.com'
          }
        }
      });

      console.log(`✅ Created assignment for ${university.name} (ID: ${assignment.id})`);
    }

    console.log('🎉 Editor successfully assigned to universities!');
    
    // Verify assignments
    const assignments = await prisma.userPermission.findMany({
      where: {
        userId: editor.id,
        permissionType: 'university_editor'
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    console.log('📋 Current assignments:', assignments.length);
    assignments.forEach(assignment => {
      const universityId = assignment.permissionDetails?.universityId;
      console.log(`  - Assignment ID: ${assignment.id}, University ID: ${universityId}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

assignEditorToUniversities();
