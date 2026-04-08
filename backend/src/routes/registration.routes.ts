import express from 'express';
import { z } from 'zod';
import {
  DuplicateRegistrationError,
  EventCapacityExceededError,
  EventNotFoundError,
  EventNotOpenError,
  RegistrationNotFoundError,
} from '../services/registration.service';
import registrationService from '../services/registration.service';
import { authenticateToken, requireRole, type AuthRequest } from '../middleware/auth';
import { logger } from '../utils/logger';

const router = express.Router();

const toNullableString = (value: unknown): string | null => {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const createRegistrationSchema = z.object({
  eventId: z.coerce.number().int().positive(),
  studentName: z.string().trim().min(2),
  studentDepartment: z.any().optional().transform(toNullableString),
  eventCategory: z.any().optional().transform(toNullableString),
  activityEvent: z.any().optional().transform(toNullableString),
  fromDate: z.any().optional().transform(toNullableString),
  toDate: z.any().optional().transform(toNullableString),
  modeOfParticipation: z.any().optional().transform(toNullableString),
  iqacVerification: z.any().optional().transform(toNullableString),
});

const listQuerySchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected']).optional(),
});

const rejectSchema = z.object({
  reason: z.string().trim().min(3),
});

router.post('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const data = createRegistrationSchema.parse(req.body);
    const registration = await registrationService.registerForEvent({
      ...data,
      studentId: req.user.id,
      studentEmail: req.user.email ?? null,
    });

    return res.status(201).json({
      message: 'Registration submitted successfully',
      registration,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }

    if (error instanceof EventNotFoundError) {
      return res.status(404).json({ error: error.message });
    }

    if (error instanceof EventNotOpenError || error instanceof EventCapacityExceededError || error instanceof DuplicateRegistrationError) {
      return res.status(409).json({ error: error.message });
    }

    logger.error('Error creating registration:', error);
    return res.status(500).json({ error: 'Failed to create registration' });
  }
});

router.get('/verification', authenticateToken, requireRole('verification', 'maintenance'), async (req, res) => {
  try {
    const query = listQuerySchema.parse(req.query);
    const registrations = await registrationService.listRegistrations(query.status);
    return res.json({ registrations });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }

    logger.error('Error loading verification registrations:', error);
    return res.status(500).json({ error: 'Failed to fetch verification registrations' });
  }
});

router.post('/:registrationId/approve', authenticateToken, requireRole('verification', 'maintenance'), async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const registrationId = Number(req.params.registrationId);
    if (!Number.isFinite(registrationId) || registrationId <= 0) {
      return res.status(400).json({ error: 'Invalid registration id' });
    }

    const registration = await registrationService.approveRegistration(registrationId, req.user.id);
    return res.json({
      message: 'Registration approved successfully',
      registration,
    });
  } catch (error) {
    if (error instanceof RegistrationNotFoundError) {
      return res.status(404).json({ error: error.message });
    }

    logger.error('Error approving registration:', error);
    return res.status(500).json({ error: 'Failed to approve registration' });
  }
});

router.post('/:registrationId/reject', authenticateToken, requireRole('verification', 'maintenance'), async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const registrationId = Number(req.params.registrationId);
    if (!Number.isFinite(registrationId) || registrationId <= 0) {
      return res.status(400).json({ error: 'Invalid registration id' });
    }

    const data = rejectSchema.parse(req.body);
    const registration = await registrationService.rejectRegistration(registrationId, req.user.id, data.reason);
    return res.json({
      message: 'Registration rejected successfully',
      registration,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }

    if (error instanceof RegistrationNotFoundError) {
      return res.status(404).json({ error: error.message });
    }

    logger.error('Error rejecting registration:', error);
    return res.status(500).json({ error: 'Failed to reject registration' });
  }
});

export default router;
