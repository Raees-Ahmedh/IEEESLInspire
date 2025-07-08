// src/routes/streamRoutes.ts
import express from 'express';
import {
  classifySubjects,
  getAllStreams,
  getStreamById,
  classifyMultipleSubjects,
  validateSubjectCombination,
  getSubjectsByStream
} from '../controllers/streamController';

const router = express.Router();

// POST /api/streams/classify - Classify a single 3-subject combination
router.post('/classify', classifySubjects);

// POST /api/streams/classify/batch - Classify multiple subject combinations
router.post('/classify/batch', classifyMultipleSubjects);

// GET /api/streams/validate/:subjectId1/:subjectId2/:subjectId3 - Quick URL-based validation
router.get('/validate/:subjectId1/:subjectId2/:subjectId3', validateSubjectCombination);

// GET /api/streams - Get all available streams
router.get('/', getAllStreams);

// GET /api/streams/:id - Get specific stream by ID
router.get('/:id', getStreamById);

// NEW: GET /api/streams/:id/subjects - Get subjects available for a specific stream
router.get('/:id/subjects', getSubjectsByStream);

export default router;