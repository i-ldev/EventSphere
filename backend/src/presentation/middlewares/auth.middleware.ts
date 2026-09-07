// src/presentation/middlewares/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { JwtService } from '../../infrastructure/auth/JwtService.js';
import { MongoUserRepository } from '../../infrastructure/repositories/MongoUserRepository.js';

// We extend the Request interface to include our custom 'user' payload
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: string;
    workspaceId?: string;
  };
}

const jwtService = new JwtService();
const userRepository = new MongoUserRepository();

export const authMiddleware = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ success: false, message: 'No token provided' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwtService.verifyAccessToken(token) as any;
    const user = await userRepository.findById(decoded.id);
    if (!user) {
      res.status(401).json({ success: false, message: 'User not found' });
      return;
    }

    req.user = {
      id: user.id,
      role: user.role,
      workspaceId: user.workspaceId || undefined
    };
    
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

// NEW: Optional Auth Middleware (for public routes that need to know IF a user is logged in)
export const optionalAuthMiddleware = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  // If no token is provided, just continue. req.user will remain undefined.
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwtService.verifyAccessToken(token) as any;
    const user = await userRepository.findById(decoded.id);
    
    if (user) {
      req.user = {
        id: user.id,
        role: user.role,
        workspaceId: user.workspaceId || undefined
      };
    }
    
    next();
  } catch (error) {
    // If the token is invalid, we still just continue (treating them as a guest)
    next();
  }
};