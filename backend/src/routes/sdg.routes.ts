import { Router, Request, Response } from 'express';
import sdgService from '../services/sdg.service';
import { logger } from '../utils/logger';

const router = Router();

/**
 * GET /api/sdgs
 * Fetch all SDG goals
 */
router.get('/sdgs', async (req: Request, res: Response) => {
  try {
    const sdgs = await sdgService.getAllSDGs();
    res.status(200).json({
      success: true,
      sdgs: sdgs,
    });
  } catch (error: any) {
    logger.error('Error fetching SDG goals:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch SDG goals',
    });
  }
});

/**
 * GET /api/sdgs/:id
 * Fetch a single SDG goal by ID
 */
router.get('/sdgs/:id', async (req: Request, res: Response) => {
  try {
    const idParam = typeof req.params.id === 'string' ? req.params.id : (req.params.id as any as string);
    const sdg = await sdgService.getSDGById(parseInt(idParam));

    if (!sdg) {
      return res.status(404).json({
        success: false,
        message: 'SDG goal not found',
      });
    }

    res.status(200).json({
      success: true,
      sdg: sdg,
    });
  } catch (error: any) {
    logger.error('Error fetching SDG goal:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch SDG goal',
    });
  }
});

export default router;
