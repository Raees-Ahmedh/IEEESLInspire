// scripts/insertOLSubjects.ts
import { prisma } from '../src/config/database';

// O/L subjects data with unique codes
const olSubjectsData = [
  { code: 'OL11', name: 'Buddhism' },
  { code: 'OL12', name: 'Saivanery' },
  { code: 'OL14', name: 'Catholicism' },
  { code: 'OL15', name: 'Christianity' },
  { code: 'OL16', name: 'Islam' },
  { code: 'OL21', name: 'Sinhala Language & Literature' },
  { code: 'OL22', name: 'Tamil Language & Literature' },
  { code: 'OL31', name: 'English Language' },
  { code: 'OL32', name: 'Mathematics' },
  { code: 'OL33', name: 'History' },
  { code: 'OL34', name: 'Science' },
  { code: 'OL40', name: 'Music (Oriental)' },
  { code: 'OL41', name: 'Music (Western)' },
  { code: 'OL42', name: 'Music (Carnatic)' },
  { code: 'OL43', name: 'Art' },
  { code: 'OL44', name: 'Dancing (Oriental)' },
  { code: 'OL45', name: 'Dancing (Bharata)' },
  { code: 'OL46', name: 'Appreciation of English Literary Texts' },
  { code: 'OL47', name: 'Appreciation of Sinhala Literary Texts' },
  { code: 'OL48', name: 'Appreciation of Tamil Literary Texts' },
  { code: 'OL49', name: 'Appreciation of Arabic Literary Texts' },
  { code: 'OL50', name: 'Drama and Theatre (Sinhala)' },
  { code: 'OL51', name: 'Drama and Theatre (Tamil)' },
  { code: 'OL52', name: 'Drama and Theatre (English)' },
  { code: 'OL60', name: 'Business & Accounting Studies' },
  { code: 'OL61', name: 'Geography' },
  { code: 'OL62', name: 'Civic Education' },
  { code: 'OL63', name: 'Entrepreneurship Studies' },
  { code: 'OL64', name: 'Second Language (Sinhala)' },
  { code: 'OL65', name: 'Second Language (Tamil)' },
  { code: 'OL66', name: 'Pali' },
  { code: 'OL67', name: 'Sanskrit' },
  { code: 'OL68', name: 'French' },
  { code: 'OL69', name: 'German' },
  { code: 'OL70', name: 'Hindi' },
  { code: 'OL71', name: 'Japanese' },
  { code: 'OL72', name: 'Arabic' },
  { code: 'OL73', name: 'Korean' },
  { code: 'OL74', name: 'Chinese' },
  { code: 'OL75', name: 'Russian' },
  { code: 'OL80', name: 'Information & Communication Technology' },
  { code: 'OL81', name: 'Agriculture & Food Technology' },
  { code: 'OL82', name: 'Aquatic Bioresources Technology' },
  { code: 'OL84', name: 'Art & Crafts' },
  { code: 'OL85', name: 'Home Economics' },
  { code: 'OL86', name: 'Health & Physical Education' },
  { code: 'OL87', name: 'Communication & Media Studies' },
  { code: 'OL88', name: 'Design & Construction Technology' },
  { code: 'OL89', name: 'Design & Mechanical Technology' },
  { code: 'OL90', name: 'Design, Electrical & Electronic Technology' },
  { code: 'OL92', name: 'Electronic Writing & Shorthand (Sinhala)' },
  { code: 'OL93', name: 'Electronic Writing & Shorthand (Tamil)' },
  { code: 'OL94', name: 'Electronic Writing & Shorthand (English)' }
];

// Main insertion function with ID starting from 65
export async function insertOLSubjectsFromId65(): Promise<void> {
  try {
    console.log('🚀 Starting O/L subjects insertion from ID 65...');
    
    // Check current A/L subject count
    const existingALCount = await prisma.subject.count({
      where: { level: 'AL' }
    });
    
    console.log(`📊 Current A/L subjects count: ${existingALCount}`);
    
    // Check if O/L subjects already exist
    const existingOLCount = await prisma.subject.count({
      where: { level: 'OL' }
    });
    
    if (existingOLCount > 0) {
      console.log(`⚠️  Found ${existingOLCount} existing O/L subjects.`);
      console.log('Skipping insertion to avoid duplicates.');
      console.log('💡 To re-insert, first delete existing O/L subjects.');
      return;
    }

    // Get the maximum ID to verify our starting point
    const maxIdResult = await prisma.subject.findFirst({
      orderBy: { id: 'desc' },
      select: { id: true }
    });
    
    const currentMaxId = maxIdResult?.id || 0;
    console.log(`📈 Current maximum subject ID: ${currentMaxId}`);
    
    if (currentMaxId >= 65) {
      console.log(`⚠️  Warning: Maximum ID (${currentMaxId}) is already >= 65`);
      console.log('O/L subjects will start from ID ' + (currentMaxId + 1));
    }

    // Reset the sequence to start from 65 if needed
    if (currentMaxId < 64) {
      console.log('🔧 Adjusting sequence to start O/L subjects from ID 65...');
      await prisma.$executeRaw`SELECT setval('subjects_subject_id_seq', 64, true)`;
      console.log('✅ Sequence set to 64, next insertion will be ID 65');
    }

    const auditInfo = {
      created_at: new Date().toISOString(),
      created_by: 'system',
      source: 'OL_curriculum_script',
      note: 'Inserted starting from ID 65 to maintain separation from A/L subjects'
    };

    console.log(`📝 Inserting ${olSubjectsData.length} O/L subjects starting from ID 65...`);
    console.log('🏷️  Using "OL" prefix for codes to avoid conflicts with A/L subjects');

    // Insert O/L subjects one by one to ensure proper ID assignment
    let insertedCount = 0;
    const insertedSubjects: any[] = [];

    for (const subjectData of olSubjectsData) {
      try {
        const insertedSubject = await prisma.subject.create({
          data: {
            code: subjectData.code,
            name: subjectData.name,
            level: 'OL',
            isActive: true,
            auditInfo: auditInfo
          }
        });
        
        insertedSubjects.push(insertedSubject);
        insertedCount++;
        
        // Log first few insertions to verify ID sequence
        if (insertedCount <= 3) {
          console.log(`   ✅ Inserted: ID ${insertedSubject.id} - ${subjectData.code} - ${subjectData.name}`);
        }
        
      } catch (error) {
        console.error(`❌ Failed to insert ${subjectData.code}:`, error);
        throw error;
      }
    }

    console.log(`✅ Successfully inserted ${insertedCount} O/L subjects!`);

    // Show insertion results with ID verification
    await showInsertionResultsWithIds(insertedSubjects);

  } catch (error) {
    console.error('❌ Error inserting O/L subjects:', error);
    throw error;
  }
}

// Show insertion results with ID information
async function showInsertionResultsWithIds(insertedSubjects: any[]): Promise<void> {
  const totalOLCount = await prisma.subject.count({
    where: { level: 'OL' }
  });

  const totalALCount = await prisma.subject.count({
    where: { level: 'AL' }
  });

  // Get ID range of inserted O/L subjects
  const olSubjects = await prisma.subject.findMany({
    where: { level: 'OL' },
    select: { id: true, code: true, name: true },
    orderBy: { id: 'asc' }
  });

  const minOLId = olSubjects.length > 0 ? Math.min(...olSubjects.map(s => s.id)) : 0;
  const maxOLId = olSubjects.length > 0 ? Math.max(...olSubjects.map(s => s.id)) : 0;

  console.log(`🔍 Verification:`);
  console.log(`   - A/L subjects: ${totalALCount}`);
  console.log(`   - O/L subjects: ${totalOLCount} (IDs: ${minOLId} - ${maxOLId})`);
  console.log(`   - Total subjects: ${totalOLCount + totalALCount}`);

  if (minOLId >= 65) {
    console.log(`✅ Success: O/L subjects start from ID ${minOLId} (as requested >= 65)`);
  } else {
    console.log(`⚠️  Note: O/L subjects start from ID ${minOLId} (requested >= 65)`);
  }

  // Show first and last few O/L subjects with IDs
  console.log('\n📋 First 3 O/L subjects:');
  olSubjects.slice(0, 3).forEach(subject => {
    console.log(`   ${subject.id}. ${subject.code} - ${subject.name}`);
  });

  if (olSubjects.length > 6) {
    console.log('   ...');
    console.log('\n📋 Last 3 O/L subjects:');
    olSubjects.slice(-3).forEach(subject => {
      console.log(`   ${subject.id}. ${subject.code} - ${subject.name}`);
    });
  }

  console.log('\n💡 Note: O/L subject codes are prefixed with "OL" to distinguish from A/L subjects');
  console.log(`🎯 Target achieved: O/L subjects start from ID ${minOLId}\n`);
}

// Alternative method: Insert with specific ID gap
export async function insertOLSubjectsWithGap(): Promise<void> {
  try {
    console.log('🚀 Alternative method: Creating O/L subjects with ID gap...');
    
    // First, create a dummy record at ID 64 to ensure O/L starts at 65
    const maxId = await prisma.subject.findFirst({
      orderBy: { id: 'desc' },
      select: { id: true }
    });
    
    const currentMax = maxId?.id || 0;
    
    if (currentMax < 64) {
      // Create a placeholder to reach ID 64
      console.log('🔧 Creating placeholder to ensure O/L subjects start at ID 65...');
      
      await prisma.$executeRaw`SELECT setval('subjects_subject_id_seq', 63, true)`;
      
      // Create placeholder record
      const placeholder = await prisma.subject.create({
        data: {
          code: 'PLACEHOLDER',
          name: 'Temporary Placeholder - Will be deleted',
          level: 'TEMP',
          isActive: false,
          auditInfo: {
            created_at: new Date().toISOString(),
            created_by: 'system',
            source: 'placeholder_for_sequencing'
          }
        }
      });
      
      console.log(`📍 Created placeholder at ID: ${placeholder.id}`);
      
      // Delete the placeholder
      await prisma.subject.delete({
        where: { id: placeholder.id }
      });
      
      console.log('🗑️  Removed placeholder, sequence is now at 64');
    }
    
    // Now insert O/L subjects (they will start from ID 65)
    await insertOLSubjectsFromId65();
    
  } catch (error) {
    console.error('❌ Error in alternative insertion method:', error);
    throw error;
  }
}

// View all subjects function (unchanged)
export async function viewAllSubjects(): Promise<void> {
  try {
    const allSubjects = await prisma.subject.findMany({
      select: { id: true, code: true, name: true, level: true, isActive: true },
      orderBy: [{ level: 'asc' }, { id: 'asc' }]
    });

    const alSubjects = allSubjects.filter(s => s.level === 'AL');
    const olSubjects = allSubjects.filter(s => s.level === 'OL');

    console.log(`\n📚 All Subjects (${allSubjects.length} total):`);
    console.log('═'.repeat(90));
    
    if (alSubjects.length > 0) {
      console.log(`\n🎓 A/L Subjects (${alSubjects.length}):`);
      console.log('─'.repeat(70));
      alSubjects.forEach(subject => {
        const status = subject.isActive ? '✅' : '❌';
        console.log(`${status} ${subject.id.toString().padStart(3, '0')}. ${subject.code.padEnd(6)} - ${subject.name}`);
      });
    }

    if (olSubjects.length > 0) {
      console.log(`\n📖 O/L Subjects (${olSubjects.length}):`);
      console.log('─'.repeat(70));
      olSubjects.forEach(subject => {
        const status = subject.isActive ? '✅' : '❌';
        console.log(`${status} ${subject.id.toString().padStart(3, '0')}. ${subject.code.padEnd(6)} - ${subject.name}`);
      });
    }
    
    console.log('═'.repeat(90));

  } catch (error) {
    console.error('❌ Error viewing subjects:', error);
    throw error;
  }
}

// Delete O/L subjects function (unchanged)
export async function deleteOLSubjects(): Promise<void> {
  try {
    const result = await prisma.subject.deleteMany({
      where: { level: 'OL' }
    });
    console.log(`🗑️  Deleted ${result.count} O/L subjects`);
  } catch (error) {
    console.error('❌ Error deleting O/L subjects:', error);
    throw error;
  }
}

// Export the data as well
export { olSubjectsData };

// Updated execution function for direct running
async function runDirectly(): Promise<void> {
  try {
    await insertOLSubjectsFromId65();
  } catch (error) {
    console.error('💥 Script execution failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Auto-run when script is executed directly
runDirectly();