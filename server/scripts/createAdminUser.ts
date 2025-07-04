import bcrypt from 'bcryptjs';
import { prisma } from '../src/config/database';

async function createAdminUser() {
  try {
    const adminEmail = 'admin@pathfinder.com';
    const adminPassword = 'admin123'; // Change this to a secure password
    
    console.log('🔧 Creating admin user...');
    
    // Check if admin user already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail }
    });

    if (existingAdmin) {
      console.log('❌ Admin user already exists with email:', adminEmail);
      console.log('📧 Email:', adminEmail);
      console.log('🔑 Try password:', adminPassword);
      return;
    }

    // Hash password
    console.log('🔐 Hashing password...');
    const hashedPassword = await bcrypt.hash(adminPassword, 12);

    // Create admin user
    console.log('👤 Creating admin user...');
    const adminUser = await prisma.user.create({
      data: {
        userType: 'admin',
        email: adminEmail,
        passwordHash: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
        isActive: true,
        auditInfo: {
          createdAt: new Date().toISOString(),
          createdBy: 'system',
          updatedAt: new Date().toISOString(),
          updatedBy: 'system'
        },
        profileData: {
          createdBy: 'system',
          accountType: 'admin',
          permissions: ['all']
        }
      }
    });

    console.log('\n🎉 Admin user created successfully!');
    console.log('═══════════════════════════════════════');
    console.log('📧 Email:', adminEmail);
    console.log('🔑 Password:', adminPassword);
    console.log('🆔 User ID:', adminUser.id);
    console.log('👤 Role:', adminUser.role);
    console.log('═══════════════════════════════════════');
    console.log('⚠️  IMPORTANT: Change the default password after first login!');
    console.log('🌐 You can now login at: http://localhost:3000/login');
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Add this to your package.json scripts:
// "create-admin": "npx ts-node scripts/createAdminUser.ts"

// Run the script
async function main() {
  try {
    await createAdminUser();
    console.log('🎉 Script completed successfully!');
  } catch (error) {
    console.error('💥 Script failed:', error);
  }
}

// Execute the main function
main();