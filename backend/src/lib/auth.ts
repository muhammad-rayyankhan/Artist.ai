import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

export interface UserPayload {
  userId: string;
  email: string;
  role: 'admin' | 'operator' | 'viewer';
}

export interface AuthRequest extends Request {
  user?: UserPayload;
}

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';

export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthError';
  }
}

export function generateToken(payload: UserPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

export function verifyToken(token: string): UserPayload {
  try {
    return jwt.verify(token, JWT_SECRET) as UserPayload;
  } catch (error) {
    throw new AuthError('Invalid or expired token');
  }
}

export function authenticateToken(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'Access token required' });
    return;
  }

  try {
    const user = verifyToken(token);
    req.user = user;
    next();
  } catch (error) {
    if (error instanceof AuthError) {
      res.status(403).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

export function authorizeRole(...allowedRoles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({ error: 'Insufficient permissions' });
      return;
    }

    next();
  };
}

// Mock user database (replace with real database in production)
const mockUsers = [
  {
    id: '1',
    email: 'admin@example.com',
    password: 'admin123', // In production, use hashed passwords
    role: 'admin' as const,
  },
  {
    id: '2',
    email: 'operator@example.com',
    password: 'operator123',
    role: 'operator' as const,
  },
];

export function authenticateUser(email: string, password: string): UserPayload | null {
  const user = mockUsers.find(u => u.email === email && u.password === password);

  if (!user) {
    return null;
  }

  return {
    userId: user.id,
    email: user.email,
    role: user.role,
  };
}

export function login(email: string, password: string): { token: string; user: UserPayload } | null {
  const userPayload = authenticateUser(email, password);

  if (!userPayload) {
    return null;
  }

  const token = generateToken(userPayload);

  return {
    token,
    user: userPayload,
  };
}