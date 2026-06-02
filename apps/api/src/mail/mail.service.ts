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
  private readonly pass?: string;

  constructor(private readonly config: ConfigService) {
    this.siteUrl = this.config.get<string>('SITE_URL') || 'http://localhost:4000';
    this.from = this.config.get<string>('SMTP_FROM') || '"More Dutch" <no-reply@moredutch.com>';

    const host = this.config.get<string>('SMTP_HOST');
    const port = this.config.get<number>('SMTP_PORT');
    const user = this.config.get<string>('SMTP_USER');
    const pass = this.config.get<string>('SMTP_PASS');
    this.pass = pass;

    if (host && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port: Number(port),
        secure: Number(port) === 465, // true for 465, false for other ports
        auth: {
          user,
          pass,
        },
        connectionTimeout: 5000, // 5s connection timeout to prevent hangs
        greetingTimeout: 5000,   // 5s greeting timeout
        socketTimeout: 5000,     // 5s socket timeout
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

  async sendTestEmail(email: string): Promise<{ success: boolean; error?: string }> {
    const subject = 'More Dutch SMTP Connection Test';
    const html = '<h1>SMTP Connection Test Successful</h1><p>Your mail server configurations are working correctly!</p>';
    if (this.transporter) {
      try {
        await this.transporter.sendMail({
          from: this.from,
          to: email,
          subject,
          html,
        });
        this.logger.log(`Test email sent to ${email}`);
        return { success: true };
      } catch (err) {
        this.logger.error(`Test email failed for ${email}`, err);
        return { success: false, error: (err as any).message || String(err) };
      }
    } else {
      return { success: false, error: 'No active SMTP transporter. Simulation mode active.' };
    }
  }

  private async sendMail(to: string, subject: string, html: string): Promise<{ success: boolean; error?: string }> {
    // If it's a Resend API key, use Resend's REST API directly over HTTPS (Port 443)
    // to bypass outgoing SMTP port blocks on cloud hosts like Render.
    if (this.pass && this.pass.startsWith('re_')) {
      try {
        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.pass}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: this.from,
            to,
            subject,
            html,
          }),
        });

        const resData = (await response.json()) as any;
        if (response.ok) {
          this.logger.log(`Email sent via Resend API to ${to}: ${subject}`);
          return { success: true };
        } else {
          const errMsg = resData.message || JSON.stringify(resData);
          this.logger.error(`Resend API failed to send to ${to}: ${errMsg}`);
          return { success: false, error: errMsg };
        }
      } catch (err) {
        this.logger.error(`Failed to send email via Resend API to ${to}`, err);
        return { success: false, error: (err as any).message || String(err) };
      }
    }

    if (this.transporter) {
      try {
        await this.transporter.sendMail({
          from: this.from,
          to,
          subject,
          html,
        });
        this.logger.log(`Email sent to ${to}: ${subject}`);
        return { success: true };
      } catch (err) {
        this.logger.error(`Failed to send email to ${to}`, err);
        return { success: false, error: (err as any).message || String(err) };
      }
    } else {
      this.logger.log(`[EMAIL-SIMULATION] To: ${to} | Subject: ${subject}`);
      return { success: true };
    }
  }
}
