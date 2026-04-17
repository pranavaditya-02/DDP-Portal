import jwt from 'jsonwebtoken';
import { logger } from '../utils/logger';
export const AUTH_COOKIE_NAME = 'ddp_auth_token';
const parseCookies = (cookieHeader) => {
    if (!cookieHeader)
        return {};
    return cookieHeader.split(';').reduce((accumulator, part) => {
        const index = part.indexOf('=');
        if (index === -1)
            return accumulator;
        const key = part.slice(0, index).trim();
        const value = decodeURIComponent(part.slice(index + 1).trim());
        accumulator[key] = value;
        return accumulator;
    }, {});
};
const extractToken = (req) => {
    const authorizationHeader = req.headers['authorization'];
    if (authorizationHeader && authorizationHeader.startsWith('Bearer ')) {
        return authorizationHeader.slice(7);
    }
    const cookies = parseCookies(req.headers.cookie);
    return cookies[AUTH_COOKIE_NAME] || null;
};
export const authenticateToken = (req, res, next) => {
    const token = extractToken(req);
    if (!token) {
        logger.warn('No token provided');
        return res.status(401).json({ error: 'Access token required' });
    }
    jwt.verify(token, process.env.JWT_SECRET || 'secret', (err, user) => {
        if (err) {
            logger.warn('Invalid token:', err.message);
            return res.status(403).json({ error: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    });
};
export const requireRole = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Authentication required' });
        }
        const hasRole = req.user.roles.some((role) => roles.includes(role));
        if (!hasRole) {
            logger.warn(`User ${req.user.email} lacks required role. Required: ${roles.join(', ')}, Has: ${req.user.roles.join(', ')}`);
            return res.status(403).json({ error: 'Insufficient permissions' });
        }
        next();
    };
};
export const generateToken = (payload) => {
    const secret = process.env.JWT_SECRET || 'secret';
    const options = {
        expiresIn: process.env.JWT_EXPIRY || '24h',
    };
    return jwt.sign(payload, secret, options);
};
export const verifyToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET || 'secret');
    }
    catch (error) {
        logger.error('Token verification failed:', error);
        return null;
    }
};
