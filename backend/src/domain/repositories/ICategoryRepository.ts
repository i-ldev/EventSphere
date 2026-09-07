// src/domain/repositories/ICategoryRepository.ts
import { Category } from '../entities/Category.js';

export interface ICategoryRepository {
  findAll(): Promise<Category[]>;
  create(name: string): Promise<Category>;
}