import express from 'express';
import multer from 'multer';
import eventsAttendedImportService from '../services/eventsAttendedImport.service';
import industryImportService from '../services/industryImport.service';
import { logger } from '../utils/logger';

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: Number(process.env.MAX_FILE_SIZE || 15 * 1024 * 1024),
  },
});

router.post('/events-attended/csv', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'CSV file is required (multipart field name: file).' });
    }

    const csvText = req.file.buffer.toString('utf-8');
    const summary = await eventsAttendedImportService.importFromCsv(csvText);

    return res.json({
      message: 'CSV import completed successfully.',
      summary,
    });
  } catch (error) {
    logger.error('Events attended CSV import failed:', error);
    return res.status(500).json({
      error: 'CSV import failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

router.post('/industries/csv', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'CSV file is required (multipart field name: file).' });
    }

    const csvText = req.file.buffer.toString('utf-8');
    const summary = await industryImportService.importFromCsv(csvText);

    return res.json({
      message: 'Industry CSV import completed successfully.',
      summary,
    });
  } catch (error) {
    logger.error('Industry CSV import failed:', error);
    return res.status(500).json({
      error: 'Industry CSV import failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
