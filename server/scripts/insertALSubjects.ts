// scripts/insertALSubjects.ts
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
    
    console.log(`📝 Inserting ${alSubjects.length} A/L subjects...`);
    
    // Use createMany for better performance (using singular model name)
    const result = await prisma.subject.createMany({
      data: alSubjects.map(subject => ({
        code: subject.code,
        name: subject.name,
        level: 'AL',
        isActive: true,
        auditInfo: auditInfo
      }))
    });
    
    console.log(`✅ Successfully inserted ${result.count} A/L subjects!`);
    
    // Verify the insertion
    const totalCount = await prisma.subject.count({
      where: { level: 'AL' }
    });
    
    console.log(`🔍 Verification: ${totalCount} A/L subjects found in database`);
    
    // Show some examples
    const sampleSubjects = await prisma.subject.findMany({
      where: { level: 'AL' },
      select: { id: true, code: true, name: true },
      orderBy: { id: 'asc' },
      take: 5
    });
    
    console.log('\n📋 Sample subjects:');
    sampleSubjects.forEach(subject => {
      console.log(`   ${subject.id}. ${subject.code} - ${subject.name}`);
    });
    console.log(`   ... and ${totalCount - 5} more\n`);
    
  } catch (error) {
    console.error('❌ Error inserting A/L subjects:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
async function main() {
  try {
    await resetSequenceAndInsertALSubjects();
    console.log('🎉 Script completed successfully!');
  } catch (error) {
    console.error('💥 Script failed:', error);
  }
}

// Execute the main function
main();