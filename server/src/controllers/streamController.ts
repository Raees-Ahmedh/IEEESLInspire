// src/controllers/streamController.ts
import { Request, Response, RequestHandler } from 'express';
import streamClassificationService from '../services/streamClassificationService';

/**
 * POST /api/streams/classify
 * Classify a 3-subject combination and return the matching stream
 */
export const classifySubjects: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { subjectIds } = req.body;

    // Validate input
    if (!subjectIds || !Array.isArray(subjectIds)) {
      res.status(400).json({
        success: false,
        error: 'subjectIds array is required',
        example: { subjectIds: [6, 1, 2] }
      });
      return;
    }

    if (subjectIds.length !== 3) {
      res.status(400).json({
        success: false,
        error: 'Exactly 3 subject IDs must be provided',
        received: subjectIds.length,
        example: { subjectIds: [6, 1, 2] }
      });
      return;
    }

    // Validate that all elements are numbers
    const numericSubjectIds = [];
    for (let i = 0; i < subjectIds.length; i++) {
      const numId = parseInt(subjectIds[i]);
      if (isNaN(numId) || numId <= 0) {
        res.status(400).json({
          success: false,
          error: `Invalid subject ID at position ${i}: "${subjectIds[i]}". Must be a positive number.`,
          example: { subjectIds: [6, 1, 2] }
        });
        return;
      }
      numericSubjectIds.push(numId);
    }

    console.log(`🔍 Classifying subjects: [${numericSubjectIds.join(', ')}]`);

    // Perform classification
    const result = await streamClassificationService.classifySubjects(numericSubjectIds);

    if (!result.isValid) {
      res.status(400).json({
        success: false,
        error: 'Invalid subject combination',
        details: result.errors,
        subjectIds: numericSubjectIds
      });
      return;
    }

    console.log(`✅ Classification result: ${result.streamName} (ID: ${result.streamId})`);

    res.json({
      success: true,
      data: {
        streamId: result.streamId,
        streamName: result.streamName,
        matchedRule: result.matchedRule,
        subjectIds: numericSubjectIds
      }
    });

  } catch (error: any) {
    console.error('Error in stream classification:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to classify subjects',
      details: error.message
    });
  }
};

/**
 * GET /api/streams
 * Get all available streams
 */
export const getAllStreams: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('📚 Fetching all streams...');

    const streams = await streamClassificationService.getAllStreams();

    res.json({
      success: true,
      data: streams.map(stream => ({
        id: stream.id,
        name: stream.name,
        description: (typeof stream.streamRule === 'object' && stream.streamRule !== null && 'description' in stream.streamRule)
          ? (stream.streamRule as { description?: string }).description || null
          : null
      }))
    });

  } catch (error: any) {
    console.error('Error fetching streams:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch streams',
      details: error.message
    });
  }
};

/**
 * GET /api/streams/:id
 * Get stream details by ID
 */
export const getStreamById: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const streamId = parseInt(req.params.id);

    if (isNaN(streamId)) {
      res.status(400).json({
        success: false,
        error: 'Invalid stream ID'
      });
      return;
    }

    console.log(`🔍 Fetching stream with ID: ${streamId}`);

    const stream = await streamClassificationService.getStreamById(streamId);

    if (!stream) {
      res.status(404).json({
        success: false,
        error: 'Stream not found'
      });
      return;
    }

    res.json({
      success: true,
      data: stream
    });

  } catch (error: any) {
    console.error('Error fetching stream:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch stream',
      details: error.message
    });
  }
};

/**
 * NEW: GET /api/streams/:id/subjects
 * Get subjects available for a specific stream
 */
export const getSubjectsByStream: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const streamId = parseInt(req.params.id);

    if (isNaN(streamId)) {
      res.status(400).json({
        success: false,
        error: 'Invalid stream ID'
      });
      return;
    }

    console.log(`🔍 Fetching subjects for stream ID: ${streamId}`);

    const subjects = await streamClassificationService.getSubjectsByStream(streamId);

    if (subjects === null) {
      res.status(404).json({
        success: false,
        error: 'Stream not found or inactive'
      });
      return;
    }

    res.json({
      success: true,
      data: subjects
    });

  } catch (error: any) {
    console.error('Error fetching subjects for stream:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch subjects for stream',
      details: error.message
    });
  }
};

/**
 * POST /api/streams/classify/batch
 * Classify multiple subject combinations at once
 */
export const classifyMultipleSubjects: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { combinations } = req.body;

    if (!combinations || !Array.isArray(combinations)) {
      res.status(400).json({
        success: false,
        error: 'combinations array is required'
      });
      return;
    }

    console.log(`🔍 Classifying ${combinations.length} subject combinations...`);

    const results = [];

    for (let i = 0; i < combinations.length; i++) {
      const combination = combinations[i];
      
      if (!Array.isArray(combination) || combination.length !== 3) {
        results.push({
          index: i,
          success: false,
          error: 'Each combination must contain exactly 3 subject IDs'
        });
        continue;
      }

      try {
        const numericSubjectIds = combination.map((id: any) => {
          const numId = parseInt(id);
          if (isNaN(numId)) {
            throw new Error(`Invalid subject ID: ${id}`);
          }
          return numId;
        });

        const result = await streamClassificationService.classifySubjects(numericSubjectIds);

        results.push({
          index: i,
          success: result.isValid,
          data: result.isValid ? {
            streamId: result.streamId,
            streamName: result.streamName,
            matchedRule: result.matchedRule,
            subjectIds: numericSubjectIds
          } : null,
          error: result.isValid ? null : result.errors?.join(', ')
        });

      } catch (error: any) {
        results.push({
          index: i,
          success: false,
          error: error.message
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    console.log(`✅ Successfully classified ${successCount}/${combinations.length} combinations`);

    res.json({
      success: true,
      data: {
        totalCombinations: combinations.length,
        successfulClassifications: successCount,
        results: results
      }
    });

  } catch (error: any) {
    console.error('Error in batch classification:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to classify subject combinations',
      details: error.message
    });
  }
};

/**
 * GET /api/streams/validate/:subjectId1/:subjectId2/:subjectId3
 * Quick validation endpoint for URL-based subject classification
 */
export const validateSubjectCombination: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { subjectId1, subjectId2, subjectId3 } = req.params;

    const subjectIds = [
      parseInt(subjectId1),
      parseInt(subjectId2), 
      parseInt(subjectId3)
    ];

    // Validate that all are valid numbers
    if (subjectIds.some(id => isNaN(id))) {
      res.status(400).json({
        success: false,
        error: 'All subject IDs must be valid numbers'
      });
      return;
    }

    console.log(`🔍 Quick validation for subjects: [${subjectIds.join(', ')}]`);

    const result = await streamClassificationService.classifySubjects(subjectIds);

    res.json({
      success: true,
      data: {
        isValid: result.isValid,
        streamId: result.streamId,
        streamName: result.streamName,
        matchedRule: result.matchedRule,
        subjectIds: subjectIds,
        errors: result.errors
      }
    });

  } catch (error: any) {
    console.error('Error in subject validation:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to validate subjects',
      details: error.message
    });
  }
};