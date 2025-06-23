// server/prisma/seed.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    // Example: Create a university
    const university = await prisma.university.create({
      data: {
        name: "University of Colombo",
        type: "government",
        uniCode: "UOC",
        address: "Colombo, Sri Lanka",
        contactInfo: {
          phone: "+94112345678",
          email: "info@cmb.ac.lk"
        },
        website: "https://cmb.ac.lk",
        isActive: true,
        auditInfo: {
          created_by: 1,
          created_at: new Date().toISOString(),
          updated_by: 1,
          updated_at: new Date().toISOString()
        }
      }
    });

    console.log('✅ University created:', university);

    // Example: Create a user
    const user = await prisma.user.create({
      data: {
        userType: "student",
        email: "student@example.com",
        passwordHash: "hashed_password_here",
        firstName: "John",
        lastName: "Doe",
        role: "student",
        isActive: true,
        auditInfo: {
          created_by: 1,
          created_at: new Date().toISOString(),
          updated_by: 1,
          updated_at: new Date().toISOString()
        }
      }
    });

    console.log('✅ User created:', user);

    // Add more seed data as needed...

  } catch (error) {
    console.error('❌ Error seeding data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();