// src/presentation/controllers/WorkspaceController.ts
import { Response } from 'express';
import { CreateWorkspaceUseCase } from '../../application/workspace/CreateWorkspaceUseCase.js';
import { AuthenticatedRequest } from '../middlewares/auth.middleware.js';

export class WorkspaceController {
  constructor(private createWorkspaceUseCase: CreateWorkspaceUseCase) {}

  create = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { name } = req.body;
      const workspace = await this.createWorkspaceUseCase.execute(name, req.user!.id);
      res.status(201).json({ success: true, data: workspace });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create workspace';
      res.status(400).json({ success: false, message });
    }
  };

  getMyWorkspace = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      // We will need to fetch this from the repo, but for now we just return a success
      res.status(200).json({ success: true, data: { message: "Workspace route works!" } });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Server Error' });
    }
  };
}