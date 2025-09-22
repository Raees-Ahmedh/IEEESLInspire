// scripts/resetAndInsertALSubjects.ts
import { prisma } from '../src/config/database';

async function resetSequenceAndInsertALSubjects() {
  try {
    console.log('🚀 Starting AL subjects insertion with sequence reset...');
    
    // Step 1: Delete existing AL subjects if any
    console.log('🗑️  Clearing existing AL subjects...');
    const deletedCount = await prisma.subject.deleteMany({
      where: { level: 'AL' }
    });
    console.log(`   ✅ Deleted ${deletedCount.count} existing AL subjects`);
    
    // Step 2: Reset the auto-increment sequence to start from 1
    console.log('🔄 Resetting subject ID sequence to start from 1...');
    try {
      // Reset the sequence for PostgreSQL
      await prisma.$executeRaw`SELECT setval('subjects_subject_id_seq', 1, false)`;
      console.log('   ✅ Successfully reset sequence to start from 1');
    } catch (error) {
      console.log('   ⚠️  Could not reset sequence automatically, proceeding with current sequence...');
    }
    
    // Step 3: Prepare audit info
    const auditInfo = {
      created_at: new Date().toISOString(),
      created_by: 'system',
      source: 'AL_curriculum_script'
    };
    
    // Step 4: AL subjects data (63 subjects total)
    const alSubjects = [
      { code: '01', name: 'Physics' },
      { code: '02', name: 'Chemistry' },
      { code: '07', name: 'Mathematics' },
      { code: '08', name: 'Agricultural Science' },
      { code: '09', name: 'Biology' },
      { code: '10', name: 'Combined Mathematics' },
      { code: '11', name: 'Higher Mathematics' },
      { code: '12', name: 'Common General Test' },
      { code: '13', name: 'General English' },
      { code: '14', name: 'Civil Technology' },
      { code: '15', name: 'Mechanical Technology' },
      { code: '16', name: 'Electrical, Electronic and Information Technology' },
      { code: '17', name: 'Food Technology' },
      { code: '18', name: 'Agro Technology' },
      { code: '19', name: 'Bio Resource Technology' },
      { code: '20', name: 'Information & Communication Technology' },
      { code: '21', name: 'Economics' },
      { code: '22', name: 'Geography' },
      { code: '23', name: 'Political Science' },
      { code: '24', name: 'Logic and Scientific Method' },
      { code: '25A', name: 'History of Sri Lanka & India' },
      { code: '25B', name: 'History of Sri Lanka & Europe' },
      { code: '25C', name: 'History of Sri Lanka & Modern World' },
      { code: '28', name: 'Home Economics' },
      { code: '29', name: 'Communication & Media Studies' },
      { code: '31', name: 'Business Statistics' },
      { code: '32', name: 'Business Studies' },
      { code: '33', name: 'Accounting' },
      { code: '41', name: 'Buddhism' },
      { code: '42', name: 'Hinduism' },
      { code: '43', name: 'Christianity' },
      { code: '44', name: 'Islam' },
      { code: '45', name: 'Buddhist Civilization' },
      { code: '46', name: 'Hindu Civilization' },
      { code: '47', name: 'Islam Civilization' },
      { code: '48', name: 'Greek and Roman Civilization' },
      { code: '49', name: 'Christian Civilization' },
      { code: '51', name: 'Art' },
      { code: '52', name: 'Dancing (Indigenous)' },
      { code: '53', name: 'Dancing (Bharatha)' },
      { code: '54', name: 'Oriental Music' },
      { code: '55', name: 'Carnatic Music' },
      { code: '56', name: 'Western Music' },
      { code: '57', name: 'Drama and Theatre (Sinhala)' },
      { code: '58', name: 'Drama and Theatre (Tamil)' },
      { code: '59', name: 'Drama and Theatre (English)' },
      { code: '65', name: 'Engineering Technology' },
      { code: '66', name: 'Bio Systems Technology' },
      { code: '67', name: 'Science for Technology' },
      { code: '71', name: 'Sinhala' },
      { code: '72', name: 'Tamil' },
      { code: '73', name: 'English' },
      { code: '74', name: 'Pali' },
      { code: '75', name: 'Sanskrit' },
      { code: '78', name: 'Arabic' },
      { code: '79', name: 'Malay' },
      { code: '81', name: 'French' },
      { code: '82', name: 'German' },
      { code: '83', name: 'Russian' },
      { code: '84', name: 'Hindi' },
      { code: '86', name: 'Chinese' },
      { code: '87', name: 'Japanese' },
      { code: '88', name: 'Korean' }
    ];
    
    console.log(`📝 Inserting ${alSubjects.length} AL subjects starting from ID 1...`);
    
    // Step 5: Insert AL subjects
    const result = await prisma.subject.createMany({
      data: alSubjects.map(subject => ({
        code: subject.code,
        name: subject.name,
        level: 'AL',
        isActive: true,
        auditInfo: auditInfo
      }))
    });
    
    console.log(`✅ Successfully inserted ${result.count} AL subjects!`);
    
    // Step 6: Verification
    const insertedSubjects = await prisma.subject.findMany({
      where: { level: 'AL' },
      select: { id: true, code: true, name: true },
      orderBy: { id: 'asc' }
    });
    
    console.log('\n🔍 Verification Results:');
    console.log('═══════════════════════════════════════');
    console.log(`📊 Total AL subjects inserted: ${insertedSubjects.length}`);
    console.log(`🆔 ID Range: ${insertedSubjects[0]?.id} to ${insertedSubjects[insertedSubjects.length - 1]?.id}`);
    
    // Show first 10 and last 5 subjects
    console.log('\n📋 First 10 AL subjects:');
    insertedSubjects.slice(0, 10).forEach(subject => {
      console.log(`   ${subject.id.toString().padStart(2, '0')}. ${subject.code.padEnd(4)} - ${subject.name}`);
    });
    
    console.log('\n📋 Last 5 AL subjects:');
    insertedSubjects.slice(-5).forEach(subject => {
      console.log(`   ${subject.id.toString().padStart(2, '0')}. ${subject.code.padEnd(4)} - ${subject.name}`);
    });
    
    console.log('═══════════════════════════════════════');
    
    if (insertedSubjects[0]?.id === 1 && insertedSubjects.length === 63) {
      console.log('🎉 SUCCESS: AL subjects inserted with IDs 1-63 as expected!');
    } else {
      console.log(`⚠️  Note: IDs range from ${insertedSubjects[0]?.id} to ${insertedSubjects[insertedSubjects.length - 1]?.id}`);
    }
    
  } catch (error) {
    console.error('❌ Error inserting AL subjects:', error);
    throw error;
  }
}

// Alternative method: Force specific IDs (if sequence reset doesn't work)
async function forceInsertWithSpecificIds() {
  try {
    console.log('🚀 Force inserting AL subjects with specific IDs 1-63...');
    
    const auditInfo = {
      created_at: new Date().toISOString(),
      created_by: 'system',
      source: 'AL_curriculum_script_force_ids'
    };
    
    // Clear existing AL subjects
    await prisma.subject.deleteMany({ where: { level: 'AL' } });
    
    const alSubjectsWithIds = [
      { id: 1, code: '01', name: 'Physics' },
      { id: 2, code: '02', name: 'Chemistry' },
      { id: 3, code: '07', name: 'Mathematics' },
      { id: 4, code: '08', name: 'Agricultural Science' },
      { id: 5, code: '09', name: 'Biology' },
      { id: 6, code: '10', name: 'Combined Mathematics' },
      { id: 7, code: '11', name: 'Higher Mathematics' },
      { id: 8, code: '12', name: 'Common General Test' },
      { id: 9, code: '13', name: 'General English' },
      { id: 10, code: '14', name: 'Civil Technology' },
      { id: 11, code: '15', name: 'Mechanical Technology' },
      { id: 12, code: '16', name: 'Electrical, Electronic and Information Technology' },
      { id: 13, code: '17', name: 'Food Technology' },
      { id: 14, code: '18', name: 'Agro Technology' },
      { id: 15, code: '19', name: 'Bio Resource Technology' },
      { id: 16, code: '20', name: 'Information & Communication Technology' },
      { id: 17, code: '21', name: 'Economics' },
      { id: 18, code: '22', name: 'Geography' },
      { id: 19, code: '23', name: 'Political Science' },
      { id: 20, code: '24', name: 'Logic and Scientific Method' },
      { id: 21, code: '25A', name: 'History of Sri Lanka & India' },
      { id: 22, code: '25B', name: 'History of Sri Lanka & Europe' },
      { id: 23, code: '25C', name: 'History of Sri Lanka & Modern World' },
      { id: 24, code: '28', name: 'Home Economics' },
      { id: 25, code: '29', name: 'Communication & Media Studies' },
      { id: 26, code: '31', name: 'Business Statistics' },
      { id: 27, code: '32', name: 'Business Studies' },
      { id: 28, code: '33', name: 'Accounting' },
      { id: 29, code: '41', name: 'Buddhism' },
      { id: 30, code: '42', name: 'Hinduism' },
      { id: 31, code: '43', name: 'Christianity' },
      { id: 32, code: '44', name: 'Islam' },
      { id: 33, code: '45', name: 'Buddhist Civilization' },
      { id: 34, code: '46', name: 'Hindu Civilization' },
      { id: 35, code: '47', name: 'Islam Civilization' },
      { id: 36, code: '48', name: 'Greek and Roman Civilization' },
      { id: 37, code: '49', name: 'Christian Civilization' },
      { id: 38, code: '51', name: 'Art' },
      { id: 39, code: '52', name: 'Dancing (Indigenous)' },
      { id: 40, code: '53', name: 'Dancing (Bharatha)' },
      { id: 41, code: '54', name: 'Oriental Music' },
      { id: 42, code: '55', name: 'Carnatic Music' },
      { id: 43, code: '56', name: 'Western Music' },
      { id: 44, code: '57', name: 'Drama and Theatre (Sinhala)' },
      { id: 45, code: '58', name: 'Drama and Theatre (Tamil)' },
      { id: 46, code: '59', name: 'Drama and Theatre (English)' },
      { id: 47, code: '65', name: 'Engineering Technology' },
      { id: 48, code: '66', name: 'Bio Systems Technology' },
      { id: 49, code: '67', name: 'Science for Technology' },
      { id: 50, code: '71', name: 'Sinhala' },
      { id: 51, code: '72', name: 'Tamil' },
      { id: 52, code: '73', name: 'English' },
      { id: 53, code: '74', name: 'Pali' },
      { id: 54, code: '75', name: 'Sanskrit' },
      { id: 55, code: '78', name: 'Arabic' },
      { id: 56, code: '79', name: 'Malay' },
      { id: 57, code: '81', name: 'French' },
      { id: 58, code: '82', name: 'German' },
      { id: 59, code: '83', name: 'Russian' },
      { id: 60, code: '84', name: 'Hindi' },
      { id: 61, code: '86', name: 'Chinese' },
      { id: 62, code: '87', name: 'Japanese' },
      { id: 63, code: '88', name: 'Korean' }
    ];
    
    // Insert each subject with specific ID using raw SQL
    for (const subject of alSubjectsWithIds) {
      await prisma.$executeRaw`
        INSERT INTO subjects (subject_id, code, name, level, is_active, audit_info) 
        VALUES (${subject.id}, ${subject.code}, ${subject.name}, 'AL', true, ${JSON.stringify(auditInfo)})
      `;
    }
    
    // Update sequence to continue from 64
    await prisma.$executeRaw`SELECT setval('subjects_subject_id_seq', 63, true)`;
    
    console.log('✅ Successfully inserted 63 AL subjects with IDs 1-63!');
    
  } catch (error) {
    console.error('❌ Error in force insertion:', error);
    throw error;
  }
}

// Main execution function
async function main() {
  try {
    console.log('Choose insertion method:');
    console.log('1. Try sequence reset first (recommended)');
    console.log('2. Force specific IDs (fallback)');
    
    // Try method 1 first
    try {
      await resetSequenceAndInsertALSubjects();
    } catch (error) {
      console.log('\n⚠️  Method 1 failed, trying method 2...');
      await forceInsertWithSpecificIds();
    }
    
    console.log('\n🎉 AL subjects insertion completed successfully!');
    
  } catch (error) {
    console.error('💥 Script failed:', error);
  } finally {
    await prisma.$disconnect();
    console.log('🔌 Database connection closed');
  }
}

// Execute the script
main();