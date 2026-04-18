import express from 'express'
import { z } from 'zod'
import { authenticateToken, requireRole } from '../middleware/auth'
import rolesService, { AppPageConflictError, RoleInUseError } from '../services/roles.service'
import { logger } from '../utils/logger'

const router = express.Router()

const roleSchema = z.object({
  name: z.string().trim().min(1, 'Role name is required'),
  description: z.string().trim().default(''),
  passwordPrefix: z.string().trim().default(''),
  editAccess: z.boolean().default(true),
  deleteAccess: z.boolean().default(false),
  status: z.boolean().default(true),
  resources: z.array(z.string().trim()).default([]),
  isSystem: z.boolean().default(false),
})

const appPageSchema = z.object({
  pageKey: z.string().trim().optional(),
  pageName: z.string().trim().min(1, 'Page name is required'),
  routePath: z.string().trim().min(1, 'Route path is required').refine((value) => value.startsWith('/'), {
    message: 'Route path must start with "/"',
  }),
})

router.get('/resources', authenticateToken, async (_req, res) => {
  try {
    const resources = await rolesService.getResources()
    res.json({ resources })
  } catch (error) {
    logger.error('Error fetching role resources:', error)
    res.status(500).json({ error: 'Failed to fetch role resources' })
  }
})

router.get('/pages', authenticateToken, requireRole('maintenance', 'admin'), async (_req, res) => {
  try {
    const pages = await rolesService.listAppPages()
    res.json({ pages })
  } catch (error) {
    logger.error('Error fetching app pages:', error)
    res.status(500).json({ error: 'Failed to fetch app pages' })
  }
})

router.post('/pages', authenticateToken, requireRole('maintenance', 'admin'), async (req, res) => {
  try {
    const payload = appPageSchema.parse(req.body)
    const page = await rolesService.createAppPage(payload)
    res.status(201).json({ message: 'Page created successfully', page })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors })
    }

    if (error instanceof AppPageConflictError) {
      return res.status(409).json({ error: error.message })
    }

    logger.error('Error creating app page:', error)
    res.status(500).json({ error: 'Failed to create app page' })
  }
})

router.put('/pages/:id', authenticateToken, requireRole('maintenance', 'admin'), async (req, res) => {
  try {
    const pageId = Number(req.params.id)
    if (!Number.isFinite(pageId) || pageId <= 0) {
      return res.status(400).json({ error: 'Invalid page id' })
    }

    const payload = appPageSchema.parse(req.body)
    const page = await rolesService.updateAppPage(pageId, payload)
    res.json({ message: 'Page updated successfully', page })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors })
    }

    if (error instanceof AppPageConflictError) {
      return res.status(409).json({ error: error.message })
    }

    const message = error instanceof Error ? error.message : ''
    if (message === 'Page not found') {
      return res.status(404).json({ error: 'Page not found' })
    }

    logger.error('Error updating app page:', error)
    res.status(500).json({ error: 'Failed to update app page' })
  }
})

router.delete('/pages/:id', authenticateToken, requireRole('maintenance', 'admin'), async (req, res) => {
  try {
    const pageId = Number(req.params.id)
    if (!Number.isFinite(pageId) || pageId <= 0) {
      return res.status(400).json({ error: 'Invalid page id' })
    }

    const deleted = await rolesService.deleteAppPage(pageId)
    if (!deleted) {
      return res.status(404).json({ error: 'Page not found' })
    }

    res.json({ message: 'Page deleted successfully' })
  } catch (error) {
    if (error instanceof AppPageConflictError) {
      return res.status(409).json({ error: error.message })
    }

    logger.error('Error deleting app page:', error)
    res.status(500).json({ error: 'Failed to delete app page' })
  }
})

router.get('/me/access', authenticateToken, async (req, res) => {
  try {
    if (!req.user?.roleId) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    const access = await rolesService.getRoleAccessByRoleId(req.user.roleId)
    res.json(access)
  } catch (error) {
    logger.error('Error fetching role access:', error)
    res.status(500).json({ error: 'Failed to fetch role access' })
  }
})

router.get('/', authenticateToken, async (_req, res) => {
  try {
    const roles = await rolesService.listRoles()
    res.json({ roles })
  } catch (error) {
    logger.error('Error fetching roles:', error)
    res.status(500).json({ error: 'Failed to fetch roles' })
  }
})

router.post('/', authenticateToken, requireRole('maintenance', 'admin'), async (req, res) => {
  try {
    const payload = roleSchema.parse(req.body)
    const role = await rolesService.createRole(payload)
    res.status(201).json({ message: 'Role created successfully', role })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors })
    }

    logger.error('Error creating role:', error)
    res.status(500).json({ error: 'Failed to create role' })
  }
})

router.put('/:id', authenticateToken, requireRole('maintenance', 'admin'), async (req, res) => {
  try {
    const roleId = Number(req.params.id)
    if (!Number.isFinite(roleId) || roleId <= 0) {
      return res.status(400).json({ error: 'Invalid role id' })
    }

    const payload = roleSchema.parse(req.body)
    const role = await rolesService.updateRole(roleId, payload)

    res.json({ message: 'Role updated successfully', role })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors })
    }

    logger.error('Error updating role:', error)
    res.status(500).json({ error: 'Failed to update role' })
  }
})

router.delete('/:id', authenticateToken, requireRole('maintenance', 'admin'), async (req, res) => {
  try {
    const roleId = Number(req.params.id)
    if (!Number.isFinite(roleId) || roleId <= 0) {
      return res.status(400).json({ error: 'Invalid role id' })
    }

    const deleted = await rolesService.deleteRole(roleId)
    if (!deleted) {
      return res.status(404).json({ error: 'Role not found' })
    }

    res.json({ message: 'Role deleted successfully' })
  } catch (error) {
    if (error instanceof RoleInUseError) {
      return res.status(409).json({ error: error.message })
    }

    logger.error('Error deleting role:', error)
    res.status(500).json({ error: 'Failed to delete role' })
  }
})

export default router
