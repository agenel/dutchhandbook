import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { verificationTemplate, passwordResetTemplate } from './templates';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter?: nodemailer.Transporter;
  private readonly from: string;
  private readonly siteUrl: string;

  constructor(private readonly config: ConfigService) {
    this.siteUrl = this.config.get<string>('SITE_URL') || 'http://localhost:4000';
    this.from = this.config.get<string>('SMTP_FROM') || '"More Dutch" <no-reply@moredutch.com>';

    const host = this.config.get<string>('SMTP_HOST');
    const port = this.config.get<number>('SMTP_PORT');
    const user = this.config.get<string>('SMTP_USER');
    const pass = this.config.get<string>('SMTP_PASS');

    if (host && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465, // true for 465, false for other ports
        auth: {
          user,
          pass,
        },
      });
      this.logger.log('MailService: Configured with SMTP');
    } else {
      this.logger.warn('MailService: No SMTP configuration found. Emails will be logged to console.');
    }
  }

  async sendVerificationEmail(email: string, token: string) {
    const url = `${this.siteUrl}/auth/verify?token=${token}`;
    const subject = 'Confirm your More Dutch account';
    const html = verificationTemplate(url);
    return this.sendMail(email, subject, html);
  }

  async sendPasswordResetEmail(email: string, token: string) {
    const url = `${this.siteUrl}/auth/reset?token=${token}`;
    const subject = 'Reset your More Dutch password';
    const html = passwordResetTemplate(url);
    return this.sendMail(email, subject, html);
  }

  private async sendMail(to: string, subject: string, html: string) {
    if (this.transporter) {
      try {
        await this.transporter.sendMail({
          from: this.from,
          to,
          subject,
          html,
        });
        this.logger.log(`Email sent to ${to}: ${subject}`);
      } catch (err) {
        this.logger.error(`Failed to send email to ${to}`, err);
      }
    } else {
      this.logger.log(`[EMAIL-SIMULATION] To: ${to} | Subject: ${subject}`);
    }
  }
}
