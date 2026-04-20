import express from 'express';
import { z } from 'zod';
import authService from '../services/auth.service';
import rolesService from '../services/roles.service';
import { AUTH_COOKIE_NAME, authenticateToken, extractToken, generateToken, verifyToken } from '../middleware/auth';
import { logger } from '../utils/logger';
import sessionService from '../services/session.service';
const router = express.Router();
// Validation schemas
const registerSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
    name: z.string().min(2),
    employeeId: z.string(),
});
const loginSchema = z.object({
    credential: z.string().min(1),
});
const parseJwtExpiryToMs = (expiry) => {
    const match = expiry.trim().match(/^(\d+)([smhd])$/i);
    if (!match)
        return 24 * 60 * 60 * 1000;
    const amount = Number(match[1]);
    const unit = match[2].toLowerCase();
    const multiplier = {
        s: 1000,
        m: 60 * 1000,
        h: 60 * 60 * 1000,
        d: 24 * 60 * 60 * 1000,
    }[unit] ?? 1000;
    return amount * multiplier;
};
const setAuthCookie = (res, token) => {
    res.cookie(AUTH_COOKIE_NAME, token, {
        httpOnly: true,
        sameSite: 'lax',
        secure: (process.env.NODE_ENV || '').toLowerCase() === 'production',
        path: '/',
        maxAge: parseJwtExpiryToMs(process.env.JWT_EXPIRY || '24h'),
    });
};
const clearAuthCookie = (res) => {
    res.clearCookie(AUTH_COOKIE_NAME, { path: '/' });
};
const groupOrder = ['Overview', 'Student', 'Faculty', 'Department', 'College', 'Management', 'Other'];
const pickDefaultRoute = (access) => {
    const filtered = (access.resources || [])
        .map((resource) => ({
        href: (resource.href || '').replace(/\/+$/, '') || '/',
        label: resource.label || '',
        group: resource.group || 'Other',
    }))
        .filter((resource) => resource.href !== '/' && resource.href !== '/login' && resource.href !== '/register')
        .filter((resource) => !/\[[^\]]+\]/.test(resource.href));
    if (filtered.length > 0) {
        filtered.sort((a, b) => {
            const ai = groupOrder.indexOf(a.group);
            const bi = groupOrder.indexOf(b.group);
            if (ai !== bi) {
                if (ai === -1)
                    return 1;
                if (bi === -1)
                    return -1;
                return ai - bi;
            }
            return a.label.localeCompare(b.label);
        });
        return filtered[0].href;
    }
    const routePaths = (access.routePaths || [])
        .map((route) => (route || '').replace(/\/+$/, '') || '/')
        .filter((route) => route !== '/' && route !== '/login' && route !== '/register')
        .filter((route) => !/\[[^\]]+\]/.test(route));
    return routePaths[0] || '/dashboard';
};
// Register
router.post('/register', async (req, res) => {
    try {
        const { email, password, name, employeeId } = registerSchema.parse(req.body);
        const user = await authService.register(email, password, name, employeeId);
        res.status(201).json({
            message: 'User registered successfully',
            user,
        });
    }
    catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.errors });
        }
        logger.error('Registration error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
});
// Google login
router.post('/google', async (req, res) => {
    try {
        const { credential } = loginSchema.parse(req.body);
        const user = await authService.loginWithGoogle(credential);
        const access = await rolesService.getRoleAccessByRoleId(user.roleId);
        const defaultRoute = pickDefaultRoute(access);
        const session = sessionService.createSession(user.id);
        const token = generateToken(user, session.id);
        setAuthCookie(res, token);
        res.json({
            message: 'Login successful',
            user,
            access,
            defaultRoute,
        });
    }
    catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.errors });
        }
        logger.error('Google login error:', error);
        res.status(401).json({ error: error instanceof Error ? error.message : 'Google login failed' });
    }
});
router.post('/logout', async (req, res) => {
    const token = extractToken(req);
    if (token) {
        const decoded = verifyToken(token);
        if (decoded?.sid) {
            sessionService.revokeSession(decoded.sid);
        }
    }
    clearAuthCookie(res);
    res.json({ message: 'Logged out successfully' });
});
// Verify token
router.post('/verify', authenticateToken, async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Authentication required' });
        }
        const user = await authService.getUserWithRoles(req.user.id);
        res.json({
            valid: true,
            user,
        });
    }
    catch (error) {
        logger.error('Token verification error:', error);
        res.status(500).json({ error: 'Verification failed' });
    }
});
// Get current user
router.get('/me', authenticateToken, async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Authentication required' });
        }
        const user = await authService.getUserWithRoles(req.user.id);
        res.json({ user });
    }
    catch (error) {
        logger.error('Error fetching current user:', error);
        res.status(500).json({ error: 'Failed to fetch user' });
    }
});
export default router;
