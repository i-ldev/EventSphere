// src/presentation/controllers/VenueController.ts
import { Response } from 'express';
import { CreateVenueUseCase, CreateVenueDTO } from '../../application/venue/CreateVenueUseCase.js';
import { UpdateVenueUseCase, UpdateVenueDTO } from '../../application/venue/UpdateVenueUseCase.js';
import { DeleteVenueUseCase } from '../../application/venue/DeleteVenueUseCase.js';
import { GetVenuesUseCase } from '../../application/venue/GetVenuesUseCase.js';
import { AuthenticatedRequest } from '../middlewares/auth.middleware.js';

export class VenueController {
  constructor(
    private createVenueUseCase: CreateVenueUseCase,
    private updateVenueUseCase: UpdateVenueUseCase,
    private deleteVenueUseCase: DeleteVenueUseCase,
    private getVenuesUseCase: GetVenuesUseCase
  ) {}

  create = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const dto: CreateVenueDTO = req.body;
      // MULTI-TENANCY: Attach the organizer's workspaceId to the venue
      dto.workspaceId = req.user?.workspaceId; 
      
      const venue = await this.createVenueUseCase.execute(dto);
      res.status(201).json({ success: true, message: 'Venue created successfully', data: venue });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Something went wrong';
      res.status(400).json({ success: false, message });
    }
  };

  update = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const dto: UpdateVenueDTO = req.body;
      const venue = await this.updateVenueUseCase.execute(req.params.id, dto);
      res.status(200).json({ success: true, message: 'Venue updated successfully', data: venue });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Something went wrong';
      res.status(400).json({ success: false, message });
    }
  };

  delete = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const deleted = await this.deleteVenueUseCase.execute(req.params.id);
      if (!deleted) throw new Error('Venue not found');
      res.status(200).json({ success: true, message: 'Venue deleted successfully' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Something went wrong';
      res.status(400).json({ success: false, message });
    }
  };

  getAll = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      // MULTI-TENANCY: If user is Organizer, pass their workspaceId to filter
      const workspaceId = req.user?.role === 'ORGANIZER' ? req.user?.workspaceId : undefined;
      
      const venues = await this.getVenuesUseCase.execute(workspaceId);
      res.status(200).json({ success: true, count: venues.length, data: venues });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Something went wrong';
      res.status(500).json({ success: false, message });
    }
  };
}