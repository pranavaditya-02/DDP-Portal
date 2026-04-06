import express from 'express';
import { z } from 'zod';
import eventMasterService from '../services/eventMaster.service';
import { logger } from '../utils/logger';

const router = express.Router();

const toBoolean = (value: unknown): boolean => {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'number') {
    return value === 1;
  }

  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    return ['1', 'true', 'yes', 'y'].includes(normalized);
  }

  return false;
};

const toNullableString = (value: unknown): string | null => {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const createEventSchema = z.object({
  maximumCount: z.coerce.number().int().min(0).default(0),
  appliedCount: z.coerce.number().int().min(0).default(0),
  balanceCount: z.coerce.number().int().min(0).default(0),
  applyByStudent: z.any().optional().transform(toBoolean),
  eventCode: z.string().trim().min(1),
  eventName: z.string().trim().min(1),
  eventOrganizer: z.any().optional().transform(toNullableString),
  webLink: z.any().optional().transform(toNullableString),
  eventCategory: z.any().optional().transform(toNullableString),
  status: z.string().trim().min(1).default('Active'),
  startDate: z.any().optional().transform(toNullableString),
  endDate: z.any().optional().transform(toNullableString),
  durationDays: z.coerce.number().int().min(0).nullable().optional(),
  eventLocation: z.any().optional().transform(toNullableString),
  eventLevel: z.any().optional().transform(toNullableString),
  state: z.any().optional().transform(toNullableString),
  country: z.any().optional().transform(toNullableString),
  withinBit: z.any().optional().transform(toBoolean),
  relatedToSpecialLab: z.any().optional().transform(toBoolean),
  department: z.any().optional().transform(toNullableString),
  competitionName: z.any().optional().transform(toNullableString),
  totalLevelOfCompetition: z.any().optional().transform(toNullableString),
  eligibleForRewards: z.any().optional().transform(toBoolean),
  winnerRewards: z.any().optional().transform(toNullableString),
});

router.get('/', async (_req, res) => {
  try {
    const events = await eventMasterService.getAllEvents();
    return res.json({ events });
  } catch (error) {
    logger.error('Error fetching event master records:', error);
    return res.status(500).json({ error: 'Failed to fetch events' });
  }
});

router.post('/', async (req, res) => {
  try {
    const data = createEventSchema.parse(req.body);
    const event = await eventMasterService.createEvent(data);
    return res.status(201).json({ message: 'Event created successfully', event });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }

    logger.error('Error creating event master record:', error);
    return res.status(500).json({ error: 'Failed to create event' });
  }
});

export default router;
