// src/presentation/routes/workspace.routes.ts
import { Router } from 'express';
import { MongoWorkspaceRepository } from '../../infrastructure/repositories/MongoWorkspaceRepository.js';
import { MongoUserRepository } from '../../infrastructure/repositories/MongoUserRepository.js';
import { CreateWorkspaceUseCase } from '../../application/workspace/CreateWorkspaceUseCase.js';
import { WorkspaceController } from '../controllers/WorkspaceController.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();

const workspaceRepository = new MongoWorkspaceRepository();
const userRepository = new MongoUserRepository();
const createWorkspaceUseCase = new CreateWorkspaceUseCase(workspaceRepository, userRepository);
const workspaceController = new WorkspaceController(createWorkspaceUseCase);

router.post('/', authMiddleware, workspaceController.create);
router.get('/me', authMiddleware, workspaceController.getMyWorkspace);

export default router;