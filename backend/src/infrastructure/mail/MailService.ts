// src/infrastructure/mail/MailService.ts
import nodemailer from 'nodemailer';
import { env } from '../../config/env.js';

export class MailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465,
      family: 4, // Forces IPv4 to prevent ECONNREFUSED ::1 on Windows
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      },
    });
  }

  async sendTicketConfirmation(email: string, eventName: string, qrCodeBase64: string) {
    try {
      await this.transporter.sendMail({
        from: `"EventSphere" <${env.SMTP_USER}>`,
        to: email,
        subject: `Ticket Confirmation for ${eventName}`,
        html: `
          <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px; background-color: #f4f4f5;">
            <div style="max-width: 500px; margin: auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h1 style="color: #4f46e5; margin-bottom: 10px;">Ticket Confirmed! 🎉</h1>
              <p style="font-size: 16px; color: #71717a;">You're all set for <strong style="color: #18181b;">${eventName}</strong>.</p>
              <p style="font-size: 14px; color: #71717a;">Present this QR code at the entrance for check-in.</p>
              <img src="cid:qrcode@eventsphere.com" alt="QR Code" style="width: 200px; height: 200px; border: 2px solid #e4e4e7; border-radius: 8px; margin: 20px 0;" />
              <p style="font-size: 12px; color: #a1a1aa;">If you did not purchase this ticket, please ignore this email.</p>
            </div>
          </div>
        `,
        attachments: [
          {
            filename: 'ticket.png',
            content: qrCodeBase64.split('base64,')[1],
            encoding: 'base64',
            cid: 'qrcode@eventsphere.com', // Content ID for the image in HTML
          },
        ],
      });
      console.log(`Ticket confirmation email sent to ${email}`);
    } catch (error) {
      console.error('Failed to send email:', error);
      // Don't throw, we don't want to fail the ticket purchase if email fails
    }
  }
}