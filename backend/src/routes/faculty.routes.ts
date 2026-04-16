import { Router, Request, Response } from 'express';
import { getMysqlPool } from '../database/mysql';
import { logger } from '../utils/logger';

const router = Router();

/**
 * GET /api/faculty
 * Get all faculty members
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const pool = getMysqlPool();
    const connection = await pool.getConnection();

    try {
      const query = 'SELECT id, name FROM faculty ORDER BY name ASC';
      const [rows] = await connection.execute(query);

      const faculty = (rows as any[]).map((row) => ({
        id: row.id,
        name: row.name,
      }));

      res.json({
        success: true,
        data: faculty,
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    logger.error('Error fetching faculty:', error);
    const errorMessage = (error as any).message || 'Failed to fetch faculty';
    const isDatabaseError = errorMessage.includes('Table') || errorMessage.includes('table');
    
    res.status(500).json({
      success: false,
      message: isDatabaseError 
        ? 'Faculty table not found. Please ensure database is initialized with patent_complete_schema.sql'
        : 'Failed to fetch faculty',
      error: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
    });
  }
});

/**
 * GET /api/faculty/:id
 * Get a specific faculty member
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const pool = getMysqlPool();
    const connection = await pool.getConnection();

    try {
      const id = req.params.id;
      const query = 'SELECT id, name FROM faculty WHERE id = ?';
      const [rows] = await connection.execute(query, [id]);

      if ((rows as any[]).length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Faculty not found',
        });
      }

      const faculty = (rows as any[])[0];

      res.json({
        success: true,
        data: {
          id: faculty.id,
          name: faculty.name,
        },
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    logger.error('Error fetching faculty:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch faculty',
      error: process.env.NODE_ENV === 'development' ? error : undefined,
    });
  }
});

export default router;
