// server/scripts/createEditorUser.ts - Script to create an editor user for testing
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createEditorUser() {
  try {
    console.log('🔄 Creating editor user...');

    // Hash the password
    const password = 'editor123';
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create the editor user
    const editorUser = await prisma.user.create({
      data: {
        userType: 'internal',
        email: 'editor@test.com',
        passwordHash: passwordHash,
        firstName: 'Test',
        lastName: 'Editor',
        role: 'editor',
        isActive: true,
        auditInfo: {
          createdAt: new Date().toISOString(),
          createdBy: 'system',
          updatedAt: new Date().toISOString(),
          updatedBy: 'system'
        }
      }
    });

    console.log('✅ Editor user created successfully:');
    console.log(`ID: ${editorUser.id}`);
    console.log(`Email: ${editorUser.email}`);
    console.log(`Role: ${editorUser.role}`);
    console.log(`Password: ${password}`);
    console.log('');
    console.log('You can now login with:');
    console.log(`Email: editor@test.com`);
    console.log(`Password: editor123`);

  } catch (error) {
    console.error('❌ Error creating editor user:', error);
    
    // Check if user already exists
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      console.log('ℹ️  Editor user already exists. You can login with:');
      console.log(`Email: editor@test.com`);
      console.log(`Password: editor123`);
    }
  } finally {
    await prisma.$disconnect();
  }
}

// Run the function
createEditorUser().catch(console.error);