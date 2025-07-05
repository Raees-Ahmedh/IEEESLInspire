// scripts/addUniversities.ts
import { prisma } from '../src/config/database';

async function addUniversities() {
  try {
    console.log('🏫 Adding 3 new Sri Lankan universities...');
    
    // University data to be added
    const universitiesToAdd = [
      // 1. NSBM Green University (Private)
      {
        name: 'NSBM Green University',
        type: 'private',
        uniCode: 'NSBM',
        address: 'Mahenwatta, Pitipana, Homagama 10206',
        contactInfo: {
          phone: '+94 11 544 5000',
          email: 'info@nsbm.ac.lk',
          fax: '+94 11 544 5001'
        },
        website: 'https://www.nsbm.ac.lk',
        imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=500&fit=crop',
        logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/NSBM_Green_University_logo.png/200px-NSBM_Green_University_logo.png',
        galleryImages: [
          'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=600&h=400&fit=crop',
          'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=600&h=400&fit=crop',
          'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=600&h=400&fit=crop'
        ],
        additionalDetails: {
          established: 2013,
          studentCount: 8000,
          ranking: 6,
          specializations: ['Computing', 'Business', 'Engineering', 'Medicine'],
          accreditations: ['UGC', 'AACSB'],
          campusSize: '40 acres',
          isGreen: true
        },
        isActive: true,
        auditInfo: {
          createdAt: new Date().toISOString(),
          createdBy: 'system',
          updatedAt: new Date().toISOString(),
          updatedBy: 'system'
        }
      },
      
      // 2. University of Ruhuna (Government)
      {
        name: 'University of Ruhuna',
        type: 'government',
        uniCode: 'RUH',
        address: 'Wellamadama, Matara 81000',
        contactInfo: {
          phone: '+94 41 222 7831',
          email: 'registrar@ruh.ac.lk',
          fax: '+94 41 222 7831'
        },
        website: 'https://www.ruh.ac.lk',
        imageUrl: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&h=500&fit=crop',
        logoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/3/3c/University_of_Ruhuna_logo.png/150px-University_of_Ruhuna_logo.png',
        galleryImages: [
          'https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?w=600&h=400&fit=crop',
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=400&fit=crop'
        ],
        additionalDetails: {
          established: 1978,
          studentCount: 13000,
          ranking: 7,
          specializations: ['Medicine', 'Engineering', 'Science', 'Humanities', 'Management'],
          accreditations: ['UGC'],
          campusSize: '500 acres'
        },
        isActive: true,
        auditInfo: {
          createdAt: new Date().toISOString(),
          createdBy: 'system',
          updatedAt: new Date().toISOString(),
          updatedBy: 'system'
        }
      },
      
      // 3. APIIT (Asia Pacific Institute of Information Technology) - Private
      {
        name: 'APIIT Sri Lanka',
        type: 'private',
        uniCode: 'APIIT',
        address: '400 Union Place, Colombo 02',
        contactInfo: {
          phone: '+94 11 217 4000',
          email: 'info@apiit.lk',
          fax: '+94 11 217 4020'
        },
        website: 'https://www.apiit.lk',
        imageUrl: 'https://images.unsplash.com/photo-1562813733-b31f71025d54?w=800&h=500&fit=crop',
        logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/APIIT_logo.png/200px-APIIT_logo.png',
        galleryImages: [
          'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=600&h=400&fit=crop',
          'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=600&h=400&fit=crop'
        ],
        additionalDetails: {
          established: 1999,
          studentCount: 5000,
          ranking: 8,
          specializations: ['Computing', 'IT', 'Business', 'Engineering'],
          accreditations: ['UGC', 'BCS'],
          internationalPartners: ['Staffordshire University UK'],
          campusSize: '5 acres'
        },
        isActive: true,
        auditInfo: {
          createdAt: new Date().toISOString(),
          createdBy: 'system',
          updatedAt: new Date().toISOString(),
          updatedBy: 'system'
        }
      }
    ];

    // Add universities one by one
    for (const university of universitiesToAdd) {
      try {
        console.log(`🔄 Adding ${university.name}...`);
        
        // Check if university already exists
        const existingUniversity = await prisma.university.findFirst({
          where: { 
            OR: [
              { name: university.name },
              { uniCode: university.uniCode }
            ]
          }
        });

        if (existingUniversity) {
          console.log(`⚠️  ${university.name} already exists, skipping...`);
          continue;
        }

        // Create university
        const createdUniversity = await prisma.university.create({
          data: university
        });

        console.log(`✅ Successfully added ${university.name} (ID: ${createdUniversity.id})`);
        
      } catch (error: any) {
        console.error(`❌ Error adding ${university.name}:`, error.message);
      }
    }

    // Display summary
    console.log('\n🎉 University addition completed!');
    console.log('═══════════════════════════════════════');
    
    // Get updated count
    const totalCount = await prisma.university.count();
    const governmentCount = await prisma.university.count({ where: { type: 'government' } });
    const privateCount = await prisma.university.count({ where: { type: 'private' } });
    
    console.log(`📊 Total Universities: ${totalCount}`);
    console.log(`🏛️  Government Universities: ${governmentCount}`);
    console.log(`🏢 Private Universities: ${privateCount}`);
    console.log('═══════════════════════════════════════');
    
    // List all universities
    console.log('\n📋 All Universities in Database:');
    const allUniversities = await prisma.university.findMany({
      select: {
        id: true,
        name: true,
        type: true,
        uniCode: true,
        isActive: true
      },
      orderBy: [
        { type: 'asc' },
        { name: 'asc' }
      ]
    });

    allUniversities.forEach((uni, index) => {
      const typeIcon = uni.type === 'government' ? '🏛️' : '🏢';
      const statusIcon = uni.isActive ? '✅' : '❌';
      console.log(`${index + 1}. ${typeIcon} ${uni.name} (${uni.uniCode}) ${statusIcon}`);
    });

    console.log('\n🌐 You can now view these universities at: http://localhost:3000');
    console.log('🔍 API endpoint: http://localhost:4000/api/admin/universities');
    
  } catch (error: any) {
    console.error('❌ Error in addUniversities function:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Add this to your package.json scripts:
// "add-universities": "npx ts-node scripts/addUniversities.ts"

// Run the script
async function main() {
  try {
    console.log('🚀 Starting university addition script...');
    await addUniversities();
    console.log('🎉 Script completed successfully!');
  } catch (error: any) {
    console.error('💥 Script failed:', error);
  }
}

// Execute the main function
main();