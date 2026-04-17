import express from 'express';
import multer from 'multer';
import { z } from 'zod';
import facultyActivitiesService, { FacultyActivityCategory } from './facultyActivities.service';
import { logger } from '../utils/logger';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

const categorySchema = z.enum([
  'e-content-developed',
  'events-attended',
  'events-organized',
  'external-examiner',
  'guest-lecture-delivered',
  'international-visit',
  'journal-reviewer',
  'newsletter',
  'notable-achievements',
  'notable-achievements-and-awards',
  'online-course',
  'paper-presentation',
  'resource-person',
]);

const categoryAliases: Record<string, FacultyActivityCategory> = {
  'notable-achievements-and-awards': 'notable-achievements',
};

const normalizeCategory = (category: string): FacultyActivityCategory => {
  const normalized = categoryAliases[category] ?? category;
  categorySchema.parse(normalized);
  return normalized as FacultyActivityCategory;
};

router.get('/categories', async (_req, res) => {
  try {
    const categories = await facultyActivitiesService.getCategories();
    return res.json({ categories });
  } catch (error) {
    logger.error('Error fetching activity categories:', error);
    return res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

router.get('/:category', async (req, res) => {
  try {
    const category = normalizeCategory(req.params.category);
    const entries = await facultyActivitiesService.getEntries(category);
    return res.json({ entries });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid category' });
    }

    logger.error('Error fetching faculty activity entries:', error);
    return res.status(500).json({ error: 'Failed to fetch entries' });
  }
});

router.post('/:category', upload.any(), async (req, res) => {
  try {
    const category = normalizeCategory(req.params.category);
    const entry = await facultyActivitiesService.createEntry(category, req.body as Record<string, unknown>);
    return res.status(201).json({ message: 'Entry stored successfully', submissionId: entry.submissionId });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid category' });
    }

    const message = error instanceof Error ? error.message : 'Failed to store entry';
    if (message.includes('Task ID')) {
      return res.status(409).json({ error: message });
    }

    logger.error('Error creating faculty activity entry:', error);
    return res.status(500).json({ error: 'Failed to store entry' });
  }
});

export default router;
