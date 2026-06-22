import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
    private readonly logger = new Logger(EmailService.name);
    private resend: Resend;

    constructor(
        private configService: ConfigService
    ) {
        this.resend = new Resend(this.configService.get('RESEND_API_KEY'));
    }

    /**
     * Sends an email using the Resend API.
     * @param to - The recipient's email address.
     * @param subject - The subject of the email.
     * @param html - The HTML content of the email.
     * @returns A promise that resolves when the email is sent successfully.
     */
    async sendEmail(to: string, subject: string, html: string): Promise<{ message: string }> {
        try {
            await this.resend.emails.send({
                from: 'SemaFacts <onboarding@resend.dev>',
                to: to,
                subject: subject,
                html: html
            });
            return { message: `Email sent to ${to}` };
        } catch (error) {
            this.logger.error('Error sending email:', error);
            throw new Error('Failed to send email');
        }
    }
}
