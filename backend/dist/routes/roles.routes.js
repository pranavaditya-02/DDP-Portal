import express from 'express';
import { z } from 'zod';
import { authenticateToken, requireRole } from '../middleware/auth';
import rolesService, { RoleInUseError } from '../services/roles.service';
import { logger } from '../utils/logger';
const router = express.Router();
const roleSchema = z.object({
    name: z.string().trim().min(1, 'Role name is required'),
    description: z.string().trim().default(''),
    passwordPrefix: z.string().trim().default(''),
    editAccess: z.boolean().default(true),
    deleteAccess: z.boolean().default(false),
    status: z.boolean().default(true),
    resources: z.array(z.string().trim()).default([]),
    isSystem: z.boolean().default(false),
});
router.get('/resources', authenticateToken, async (_req, res) => {
    try {
        const resources = await rolesService.getResources();
        res.json({ resources });
    }
    catch (error) {
        logger.error('Error fetching role resources:', error);
        res.status(500).json({ error: 'Failed to fetch role resources' });
    }
});
router.get('/me/access', authenticateToken, async (req, res) => {
    try {
        if (!req.user?.roleId) {
            return res.status(401).json({ error: 'Authentication required' });
        }
        const access = await rolesService.getRoleAccessByRoleId(req.user.roleId);
        res.json(access);
    }
    catch (error) {
        logger.error('Error fetching role access:', error);
        res.status(500).json({ error: 'Failed to fetch role access' });
    }
});
router.get('/', authenticateToken, async (_req, res) => {
    try {
        const roles = await rolesService.listRoles();
        res.json({ roles });
    }
    catch (error) {
        logger.error('Error fetching roles:', error);
        res.status(500).json({ error: 'Failed to fetch roles' });
    }
});
router.post('/', authenticateToken, requireRole('maintenance', 'admin'), async (req, res) => {
    try {
        const payload = roleSchema.parse(req.body);
        const role = await rolesService.createRole(payload);
        res.status(201).json({ message: 'Role created successfully', role });
    }
    catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.errors });
        }
        logger.error('Error creating role:', error);
        res.status(500).json({ error: 'Failed to create role' });
    }
});
router.put('/:id', authenticateToken, requireRole('maintenance', 'admin'), async (req, res) => {
    try {
        const roleId = Number(req.params.id);
        if (!Number.isFinite(roleId) || roleId <= 0) {
            return res.status(400).json({ error: 'Invalid role id' });
        }
        const payload = roleSchema.parse(req.body);
        const role = await rolesService.updateRole(roleId, payload);
        res.json({ message: 'Role updated successfully', role });
    }
    catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.errors });
        }
        logger.error('Error updating role:', error);
        res.status(500).json({ error: 'Failed to update role' });
    }
});
router.delete('/:id', authenticateToken, requireRole('maintenance', 'admin'), async (req, res) => {
    try {
        const roleId = Number(req.params.id);
        if (!Number.isFinite(roleId) || roleId <= 0) {
            return res.status(400).json({ error: 'Invalid role id' });
        }
        const deleted = await rolesService.deleteRole(roleId);
        if (!deleted) {
            return res.status(404).json({ error: 'Role not found' });
        }
        res.json({ message: 'Role deleted successfully' });
    }
    catch (error) {
        if (error instanceof RoleInUseError) {
            return res.status(409).json({ error: error.message });
        }
        logger.error('Error deleting role:', error);
        res.status(500).json({ error: 'Failed to delete role' });
    }
});
export default router;
