// src/presentation/middlewares/role.middleware.ts
import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth.middleware.js';
import { Role } from '../../shared/enums/role.enum.js';

export const roleMiddleware = (allowedRoles: Role[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user || !allowedRoles.includes(req.user.role as Role)) {
      res.status(403).json({
        success: false,
        message: 'Forbidden: You do not have permission to perform this action',
      });
      return;
    }
    next();
  };
};
