import { prisma } from '../src/config/database';

const eventsData = [
  {
    title: 'AI for Education Conference 2025',
    description: 'A conference focusing on AI-powered tools and their role in education.',
    eventType: 'conference',
    startDate: new Date('2025-09-01T09:00:00Z'),
    endDate: new Date('2025-09-03T17:00:00Z'),
    location: 'Colombo Convention Centre',
    isPublic: true
  },
  {
    title: 'SLI Workshop: Python for Beginners',
    description: 'A beginner-level workshop covering the basics of Python programming.',
    eventType: 'workshop',
    startDate: new Date('2025-07-20T10:00:00Z'),
    endDate: new Date('2025-07-20T15:00:00Z'),
    location: 'SLI Main Auditorium',
    isPublic: true
  },
  {
    title: 'University Admission Deadline 2025',
    description: 'Final deadline for submitting university admission applications.',
    eventType: 'deadline',
    startDate: new Date('2025-08-15T23:59:59Z'),
    location: 'Online',
    isPublic: false
  }
];

// Main insertion function
export async function insertEvents(): Promise<void> {
  try {
    console.log('🚀 Starting event insertion...');

    // Replace with an actual User ID that exists in the `User` table
    const defaultUserId = 1;

    const auditInfo = {
      created_at: new Date().toISOString(),
      created_by: 'system',
      source: 'insertEvents_script'
    };

    console.log(`📝 Inserting ${eventsData.length} events...`);

    const result = await prisma.event.createMany({
      data: eventsData.map(event => ({
        createdBy: defaultUserId,
        title: event.title,
        description: event.description,
        eventType: event.eventType,
        startDate: event.startDate,
        endDate: event.endDate,
        location: event.location,
        isPublic: event.isPublic,
        auditInfo: auditInfo
      }))
    });

    console.log(`✅ Successfully inserted ${result.count} events!`);
    await showEventSummary();

  } catch (error) {
    console.error('❌ Error inserting events:', error);
    throw error;
  }
}

// Show summary of events
async function showEventSummary(): Promise<void> {
  const totalEvents = await prisma.event.count();
  const publicEvents = await prisma.event.count({ where: { isPublic: true } });
  const privateEvents = totalEvents - publicEvents;

  console.log('\n📊 Event Summary:');
  console.log(`   - Total Events: ${totalEvents}`);
  console.log(`   - Public: ${publicEvents}`);
  console.log(`   - Private: ${privateEvents}`);

  const sampleEvents = await prisma.event.findMany({
    orderBy: { id: 'asc' },
    select: { id: true, title: true, startDate: true },
    take: 5
  });

  console.log('\n📋 Sample Events:');
  sampleEvents.forEach(event => {
    console.log(`   ${event.id}. ${event.title} (${event.startDate.toISOString().split('T')[0]})`);
  });
  console.log(`   ... and ${totalEvents - sampleEvents.length} more\n`);
}

// Optional: Delete all events
export async function deleteAllEvents(): Promise<void> {
  try {
    const result = await prisma.event.deleteMany();
    console.log(`🗑️  Deleted ${result.count} events`);
  } catch (error) {
    console.error('❌ Error deleting events:', error);
    throw error;
  }
}

// Run the script directly if executed
async function runDirectly(): Promise<void> {
  try {
    await insertEvents();
  } catch (error) {
    console.error('💥 Script execution failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

runDirectly();
