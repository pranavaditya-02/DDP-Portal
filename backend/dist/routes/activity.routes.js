import express from 'express';
import { z } from 'zod';
import activityService from '../services/activity.service';
import { authenticateToken, requireRole } from '../middleware/auth';
import { logger } from '../utils/logger';
const router = express.Router();
const submitActivitySchema = z.object({
    activityTypeId: z.number(),
    title: z.string().min(3),
    description: z.string().min(10),
    activityDate: z.string().datetime(),
    proofDocumentPath: z.string().optional(),
    additionalData: z.record(z.any()).optional(),
});
const approveActivitySchema = z.object({
    pointsEarned: z.number().min(0),
});
const rejectActivitySchema = z.object({
    rejectionReason: z.string().min(5),
});
// Faculty: Get their own activities
router.get('/my-activities', authenticateToken, requireRole('faculty'), async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Authentication required' });
        }
        const activities = await activityService.getFacultyActivities(req.user.id);
        res.json({ activities });
    }
    catch (error) {
        logger.error('Error fetching faculty activities:', error);
        res.status(500).json({ error: 'Failed to fetch activities' });
    }
});
// Faculty: Submit new activity
router.post('/submit', authenticateToken, requireRole('faculty'), async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Authentication required' });
        }
        const data = submitActivitySchema.parse(req.body);
        const activity = await activityService.submitActivity(req.user.id, {
            ...data,
            activityDate: new Date(data.activityDate),
        });
        res.status(201).json({
            message: 'Activity submitted successfully',
            activity,
        });
    }
    catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.errors });
        }
        logger.error('Error submitting activity:', error);
        res.status(500).json({ error: 'Failed to submit activity' });
    }
});
// Verification Team: Get pending activities
router.get('/pending', authenticateToken, requireRole('verification'), async (req, res) => {
    try {
        const { departmentId } = req.query;
        const activities = await activityService.getPendingActivities(departmentId ? Number(departmentId) : undefined);
        res.json({ activities });
    }
    catch (error) {
        logger.error('Error fetching pending activities:', error);
        res.status(500).json({ error: 'Failed to fetch pending activities' });
    }
});
// Verification Team: Approve activity
router.post('/:activityId/approve', authenticateToken, requireRole('verification'), async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Authentication required' });
        }
        const { pointsEarned } = approveActivitySchema.parse(req.body);
        const { activityId } = req.params;
        const activity = await activityService.approveActivity(Number(activityId), req.user.id, pointsEarned);
        res.json({
            message: 'Activity approved successfully',
            activity,
        });
    }
    catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.errors });
        }
        logger.error('Error approving activity:', error);
        res.status(500).json({ error: 'Failed to approve activity' });
    }
});
// Verification Team: Reject activity
router.post('/:activityId/reject', authenticateToken, requireRole('verification'), async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Authentication required' });
        }
        const { rejectionReason } = rejectActivitySchema.parse(req.body);
        const { activityId } = req.params;
        const activity = await activityService.rejectActivity(Number(activityId), req.user.id, rejectionReason);
        res.json({
            message: 'Activity rejected successfully',
            activity,
        });
    }
    catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.errors });
        }
        logger.error('Error rejecting activity:', error);
        res.status(500).json({ error: 'Failed to reject activity' });
    }
});
// HOD/Dean: Get department activities
router.get('/department/:departmentId', authenticateToken, requireRole('hod', 'dean', 'verification'), async (req, res) => {
    try {
        const { departmentId } = req.params;
        const { academicYear } = req.query;
        const activities = await activityService.getDepartmentActivities(Number(departmentId), academicYear);
        res.json({ activities });
    }
    catch (error) {
        logger.error('Error fetching department activities:', error);
        res.status(500).json({ error: 'Failed to fetch department activities' });
    }
});
// Get activity statistics
router.get('/stats/department/:departmentId', authenticateToken, requireRole('hod', 'dean', 'verification'), async (req, res) => {
    try {
        const { departmentId } = req.params;
        const { academicYear } = req.query;
        const stats = await activityService.getActivityStats(Number(departmentId), academicYear);
        res.json({ stats });
    }
    catch (error) {
        logger.error('Error fetching activity statistics:', error);
        res.status(500).json({ error: 'Failed to fetch statistics' });
    }
});
export default router;
