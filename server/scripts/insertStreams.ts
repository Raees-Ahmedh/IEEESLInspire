// scripts/insertStreamsWithSpecificIds.ts
import { prisma } from '../src/config/database';

async function insertStreamsWithSpecificIds() {
  try {
    console.log('🚀 Starting stream insertion with specific IDs (1-7)...');
    
    // Delete ALL existing streams
    console.log('🗑️  Deleting all existing streams...');
    await prisma.stream.deleteMany({});
    console.log('   ✅ All streams deleted');
    
    // Find the sequence name and reset it
    try {
      const sequences = await prisma.$queryRaw<Array<{sequence_name: string}>>`
        SELECT sequence_name 
        FROM information_schema.sequences 
        WHERE sequence_schema = 'public' 
        AND (sequence_name LIKE '%stream%')
      `;
      
      console.log('🔍 Found sequences:', sequences);
      
      // Try to reset each found sequence
      for (const seq of sequences) {
        try {
          await prisma.$executeRaw`SELECT setval(${seq.sequence_name}, 1, false)`;
          console.log(`   ✅ Reset sequence: ${seq.sequence_name}`);
        } catch (err) {
          console.log(`   ⚠️  Could not reset ${seq.sequence_name}`);
        }
      }
    } catch (error) {
      console.log('   ⚠️  Could not query sequences, will proceed with manual ID insertion');
    }

    const auditInfo = {
      created_at: new Date().toISOString(),
      created_by: 'system',
      source: 'stream_classification_script'
    };

    // Arts Stream Baskets using direct subject IDs
    const basket01Subjects = [
      17, 18, 21, 22, 23, 24, 4, 25, 16, 28, 26, 19, 20,
      10, 12, 14, 11, 13, 15
    ];

    const basket02Subjects = [
      29, 33, 30, 34, 31, 37, 32, 35, 36
    ];

    const basket03Subjects = [
      38, 39, 40, 41, 42, 43, 44, 45, 46
    ];

    const nationalLanguages = [50, 51, 52];
    const classicalLanguages = [55, 53, 54];
    const foreignLanguages = [61, 57, 58, 60, 62, 56, 59, 63];

    // Commerce Stream subjects
    const commerceBasket01 = [27, 17, 28];
    const commerceBasket02 = [
      4, 18, 26, 58, 6, 3, 21, 22, 23, 19, 52, 20, 57, 16
    ];

    // Science Stream subjects
    const biologicalScienceCore = [5];
    const biologicalScienceOptions = [1, 2, 3, 4];
    const physicalScienceSubjects = [7, 6, 1, 2];

    // Technology Stream subjects
    const engineeringTechCore = [47, 49];
    const engineeringTechOptions = [
      17, 18, 24, 52, 25, 16, 38, 27, 4, 28, 3
    ];

    const biosystemsTechCore = [48, 49];
    const biosystemsTechOptions = [
      17, 18, 24, 52, 25, 16, 38, 27, 4, 28, 3
    ];

    // Define stream data with specific IDs
    const streamData = [
      {
        id: 1,
        name: 'Arts Stream',
        streamRule: {
          type: 'arts',
          baskets: {
            basket01: {
              name: 'Social Sciences / Applied Social Studies',
              subjects: basket01Subjects,
              minRequired: 1,
              maxAllowed: 3
            },
            basket02: {
              name: 'Religions and Civilizations', 
              subjects: basket02Subjects,
              maxAllowed: 2,
              exclusions: [
                { if: [29], then_exclude: [33] },
                { if: [30], then_exclude: [34] },
                { if: [31], then_exclude: [37] },
                { if: [32], then_exclude: [35] }
              ]
            },
            basket03: {
              name: 'Aesthetic Studies',
              subjects: basket03Subjects,
              maxAllowed: 2,
              areaConstraints: [
                { area: 'dancing', subjects: [39, 40], maxFromArea: 1 },
                { area: 'music', subjects: [41, 42, 43], maxFromArea: 1 },
                { area: 'drama', subjects: [44, 45, 46], maxFromArea: 1 }
              ]
            },
            basket04: {
              name: 'Languages',
              national: nationalLanguages,
              classical: classicalLanguages,
              foreign: foreignLanguages,
              maxAllowed: 2,
              exceptions: [
                { type: 'three_national', subjects: nationalLanguages },
                { type: 'national_classical', minNational: 1, maxClassical: 2 }
              ]
            }
          },
          exceptions: [
            { type: 'three_national_languages', subjects: nationalLanguages },
            { type: 'national_classical_mix', nationalSubjects: nationalLanguages, classicalSubjects: classicalLanguages },
            { type: 'two_languages_plus_religion_aesthetic', languageBaskets: [...nationalLanguages, ...classicalLanguages, ...foreignLanguages], otherBaskets: [...basket02Subjects, ...basket03Subjects] }
          ]
        }
      },
      {
        id: 2,
        name: 'Commerce Stream',
        streamRule: {
          type: 'commerce',
          basket01: {
            name: 'Core Commerce',
            subjects: commerceBasket01,
            minRequired: 2
          },
          basket02: {
            name: 'Supporting Subjects',
            subjects: commerceBasket02
          },
          rules: [
            { type: 'all_from_basket01', basket: commerceBasket01, count: 3 },
            { type: 'two_from_basket01_one_from_basket02', basket01: commerceBasket01, basket02: commerceBasket02 }
          ]
        }
      },
      {
        id: 3,
        name: 'Biological Science Stream',
        streamRule: {
          type: 'biological_science',
          required: biologicalScienceCore,
          options: biologicalScienceOptions,
          rules: [
            { type: 'biology_plus_two_from_options', required: biologicalScienceCore, options: biologicalScienceOptions }
          ]
        }
      },
      {
        id: 4,
        name: 'Physical Science Stream', 
        streamRule: {
          type: 'physical_science',
          allowedSubjects: physicalScienceSubjects,
          rules: [
            { type: 'any_three_from_allowed', subjects: physicalScienceSubjects, count: 3 }
          ]
        }
      },
      {
        id: 5,
        name: 'Engineering Technology Stream',
        streamRule: {
          type: 'engineering_technology',
          required: engineeringTechCore,
          options: engineeringTechOptions,
          rules: [
            { type: 'two_required_one_option', required: engineeringTechCore, options: engineeringTechOptions }
          ]
        }
      },
      {
        id: 6,
        name: 'Bio Systems Technology Stream',
        streamRule: {
          type: 'biosystems_technology', 
          required: biosystemsTechCore,
          options: biosystemsTechOptions,
          rules: [
            { type: 'two_required_one_option', required: biosystemsTechCore, options: biosystemsTechOptions }
          ]
        }
      },
      {
        id: 7,
        name: 'Common',
        streamRule: {
          type: 'common',
          description: 'Any three-subject combination that does not fulfill criteria for other streams',
          rules: [
            { type: 'fallback', description: 'Default stream for combinations not matching other criteria' }
          ]
        }
      }
    ];

    console.log('💾 Inserting streams with specific IDs...');

    // Insert streams with specific IDs using raw SQL
    for (const stream of streamData) {
      try {
        // Use raw SQL to force specific ID
        await prisma.$executeRaw`
          INSERT INTO streams (id, name, "streamRule", "isActive", "auditInfo") 
          VALUES (${stream.id}, ${stream.name}, ${JSON.stringify(stream.streamRule)}, ${true}, ${JSON.stringify(auditInfo)})
        `;
        console.log(`   ✅ Inserted: ${stream.name} (ID: ${stream.id})`);
      } catch (error) {
        console.error(`   ❌ Failed to insert ${stream.name}:`, error);
        
        // Fallback: try with Prisma create (will use auto-increment)
        try {
          const result = await prisma.stream.create({
            data: {
              name: stream.name,
              streamRule: stream.streamRule,
              isActive: true,
              auditInfo: auditInfo
            }
          });
          console.log(`   ⚠️  Fallback insertion: ${stream.name} (ID: ${result.id})`);
        } catch (fallbackError) {
          console.error(`   ❌ Fallback also failed for ${stream.name}:`, fallbackError);
        }
      }
    }

    // Update the sequence to continue from 8
    try {
      const sequences = await prisma.$queryRaw<Array<{sequence_name: string}>>`
        SELECT sequence_name 
        FROM information_schema.sequences 
        WHERE sequence_schema = 'public' 
        AND (sequence_name LIKE '%stream%')
      `;
      
      for (const seq of sequences) {
        try {
          await prisma.$executeRaw`SELECT setval(${seq.sequence_name}, 7, true)`;
          console.log(`   ✅ Set sequence ${seq.sequence_name} to continue from 8`);
        } catch (err) {
          console.log(`   ⚠️  Could not update sequence ${seq.sequence_name}`);
        }
      }
    } catch (error) {
      console.log('   ⚠️  Could not update sequence for future inserts');
    }

    console.log('\n🎉 Stream insertion completed!');

    // Verification
    const streams = await prisma.stream.findMany({
      select: { id: true, name: true },
      orderBy: { id: 'asc' }
    });

    console.log('📋 Final Stream List:');
    console.log('═══════════════════════════════════════');
    streams.forEach(stream => {
      console.log(`   ${stream.id}. ${stream.name}`);
    });
    console.log('═══════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Error in stream insertion:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
async function main() {
  try {
    await insertStreamsWithSpecificIds();
    console.log('🎯 Script completed successfully!');
  } catch (error) {
    console.error('💥 Script failed:', error);
  }
}

main();