import express from 'express'
import { z } from 'zod'
import { authenticateToken, requireRole, type AuthRequest } from '../middleware/auth'
import workflowTargetsService from '../services/workflowTargets.service'
import { logger } from '../utils/logger'

const router = express.Router()

const academicYearSchema = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}$/i, 'Academic year must be in YYYY-YY format')

const designationTargetUpdateSchema = z.object({
  academicYear: academicYearSchema.default('2026-27'),
  targets: z.record(z.number().min(0)).refine((value) => Object.keys(value).length > 0, {
    message: 'Provide at least one target value',
  }),
})

const rebuildSchema = z.object({
  academicYear: academicYearSchema.default('2026-27'),
  designationId: z.number().int().positive().optional(),
})

const deadlineSettingsSchema = z.object({
  academicYear: academicYearSchema.default('2026-27'),
  settings: z.record(z.string()).default({}),
})

const completeTaskSchema = z.object({
  academicYear: academicYearSchema.default('2026-27'),
  workflowType: z.enum(['paper', 'patent', 'proposal']),
  slotNo: z.number().int().positive().default(1),
  taskCode: z.string().trim().min(1),
  payload: z.record(z.any()).optional(),
})

router.get('/designation-rules', authenticateToken, requireRole('maintenance', 'admin'), async (req, res) => {
  try {
    const parsed = academicYearSchema.safeParse(req.query.academicYear || '2026-27')
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.errors })
    }

    const rules = await workflowTargetsService.getDesignationRules(parsed.data)
    res.json({ academicYear: parsed.data, rules })
  } catch (error) {
    logger.error('Error fetching designation target rules:', error)
    res.status(500).json({ error: 'Failed to fetch designation target rules' })
  }
})

router.get('/target-master', authenticateToken, requireRole('maintenance', 'admin'), async (_req, res) => {
  try {
    const targets = await workflowTargetsService.getTargetDefinitions()
    res.json({ targets })
  } catch (error) {
    logger.error('Error fetching target master:', error)
    res.status(500).json({ error: 'Failed to fetch target master' })
  }
})

router.put('/designation-rules/:designationId', authenticateToken, requireRole('maintenance', 'admin'), async (req, res) => {
  try {
    const designationId = Number(req.params.designationId)
    if (!Number.isFinite(designationId) || designationId <= 0) {
      return res.status(400).json({ error: 'Invalid designation id' })
    }

    const payload = designationTargetUpdateSchema.parse(req.body)
    const rules = await workflowTargetsService.upsertDesignationTargets({
      academicYear: payload.academicYear,
      designationId,
      targets: payload.targets,
    })

    res.json({
      message: 'Designation targets updated successfully',
      academicYear: payload.academicYear,
      designationId,
      rules,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors })
    }

    logger.error('Error updating designation target rules:', error)
    res.status(500).json({ error: 'Failed to update designation target rules' })
  }
})

router.post('/assignments/rebuild', authenticateToken, requireRole('maintenance', 'admin'), async (req, res) => {
  try {
    const payload = rebuildSchema.parse(req.body)
    const count = await workflowTargetsService.rebuildAssignments(payload)

    res.json({
      message: 'Faculty target assignments rebuilt successfully',
      academicYear: payload.academicYear,
      designationId: payload.designationId || null,
      assignmentCount: count,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors })
    }

    logger.error('Error rebuilding faculty target assignments:', error)
    res.status(500).json({ error: 'Failed to rebuild faculty target assignments' })
  }
})

router.get('/faculty/:facultyId', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const parsed = academicYearSchema.safeParse(req.query.academicYear || '2026-27')
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.errors })
    }

    const summary = await workflowTargetsService.getFacultyTargets(parsed.data, req.params.facultyId)
    if (!summary) {
      return res.status(404).json({ error: 'No target assignments found for faculty' })
    }

    res.json(summary)
  } catch (error) {
    logger.error('Error fetching faculty target assignments:', error)
    res.status(500).json({ error: 'Failed to fetch faculty target assignments' })
  }
})

router.get('/me', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const parsed = academicYearSchema.safeParse(req.query.academicYear || '2026-27')
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.errors })
    }

    if (!req.user?.facultyId) {
      return res.status(400).json({ error: 'Current user has no faculty id linked' })
    }

    const summary = await workflowTargetsService.getFacultyTargets(parsed.data, req.user.facultyId)
    if (!summary) {
      return res.status(404).json({ error: 'No target assignments found for current user' })
    }

    res.json(summary)
  } catch (error) {
    logger.error('Error fetching current user target assignments:', error)
    res.status(500).json({ error: 'Failed to fetch current user target assignments' })
  }
})

router.get('/admin/deadlines', authenticateToken, requireRole('maintenance', 'admin'), async (req: AuthRequest, res) => {
  try {
    const parsed = academicYearSchema.safeParse(req.query.academicYear || '2026-27')
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.errors })
    }

    const settings = await workflowTargetsService.getDeadlineSettingsForAcademicYear(parsed.data)
    res.json({ academicYear: parsed.data, settings })
  } catch (error) {
    logger.error('Error fetching workflow deadline settings:', error)
    res.status(500).json({ error: 'Failed to fetch workflow deadline settings' })
  }
})

router.put('/admin/deadlines', authenticateToken, requireRole('maintenance', 'admin'), async (req: AuthRequest, res) => {
  try {
    const payload = deadlineSettingsSchema.parse(req.body)
    const settings = await workflowTargetsService.saveDeadlineSettings({
      academicYear: payload.academicYear,
      settings: payload.settings,
      updatedBy: req.user?.id || null,
    })

    res.json({
      message: 'Workflow deadline settings updated successfully',
      academicYear: payload.academicYear,
      settings,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors })
    }

    logger.error('Error updating workflow deadline settings:', error)
    res.status(500).json({ error: 'Failed to update workflow deadline settings' })
  }
})

router.get('/me/workflow', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const parsed = academicYearSchema.safeParse(req.query.academicYear || '2026-27')
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.errors })
    }

    if (!req.user?.facultyId) {
      return res.status(400).json({ error: 'Current user has no faculty id linked' })
    }

    const plan = await workflowTargetsService.getWorkflowPlanForFaculty({
      academicYear: parsed.data,
      facultyId: req.user.facultyId,
      facultyEmail: req.user.email,
    })

    if (!plan) {
      return res.status(404).json({ error: 'No workflow plan found for current user' })
    }

    res.json(plan)
  } catch (error) {
    logger.error('Error fetching current user workflow plan:', error)
    res.status(500).json({ error: 'Failed to fetch workflow plan' })
  }
})

router.post('/me/workflow/complete', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const payload = completeTaskSchema.parse(req.body)

    if (!req.user?.facultyId) {
      return res.status(400).json({ error: 'Current user has no faculty id linked' })
    }

    await workflowTargetsService.completeWorkflowTask({
      academicYear: payload.academicYear,
      facultyId: req.user.facultyId,
      facultyEmail: req.user.email,
      workflowType: payload.workflowType,
      slotNo: payload.slotNo,
      taskCode: payload.taskCode,
      payload: payload.payload,
    })

    res.json({ message: 'Task marked as completed' })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors })
    }

    logger.error('Error completing workflow task:', error)
    res.status(500).json({ error: 'Failed to complete workflow task' })
  }
})

export default router
