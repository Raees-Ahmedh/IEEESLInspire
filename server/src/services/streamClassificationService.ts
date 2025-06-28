// src/services/streamClassificationService.ts
import { prisma } from '../config/database';

interface StreamClassificationResult {
  streamId: number | null;
  streamName: string | null;
  isValid: boolean;
  matchedRule?: string;
  errors?: string[];
}

interface StreamRule {
  type: string;
  [key: string]: any;
}

class StreamClassificationService {
  
  /**
   * Main function to classify a 3-subject combination
   */
  async classifySubjects(subjectIds: number[]): Promise<StreamClassificationResult> {
    try {
      // Validate input
      if (!Array.isArray(subjectIds) || subjectIds.length !== 3) {
        return {
          streamId: null,
          streamName: null,
          isValid: false,
          errors: ['Exactly 3 subjects must be provided']
        };
      }

      // Remove duplicates and validate all are numbers
      const uniqueSubjectIds = [...new Set(subjectIds)];
      if (uniqueSubjectIds.length !== 3) {
        return {
          streamId: null,
          streamName: null,
          isValid: false,
          errors: ['All 3 subjects must be different']
        };
      }

      // Check if all subjects exist and are active
      const subjects = await this.getSubjectsByIds(subjectIds);
      if (subjects.length !== 3) {
        const foundIds = subjects.map(s => s.id);
        const missingIds = subjectIds.filter(id => !foundIds.includes(id));
        return {
          streamId: null,
          streamName: null,
          isValid: false,
          errors: [`Subject(s) with ID(s) ${missingIds.join(', ')} not found or inactive`]
        };
      }

      // Verify all subjects are A/L level
      const nonALSubjects = subjects.filter(s => s.level !== 'AL');
      if (nonALSubjects.length > 0) {
        return {
          streamId: null,
          streamName: null,
          isValid: false,
          errors: [`Subjects must be A/L level. Found non-A/L: ${nonALSubjects.map(s => s.name).join(', ')}`]
        };
      }

      // Get streams in specific order - most specific first, Arts and Common last
      const streams = await prisma.stream.findMany({
        where: { isActive: true },
        orderBy: { id: 'asc' }
      });

      // Define processing order (most specific to least specific)
      const streamOrder = [
        'physical_science',
        'biological_science', 
        'engineering_technology',
        'biosystems_technology',
        'commerce',
        'arts'  // Arts last as it's most permissive
      ];

      // Check streams in priority order
      for (const streamType of streamOrder) {
        const stream = streams.find(s => {
          const rule = s.streamRule as StreamRule;
          return rule.type === streamType;
        });
        
        if (stream) {
          const isMatch = await this.checkStreamMatch(subjectIds, stream.streamRule as StreamRule);
          if (isMatch.matches) {
            return {
              streamId: stream.id,
              streamName: stream.name,
              isValid: true,
              matchedRule: isMatch.rule
            };
          }
        }
      }

      // If no specific stream matches, return Common
      const commonStream = streams.find(s => s.name === 'Common');
      return {
        streamId: commonStream?.id || null,
        streamName: 'Common',
        isValid: true,
        matchedRule: 'fallback'
      };

    } catch (error) {
      console.error('Error in stream classification:', error);
      return {
        streamId: null,
        streamName: null,
        isValid: false,
        errors: ['Internal error during classification']
      };
    }
  }

  /**
   * Check if subjects match a specific stream's rules
   */
  private async checkStreamMatch(subjectIds: number[], streamRule: StreamRule): Promise<{matches: boolean, rule?: string}> {
    switch (streamRule.type) {
      case 'physical_science':
        return this.checkPhysicalScienceStream(subjectIds, streamRule);
      case 'biological_science':
        return this.checkBiologicalScienceStream(subjectIds, streamRule);
      case 'commerce':
        return this.checkCommerceStream(subjectIds, streamRule);
      case 'engineering_technology':
        return this.checkEngineeringTechnologyStream(subjectIds, streamRule);
      case 'biosystems_technology':
        return this.checkBiosystemsTechnologyStream(subjectIds, streamRule);
      case 'arts':
        return this.checkArtsStream(subjectIds, streamRule);
      default:
        return { matches: false };
    }
  }

  /**
   * Check Arts Stream rules - MUCH MORE RESTRICTIVE
   */
  private checkArtsStream(subjectIds: number[], rule: StreamRule): {matches: boolean, rule?: string} {
    const baskets = rule.baskets;
    
    // FIRST: Check explicit exceptions (these are definitely Arts)
    if (rule.exceptions) {
      // Exception 1: Three national languages
      const nationalLangs = baskets.basket04.national;
      if (this.arrayEquals(subjectIds.sort(), nationalLangs.sort())) {
        return { matches: true, rule: 'three_national_languages' };
      }

      // Exception 2: National + Classical languages combination  
      const nationalCount = subjectIds.filter(id => nationalLangs.includes(id)).length;
      const classicalCount = subjectIds.filter(id => baskets.basket04.classical.includes(id)).length;
      
      if (nationalCount >= 1 && classicalCount <= 2 && nationalCount + classicalCount === 3) {
        return { matches: true, rule: 'national_classical_mix' };
      }

      // Exception 3: Two languages + one religion/aesthetic
      const allLanguages = [...baskets.basket04.national, ...baskets.basket04.classical, ...baskets.basket04.foreign];
      const languageCount = subjectIds.filter(id => allLanguages.includes(id)).length;
      const religionAestheticSubjects = [...baskets.basket02.subjects, ...baskets.basket03.subjects];
      const religionAestheticCount = subjectIds.filter(id => religionAestheticSubjects.includes(id)).length;
      
      if (languageCount === 2 && religionAestheticCount === 1) {
        return { matches: true, rule: 'two_languages_plus_religion_aesthetic' };
      }
    }

    // STRICT REJECTION: Combinations that clearly belong to other streams
    const physicalScienceSubjects = [7, 6, 1, 2]; // Higher Math, Combined Math, Physics, Chemistry
    const biologicalScienceSubjects = [5, 1, 2, 3, 4]; // Biology + support subjects
    const commerceCore = [27, 17, 28]; // Business Studies, Economics, Accounting
    const techSubjects = [47, 48, 49]; // Technology subjects
    
    // Count subjects from each domain
    const physicalScienceCount = subjectIds.filter(id => physicalScienceSubjects.includes(id)).length;
    const bioScienceCount = subjectIds.filter(id => biologicalScienceSubjects.includes(id)).length;
    const commerceCoreCount = subjectIds.filter(id => commerceCore.includes(id)).length;
    const techCount = subjectIds.filter(id => techSubjects.includes(id)).length;

    // HARD REJECTION RULES - these combinations should NEVER be Arts
    if (physicalScienceCount >= 2) return { matches: false }; // 2+ physical science subjects
    if (bioScienceCount >= 2 && subjectIds.includes(5)) return { matches: false }; // Biology + science support
    if (commerceCoreCount >= 2) return { matches: false }; // 2+ core commerce subjects
    if (techCount >= 2) return { matches: false }; // 2+ technology subjects

    // NEW STRICT RULE: Check if this is a genuine Arts-focused combination
    const basket01Count = subjectIds.filter(id => baskets.basket01.subjects.includes(id)).length;
    const basket02Count = subjectIds.filter(id => baskets.basket02.subjects.includes(id)).length;
    const basket03Count = subjectIds.filter(id => baskets.basket03.subjects.includes(id)).length;
    const basket04Count = subjectIds.filter(id => [...baskets.basket04.national, ...baskets.basket04.classical, ...baskets.basket04.foreign].includes(id)).length;

    // Total subjects that belong to Arts stream
    const totalArtsSubjects = basket01Count + basket02Count + basket03Count + basket04Count;
    
    // VERY STRICT ARTS CRITERIA:
    // 1. Must have at least 2 subjects from basket01 (Social Sciences) OR
    // 2. Must have at least 1 from basket01 AND the combination must be predominantly Arts subjects (all 3 subjects are Arts)
    
    const isPredomminantlyArts = totalArtsSubjects === 3; // All subjects are Arts subjects
    const hasStrongSocialScienceBase = basket01Count >= 2; // At least 2 social sciences
    const hasMinimalArtsBase = basket01Count >= 1 && isPredomminantlyArts; // 1 social science but all subjects are Arts
    
    // REJECT: Mixed combinations with only 1 Arts subject from basket01
    if (basket01Count === 1 && !isPredomminantlyArts) {
      return { matches: false }; // Single Economics/Geography etc. with non-Arts subjects
    }
    
    // REJECT: Combinations with less than 2 Arts subjects total
    if (totalArtsSubjects < 2) {
      return { matches: false };
    }

    // CHECK: Valid Arts combinations
    if (hasStrongSocialScienceBase || hasMinimalArtsBase) {
      // Verify basket constraints
      if (basket02Count <= 2 && this.checkReligionCivilizationConstraints(subjectIds, baskets.basket02)) {
        if (basket03Count <= 2 && this.checkAestheticConstraints(subjectIds, baskets.basket03)) {
          if (basket04Count <= 2) {
            // Additional check: Make sure it's not a random mix
            const nonArtsSubjectCount = 3 - totalArtsSubjects;
            
            // If there are non-Arts subjects, they should not be from clearly defined other streams
            if (nonArtsSubjectCount > 0) {
              const nonArtsSubjects = subjectIds.filter(id => {
                const allArtsSubjects = [
                  ...baskets.basket01.subjects,
                  ...baskets.basket02.subjects, 
                  ...baskets.basket03.subjects,
                  ...baskets.basket04.national,
                  ...baskets.basket04.classical,
                  ...baskets.basket04.foreign
                ];
                return !allArtsSubjects.includes(id);
              });
              
              // Check if non-Arts subjects belong to other streams
              for (const subjectId of nonArtsSubjects) {
                if (physicalScienceSubjects.includes(subjectId) || 
                    biologicalScienceSubjects.includes(subjectId) ||
                    commerceCore.includes(subjectId) ||
                    techSubjects.includes(subjectId)) {
                  // This subject clearly belongs to another stream
                  return { matches: false };
                }
              }
            }
            
            return { matches: true, rule: 'standard_arts_combination' };
          }
        }
      }
    }

    return { matches: false };
  }

  /**
   * Check Commerce Stream rules
   */
  private checkCommerceStream(subjectIds: number[], rule: StreamRule): {matches: boolean, rule?: string} {
    const basket01 = rule.basket01.subjects; // [Business Studies, Economics, Accounting]
    const basket02 = rule.basket02.subjects;
    
    const basket01Count = subjectIds.filter(id => basket01.includes(id)).length;
    const basket02Count = subjectIds.filter(id => basket02.includes(id)).length;

    // Rule 1: All three from basket01
    if (basket01Count === 3) {
      return { matches: true, rule: 'all_from_core_commerce' };
    }

    // Rule 2: At least 2 from basket01, 1 from basket02
    if (basket01Count >= 2 && basket02Count >= 1 && basket01Count + basket02Count === 3) {
      return { matches: true, rule: 'two_core_one_supporting' };
    }

    return { matches: false };
  }

  /**
   * Check Biological Science Stream rules
   */
  private checkBiologicalScienceStream(subjectIds: number[], rule: StreamRule): {matches: boolean, rule?: string} {
    const required = rule.required; // [Biology]
    const options = rule.options; // [Physics, Chemistry, Mathematics, Agricultural Science]
    
    const hasRequired = required.every((id: number) => subjectIds.includes(id));
    const optionCount = subjectIds.filter(id => options.includes(id)).length;
    const totalValidSubjects = subjectIds.filter(id => required.includes(id) || options.includes(id)).length;

    if (hasRequired && optionCount >= 2 && totalValidSubjects === 3) {
      return { matches: true, rule: 'biology_plus_two_sciences' };
    }

    return { matches: false };
  }

  /**
   * Check Physical Science Stream rules
   */
  private checkPhysicalScienceStream(subjectIds: number[], rule: StreamRule): {matches: boolean, rule?: string} {
    const allowedSubjects = rule.allowedSubjects; // [Higher Math, Combined Math, Physics, Chemistry]
    
    const validCount = subjectIds.filter(id => allowedSubjects.includes(id)).length;
    
    if (validCount === 3) {
      return { matches: true, rule: 'three_physical_sciences' };
    }

    return { matches: false };
  }

  /**
   * Check Engineering Technology Stream rules
   */
  private checkEngineeringTechnologyStream(subjectIds: number[], rule: StreamRule): {matches: boolean, rule?: string} {
    const required = rule.required; // [Engineering Technology, Science for Technology]
    const options = rule.options;
    
    const hasAllRequired = required.every((id: number) => subjectIds.includes(id));
    const hasOption = subjectIds.some(id => options.includes(id));
    const validCount = subjectIds.filter(id => required.includes(id) || options.includes(id)).length;

    if (hasAllRequired && hasOption && validCount === 3) {
      return { matches: true, rule: 'engineering_tech_combination' };
    }

    return { matches: false };
  }

  /**
   * Check Biosystems Technology Stream rules
   */
  private checkBiosystemsTechnologyStream(subjectIds: number[], rule: StreamRule): {matches: boolean, rule?: string} {
    const required = rule.required; // [Biosystems Technology, Science for Technology]
    const options = rule.options;
    
    const hasAllRequired = required.every((id: number) => subjectIds.includes(id));
    const hasOption = subjectIds.some(id => options.includes(id));
    const validCount = subjectIds.filter(id => required.includes(id) || options.includes(id)).length;

    if (hasAllRequired && hasOption && validCount === 3) {
      return { matches: true, rule: 'biosystems_tech_combination' };
    }

    return { matches: false };
  }

  /**
   * Helper function to check religion-civilization constraints
   */
  private checkReligionCivilizationConstraints(subjectIds: number[], basket02: any): boolean {
    // Get subject codes to check exclusions
    const exclusions = basket02.exclusions || [];
    
    for (const exclusion of exclusions) {
      const hasIf = exclusion.if.some((id: number) => subjectIds.includes(id));
      const hasExcluded = exclusion.then_exclude.some((id: number) => subjectIds.includes(id));
      
      if (hasIf && hasExcluded) {
        return false; // Violated exclusion rule
      }
    }
    
    return true;
  }

  /**
   * Helper function to check aesthetic study constraints
   */
  private checkAestheticConstraints(subjectIds: number[], basket03: any): boolean {
    const areaConstraints = basket03.areaConstraints || [];
    
    for (const constraint of areaConstraints) {
      const countInArea = subjectIds.filter(id => constraint.subjects.includes(id)).length;
      if (countInArea > constraint.maxFromArea) {
        return false;
      }
    }
    
    return true;
  }

  /**
   * Helper function to check array equality
   */
  private arrayEquals(a: number[], b: number[]): boolean {
    return a.length === b.length && a.every(val => b.includes(val));
  }

  /**
   * Get all available streams
   */
  async getAllStreams() {
    return await prisma.stream.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        streamRule: true
      },
      orderBy: { id: 'asc' }
    });
  }

  /**
   * Get subjects by IDs for validation
   */
  async getSubjectsByIds(subjectIds: number[]) {
    return await prisma.subject.findMany({
      where: { 
        id: { in: subjectIds },
        isActive: true 
      },
      select: { id: true, code: true, name: true, level: true }
    });
  }

  /**
   * Get stream details by ID
   */
  async getStreamById(streamId: number) {
    return await prisma.stream.findUnique({
      where: { id: streamId },
      select: {
        id: true,
        name: true,
        streamRule: true,
        isActive: true
      }
    });
  }
}

export const streamClassificationService = new StreamClassificationService();
export default streamClassificationService;