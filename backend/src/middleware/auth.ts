import type { Request, Response, NextFunction } from 'express';
import jwt, { type Secret, type SignOptions } from 'jsonwebtoken';
import { logger } from '../utils/logger';

export const AUTH_COOKIE_NAME = 'ddp_auth_token';

export interface AuthRequest extends Request {
  user?: {
    id: number;
    username: string;
    email: string;
    name: string;
    roleId: number;
    roleName: string;
    roles: string[];
    facultyId?: string | null;
  };
}

interface JWTPayload {
  id: number;
  username: string;
  email: string;
  name: string;
  roleId: number;
  roleName: string;
  roles: string[];
  facultyId?: string | null;
  exp?: number;
}

const parseCookies = (cookieHeader?: string) => {
  if (!cookieHeader) return {} as Record<string, string>

  return cookieHeader.split(';').reduce<Record<string, string>>((accumulator, part) => {
    const index = part.indexOf('=')
    if (index === -1) return accumulator

    const key = part.slice(0, index).trim()
    const value = decodeURIComponent(part.slice(index + 1).trim())
    accumulator[key] = value
    return accumulator
  }, {})
}

const extractToken = (req: Request) => {
  const authorizationHeader = req.headers['authorization']
  if (authorizationHeader && authorizationHeader.startsWith('Bearer ')) {
    return authorizationHeader.slice(7)
  }

  const cookies = parseCookies(req.headers.cookie)
  return cookies[AUTH_COOKIE_NAME] || null
}

export const authenticateToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
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

    req.user = user as AuthRequest['user'];
    next();
  });
};

export const requireRole = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
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

export const generateToken = (payload: JWTPayload): string => {
  const secret: Secret = process.env.JWT_SECRET || 'secret';
  const options: SignOptions = {
    expiresIn: process.env.JWT_EXPIRY || '24h',
  };

  return jwt.sign(payload, secret, options);
};

export const verifyToken = (token: string): JWTPayload | null => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'secret') as JWTPayload;
  } catch (error) {
    logger.error('Token verification failed:', error);
    return null;
  }
};
