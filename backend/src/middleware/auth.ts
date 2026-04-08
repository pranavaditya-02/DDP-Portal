import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { logger } from '../utils/logger';

export interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    roles: string[];
    departmentId?: number;
  };
}

interface JWTPayload {
  id: number;
  email: string;
  roles: string[];
  departmentId?: number;
}

export const authenticateToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    logger.warn('No token provided');
    return res.status(401).json({ error: 'Access token required' });
  }

  // Allow demo tokens to pass through
  if (token.startsWith('demo-')) {
    req.user = {
      id: 1,
      email: 'demo@bit.edu',
      roles: ['student'],
    };
    return next();
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
  return jwt.sign(payload, process.env.JWT_SECRET || 'secret', {
    expiresIn: process.env.JWT_EXPIRY || '24h',
  });
};

export const verifyToken = (token: string): JWTPayload | null => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'secret') as JWTPayload;
  } catch (error) {
    logger.error('Token verification failed:', error);
    return null;
  }
};

export const optionalAuthenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    jwt.verify(token, process.env.JWT_SECRET || 'secret', (err, user) => {
      if (!err) {
        req.user = user as AuthRequest['user'];
      } else {
        logger.warn('Invalid token provided:', err.message);
      }
      next();
    });
  } else {
    // No token provided, but that's okay for GET requests
    logger.info('No token provided - request allowed without authentication');
    next();
  }
};
