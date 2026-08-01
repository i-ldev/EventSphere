// src/presentation/controllers/RegistrationController.ts
import { Response } from 'express';
import {
  BuyTicketUseCase,
  BuyTicketDTO,
} from '../../application/registration/BuyTicketUseCase.js';
import { GetMyRegistrationsUseCase } from '../../application/registration/GetMyRegistrationsUseCase.js';
import { GetOrganizerStatsUseCase } from '../../application/registration/GetOrganizerStatsUseCase.js';
import { CheckInAttendeeUseCase } from '../../application/registration/CheckInAttendeeUseCase.js';
import { AuthenticatedRequest } from '../middlewares/auth.middleware.js';

export class RegistrationController {
  constructor(
    private buyTicketUseCase: BuyTicketUseCase,
    private getMyRegistrationsUseCase: GetMyRegistrationsUseCase,
    private getOrganizerStatsUseCase: GetOrganizerStatsUseCase,
    private checkInAttendeeUseCase: CheckInAttendeeUseCase,
  ) {}

  buyTicket = async (
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> => {
    try {
      const dto: BuyTicketDTO = {
        eventId: req.body.eventId,
        ticketTypeId: req.body.ticketTypeId,
      };

      const registration = await this.buyTicketUseCase.execute(
        dto,
        req.user!.id,
      );

      res.status(201).json({
        success: true,
        message: 'Ticket purchased successfully!',
        data: registration,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Something went wrong';
      const status = message.includes('not found') ? 404 : 400;
      res.status(status).json({ success: false, message });
    }
  };

  getMyTickets = async (
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> => {
    try {
      const registrations = await this.getMyRegistrationsUseCase.execute(
        req.user!.id,
      );

      res.status(200).json({
        success: true,
        count: registrations.length,
        data: registrations,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Something went wrong';
      res.status(500).json({ success: false, message });
    }
  };

  getOrganizerStats = async (
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> => {
    try {
      const stats = await this.getOrganizerStatsUseCase.execute(req.user!.id);

      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Something went wrong';
      res.status(500).json({ success: false, message });
    }
  };

  checkInAttendee = async (
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> => {
    try {
      const registrationId = req.params.id;
      await this.checkInAttendeeUseCase.execute(registrationId, req.user!.id);

      res.status(200).json({
        success: true,
        message: 'Attendee checked in successfully!',
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
}
