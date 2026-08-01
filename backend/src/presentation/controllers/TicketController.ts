// src/presentation/controllers/TicketController.ts
import { Response } from 'express';
import {
  CreateTicketTypeUseCase,
  CreateTicketTypeDTO,
} from '../../application/ticket/CreateTicketTypeUseCase.js';
import { GetTicketsForEventUseCase } from '../../application/ticket/GetTicketsForEventUseCase.js';
import { AuthenticatedRequest } from '../middlewares/auth.middleware.js';

export class TicketController {
  constructor(
    private createTicketTypeUseCase: CreateTicketTypeUseCase,
    private getTicketsForEventUseCase: GetTicketsForEventUseCase,
  ) {}

  create = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const dto: CreateTicketTypeDTO = {
        eventId: req.params.eventId,
        name: req.body.name,
        price: req.body.price,
        quantity: req.body.quantity,
      };

      const ticket = await this.createTicketTypeUseCase.execute(
        dto,
        req.user!.id,
      );

      res.status(201).json({
        success: true,
        message: 'Ticket type created successfully',
        data: ticket,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Something went wrong';
      const status = message.includes('Unauthorized')
        ? 403
        : message.includes('not found')
          ? 404
          : 400;
      res.status(status).json({ success: false, message });
    }
  };

  getByEvent = async (
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> => {
    try {
      const eventId = req.params.eventId;
      const tickets = await this.getTicketsForEventUseCase.execute(eventId);

      res.status(200).json({
        success: true,
        count: tickets.length,
        data: tickets,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Something went wrong';
      res.status(500).json({ success: false, message });
    }
  };
}
