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

// Main insertion function
export async function insertOLSubjects(): Promise<void> {
  try {
    console.log('🚀 Starting O/L subjects insertion...');
    
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

    const auditInfo = {
      created_at: new Date().toISOString(),
      created_by: 'system',
      source: 'OL_curriculum_script'
    };

    console.log(`📝 Inserting ${olSubjectsData.length} O/L subjects...`);
    console.log('🏷️  Using "OL" prefix for codes to avoid conflicts with A/L subjects');

    // Insert all O/L subjects
    const result = await prisma.subject.createMany({
      data: olSubjectsData.map(subject => ({
        code: subject.code,
        name: subject.name,
        level: 'OL',
        isActive: true,
        auditInfo: auditInfo
      }))
    });

    console.log(`✅ Successfully inserted ${result.count} O/L subjects!`);

    // Show verification results
    await showInsertionResults();

  } catch (error) {
    console.error('❌ Error inserting O/L subjects:', error);
    throw error;
  }
}

// Show insertion results
async function showInsertionResults(): Promise<void> {
  const totalOLCount = await prisma.subject.count({
    where: { level: 'OL' }
  });

  const totalALCount = await prisma.subject.count({
    where: { level: 'AL' }
  });

  console.log(`🔍 Verification:`);
  console.log(`   - O/L subjects: ${totalOLCount}`);
  console.log(`   - A/L subjects: ${totalALCount}`);
  console.log(`   - Total subjects: ${totalOLCount + totalALCount}`);

  // Show sample of inserted O/L subjects
  const sampleOLSubjects = await prisma.subject.findMany({
    where: { level: 'OL' },
    select: { id: true, code: true, name: true },
    orderBy: { id: 'asc' },
    take: 5
  });

  console.log('\n📋 Sample O/L subjects:');
  sampleOLSubjects.forEach(subject => {
    console.log(`   ${subject.id}. ${subject.code} - ${subject.name}`);
  });
  console.log(`   ... and ${totalOLCount - 5} more O/L subjects`);
  console.log('\n💡 Note: O/L subject codes are prefixed with "OL" to distinguish from A/L subjects\n');
}

// View all subjects function
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

// Delete O/L subjects function
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

// Check for code conflicts
export async function checkCodeConflicts(): Promise<void> {
  try {
    console.log('🔍 Checking for potential code conflicts...');
    
    const existingCodes = await prisma.subject.findMany({
      select: { code: true, level: true, name: true }
    });

    const alCodes = existingCodes.filter(s => s.level === 'AL').map(s => s.code);
    const olCodes = existingCodes.filter(s => s.level === 'OL').map(s => s.code);

    console.log(`📊 Found ${alCodes.length} A/L codes and ${olCodes.length} O/L codes`);
    
    if (alCodes.length > 0) {
      console.log('\n🎓 A/L Codes:', alCodes.sort().join(', '));
    }
    
    if (olCodes.length > 0) {
      console.log('\n📖 O/L Codes:', olCodes.sort().join(', '));
    }

    // Check for any overlaps
    const overlaps = alCodes.filter(code => olCodes.includes(code));
    if (overlaps.length > 0) {
      console.log(`\n⚠️  Found ${overlaps.length} overlapping codes:`, overlaps.join(', '));
    } else {
      console.log('\n✅ No code conflicts found!');
    }

  } catch (error) {
    console.error('❌ Error checking code conflicts:', error);
    throw error;
  }
}

// Export the data as well
export { olSubjectsData };

// Simple execution function for direct running
async function runDirectly(): Promise<void> {
  try {
    await insertOLSubjects();
  } catch (error) {
    console.error('💥 Script execution failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Auto-run when script is executed directly
runDirectly();