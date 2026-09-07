// src/presentation/controllers/EventController.ts
import { Response } from 'express';
import { CreateEventUseCase, CreateEventDTO } from '../../application/event/CreateEventUseCase.js';
import { UpdateEventUseCase, UpdateEventDTO } from '../../application/event/UpdateEventUseCase.js';
import { DeleteEventUseCase } from '../../application/event/DeleteEventUseCase.js';
import { GetEventsUseCase } from '../../application/event/GetEventsUseCase.js';
import { PublishEventUseCase } from '../../application/event/PublishEventUseCase.js';
import { GetEventStatsUseCase } from '../../application/event/GetEventStatsUseCase.js';
import { AuthenticatedRequest } from '../middlewares/auth.middleware.js';

export class EventController {
  constructor(
    private createEventUseCase: CreateEventUseCase,
    private updateEventUseCase: UpdateEventUseCase,
    private deleteEventUseCase: DeleteEventUseCase,
    private getEventsUseCase: GetEventsUseCase,
    private publishEventUseCase: PublishEventUseCase,
    private getEventStatsUseCase: GetEventStatsUseCase
  ) {}

  create = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const dto: CreateEventDTO = req.body;
      // MULTI-TENANCY: Attach the organizer's workspaceId to the event
      dto.workspaceId = req.user?.workspaceId; 
      
      const event = await this.createEventUseCase.execute(dto, req.user!.id);
      res.status(201).json({ success: true, message: 'Event created successfully', data: event });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Something went wrong';
      res.status(400).json({ success: false, message });
    }
  };

  update = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const dto: UpdateEventDTO = req.body;
      const event = await this.updateEventUseCase.execute(req.params.id, dto);
      res.status(200).json({ success: true, message: 'Event updated successfully', data: event });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Something went wrong';
      res.status(400).json({ success: false, message });
    }
  };

  delete = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const deleted = await this.deleteEventUseCase.execute(req.params.id);
      if (!deleted) throw new Error('Event not found');
      res.status(200).json({ success: true, message: 'Event deleted successfully' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Something went wrong';
      res.status(400).json({ success: false, message });
    }
  };

  getAll = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const query: any = {
        status: req.query.status as string,
        category: req.query.category as string,
        search: req.query.search as string
      };

      // MULTI-TENANCY: If user is Organizer, only show their workspace events
      if (req.user?.role === 'ORGANIZER' && req.user?.workspaceId) {
        query.workspaceId = req.user.workspaceId;
      }

    
      const events = await this.getEventsUseCase.execute(query);
      res.status(200).json({ success: true, count: events.length, data: events });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Something went wrong';
      res.status(500).json({ success: false, message });
    }
  };

  publish = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      await this.publishEventUseCase.execute(req.params.id, req.user!.id);
      res.status(200).json({ success: true, message: 'Event published successfully' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Something went wrong';
      const status = message.includes('Unauthorized') ? 403 : message.includes('not found') ? 404 : 400;
      res.status(status).json({ success: false, message });
    }
  };

  getStats = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const stats = await this.getEventStatsUseCase.execute(req.params.id);
      res.status(200).json({ success: true, data: stats });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Something went wrong';
      res.status(500).json({ success: false, message });
    }
  };
}