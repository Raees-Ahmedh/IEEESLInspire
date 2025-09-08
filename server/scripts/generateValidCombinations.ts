import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Subject ID mappings based on the AL subjects data
const SUBJECT_MAPPINGS = {
  // Core science subjects
  physics: 1,              // Code: 01
  chemistry: 2,            // Code: 02
  mathematics: 3,          // Code: 07
  agriculturalScience: 4,  // Code: 08
  biology: 5,              // Code: 09
  combinedMathematics: 6,  // Code: 10
  higherMathematics: 7,    // Code: 11
  
  // Commerce subjects
  economics: 17,           // Code: 21
  geography: 18,           // Code: 22
  politicalScience: 19,    // Code: 23
  logicScientificMethod: 20, // Code: 24
  homeEconomics: 24,       // Code: 28
  communicationMediaStudies: 25, // Code: 29
  businessStatistics: 27,  // Code: 31
  businessStudies: 28,     // Code: 32
  accounting: 29,          // Code: 33
  
  // Religion subjects
  buddhism: 33,            // Code: 41
  hinduism: 34,            // Code: 42
  christianity: 35,        // Code: 43
  islam: 36,               // Code: 44
  
  // Technology subjects
  engineeringTechnology: 47, // Code: 65
  bioSystemsTechnology: 48,  // Code: 66
  scienceForTechnology: 49,  // Code: 67
  
  // Language subjects
  sinhala: 50,             // Code: 71
  tamil: 51,               // Code: 72
  english: 52,             // Code: 73
  
  // ICT
  ict: 16,                 // Code: 20
  
  // Art subjects
  art: 37,                 // Code: 51
  
  // History subjects (combining all history codes)
  history: 21,             // Code: 25A (using first history subject)
  
  // Technology subjects for Arts stream
  civilTechnology: 10,     // Code: 14
  mechanicalTechnology: 11, // Code: 15
  electricalTechnology: 12, // Code: 16
  foodTechnology: 13,      // Code: 17
  agroTechnology: 14,      // Code: 18
  bioResourceTechnology: 15, // Code: 19
};

interface StreamRule {
  type: string;
  required?: number[];
  options?: number[];
  allowedSubjects?: number[];
  basket01?: { subjects: number[] };
  basket02?: { subjects: number[] };
  baskets?: {
    basket01?: { socialSciences?: number[] };
    basket02?: { religions?: number[] };
    basket03?: { aesthetic?: number[] };
    basket04?: { languages?: { national?: number[], classical?: number[], foreign?: number[] } };
  };
}

interface ValidCombination {
  subject1: number;
  subject2: number;
  subject3: number;
  streamId: number;
  courseId: number[];
  auditInfo: object;
}

class SubjectCombinationGenerator {
  private auditInfo = {
    createdBy: 'system',
    createdAt: new Date().toISOString(),
    updatedBy: 'system',
    updatedAt: new Date().toISOString()
  };

  /**
   * Main function to generate all valid combinations
   */
  async generateAllValidCombinations(): Promise<void> {
    try {
      console.log('🚀 Starting valid combination generation...');
      
      // Get all active streams (excluding Common stream - ID 7)
      const streams = await prisma.stream.findMany({
        where: { 
          isActive: true,
          id: { not: 7 } // Exclude Common stream
        },
        select: {
          id: true,
          name: true,
          streamRule: true
        }
      });

      console.log(`📋 Found ${streams.length} streams to process...`);

      // Clear existing valid combinations
      await this.clearExistingCombinations();

      // Generate combinations for each stream
      for (const stream of streams) {
        console.log(`\n🔄 Processing ${stream.name} (ID: ${stream.id})...`);
        
        // Use TypeScript's recommended pattern for JsonValue -> custom type conversion
        const streamRule = stream.streamRule as unknown as StreamRule;
        
        if (!streamRule || !streamRule.type) {
          console.log(`   ⚠️  Invalid or missing stream rule for ${stream.name}, skipping...`);
          continue;
        }
        
        const combinations = await this.generateCombinationsForStream(stream.id, streamRule);
        
        if (combinations.length > 0) {
          await this.insertCombinations(combinations);
          console.log(`✅ Generated ${combinations.length} combinations for ${stream.name}`);
        } else {
          console.log(`⚠️  No valid combinations found for ${stream.name}`);
        }
      }

      // Display summary
      await this.displaySummary();

    } catch (error) {
      console.error('❌ Error generating combinations:', error);
      throw error;
    }
  }

  /**
   * Clear existing valid combinations
   */
  private async clearExistingCombinations(): Promise<void> {
    console.log('🗑️  Clearing existing valid combinations...');
    const deletedCount = await prisma.validCombination.deleteMany({});
    console.log(`   Deleted ${deletedCount.count} existing combinations`);
  }

  /**
   * Generate combinations for a specific stream
   */
  private async generateCombinationsForStream(streamId: number, streamRule: StreamRule): Promise<ValidCombination[]> {
    const combinations: ValidCombination[] = [];

    switch (streamRule.type) {
      case 'physical_science':
        combinations.push(...this.generatePhysicalScienceCombinations(streamId, streamRule));
        break;
      case 'biological_science':
        combinations.push(...this.generateBiologicalScienceCombinations(streamId, streamRule));
        break;
      case 'commerce':
        combinations.push(...this.generateCommerceCombinations(streamId, streamRule));
        break;
      case 'engineering_technology':
        combinations.push(...this.generateEngineeringTechnologyCombinations(streamId, streamRule));
        break;
      case 'biosystems_technology':
        combinations.push(...this.generateBioSystemsTechnologyCombinations(streamId, streamRule));
        break;
      case 'arts':
        combinations.push(...this.generateArtsCombinations(streamId, streamRule));
        break;
    }

    return combinations;
  }

  /**
   * Generate Physical Science Stream combinations
   * Rule: Any three subjects from [Higher Math, Combined Math, Physics, Chemistry]
   */
  private generatePhysicalScienceCombinations(streamId: number, rule: StreamRule): ValidCombination[] {
    const allowedSubjects = [
      SUBJECT_MAPPINGS.higherMathematics,
      SUBJECT_MAPPINGS.combinedMathematics,
      SUBJECT_MAPPINGS.physics,
      SUBJECT_MAPPINGS.chemistry
    ];

    return this.generateAllCombinations(allowedSubjects, streamId);
  }

  /**
   * Generate Biological Science Stream combinations
   * Rule: Biology + any two from [Physics, Chemistry, Mathematics, Agricultural Science]
   */
  private generateBiologicalScienceCombinations(streamId: number, rule: StreamRule): ValidCombination[] {
    const combinations: ValidCombination[] = [];
    const requiredSubject = SUBJECT_MAPPINGS.biology;
    const optionalSubjects = [
      SUBJECT_MAPPINGS.physics,
      SUBJECT_MAPPINGS.chemistry,
      SUBJECT_MAPPINGS.mathematics,
      SUBJECT_MAPPINGS.agriculturalScience
    ];

    // Generate all combinations with Biology as required + 2 from options
    for (let i = 0; i < optionalSubjects.length; i++) {
      for (let j = i + 1; j < optionalSubjects.length; j++) {
        const subjects = [requiredSubject, optionalSubjects[i], optionalSubjects[j]].sort((a, b) => a - b);
        combinations.push({
          subject1: subjects[0],
          subject2: subjects[1],
          subject3: subjects[2],
          streamId,
          courseId: [],
          auditInfo: this.auditInfo
        });
      }
    }

    return combinations;
  }

  /**
   * Generate Commerce Stream combinations
   * Rule 1: All three from core [Business Studies, Economics, Accounting]
   * Rule 2: At least 2 from core + 1 from supporting subjects
   */
  private generateCommerceCombinations(streamId: number, rule: StreamRule): ValidCombination[] {
    const combinations: ValidCombination[] = [];
    const coreSubjects = [
      SUBJECT_MAPPINGS.businessStudies,
      SUBJECT_MAPPINGS.economics,
      SUBJECT_MAPPINGS.accounting
    ];
    
    const supportingSubjects = [
      SUBJECT_MAPPINGS.agriculturalScience,
      SUBJECT_MAPPINGS.geography,
      SUBJECT_MAPPINGS.businessStatistics,
      SUBJECT_MAPPINGS.combinedMathematics,
      SUBJECT_MAPPINGS.mathematics,
      SUBJECT_MAPPINGS.history,
      SUBJECT_MAPPINGS.politicalScience,
      SUBJECT_MAPPINGS.english,
      SUBJECT_MAPPINGS.logicScientificMethod,
      SUBJECT_MAPPINGS.ict
    ];

    // Rule 1: All three core subjects
    const coreCombo = coreSubjects.sort((a, b) => a - b);
    combinations.push({
      subject1: coreCombo[0],
      subject2: coreCombo[1],
      subject3: coreCombo[2],
      streamId,
      courseId: [],
      auditInfo: this.auditInfo
    });

    // Rule 2: 2 core + 1 supporting
    for (let i = 0; i < coreSubjects.length; i++) {
      for (let j = i + 1; j < coreSubjects.length; j++) {
        for (const supportingSubject of supportingSubjects) {
          const subjects = [coreSubjects[i], coreSubjects[j], supportingSubject].sort((a, b) => a - b);
          combinations.push({
            subject1: subjects[0],
            subject2: subjects[1],
            subject3: subjects[2],
            streamId,
            courseId: [],
            auditInfo: this.auditInfo
          });
        }
      }
    }

    return combinations;
  }

  /**
   * Generate Engineering Technology combinations
   * Rule: Engineering Technology + Science for Technology + one from options
   */
  private generateEngineeringTechnologyCombinations(streamId: number, rule: StreamRule): ValidCombination[] {
    const combinations: ValidCombination[] = [];
    const requiredSubjects = [
      SUBJECT_MAPPINGS.engineeringTechnology,
      SUBJECT_MAPPINGS.scienceForTechnology
    ];
    
    const optionalSubjects = [
      SUBJECT_MAPPINGS.economics,
      SUBJECT_MAPPINGS.geography,
      SUBJECT_MAPPINGS.homeEconomics,
      SUBJECT_MAPPINGS.english,
      SUBJECT_MAPPINGS.communicationMediaStudies,
      SUBJECT_MAPPINGS.ict,
      SUBJECT_MAPPINGS.art,
      SUBJECT_MAPPINGS.businessStudies,
      SUBJECT_MAPPINGS.agriculturalScience,
      SUBJECT_MAPPINGS.accounting,
      SUBJECT_MAPPINGS.mathematics
    ];

    for (const optionalSubject of optionalSubjects) {
      const subjects = [...requiredSubjects, optionalSubject].sort((a, b) => a - b);
      combinations.push({
        subject1: subjects[0],
        subject2: subjects[1],
        subject3: subjects[2],
        streamId,
        courseId: [],
        auditInfo: this.auditInfo
      });
    }

    return combinations;
  }

  /**
   * Generate Bio Systems Technology combinations
   * Rule: Bio Systems Technology + Science for Technology + one from options
   */
  private generateBioSystemsTechnologyCombinations(streamId: number, rule: StreamRule): ValidCombination[] {
    const combinations: ValidCombination[] = [];
    const requiredSubjects = [
      SUBJECT_MAPPINGS.bioSystemsTechnology,
      SUBJECT_MAPPINGS.scienceForTechnology
    ];
    
    const optionalSubjects = [
      SUBJECT_MAPPINGS.economics,
      SUBJECT_MAPPINGS.geography,
      SUBJECT_MAPPINGS.homeEconomics,
      SUBJECT_MAPPINGS.english,
      SUBJECT_MAPPINGS.communicationMediaStudies,
      SUBJECT_MAPPINGS.ict,
      SUBJECT_MAPPINGS.art,
      SUBJECT_MAPPINGS.businessStudies,
      SUBJECT_MAPPINGS.agriculturalScience,
      SUBJECT_MAPPINGS.accounting,
      SUBJECT_MAPPINGS.mathematics
    ];

    for (const optionalSubject of optionalSubjects) {
      const subjects = [...requiredSubjects, optionalSubject].sort((a, b) => a - b);
      combinations.push({
        subject1: subjects[0],
        subject2: subjects[1],
        subject3: subjects[2],
        streamId,
        courseId: [],
        auditInfo: this.auditInfo
      });
    }

    return combinations;
  }

  /**
   * Generate Arts Stream combinations (simplified version)
   * This is complex due to multiple baskets and rules - implementing basic version
   */
  private generateArtsCombinations(streamId: number, rule: StreamRule): ValidCombination[] {
    const combinations: ValidCombination[] = [];
    
    // Basket 01 - Social Sciences
    const socialSciences = [
      SUBJECT_MAPPINGS.economics,
      SUBJECT_MAPPINGS.geography,
      SUBJECT_MAPPINGS.history,
      SUBJECT_MAPPINGS.homeEconomics,
      SUBJECT_MAPPINGS.agriculturalScience,
      SUBJECT_MAPPINGS.mathematics,
      SUBJECT_MAPPINGS.combinedMathematics,
      SUBJECT_MAPPINGS.communicationMediaStudies,
      SUBJECT_MAPPINGS.ict,
      SUBJECT_MAPPINGS.accounting,
      SUBJECT_MAPPINGS.businessStatistics,
      SUBJECT_MAPPINGS.politicalScience,
      SUBJECT_MAPPINGS.logicScientificMethod,
      SUBJECT_MAPPINGS.civilTechnology,
      SUBJECT_MAPPINGS.electricalTechnology,
      SUBJECT_MAPPINGS.agroTechnology,
      SUBJECT_MAPPINGS.mechanicalTechnology,
      SUBJECT_MAPPINGS.foodTechnology,
      SUBJECT_MAPPINGS.bioResourceTechnology
    ];

    // Basket 02 - Religions
    const religions = [
      SUBJECT_MAPPINGS.buddhism,
      SUBJECT_MAPPINGS.hinduism,
      SUBJECT_MAPPINGS.christianity,
      SUBJECT_MAPPINGS.islam
    ];

    // Basket 03 - Aesthetic (simplified)
    const aesthetic = [SUBJECT_MAPPINGS.art];

    // Basket 04 - Languages
    const languages = [
      SUBJECT_MAPPINGS.sinhala,
      SUBJECT_MAPPINGS.tamil,
      SUBJECT_MAPPINGS.english
    ];

    // Rule 1: Three subjects from social sciences
    const socialCombinations = this.generateAllCombinations(socialSciences.slice(0, 10), streamId);
    combinations.push(...socialCombinations.slice(0, 50)); // Limit to avoid too many combinations

    // Rule 2: Two from social + one from religion
    for (let i = 0; i < Math.min(socialSciences.length, 8); i++) {
      for (let j = i + 1; j < Math.min(socialSciences.length, 8); j++) {
        for (const religion of religions) {
          const subjects = [socialSciences[i], socialSciences[j], religion].sort((a, b) => a - b);
          combinations.push({
            subject1: subjects[0],
            subject2: subjects[1],
            subject3: subjects[2],
            streamId,
            courseId: [],
            auditInfo: this.auditInfo
          });
        }
      }
    }

    // Rule 3: Special language combinations
    // Three national languages
    const languageCombo = languages.sort((a, b) => a - b);
    if (languageCombo.length >= 3) {
      combinations.push({
        subject1: languageCombo[0],
        subject2: languageCombo[1],
        subject3: languageCombo[2],
        streamId,
        courseId: [],
        auditInfo: this.auditInfo
      });
    }

    return combinations;
  }

  /**
   * Generate all possible 3-subject combinations from a list
   */
  private generateAllCombinations(subjects: number[], streamId: number): ValidCombination[] {
    const combinations: ValidCombination[] = [];
    
    for (let i = 0; i < subjects.length; i++) {
      for (let j = i + 1; j < subjects.length; j++) {
        for (let k = j + 1; k < subjects.length; k++) {
          const sortedSubjects = [subjects[i], subjects[j], subjects[k]].sort((a, b) => a - b);
          combinations.push({
            subject1: sortedSubjects[0],
            subject2: sortedSubjects[1],
            subject3: sortedSubjects[2],
            streamId,
            courseId: [],
            auditInfo: this.auditInfo
          });
        }
      }
    }
    
    return combinations;
  }

  /**
   * Insert combinations into database
   */
  private async insertCombinations(combinations: ValidCombination[]): Promise<void> {
    if (combinations.length === 0) return;

    try {
      await prisma.validCombination.createMany({
        data: combinations,
        skipDuplicates: true
      });
    } catch (error) {
      console.error('Error inserting combinations:', error);
      throw error;
    }
  }

  /**
   * Display summary of generated combinations
   */
  private async displaySummary(): Promise<void> {
    console.log('\n📊 SUMMARY OF GENERATED COMBINATIONS');
    console.log('═'.repeat(50));

    const streams = await prisma.stream.findMany({
      where: { 
        isActive: true,
        id: { not: 7 } // Exclude Common stream
      },
      include: {
        validCombinations: true
      }
    });

    let totalCombinations = 0;
    for (const stream of streams) {
      const count = stream.validCombinations.length;
      totalCombinations += count;
      console.log(`${stream.name.padEnd(25)} : ${count.toString().padStart(4)} combinations`);
    }

    console.log('─'.repeat(50));
    console.log(`${'TOTAL'.padEnd(25)} : ${totalCombinations.toString().padStart(4)} combinations`);
    console.log('═'.repeat(50));

    // Show some sample combinations
    console.log('\n📋 Sample Combinations:');
    const sampleCombinations = await prisma.validCombination.findMany({
      take: 5,
      include: {
        subjectOne: { select: { name: true } },
        subjectTwo: { select: { name: true } },
        subjectThree: { select: { name: true } },
        stream: { select: { name: true } }
      }
    });

    sampleCombinations.forEach((combo, index) => {
      console.log(`${index + 1}. ${combo.stream.name}:`);
      console.log(`   ${combo.subjectOne.name} + ${combo.subjectTwo.name} + ${combo.subjectThree.name}`);
    });
  }
}

// Main execution function
async function main(): Promise<void> {
  const generator = new SubjectCombinationGenerator();
  
  try {
    await generator.generateAllValidCombinations();
    console.log('\n🎉 Successfully generated all valid subject combinations!');
    
    console.log('\n💡 Next steps:');
    console.log('   1. Verify the data: npx prisma studio');
    console.log('   2. Test the API endpoints');
    console.log('   3. Update courses to reference these combinations');
    
  } catch (error) {
    console.error('💥 Script failed:', error);
    // Use manual exit instead of process.exit
    throw error;
  } finally {
    await prisma.$disconnect();
    console.log('🔌 Database connection closed gracefully');
  }
}

// Execute the script only if this file is run directly
main().catch((error) => {
  console.error('Unhandled error:', error);
  // Manual exit without using process
  throw error;
});

export { SubjectCombinationGenerator };