import jwt from 'jsonwebtoken';
import { logger } from '../utils/logger';
import sessionService from '../services/session.service';
export const AUTH_COOKIE_NAME = 'ddp_auth_token';
const getJwtSecret = () => {
    const secret = process.env.JWT_SECRET?.trim();
    if (!secret) {
        throw new Error('JWT_SECRET is required and must not be empty');
    }
    if (secret.length < 32 || secret === 'your_jwt_secret_key_change_in_production') {
        throw new Error('JWT_SECRET must be at least 32 characters and not use default placeholder value');
    }
    return secret;
};
const getJwtIssuer = () => process.env.JWT_ISSUER || 'faculty-tracking-api';
const getJwtAudience = () => process.env.JWT_AUDIENCE || 'faculty-tracking-client';
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
export const extractToken = (req) => {
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
        logger.debug('No token provided');
        return res.status(401).json({ error: 'Access token required' });
    }
    const decoded = verifyToken(token);
    if (!decoded) {
        logger.debug('Invalid token received');
        return res.status(403).json({ error: 'Invalid or expired token' });
    }
    if (!sessionService.isSessionActive(decoded.sid, decoded.id)) {
        logger.debug(`Inactive session rejected for user ${decoded.email}`);
        return res.status(401).json({ error: 'Session expired or revoked' });
    }
    req.user = {
        id: decoded.id,
        username: decoded.username,
        email: decoded.email,
        name: decoded.name,
        roleId: decoded.roleId,
        roleName: decoded.roleName,
        roles: decoded.roles,
        facultyId: decoded.facultyId,
    };
    next();
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
export const generateToken = (payload, sessionId) => {
    return jwt.sign({ ...payload, sid: sessionId }, getJwtSecret(), {
        algorithm: 'HS256',
        issuer: getJwtIssuer(),
        audience: getJwtAudience(),
        subject: String(payload.id),
        expiresIn: process.env.JWT_EXPIRY || '24h',
    });
};
export const verifyToken = (token) => {
    try {
        const decoded = jwt.verify(token, getJwtSecret(), {
            algorithms: ['HS256'],
            issuer: getJwtIssuer(),
            audience: getJwtAudience(),
        });
        if (!decoded.sid) {
            return null;
        }
        return decoded;
    }
    catch (error) {
        logger.error('Token verification failed:', error);
        return null;
    }
};
