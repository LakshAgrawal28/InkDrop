import { Request, Response, NextFunction } from 'express';

/**
 * Global error handler middleware
 * Catches all errors and returns consistent error response
 */
export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error('Error:', err);
  
  // Database errors
  if (err.code === '23505') { // Unique violation
    return res.status(409).json({
      error: 'Conflict',
      message: 'Resource already exists',
    });
  }
  
  if (err.code === '23503') { // Foreign key violation
    return res.status(400).json({
      error: 'Bad Request',
      message: 'Referenced resource does not exist',
    });
  }
  
  // Default error
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';
  
  res.status(statusCode).json({
    error: err.name || 'Error',
    message,
  });
}

/**
 * 404 handler for routes that don't exist
 */
export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`,
  });
}
