import express from 'express';
import { z } from 'zod';
import eventMasterService, { EventCodeExistsError } from '../services/eventMaster.service';
import { authenticateToken, requireRole, type AuthRequest } from '../middleware/auth';
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

router.get('/', async (req, res) => {
  try {
    const sort = req.query.sort === 'asc' ? 'asc' : 'desc';
    const events = await eventMasterService.getAllEvents(sort);
    return res.json({ events });
  } catch (error) {
    logger.error('Error fetching event master records:', error);
    return res.status(500).json({ error: 'Failed to fetch events' });
  }
});

router.post('/', authenticateToken, requireRole('maintenance'), async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const data = createEventSchema.parse(req.body);

    if (data.endDate && data.startDate && new Date(data.endDate) < new Date(data.startDate)) {
      return res.status(400).json({ error: 'End date cannot be earlier than start date' });
    }

    if (data.appliedCount > data.maximumCount) {
      return res.status(400).json({ error: 'Applied count cannot exceed maximum count' });
    }

    const event = await eventMasterService.createEvent({
      ...data,
      maximumCount: data.maximumCount,
      appliedCount: data.appliedCount,
      balanceCount: Math.max(0, data.maximumCount - data.appliedCount),
      winnerRewards: data.eligibleForRewards ? data.winnerRewards : null,
    });

    return res.status(201).json({ message: 'Event created successfully', event });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }

    if (error instanceof EventCodeExistsError) {
      return res.status(409).json({ error: error.message });
    }

    logger.error('Error creating event master record:', error);
    return res.status(500).json({ error: 'Failed to create event' });
  }
});

export default router;
