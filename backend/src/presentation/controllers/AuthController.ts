// src/presentation/controllers/AuthController.ts
import { Response } from 'express';
import {
  RegisterUserUseCase,
  RegisterUserDTO,
} from '../../application/user/RegisterUserUseCase.js';
import {
  LoginUserUseCase,
  LoginUserDTO,
} from '../../application/user/LoginUserUseCase.js';
import { GetUserProfileUseCase } from '../../application/user/GetUserProfileUseCase.js';
import { AuthenticatedRequest } from '../middlewares/auth.middleware.js';

export class AuthController {
  constructor(
    private registerUserUseCase: RegisterUserUseCase,
    private loginUserUseCase: LoginUserUseCase,
    private getUserProfileUseCase: GetUserProfileUseCase,
  ) {}

  register = async (
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> => {
    try {
      const dto: RegisterUserDTO = req.body;
      const user = await this.registerUserUseCase.execute(dto);

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: { id: user.id, email: user.email, role: user.role },
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Something went wrong';
      res.status(400).json({ success: false, message });
    }
  };

  login = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const dto: LoginUserDTO = req.body;
      const { accessToken, refreshToken } =
        await this.loginUserUseCase.execute(dto);

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: { accessToken },
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Something went wrong';
      res.status(401).json({ success: false, message });
    }
  };

  getMe = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      // req.user is populated by our authMiddleware!
      const user = await this.getUserProfileUseCase.execute(req.user!.id);

      if (!user) {
        res.status(404).json({ success: false, message: 'User not found' });
        return;
      }

      res.status(200).json({
        success: true,
        data: {
          id: user.id,
          email: user.email,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
        },
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Something went wrong';
      res.status(400).json({ success: false, message });
    }
  };
}
