import { Router, Request, Response } from 'express';
import { logger } from '../utils/logger';

const router = Router();

export interface VerifiedStudent {
  id: number;
  studentId: string;
  studentName: string;
  studentEmail: string;
}

/**
 * GET /api/verified-students
 * Fetch all verified students for the current user
 * TODO: Implement actual logic to fetch students based on authenticated user
 */
router.get('/verified-students', async (req: Request, res: Response) => {
  try {
    // TODO: Get authenticated user from request
    // TODO: Query database for verified students linked to this user

    // For now, return empty array - frontend will use test student
    const students: VerifiedStudent[] = [];

    res.status(200).json({
      success: true,
      students: students,
    });
  } catch (error: any) {
    logger.error('Error fetching verified students:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch verified students',
    });
  }
});

export default router;
