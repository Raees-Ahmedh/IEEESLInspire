import { prisma } from '../config/database';
import { Prisma } from '@prisma/client';

export interface AddCourseData {
  // Basic Details
  name: string;
  courseCode?: string;
  courseUrl: string;
  description?: string;
  specialisation: string[];

  // University Structure
  universityId: number;
  facultyId: number;
  departmentId: number;
  subfieldId: number[];

  // Course Configuration
  studyMode: 'fulltime' | 'parttime';
  courseType: 'internal' | 'external';
  frameworkId?: number;

  // Fees & Duration
  feeType: 'free' | 'paid';
  feeAmount?: number;
  durationMonths?: number;
  medium: string[];

  // Complex Data
  zscore?: any;
  additionalDetails?: {
    intakeCount?: number;
    syllabus?: string;
    customFields?: Record<string, any>;
  };

  // Requirements
  requirements: {
    minRequirement: 'noNeed' | 'OLPass' | 'ALPass' | 'Graduate';
    streams: number[];
    ruleSubjectBasket?: any;
    ruleSubjectGrades?: any;
    ruleOLGrades?: any;
  };

  // Career Paths
  careerPathways: Array<{
    jobTitle: string;
    industry?: string;
    description?: string;
    salaryRange?: string;
  }>;
}

export interface ValidCombinationData {
  subject1: number;
  subject2: number;
  subject3: number;
  streamId: number;
}

export class CourseManagementService {
  // Get all form data needed for course creation
  async getFormData() {
    try {
      const [
        universities,
        faculties,
        departments,
        majorFields,
        subFields,
        frameworks,
        streams,
        alSubjects,
        olSubjects,
        existingCareers
      ] = await Promise.all([
        // Universities
        prisma.university.findMany({
          where: { isActive: true },
          select: {
            id: true,
            name: true,
            type: true,
            uniCode: true
          },
          orderBy: { name: 'asc' }
        }),
        // Faculties
        prisma.faculty.findMany({
          where: { isActive: true },
          select: {
            id: true,
            name: true,
            universityId: true
          },
          orderBy: { name: 'asc' }
        }),
        // Departments
        prisma.department.findMany({
          where: { isActive: true },
          select: {
            id: true,
            name: true,
            facultyId: true
          },
          orderBy: { name: 'asc' }
        }),
        // Major Fields
        prisma.majorField.findMany({
          where: { isActive: true },
          select: {
            id: true,
            name: true,
            description: true
          },
          orderBy: { name: 'asc' }
        }),
        // Sub Fields
        prisma.subField.findMany({
          where: { isActive: true },
          select: {
            id: true,
            name: true,
            majorId: true,
            description: true
          },
          orderBy: { name: 'asc' }
        }),
        // Frameworks
        prisma.framework.findMany({
          select: {
            id: true,
            type: true,
            qualificationCategory: true,
            level: true,
            year: true
          },
          orderBy: [{ type: 'asc' }, { level: 'asc' }]
        }),
        // Streams
        prisma.stream.findMany({
          where: { isActive: true },
          select: {
            id: true,
            name: true,
            streamRule: true
          },
          orderBy: { name: 'asc' }
        }),
        // AL Subjects
        prisma.subject.findMany({
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
          orderBy: { name: 'asc' }
        }),
        // OL Subjects
        prisma.subject.findMany({
          where: {
            level: 'OL',
            isActive: true
          },
          select: {
            id: true,
            code: true,
            name: true,
            level: true
          },
          orderBy: { name: 'asc' }
        }),
        // Career Pathways
        prisma.careerPathway.findMany({
          where: { isActive: true },
          select: {
            id: true,
            jobTitle: true,
            industry: true,
            description: true,
            salaryRange: true
          },
          orderBy: { jobTitle: 'asc' }
        })
      ]);

      return {
        success: true,
        data: {
          universities,
          faculties,
          departments,
          majorFields,
          subFields,
          frameworks,
          streams,
          subjects: {
            al: alSubjects,
            ol: olSubjects
          },
          careerPathways: existingCareers
        }
      };
    } catch (error) {
      console.error('Error fetching form data:', error);
      return {
        success: false,
        error: 'Failed to fetch form data'
      };
    }
  }

  // Generate subject combinations based on rules
  private generateSubjectCombinations(streams: number[], allALSubjects: any[]): ValidCombinationData[] {
    const combinations: ValidCombinationData[] = [];
    
    // If no streams selected or all streams selected, generate all possible combinations
    if (streams.length === 0 || streams.includes(-1)) {
      // Generate all possible 3-subject combinations
      for (let i = 0; i < allALSubjects.length - 2; i++) {
        for (let j = i + 1; j < allALSubjects.length - 1; j++) {
          for (let k = j + 1; k < allALSubjects.length; k++) {
            combinations.push({
              subject1: allALSubjects[i].id,
              subject2: allALSubjects[j].id,
              subject3: allALSubjects[k].id,
              streamId: 1 // Default stream
            });
          }
        }
      }
    } else {
      // Generate combinations based on specific streams
      for (const streamId of streams) {
        // This would need to be enhanced based on actual stream rules
        // For now, generate basic combinations for each stream
        for (let i = 0; i < allALSubjects.length - 2; i++) {
          for (let j = i + 1; j < allALSubjects.length - 1; j++) {
            for (let k = j + 1; k < allALSubjects.length; k++) {
              combinations.push({
                subject1: allALSubjects[i].id,
                subject2: allALSubjects[j].id,
                subject3: allALSubjects[k].id,
                streamId
              });
            }
          }
        }
      }
    }

    // Sort combinations by subject IDs
    return combinations.sort((a, b) => {
      if (a.subject1 !== b.subject1) return a.subject1 - b.subject1;
      if (a.subject2 !== b.subject2) return a.subject2 - b.subject2;
      return a.subject3 - b.subject3;
    });
  }

  // Create new course with all related data
  async createCourse(courseData: AddCourseData, userId: number) {
    const transaction = await prisma.$transaction(async (tx) => {
      try {
        // 1. Create career pathways if provided
        const careerIds: number[] = [];
        if (courseData.careerPathways && courseData.careerPathways.length > 0) {
          for (const career of courseData.careerPathways) {
            const createdCareer = await tx.careerPathway.create({
              data: {
                jobTitle: career.jobTitle,
                industry: career.industry,
                description: career.description,
                salaryRange: career.salaryRange,
                auditInfo: {
                  createdBy: userId,
                  createdAt: new Date(),
                  updatedBy: userId,
                  updatedAt: new Date()
                }
              }
            });
            careerIds.push(createdCareer.id);
          }
        }

        // 2. Create course requirements
        let requirementId: number | null = null;
        if (courseData.requirements) {
          const requirement = await tx.courseRequirement.create({
            data: {
              minRequirement: courseData.requirements.minRequirement,
              stream: courseData.requirements.streams,
              ruleSubjectBasket: courseData.requirements.ruleSubjectBasket,
              ruleSubjectGrades: courseData.requirements.ruleSubjectGrades,
              ruleOLGrades: courseData.requirements.ruleOLGrades,
              auditInfo: {
                createdBy: userId,
                createdAt: new Date(),
                updatedBy: userId,
                updatedAt: new Date()
              }
            }
          });
          requirementId = requirement.id;
        }

        // 3. Create the course
        const course = await tx.course.create({
          data: {
            name: courseData.name,
            courseCode: courseData.courseCode,
            courseUrl: courseData.courseUrl,
            description: courseData.description,
            specialisation: courseData.specialisation,
            universityId: courseData.universityId,
            facultyId: courseData.facultyId,
            departmentId: courseData.departmentId,
            subfieldId: courseData.subfieldId,
            studyMode: courseData.studyMode,
            courseType: courseData.courseType,
            frameworkId: courseData.frameworkId,
            feeType: courseData.feeType,
            feeAmount: courseData.feeAmount ? new Prisma.Decimal(courseData.feeAmount) : null,
            durationMonths: courseData.durationMonths,
            medium: courseData.medium,
            zscore: courseData.zscore,
            additionalDetails: courseData.additionalDetails,
            requirementId,
            careerId: careerIds,
            materialIds: [], // Empty initially
            auditInfo: {
              createdBy: userId,
              createdAt: new Date(),
              updatedBy: userId,
              updatedAt: new Date()
            }
          }
        });

        // 4. Generate and update valid combinations
        if (courseData.requirements && courseData.requirements.streams.length > 0) {
          // Get all AL subjects for combination generation
          const allALSubjects = await tx.subject.findMany({
            where: { level: 'AL', isActive: true },
            select: { id: true, code: true, name: true }
          });

          // Check if "Pass any three subjects in AL" rule should be applied
          const hasBasketRules = courseData.requirements.ruleSubjectBasket && 
                                Object.keys(courseData.requirements.ruleSubjectBasket).length > 0;

          if (!hasBasketRules) {
            // No specific basket rules - create general "pass any three" entry
            // This is handled by not generating specific combinations
            console.log('No basket rules specified - using general AL pass requirement');
          } else {
            // Generate specific combinations based on rules
            const combinations = this.generateSubjectCombinations(
              courseData.requirements.streams, 
              allALSubjects
            );

            // Update or create valid combinations
            for (const combo of combinations) {
              const existingCombination = await tx.validCombination.findFirst({
                where: {
                  subject1: combo.subject1,
                  subject2: combo.subject2,
                  subject3: combo.subject3,
                  streamId: combo.streamId
                }
              });

              if (existingCombination) {
                // Append course ID to existing combination
                const updatedCourseIds = [...existingCombination.courseId];
                if (!updatedCourseIds.includes(course.id)) {
                  updatedCourseIds.push(course.id);
                }

                await tx.validCombination.update({
                  where: { id: existingCombination.id },
                  data: {
                    courseId: updatedCourseIds,
                    auditInfo: {
                      updatedBy: userId,
                      updatedAt: new Date()
                    }
                  }
                });
              } else {
                // Create new combination
                await tx.validCombination.create({
                  data: {
                    subject1: combo.subject1,
                    subject2: combo.subject2,
                    subject3: combo.subject3,
                    courseId: [course.id],
                    streamId: combo.streamId,
                    auditInfo: {
                      createdBy: userId,
                      createdAt: new Date(),
                      updatedBy: userId,
                      updatedAt: new Date()
                    }
                  }
                });
              }
            }
          }
        }

        return {
          success: true,
          data: {
            courseId: course.id,
            message: 'Course created successfully',
            course: {
              id: course.id,
              name: course.name,
              courseCode: course.courseCode,
              universityName: 'University Name', // Would need to join to get this
              facultyName: 'Faculty Name', // Would need to join to get this
              departmentName: 'Department Name' // Would need to join to get this
            }
          }
        };
      } catch (error) {
        console.error('Error in course creation transaction:', error);
        throw error;
      }
    });

    return transaction;
  }

  // Get courses with filters (for management)
  async getCourses(filters: {
    page?: number;
    limit?: number;
    search?: string;
    universityId?: number;
    facultyId?: number;
    departmentId?: number;
    courseType?: string;
    feeType?: string;
    studyMode?: string;
  }) {
    try {
      const page = filters.page || 1;
      const limit = filters.limit || 20;
      const skip = (page - 1) * limit;

      const whereClause: any = { isActive: true };

      // Apply filters
      if (filters.search) {
        whereClause.OR = [
          { name: { contains: filters.search, mode: 'insensitive' } },
          { courseCode: { contains: filters.search, mode: 'insensitive' } },
          { description: { contains: filters.search, mode: 'insensitive' } }
        ];
      }

      if (filters.universityId) whereClause.universityId = filters.universityId;
      if (filters.facultyId) whereClause.facultyId = filters.facultyId;
      if (filters.departmentId) whereClause.departmentId = filters.departmentId;
      if (filters.courseType && filters.courseType !== 'all') {
        whereClause.courseType = filters.courseType;
      }
      if (filters.feeType && filters.feeType !== 'all') {
        whereClause.feeType = filters.feeType;
      }
      if (filters.studyMode && filters.studyMode !== 'all') {
        whereClause.studyMode = filters.studyMode;
      }

      const [courses, totalCount] = await Promise.all([
        prisma.course.findMany({
          where: whereClause,
          include: {
            university: {
              select: { id: true, name: true, type: true }
            },
            faculty: {
              select: { id: true, name: true }
            },
            department: {
              select: { id: true, name: true }
            },
            framework: {
              select: { id: true, type: true, qualificationCategory: true, level: true }
            },
            requirements: {
              select: { 
                id: true, 
                minRequirement: true, 
                stream: true,
                ruleSubjectBasket: true,
                ruleSubjectGrades: true,
                ruleOLGrades: true
              }
            }
          },
          orderBy: { id: 'desc' },
          skip,
          take: limit
        }),
        prisma.course.count({ where: whereClause })
      ]);

      return {
        success: true,
        data: {
          courses,
          pagination: {
            currentPage: page,
            totalPages: Math.ceil(totalCount / limit),
            totalCount,
            hasNext: page < Math.ceil(totalCount / limit),
            hasPrev: page > 1
          }
        }
      };
    } catch (error) {
      console.error('Error fetching courses:', error);
      return {
        success: false,
        error: 'Failed to fetch courses'
      };
    }
  }

  // Update course
  async updateCourse(courseId: number, updateData: Partial<AddCourseData>, userId: number) {
    try {
      const transaction = await prisma.$transaction(async (tx) => {
        // Update course basic info
        const course = await tx.course.update({
          where: { id: courseId },
          data: {
            name: updateData.name,
            courseCode: updateData.courseCode,
            courseUrl: updateData.courseUrl,
            description: updateData.description,
            specialisation: updateData.specialisation,
            universityId: updateData.universityId,
            facultyId: updateData.facultyId,
            departmentId: updateData.departmentId,
            subfieldId: updateData.subfieldId,
            studyMode: updateData.studyMode,
            courseType: updateData.courseType,
            frameworkId: updateData.frameworkId,
            feeType: updateData.feeType,
            feeAmount: updateData.feeAmount ? new Prisma.Decimal(updateData.feeAmount) : null,
            durationMonths: updateData.durationMonths,
            medium: updateData.medium,
            zscore: updateData.zscore,
            additionalDetails: updateData.additionalDetails,
            auditInfo: {
              updatedBy: userId,
              updatedAt: new Date()
            }
          }
        });

        // Update requirements if provided
        if (updateData.requirements && course.requirementId) {
          await tx.courseRequirement.update({
            where: { id: course.requirementId },
            data: {
              minRequirement: updateData.requirements.minRequirement,
              stream: updateData.requirements.streams,
              ruleSubjectBasket: updateData.requirements.ruleSubjectBasket,
              ruleSubjectGrades: updateData.requirements.ruleSubjectGrades,
              ruleOLGrades: updateData.requirements.ruleOLGrades,
              auditInfo: {
                updatedBy: userId,
                updatedAt: new Date()
              }
            }
          });
        }

        return course;
      });

      return {
        success: true,
        data: {
          message: 'Course updated successfully',
          courseId: transaction.id
        }
      };
    } catch (error) {
      console.error('Error updating course:', error);
      return {
        success: false,
        error: 'Failed to update course'
      };
    }
  }

  // Delete course (soft delete)
  async deleteCourse(courseId: number, userId: number) {
    try {
      await prisma.course.update({
        where: { id: courseId },
        data: {
          isActive: false,
          auditInfo: {
            path: ['deletedBy'],
            deletedBy: userId,
            deletedAt: new Date()
          }
        }
      });

      return {
        success: true,
        data: { message: 'Course deleted successfully' }
      };
    } catch (error) {
      console.error('Error deleting course:', error);
      return {
        success: false,
        error: 'Failed to delete course'
      };
    }
  }
}

export const courseManagementService = new CourseManagementService();