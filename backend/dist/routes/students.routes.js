import express from 'express';
import { z } from 'zod';
import { getMysqlPool } from '../database/mysql';
import { logger } from '../utils/logger';
const router = express.Router();
const studentSearchSchema = z.object({
    q: z.string().trim().max(100).optional().default(''),
});
router.get('/', async (req, res) => {
    try {
        const { q } = studentSearchSchema.parse(req.query);
        const pool = getMysqlPool();
        const params = [];
        let whereClause = '';
        if (q) {
            const like = `%${q.toLowerCase()}%`;
            whereClause = 'WHERE LOWER(student_name) LIKE ? OR LOWER(roll_no) LIKE ? OR LOWER(college_email) LIKE ?';
            params.push(like, like, like);
        }
        const [rows] = await pool.query(`SELECT
        id,
        student_name,
        roll_no,
        college_email,
        department
      FROM students
      ${whereClause}
      ORDER BY student_name ASC
      LIMIT 500`, params);
        return res.json({ students: rows });
    }
    catch (error) {
        logger.error('Error listing students:', error);
        return res.status(500).json({ error: 'Failed to list students' });
    }
});
export default router;
