import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/auth';

// Extend Express Request type to include userId
declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

/**
 * Middleware to verify JWT access token
 * Extracts token from Authorization header and validates it
 * Sets req.userId if valid
 */
export function authenticate(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'No valid authorization header found',
      });
    }
    
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    const { userId } = verifyAccessToken(token);
    req.userId = userId;
    
    next();
  } catch (error: any) {
    return res.status(401).json({
      error: 'Authentication failed',
      message: error.message || 'Invalid or expired token',
    });
  }
}

/**
 * Optional authentication - sets userId if token is valid, but doesn't fail if missing
 * Useful for endpoints that work differently for authenticated vs anonymous users
 */
export function optionalAuthenticate(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const { userId } = verifyAccessToken(token);
      req.userId = userId;
    }
    
    next();
  } catch (error) {
    // Ignore authentication errors for optional auth
    next();
  }
}
