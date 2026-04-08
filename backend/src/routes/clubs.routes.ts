import { Router, Request, Response } from 'express';
import clubsService from '../services/clubs.service';
import { logger } from '../utils/logger';

const router = Router();

/**
 * GET /api/clubs
 * Fetch all clubs
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const clubs = await clubsService.getAllClubs();
    res.status(200).json({
      success: true,
      clubs: clubs,
    });
  } catch (error: any) {
    logger.error('Error fetching clubs:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch clubs',
    });
  }
});

/**
 * GET /api/clubs/:id
 * Fetch a single club by ID
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const club = await clubsService.getClubById(parseInt(id));

    if (!club) {
      return res.status(404).json({
        success: false,
        message: 'Club not found',
      });
    }

    res.status(200).json({
      success: true,
      data: club,
    });
  } catch (error: any) {
    logger.error('Error fetching club:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch club',
    });
  }
});

export default router;
