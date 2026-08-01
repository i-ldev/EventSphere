// src/presentation/controllers/VenueController.ts
import { Response } from 'express';
import {
  CreateVenueUseCase,
  CreateVenueDTO,
} from '../../application/venue/CreateVenueUseCase.js';
import { GetVenuesUseCase } from '../../application/venue/GetVenuesUseCase.js';
import { AuthenticatedRequest } from '../middlewares/auth.middleware.js';

export class VenueController {
  constructor(
    private createVenueUseCase: CreateVenueUseCase,
    private getVenuesUseCase: GetVenuesUseCase,
  ) {}

  create = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const dto: CreateVenueDTO = req.body;
      const venue = await this.createVenueUseCase.execute(dto);

      res.status(201).json({
        success: true,
        message: 'Venue created successfully',
        data: venue,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Something went wrong';
      res.status(400).json({ success: false, message });
    }
  };

  getAll = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const venues = await this.getVenuesUseCase.execute();
      res.status(200).json({
        success: true,
        count: venues.length,
        data: venues,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Something went wrong';
      res.status(500).json({ success: false, message });
    }
  };
}
