import express from 'express';
import { z } from 'zod';
import industriesService from '../services/industries.service';
import { logger } from '../utils/logger';

const router = express.Router();

const industrySchema = z.object({
  industry: z.string().min(1),
  address: z.string().min(1),
  website_link: z.string().url(),
  active_now: z.boolean().optional(),
});

router.get('/', async (req, res) => {
  try {
    const industries = await industriesService.getAllIndustries();
    res.json({ industries });
  } catch (error) {
    logger.error('Failed to fetch industries:', error);
    res.status(500).json({ error: 'Unable to fetch industries' });
  }
});

router.get('/active', async (req, res) => {
  try {
    const industries = await industriesService.getActiveIndustries();
    res.json({ industries });
  } catch (error) {
    logger.error('Failed to fetch active industries:', error);
    res.status(500).json({ error: 'Unable to fetch active industries' });
  }
});

router.post('/', async (req, res) => {
  try {
    const payload = industrySchema.parse(req.body);
    const industry = await industriesService.createIndustry(payload);
    res.status(201).json({ industry });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    logger.error('Failed to create industry:', error);
    res.status(500).json({ error: 'Unable to create industry' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id) || id <= 0) {
      return res.status(400).json({ error: 'Invalid industry id' });
    }
    const payload = industrySchema.partial().parse(req.body);
    const industry = await industriesService.updateIndustry(id, payload);
    if (!industry) {
      return res.status(404).json({ error: 'Industry not found' });
    }
    res.json({ industry });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    logger.error('Failed to update industry:', error);
    res.status(500).json({ error: 'Unable to update industry' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id) || id <= 0) {
      return res.status(400).json({ error: 'Invalid industry id' });
    }
    const success = await industriesService.deleteIndustry(id);
    if (!success) {
      return res.status(404).json({ error: 'Industry not found' });
    }
    res.json({ message: 'Industry deleted' });
  } catch (error) {
    logger.error('Failed to delete industry:', error);
    res.status(500).json({ error: 'Unable to delete industry' });
  }
});

export default router;