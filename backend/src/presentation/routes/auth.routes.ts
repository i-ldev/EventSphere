// src/presentation/routes/auth.routes.ts
import { Router } from 'express';
import { MongoUserRepository } from '../../infrastructure/repositories/MongoUserRepository.js';
import { RegisterUserUseCase } from '../../application/user/RegisterUserUseCase.js';
import { LoginUserUseCase } from '../../application/user/LoginUserUseCase.js';
import { GetUserProfileUseCase } from '../../application/user/GetUserProfileUseCase.js';
import { JwtService } from '../../infrastructure/auth/JwtService.js';
import { AuthController } from '../controllers/AuthController.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();

// Dependency Injection
const userRepository = new MongoUserRepository();
const jwtService = new JwtService();

const registerUserUseCase = new RegisterUserUseCase(userRepository);
const loginUserUseCase = new LoginUserUseCase(userRepository, jwtService);
const getUserProfileUseCase = new GetUserProfileUseCase(userRepository);

const authController = new AuthController(
  registerUserUseCase,
  loginUserUseCase,
  getUserProfileUseCase,
);

// Routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected Route
router.get('/me', authMiddleware, authController.getMe);

export default router;
