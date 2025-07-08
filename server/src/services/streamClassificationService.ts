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
          errors: [`Found non-A/L: ${nonALSubjects.map(s => s.name).join(', ')}`]
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
    // Access the nested baskets structure
    const baskets = rule.baskets;
    if (!baskets) return { matches: false };

    const basket01 = baskets.basket01?.subjects || [];
    const basket02 = baskets.basket02?.subjects || [];
    const basket03 = baskets.basket03?.subjects || [];
    const nationalLanguages = baskets.basket04?.national || [];
    const classicalLanguages = baskets.basket04?.classical || [];
    const foreignLanguages = baskets.basket04?.foreign || [];

    // Count subjects in each basket
    const basket01Count = subjectIds.filter(id => basket01.includes(id)).length;
    const basket02Count = subjectIds.filter(id => basket02.includes(id)).length;
    const basket03Count = subjectIds.filter(id => basket03.includes(id)).length;
    const nationalLangCount = subjectIds.filter(id => nationalLanguages.includes(id)).length;
    const classicalLangCount = subjectIds.filter(id => classicalLanguages.includes(id)).length;
    const foreignLangCount = subjectIds.filter(id => foreignLanguages.includes(id)).length;

    // Exception 1: Three national languages
    if (nationalLangCount === 3) {
      return { matches: true, rule: 'three_national_languages' };
    }

    // Exception 2: At least one national language + classical languages
    if (nationalLangCount >= 1 && classicalLangCount >= 1 && nationalLangCount + classicalLangCount === 3) {
      return { matches: true, rule: 'national_plus_classical_languages' };
    }

    // Exception 3: Two languages + one religion/aesthetic
    const totalLanguages = nationalLangCount + classicalLangCount + foreignLangCount;
    if (totalLanguages === 2 && (basket02Count === 1 || basket03Count === 1) && totalLanguages + basket02Count + basket03Count === 3) {
      return { matches: true, rule: 'two_languages_one_religion_aesthetic' };
    }

    // Standard Arts Rules
    const totalValidSubjects = basket01Count + basket02Count + basket03Count;

    // Rule 1: All three from basket01 (social sciences)
    if (basket01Count === 3) {
      return { matches: true, rule: 'three_social_sciences' };
    }

    // Rule 2: Two from basket01 + one from basket02 (religion)
    if (basket01Count === 2 && basket02Count === 1) {
      return { matches: true, rule: 'two_social_one_religion' };
    }

    // Rule 3: Two from basket01 + one from basket03 (aesthetic)
    if (basket01Count === 2 && basket03Count === 1) {
      return { matches: true, rule: 'two_social_one_aesthetic' };
    }

    // Rule 4: One from basket01 + one from basket02 + one from basket03
    if (basket01Count === 1 && basket02Count === 1 && basket03Count === 1) {
      return { matches: true, rule: 'one_social_one_religion_one_aesthetic' };
    }

    // Rule 5: One from basket01 + two from basket02 (religion)
    if (basket01Count === 1 && basket02Count === 2) {
      return { matches: true, rule: 'one_social_two_religion' };
    }

    // Rule 6: One from basket01 + two from basket03 (aesthetic)
    if (basket01Count === 1 && basket03Count === 2) {
      return { matches: true, rule: 'one_social_two_aesthetic' };
    }

    return { matches: false };
  }

  /**
   * Check Commerce Stream rules
   */
  private checkCommerceStream(subjectIds: number[], rule: StreamRule): {matches: boolean, rule?: string} {
    const basket01 = rule.basket01?.subjects || []; // [Business Studies, Economics, Accounting]
    const basket02 = rule.basket02?.subjects || [];
    
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
    const required = rule.required || []; // [Biology]
    const options = rule.options || []; // [Physics, Chemistry, Mathematics, Agricultural Science]
    
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
    const allowedSubjects = rule.allowedSubjects || []; // [Higher Math, Combined Math, Physics, Chemistry]
    
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
    const required = rule.required || []; // [Engineering Technology, Science for Technology]
    const options = rule.options || [];
    
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
    const required = rule.required || []; // [Biosystems Technology, Science for Technology]
    const options = rule.options || [];
    
    const hasAllRequired = required.every((id: number) => subjectIds.includes(id));
    const hasOption = subjectIds.some(id => options.includes(id));
    const validCount = subjectIds.filter(id => required.includes(id) || options.includes(id)).length;

    if (hasAllRequired && hasOption && validCount === 3) {
      return { matches: true, rule: 'biosystems_tech_combination' };
    }

    return { matches: false };
  }

  /**
   * NEW: Get subjects available for a specific stream
   */
  async getSubjectsByStream(streamId: number) {
    try {
      // Get the stream and its rules
      const stream = await prisma.stream.findUnique({
        where: { id: streamId },
        select: {
          id: true,
          name: true,
          streamRule: true,
          isActive: true
        }
      });

      if (!stream || !stream.isActive) {
        return null;
      }

      const streamRule = stream.streamRule as StreamRule;
      let subjectIds: number[] = [];

      // Special handling for Common stream - show all AL subjects
      if (streamRule.type === 'common' || stream.name === 'Common') {
        const allALSubjects = await prisma.subject.findMany({
          where: {
            level: 'AL',
            isActive: true
          },
          select: {
            id: true,
            code: true,
            name: true,
            level: true
          },
          orderBy: {
            name: 'asc'
          }
        });
        return allALSubjects;
      }

      subjectIds = this.extractSubjectIdsFromRule(streamRule);

      if (subjectIds.length === 0) {
        return [];
      }

      // Get the actual subject objects
      const subjects = await prisma.subject.findMany({
        where: {
          id: { in: subjectIds },
          level: 'AL',
          isActive: true
        },
        select: {
          id: true,
          code: true,
          name: true,
          level: true
        },
        orderBy: {
          name: 'asc'
        }
      });

      return subjects;

    } catch (error) {
      console.error('Error fetching subjects for stream:', error);
      throw error;
    }
  }

  /**
   * Helper function to extract subject IDs from stream rules
   */
  private extractSubjectIdsFromRule(streamRule: StreamRule): number[] {
    const subjectIds: number[] = [];

    switch (streamRule.type) {
      case 'physical_science':
        if (streamRule.allowedSubjects) {
          subjectIds.push(...streamRule.allowedSubjects);
        }
        break;

      case 'biological_science':
        if (streamRule.required) {
          subjectIds.push(...streamRule.required);
        }
        if (streamRule.options) {
          subjectIds.push(...streamRule.options);
        }
        break;

      case 'commerce':
        if (streamRule.basket01?.subjects) {
          subjectIds.push(...streamRule.basket01.subjects);
        }
        if (streamRule.basket02?.subjects) {
          subjectIds.push(...streamRule.basket02.subjects);
        }
        break;

      case 'engineering_technology':
        if (streamRule.required) {
          subjectIds.push(...streamRule.required);
        }
        if (streamRule.options) {
          subjectIds.push(...streamRule.options);
        }
        break;

      case 'biosystems_technology':
        if (streamRule.required) {
          subjectIds.push(...streamRule.required);
        }
        if (streamRule.options) {
          subjectIds.push(...streamRule.options);
        }
        break;

      case 'arts':
        if (streamRule.baskets) {
          // Access the nested baskets structure
          if (streamRule.baskets.basket01?.subjects) {
            subjectIds.push(...streamRule.baskets.basket01.subjects);
          }
          if (streamRule.baskets.basket02?.subjects) {
            subjectIds.push(...streamRule.baskets.basket02.subjects);
          }
          if (streamRule.baskets.basket03?.subjects) {
            subjectIds.push(...streamRule.baskets.basket03.subjects);
          }
          if (streamRule.baskets.basket04) {
            if (streamRule.baskets.basket04.national) {
              subjectIds.push(...streamRule.baskets.basket04.national);
            }
            if (streamRule.baskets.basket04.classical) {
              subjectIds.push(...streamRule.baskets.basket04.classical);
            }
            if (streamRule.baskets.basket04.foreign) {
              subjectIds.push(...streamRule.baskets.basket04.foreign);
            }
          }
        }
        break;

      default:
        // For common stream, return all AL subjects
        if (streamRule.type === 'common') {
          // We'll return an empty array here and handle it specially in getSubjectsByStream
          return [];
        }
        break;
    }

    // Remove duplicates and return
    return [...new Set(subjectIds)];
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