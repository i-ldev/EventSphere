// src/presentation/controllers/CategoryController.ts
import { Response } from 'express';
import { GetCategoriesUseCase, CreateCategoryUseCase } from '../../application/category/CategoryUseCases.js';
import { AuthenticatedRequest } from '../middlewares/auth.middleware.js';

export class CategoryController {
  constructor(
    private getCategoriesUseCase: GetCategoriesUseCase,
    private createCategoryUseCase: CreateCategoryUseCase
  ) {}

  getAll = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const categories = await this.getCategoriesUseCase.execute();
      res.status(200).json({ success: true, data: categories });
    } catch (error) {
      console.error('Error fetching categories:', error); // <-- Added this!
      res.status(500).json({ success: false, message: 'Failed to fetch categories' });
    }
  };

  create = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const category = await this.createCategoryUseCase.execute(req.body.name);
      res.status(201).json({ success: true, data: category });
    } catch (error) {
      console.error('Error creating category:', error);
      const message = error instanceof Error ? error.message : 'Failed to create category';
      res.status(400).json({ success: false, message });
    }
  };
}