// src/presentation/controllers/EventController.ts
import { Response } from 'express';
import {
  CreateEventUseCase,
  CreateEventDTO,
} from '../../application/event/CreateEventUseCase.js';
import { GetEventsUseCase } from '../../application/event/GetEventsUseCase.js';
import { PublishEventUseCase } from '../../application/event/PublishEventUseCase.js';
import { AuthenticatedRequest } from '../middlewares/auth.middleware.js';

export class EventController {
  constructor(
    private createEventUseCase: CreateEventUseCase,
    private getEventsUseCase: GetEventsUseCase,
    private publishEventUseCase: PublishEventUseCase,
  ) {}

  create = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const dto: CreateEventDTO = req.body;
      const event = await this.createEventUseCase.execute(dto, req.user!.id);

      res.status(201).json({
        success: true,
        message: 'Event created successfully',
        data: event,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Something went wrong';
      res.status(400).json({ success: false, message });
    }
  };

  getAll = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const events = await this.getEventsUseCase.execute();
      res.status(200).json({
        success: true,
        count: events.length,
        data: events,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Something went wrong';
      res.status(500).json({ success: false, message });
    }
  };

  publish = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const eventId = req.params.id;
      await this.publishEventUseCase.execute(eventId, req.user!.id);

      res.status(200).json({
        success: true,
        message: 'Event published successfully',
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Something went wrong';
      // 403 Forbidden if unauthorized, 404 if not found, 400 otherwise
      const status = message.includes('Unauthorized')
        ? 403
        : message.includes('not found')
          ? 404
          : 400;
      res.status(status).json({ success: false, message });
    }
  };
}
