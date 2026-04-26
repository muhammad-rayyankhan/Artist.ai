import { Request, Response, NextFunction } from 'express';
import { logger } from './logging';

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public isOperational: boolean = true
  ) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 404);
    this.name = 'NotFoundError';
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden') {
    super(message, 403);
    this.name = 'ForbiddenError';
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409);
    this.name = 'ConflictError';
  }
}

// Error handling middleware
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Log the error
  logger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
    requestId: (req as any).requestId,
    url: req.url,
    method: req.method
  });

  // Handle AppError instances
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: err.name,
      message: err.message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
  }

  // Handle Prisma errors
  if (err.name.includes('Prisma')) {
    // Prisma client errors
    const prismaError = err as any;

    if (prismaError.code === 'P2002') {
      // Unique constraint violation
      return res.status(409).json({
        error: 'ConflictError',
        message: 'A record with this value already exists'
      });
    }

    if (prismaError.code === 'P2025') {
      // Record not found
      return res.status(404).json({
        error: 'NotFoundError',
        message: 'Record not found'
      });
    }

    if (prismaError.code === 'P2003') {
      // Foreign key constraint violation
      return res.status(400).json({
        error: 'ValidationError',
        message: 'Invalid reference to related record'
      });
    }
  }

  // Handle validation errors (Joi, class-validator, etc.)
  if (err.name === 'ValidationError' || err.name === 'BadRequestError') {
    return res.status(400).json({
      error: 'ValidationError',
      message: err.message
    });
  }

  // Default error response
  const statusCode = 500;
  const message = process.env.NODE_ENV === 'production'
    ? 'Internal server error'
    : err.message;

  res.status(statusCode).json({
    error: 'InternalServerError',
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

// Async error handler wrapper
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};