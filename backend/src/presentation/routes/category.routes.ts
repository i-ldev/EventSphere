// src/presentation/routes/category.routes.ts
import { Router } from 'express';
import { MongoCategoryRepository } from '../../infrastructure/repositories/MongoCategoryRepository.js';
import { GetCategoriesUseCase, CreateCategoryUseCase } from '../../application/category/CategoryUseCases.js';
import { CategoryController } from '../controllers/CategoryController.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { roleMiddleware } from '../middlewares/role.middleware.js';
import { Role } from '../../shared/enums/role.enum.js';

const router = Router();
const repo = new MongoCategoryRepository();
const getCategoriesUseCase = new GetCategoriesUseCase(repo);
const createCategoryUseCase = new CreateCategoryUseCase(repo);
const controller = new CategoryController(getCategoriesUseCase, createCategoryUseCase);

// GET /api/v1/categories (Public)
router.get('/', controller.getAll);
// POST /api/v1/categories (Admin/Organizer only)
router.post('/', authMiddleware, roleMiddleware([Role.ORGANIZER, Role.SUPER_ADMIN]), controller.create);

export default router;