// src/application/category/CategoryUseCases.ts
import { Category } from '../../domain/entities/Category.js';
import { ICategoryRepository } from '../../domain/repositories/ICategoryRepository.js';

export class GetCategoriesUseCase {
  constructor(private categoryRepository: ICategoryRepository) {}
  async execute(): Promise<Category[]> {
    return await this.categoryRepository.findAll();
  }
}

export class CreateCategoryUseCase {
  constructor(private categoryRepository: ICategoryRepository) {}
  async execute(name: string): Promise<Category> {
    return await this.categoryRepository.create(name);
  }
}