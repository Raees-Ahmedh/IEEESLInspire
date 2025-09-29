import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/database';

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        email: string;
        role: string;
        firstName?: string | null;
        lastName?: string | null;
      };
    }
  }
}

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-for-development';

// Ensure JWT_SECRET is available
if (!JWT_SECRET || JWT_SECRET === 'fallback-secret-key-for-development') {
  console.warn('⚠️  WARNING: Using fallback JWT secret. Please set JWT_SECRET in your .env file');
}

// Middleware to verify JWT token
export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Access denied. No token provided.'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    // Get user from database to ensure they still exist and are active
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true
      }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User not found'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        error: 'Account is disabled'
      });
    }

    // Add user to request object
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName
    };

    next();
  } catch (error: any) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: 'Invalid token'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Token expired'
      });
    }

    console.error('Authentication error:', error);
    return res.status(500).json({
      success: false,
      error: 'Authentication failed'
    });
  }
};

// Middleware to check if user has required role
export const requireRole = (roles: string | string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions'
      });
    }

    next();
  };
};

// Middleware to check if user is admin
export const requireAdmin = requireRole(['admin']);

// Middleware to check if user is admin or manager
export const requireAdminOrManager = requireRole(['admin', 'manager']);

// Require admin, manager, or editor role
export const requireAdminOrManagerOrEditor = requireRole(['admin', 'manager', 'editor']);

// Optional authentication (doesn't fail if no token)
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(); // Continue without authentication
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true
      }
    });

    if (user && user.isActive) {
      req.user = {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName
      };
    }

    next();
  } catch (error) {
    // If token is invalid, continue without authentication
    next();
  }
};