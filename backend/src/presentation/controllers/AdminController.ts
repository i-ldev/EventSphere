// src/presentation/controllers/AdminController.ts
import { Response } from 'express';
import { GetAllUsersUseCase } from '../../application/user/GetAllUsersUseCase.js';
import { AuthenticatedRequest } from '../middlewares/auth.middleware.js';

export class AdminController {
  constructor(private getAllUsersUseCase: GetAllUsersUseCase) {}

  getAllUsers = async (
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> => {
    try {
      const users = await this.getAllUsersUseCase.execute();

      // Map users to remove passwords from the response
      const safeUsers = users.map((u) => ({
        id: u.id,
        email: u.email,
        role: u.role,
        firstName: u.firstName,
        lastName: u.lastName,
        isEmailVerified: u.isEmailVerified,
        createdAt: u.createdAt,
      }));

      res.status(200).json({
        success: true,
        count: safeUsers.length,
        data: safeUsers,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Something went wrong';
      res.status(500).json({ success: false, message });
    }
  };
}
