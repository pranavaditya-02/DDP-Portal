import { Router, Request, Response } from 'express';
import departmentsService from '../services/departments.service';
import { logger } from '../utils/logger';

const router = Router();

/**
 * GET /api/departments
 * Fetch all departments
 */
router.get('/departments', async (req: Request, res: Response) => {
  try {
    const departments = await departmentsService.getAllDepartments();
    res.status(200).json({
      success: true,
      departments: departments, // Match frontend expectation
    });
  } catch (error: any) {
    logger.error('Error fetching departments:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch departments',
    });
  }
});

/**
 * GET /api/departments/:id
 * Fetch a single department by ID
 */
router.get('/departments/:id', async (req: Request, res: Response) => {
  try {
    const idParam = typeof req.params.id === 'string' ? req.params.id : (req.params.id as any as string);
    const department = await departmentsService.getDepartmentById(parseInt(idParam));

    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found',
      });
    }

    res.status(200).json({
      success: true,
      data: department,
    });
  } catch (error: any) {
    logger.error('Error fetching department:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch department',
    });
  }
});

export default router;
