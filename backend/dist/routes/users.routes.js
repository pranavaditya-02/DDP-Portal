import express from 'express';
import { z } from 'zod';
import usersService from '../services/users.service';
import { authenticateToken } from '../middleware/auth';
import { logger } from '../utils/logger';
const router = express.Router();
// Validation schemas
const createUserSchema = z.object({
    facultyId: z.string().min(1, 'Faculty ID is required'),
    email: z.string().email('Invalid email'),
    name: z.string().min(1, 'Name is required'),
    department: z.string().min(1, 'Department is required'),
    designation: z.string().min(1, 'Designation is required'),
    role: z.string().min(1, 'Role is required'),
    status: z.enum(['active', 'inactive']).default('active'),
});
const updateUserSchema = z.object({
    facultyId: z.string().optional(),
    email: z.string().email().optional(),
    name: z.string().optional(),
    department: z.string().optional(),
    designation: z.string().optional(),
    role: z.string().optional(),
    status: z.enum(['active', 'inactive']).optional(),
});
const bulkImportSchema = z.object({
    users: z.array(createUserSchema),
});
// Get all users
router.get('/', authenticateToken, async (_req, res) => {
    try {
        const users = await usersService.getAllUsers();
        res.json({ users });
    }
    catch (error) {
        logger.error('Error fetching users:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});
// Get metadata for user-management dropdowns
router.get('/metadata', authenticateToken, async (_req, res) => {
    try {
        const metadata = await usersService.getLookupMetadata();
        res.json(metadata);
    }
    catch (error) {
        logger.error('Error fetching users metadata:', error);
        res.status(500).json({ error: 'Failed to fetch users metadata' });
    }
});
// Get user by ID
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const user = await usersService.getUserById(parseInt(id));
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({ user });
    }
    catch (error) {
        logger.error('Error fetching user:', error);
        res.status(500).json({ error: 'Failed to fetch user' });
    }
});
// Create user
router.post('/', authenticateToken, async (req, res) => {
    try {
        const data = createUserSchema.parse(req.body);
        // Check for duplicates
        const { isDuplicate, reason } = await usersService.checkDuplicates(data.facultyId, data.email);
        if (isDuplicate) {
            return res.status(409).json({ error: reason || 'User already exists' });
        }
        const user = await usersService.createUser(data);
        res.status(201).json({ message: 'User created successfully', user });
    }
    catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.errors });
        }
        logger.error('Error creating user:', error);
        res.status(500).json({ error: 'Failed to create user' });
    }
});
// Update user
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const data = updateUserSchema.parse(req.body);
        const user = await usersService.updateUser(parseInt(id), data);
        res.json({ message: 'User updated successfully', user });
    }
    catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.errors });
        }
        logger.error('Error updating user:', error);
        res.status(500).json({ error: 'Failed to update user' });
    }
});
// Delete user
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        await usersService.deleteUser(parseInt(id));
        res.json({ message: 'User deleted successfully' });
    }
    catch (error) {
        logger.error('Error deleting user:', error);
        res.status(500).json({ error: 'Failed to delete user' });
    }
});
// Bulk import users
router.post('/bulk/import', authenticateToken, async (req, res) => {
    try {
        const { users } = bulkImportSchema.parse(req.body);
        const createdUsers = await usersService.importUsers(users);
        res.status(201).json({
            message: `${createdUsers.length} users imported successfully`,
            count: createdUsers.length,
            users: createdUsers,
        });
    }
    catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.errors });
        }
        logger.error('Error importing users:', error);
        res.status(500).json({ error: 'Failed to import users' });
    }
});
// Check for duplicate users
router.post('/check/duplicates', authenticateToken, async (req, res) => {
    try {
        const { facultyId, email } = req.body;
        if (!facultyId || !email) {
            return res.status(400).json({ error: 'Faculty ID and email are required' });
        }
        const result = await usersService.checkDuplicates(facultyId, email);
        res.json(result);
    }
    catch (error) {
        logger.error('Error checking duplicates:', error);
        res.status(500).json({ error: 'Failed to check duplicates' });
    }
});
export default router;
