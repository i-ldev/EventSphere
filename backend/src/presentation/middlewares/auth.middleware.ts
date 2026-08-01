// src/presentation/middlewares/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { JwtService } from '../../infrastructure/auth/JwtService.js';

// We extend the Request interface to include our custom 'user' payload
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

const jwtService = new JwtService();

export const authMiddleware = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ success: false, message: 'No token provided' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    // Verify the token
    const decoded = jwtService.verifyAccessToken(token);

    // Attach the user payload to the request object
    req.user = { id: decoded.id, role: decoded.role };

    next(); // Move to the next middleware or controller
  } catch {
    res
      .status(401)
      .json({ success: false, message: 'Invalid or expired token' });
  }
};
