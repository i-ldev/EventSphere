// src/presentation/routes/admin.routes.ts
import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { roleMiddleware } from '../middlewares/role.middleware.js';
import { Role } from '../../shared/enums/role.enum.js';
import { MongoUserRepository } from '../../infrastructure/repositories/MongoUserRepository.js';
import { GetAllUsersUseCase } from '../../application/user/GetAllUsersUseCase.js';
import { AdminController } from '../controllers/AdminController.js';

const router = Router();

// Dependency Injection
const userRepository = new MongoUserRepository();
const getAllUsersUseCase = new GetAllUsersUseCase(userRepository);
const adminController = new AdminController(getAllUsersUseCase);

// Only SUPER_ADMIN can access these routes
router.get(
  '/users',
  authMiddleware,
  roleMiddleware([Role.SUPER_ADMIN]),
  adminController.getAllUsers,
);

export default router;
