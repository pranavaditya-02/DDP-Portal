import { Router, Request, Response } from 'express';
import { logger } from '../utils/logger';
import getMysqlPool from '../database/mysql';

const router = Router();

export interface VerifiedStudent {
  id: number;
  studentId: string;
  studentName: string;
  studentEmail: string;
}

/**
 * GET /api/verified-students
 * Fetch all students from the students table for selection in forms
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const connection = await getMysqlPool().getConnection();
    try {
      const [rows] = await connection.execute(`
        SELECT id, roll_no as studentId, student_name as studentName, college_email as studentEmail 
        FROM students 
        ORDER BY student_name ASC
      `);

      const students = (rows as any[]).map((row) => ({
        id: row.id,
        studentId: row.studentId,
        studentName: row.studentName,
        studentEmail: row.studentEmail,
      }));

      res.status(200).json(students);
    } finally {
      connection.release();
    }
  } catch (error: any) {
    logger.error('Error fetching verified students:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch verified students',
    });
  }
});

export default router;
