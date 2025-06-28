// scripts/testStreamClassification.ts
import { prisma } from '../src/config/database';
import streamClassificationService from '../src/services/streamClassificationService';

interface TestCase {
  name: string;
  subjectIds: number[];
  expectedStream: string;
  description: string;
}

// Additional test to show all available streams
async function showAvailableStreams() {
  try {
    console.log('\n📚 Available Streams in Database:');
    console.log('─────────────────────────────────────────────');
    
    const streams = await streamClassificationService.getAllStreams();
    
    if (streams.length === 0) {
      console.log('❌ No streams found! Please run: npx ts-node scripts/insertStreams.ts');
      return false;
    }
    
    streams.forEach((stream, index) => {
      console.log(`${index + 1}. ${stream.name} (ID: ${stream.id})`);
    });
    
    console.log('─────────────────────────────────────────────\n');
    return true;
    
  } catch (error) {
    console.error('❌ Error fetching streams:', error);
    return false;
  }
}

async function runStreamClassificationTests() {
  console.log('🧪 Starting Stream Classification Tests');
  console.log('══════════════════════════════════════════════════════════════');

  // Define test cases using direct subject IDs (1-63)
  const testCases: TestCase[] = [
    // Physical Science Stream Tests (HIGHEST PRIORITY)
    {
      name: 'Physical Science - Combined Math, Physics, Chemistry',
      subjectIds: [6, 1, 2], // Combined Math (6), Physics (1), Chemistry (2)
      expectedStream: 'Physical Science Stream',
      description: 'Classic physical science combination'
    },
    {
      name: 'Physical Science - Higher Math, Physics, Chemistry', 
      subjectIds: [7, 1, 2], // Higher Math (7), Physics (1), Chemistry (2)
      expectedStream: 'Physical Science Stream',
      description: 'Higher mathematics with physical sciences'
    },
    {
      name: 'Physical Science - Higher Math, Combined Math, Physics', 
      subjectIds: [7, 6, 1], // Higher Math (7), Combined Math (6), Physics (1)
      expectedStream: 'Physical Science Stream',
      description: 'Mathematics and physics combination'
    },

    // Biological Science Stream Tests
    {
      name: 'Biological Science - Biology, Chemistry, Physics',
      subjectIds: [5, 2, 1], // Biology (5), Chemistry (2), Physics (1)
      expectedStream: 'Biological Science Stream',
      description: 'Biology with supporting sciences'
    },
    {
      name: 'Biological Science - Biology, Chemistry, Mathematics',
      subjectIds: [5, 2, 3], // Biology (5), Chemistry (2), Mathematics (3)
      expectedStream: 'Biological Science Stream', 
      description: 'Biology with chemistry and mathematics'
    },
    {
      name: 'Biological Science - Biology, Agricultural Science, Chemistry',
      subjectIds: [5, 4, 2], // Biology (5), Agricultural Science (4), Chemistry (2)
      expectedStream: 'Biological Science Stream', 
      description: 'Biology with agricultural science and chemistry'
    },

    // Commerce Stream Tests
    {
      name: 'Commerce - Business Studies, Economics, Accounting',
      subjectIds: [27, 17, 28], // Business Studies (27), Economics (17), Accounting (28)
      expectedStream: 'Commerce Stream',
      description: 'All three core commerce subjects'
    },
    {
      name: 'Commerce - Economics, Accounting, Geography',
      subjectIds: [17, 28, 18], // Economics (17), Accounting (28), Geography (18)
      expectedStream: 'Commerce Stream',
      description: 'Two core commerce + one supporting subject'
    },
    {
      name: 'Commerce - Business Studies, Economics, Combined Mathematics',
      subjectIds: [27, 17, 6], // Business Studies (27), Economics (17), Combined Mathematics (6)
      expectedStream: 'Commerce Stream',
      description: 'Two core commerce + mathematics'
    },

    // Technology Stream Tests
    {
      name: 'Engineering Technology',
      subjectIds: [47, 49, 17], // Engineering Technology (47), Science for Technology (49), Economics (17)
      expectedStream: 'Engineering Technology Stream',
      description: 'Engineering technology with supporting subject'
    },
    {
      name: 'Bio Systems Technology',
      subjectIds: [48, 49, 3], // Bio Systems Technology (48), Science for Technology (49), Mathematics (3)
      expectedStream: 'Bio Systems Technology Stream',
      description: 'Bio systems technology with mathematics'
    },

    // Arts Stream Tests (EXPLICIT ARTS CASES)
    {
      name: 'Arts - Three National Languages (Exception)',
      subjectIds: [50, 51, 52], // Sinhala (50), Tamil (51), English (52)
      expectedStream: 'Arts Stream',
      description: 'Exception: Three national languages'
    },
    {
      name: 'Arts - National + Classical Languages',
      subjectIds: [50, 53, 54], // Sinhala (50), Pali (53), Sanskrit (54)
      expectedStream: 'Arts Stream',
      description: 'Exception: One national + two classical languages'
    },
    {
      name: 'Arts - Two Languages + Religion',
      subjectIds: [50, 57, 29], // Sinhala (50), French (57), Buddhism (29)
      expectedStream: 'Arts Stream',
      description: 'Exception: Two languages + one religion'
    },
    {
      name: 'Arts - Geography, History, Political Science',
      subjectIds: [18, 21, 23], // Geography (18), History SL & India (21), Political Science (23)
      expectedStream: 'Arts Stream',
      description: 'Standard Arts: Three social sciences from basket01'
    },
    {
      name: 'Arts - Economics, Geography, Buddhism',
      subjectIds: [17, 18, 29], // Economics (17), Geography (18), Buddhism (29)
      expectedStream: 'Arts Stream',
      description: 'Standard Arts: Social sciences + religion'
    },
    {
      name: 'Arts - Political Science, Art, Music',
      subjectIds: [23, 38, 41], // Political Science (23), Art (38), Oriental Music (41)
      expectedStream: 'Arts Stream',
      description: 'Standard Arts: Social science + aesthetic subjects'
    },

    // Common Stream Tests (SHOULD NOT MATCH OTHER STREAMS)
    {
      name: 'Common - Physics, Economics, Buddhism',
      subjectIds: [1, 17, 29], // Physics (1), Economics (17), Buddhism (29)
      expectedStream: 'Common',
      description: 'Random mix: Science + Economics + Religion - not enough for Arts'
    },
    {
      name: 'Common - Chemistry, Business Studies, Art',
      subjectIds: [2, 27, 38], // Chemistry (2), Business Studies (27), Art (38)
      expectedStream: 'Common',
      description: 'Random mix: Science + Commerce + Aesthetic - no clear pattern'
    },
    {
      name: 'Common - Biology, Economics, French',
      subjectIds: [5, 17, 57], // Biology (5), Economics (17), French (57)
      expectedStream: 'Common',
      description: 'Random mix: Science + Economics + Language - not enough for any stream'
    },
    {
      name: 'Common - Art, Music, Dancing',
      subjectIds: [38, 41, 39], // Art (38), Oriental Music (41), Indigenous Dancing (39)
      expectedStream: 'Common',
      description: 'Pure aesthetic subjects without required social science base'
    },
    {
      name: 'Common - Only Economics from Arts subjects',
      subjectIds: [17, 1, 29], // Economics (17), Physics (1), Buddhism (29)
      expectedStream: 'Common',
      description: 'Only one subject (Economics) from Arts basket01, mixed with random subjects'
    },
    {
      name: 'Common - Mathematics, Agricultural Science, ICT',
      subjectIds: [3, 4, 16], // Mathematics (3), Agricultural Science (4), ICT (16)
      expectedStream: 'Common',
      description: 'Random mix that doesn\'t fit any specific stream criteria'
    }
  ];

  let passedTests = 0;
  let failedTests = 0;

  console.log(`\n🔬 Running ${testCases.length} test cases...\n`);

  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    
    try {
      console.log(`Test ${i + 1}: ${testCase.name}`);
      console.log(`   Subject IDs: [${testCase.subjectIds.join(', ')}] - ${testCase.description}`);
      
      // Classify the subjects
      const result = await streamClassificationService.classifySubjects(testCase.subjectIds);
      
      if (!result.isValid) {
        console.log(`   ❌ FAILED: Classification returned invalid result`);
        console.log(`      Errors: ${result.errors?.join(', ')}`);
        failedTests++;
        continue;
      }

      // Check if result matches expected stream
      if (result.streamName === testCase.expectedStream) {
        console.log(`   ✅ PASSED: Classified as ${result.streamName} (Rule: ${result.matchedRule})`);
        passedTests++;
      } else {
        console.log(`   ❌ FAILED: Expected ${testCase.expectedStream}, got ${result.streamName}`);
        console.log(`      Rule matched: ${result.matchedRule}`);
        failedTests++;
      }

    } catch (error) {
      console.log(`   ❌ FAILED: Error during classification - ${error}`);
      failedTests++;
    }

    console.log(''); // Empty line for readability
  }

  // Summary
  console.log('══════════════════════════════════════════════════════════════');
  console.log('🏁 Test Results Summary');
  console.log('══════════════════════════════════════════════════════════════');
  console.log(`✅ Passed: ${passedTests}/${testCases.length}`);
  console.log(`❌ Failed: ${failedTests}/${testCases.length}`);
  console.log(`📊 Success Rate: ${((passedTests / testCases.length) * 100).toFixed(1)}%`);
  
  if (failedTests === 0) {
    console.log('🎉 All tests passed! Stream classification is working correctly.');
  } else {
    console.log('⚠️  Some tests failed. Please review the classification logic.');
  }

  console.log('══════════════════════════════════════════════════════════════');
  
  return { passed: passedTests, failed: failedTests };
}

// Test specific edge cases
async function testEdgeCases() {
  console.log('\n🔍 Testing Edge Cases');
  console.log('─────────────────────────────────────────────');

  const edgeCases = [
    {
      name: 'Invalid subject count (2 subjects)',
      subjectIds: [1, 2],
      shouldFail: true
    },
    {
      name: 'Invalid subject count (4 subjects)', 
      subjectIds: [1, 2, 3, 4],
      shouldFail: true
    },
    {
      name: 'Non-existent subject IDs',
      subjectIds: [9999, 9998, 9997],
      shouldFail: true
    },
    {
      name: 'Duplicate subjects',
      subjectIds: [1, 1, 2],
      shouldFail: true
    },
    {
      name: 'Empty array',
      subjectIds: [],
      shouldFail: true
    }
  ];

  let passed = 0;
  let failed = 0;

  for (const testCase of edgeCases) {
    console.log(`\nTesting: ${testCase.name}`);
    console.log(`   Input: [${testCase.subjectIds.join(', ')}]`);
    
    try {
      const result = await streamClassificationService.classifySubjects(testCase.subjectIds);
      
      if (testCase.shouldFail && !result.isValid) {
        console.log(`   ✅ PASSED: Correctly rejected invalid input`);
        console.log(`      Errors: ${result.errors?.join(', ')}`);
        passed++;
      } else if (!testCase.shouldFail && result.isValid) {
        console.log(`   ✅ PASSED: Valid classification returned`);
        passed++;
      } else {
        console.log(`   ❌ FAILED: Unexpected result for edge case`);
        failed++;
      }
      
    } catch (error) {
      console.log(`   ❌ FAILED: Unexpected error - ${error}`);
      failed++;
    }
  }

  console.log('\n─────────────────────────────────────────────');
  console.log(`Edge Case Tests: ✅ ${passed} passed, ❌ ${failed} failed`);
  return { passed, failed };
}

// Quick sanity check
async function quickSanityCheck() {
  console.log('\n⚡ Quick Sanity Check');
  console.log('─────────────────────────────────────────────');
  
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Database connection: OK');
    
    // Test basic subject fetch
    const subjectCount = await prisma.subject.count({ where: { isActive: true, level: 'AL' } });
    console.log(`✅ A/L Subjects found: ${subjectCount}`);
    
    // Test stream count
    const streamCount = await prisma.stream.count({ where: { isActive: true } });
    console.log(`✅ Active streams found: ${streamCount}`);
    
    if (streamCount === 0) {
      console.log('❌ No streams found! Please run: npx ts-node scripts/insertStreams.ts');
      return false;
    }
    
    // Test simple classification
    const testResult = await streamClassificationService.classifySubjects([6, 1, 2]);
    console.log(`✅ Test classification: ${testResult.isValid ? 'Working' : 'Failed'}`);
    
    return true;
    
  } catch (error) {
    console.log('❌ Sanity check failed:', error);
    return false;
  }
}

// Additional function to test specific problematic combinations
async function testProblematicCombinations() {
  console.log('\n🔧 Testing Previously Problematic Combinations');
  console.log('─────────────────────────────────────────────');

  const problematicCases = [
    {
      name: 'Physics + Economics + Buddhism',
      subjectIds: [1, 17, 29],
      expectedStream: 'Common',
      reason: 'Mixed subjects from different domains - should not be Arts'
    },
    {
      name: 'Chemistry + Business Studies + Art', 
      subjectIds: [2, 27, 38],
      expectedStream: 'Common',
      reason: 'Random mix of science, commerce, and aesthetic'
    },
    {
      name: 'Only Economics as Arts subject',
      subjectIds: [17, 5, 1], // Economics + Biology + Physics
      expectedStream: 'Common',
      reason: 'Economics alone should not make it Arts stream'
    },
    {
      name: 'Legitimate Arts - Geography + History + Political Science',
      subjectIds: [18, 21, 23],
      expectedStream: 'Arts Stream',
      reason: 'Three proper social sciences from Arts basket01'
    },
    {
      name: 'Legitimate Arts - Economics + Geography + Buddhism',
      subjectIds: [17, 18, 29],
      expectedStream: 'Arts Stream',
      reason: 'Two from basket01 (social sciences) + one from basket02 (religion)'
    }
  ];

  let passed = 0;
  let failed = 0;

  for (const testCase of problematicCases) {
    console.log(`\nTesting: ${testCase.name}`);
    console.log(`   Subject IDs: [${testCase.subjectIds.join(', ')}]`);
    console.log(`   Reason: ${testCase.reason}`);
    
    try {
      const result = await streamClassificationService.classifySubjects(testCase.subjectIds);
      
      if (result.isValid && result.streamName === testCase.expectedStream) {
        console.log(`   ✅ PASSED: Correctly classified as ${result.streamName}`);
        console.log(`      Rule: ${result.matchedRule}`);
        passed++;
      } else {
        console.log(`   ❌ FAILED: Expected ${testCase.expectedStream}, got ${result.streamName}`);
        console.log(`      Rule: ${result.matchedRule}`);
        failed++;
      }
      
    } catch (error) {
      console.log(`   ❌ FAILED: Error - ${error}`);
      failed++;
    }
  }

  console.log('\n─────────────────────────────────────────────');
  console.log(`Problematic Case Tests: ✅ ${passed} passed, ❌ ${failed} failed`);
  return { passed, failed };
}

// Main test function
async function main() {
  try {
    console.log('🧪 Starting Stream Classification Test Suite');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log(`📅 Test started at: ${new Date().toISOString()}`);
    
    // Step 1: Quick sanity check
    const sanityOk = await quickSanityCheck();
    if (!sanityOk) {
      console.log('\n💥 Sanity check failed. Aborting tests.');
      return;
    }
    
    // Step 2: Show available streams
    const streamsOk = await showAvailableStreams();
    if (!streamsOk) {
      console.log('\n💥 No streams available. Aborting tests.');
      return;
    }
    
    // Step 3: Run main tests
    const basicTests = await runStreamClassificationTests();
    
    // Step 4: Run edge case tests
    const edgeTests = await testEdgeCases();
    
    // Step 5: Run problematic combination tests
    const problematicTests = await testProblematicCombinations();
    
    // Final summary
    const totalPassed = basicTests.passed + edgeTests.passed + problematicTests.passed;
    const totalFailed = basicTests.failed + edgeTests.failed + problematicTests.failed;
    const totalTests = totalPassed + totalFailed;
    
    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('🏆 FINAL TEST RESULTS');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log(`📊 Total Tests: ${totalTests}`);
    console.log(`✅ Passed: ${totalPassed}`);
    console.log(`❌ Failed: ${totalFailed}`);
    console.log(`📈 Success Rate: ${totalTests > 0 ? ((totalPassed / totalTests) * 100).toFixed(1) : 0}%`);
    
    console.log('\n📋 Test Category Breakdown:');
    console.log(`   🧪 Basic Classification: ${basicTests.passed}/${basicTests.passed + basicTests.failed}`);
    console.log(`   🔍 Edge Cases: ${edgeTests.passed}/${edgeTests.passed + edgeTests.failed}`);
    console.log(`   🔧 Problematic Cases: ${problematicTests.passed}/${problematicTests.passed + problematicTests.failed}`);
    
    if (totalFailed === 0) {
      console.log('\n🎉 ALL TESTS PASSED! 🎉');
      console.log('✨ Stream classification system is working perfectly!');
      console.log('🚀 Ready for production use.');
    } else {
      console.log(`\n⚠️  ${totalFailed} test(s) failed. Please review the issues above.`);
      
      if (problematicTests.failed > 0) {
        console.log('\n🔧 Specific Issues to Address:');
        console.log('   • Arts Stream classification may be too permissive');
        console.log('   • Consider strengthening Common Stream detection');
        console.log('   • Review subject combination logic for edge cases');
      }
    }
    
    console.log('\n🔗 Next Steps:');
    console.log('   1. If tests passed: Start server with `npm run dev`');
    console.log('   2. Test API: POST /api/streams/classify with {"subjectIds": [6,1,2]}');
    console.log('   3. Quick demo: GET /api/demo/classify/6/1/2');
    console.log('   4. Test problematic case: GET /api/demo/classify/1/17/29');
    console.log('═══════════════════════════════════════════════════════════════');
    
  } catch (error) {
    console.error('\n💥 Test execution failed:', error);
    console.log('\n🔧 Troubleshooting:');
    console.log('   1. Ensure database is running');
    console.log('   2. Check DATABASE_URL in .env file');
    console.log('   3. Run: npx prisma generate');
    console.log('   4. Run: npx ts-node scripts/insertStreams.ts');
    console.log('   5. Run: npx ts-node scripts/insertALSubjects.ts');
  } finally {
    console.log('\n🔌 Closing database connection...');
    await prisma.$disconnect();
    console.log('✅ Database connection closed gracefully');
  }
}

// Execute the main function
main();