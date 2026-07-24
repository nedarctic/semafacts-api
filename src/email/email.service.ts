import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import * as nodemailer from 'nodemailer';
import { PrismaService } from '../prisma/prisma.service';
import { CompanyNotFoundException } from '../companies/exceptions/company-not-found.exception';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private resend: Resend;
  private transporter: nodemailer.Transporter;

  constructor(
    private configService: ConfigService,
    private readonly prisma: PrismaService
  ) {
    this.resend = new Resend(this.configService.get('RESEND_API_KEY'));
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('SMTP_HOST'),
      port: this.configService.get<number>('SMTP_PORT'),
      secure: true,
      auth: {
        user: this.configService.get<string>('SMTP_USERNAME'),
        pass: this.configService.get<string>('SMTP_PASSWORD'),
      }
    })
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
      await this.transporter.sendMail({
        from: this.configService.get<string>('SMTP_USERNAME'),
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

  async sendInviteMail(toEmail: string, companyId: string) {

    const company = await this.prisma.company.findUnique({ where: { id: companyId } });
    if (!company) {
      throw new CompanyNotFoundException()
    }

    const companyName = company.name;

    return await this.transporter.sendMail({
      from: this.configService.get<string>('SMTP_USERNAME'),
      to: toEmail,
      subject: 'INCIDENT HANDLER INVITATION',
      html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body style="margin:0;padding:0;background-color:#f4f4f4;font-family:Arial,Helvetica,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f4;padding:40px 0;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;padding:40px;">
                <tr>
                  <td>
                    <h2 style="margin-top:0;color:#333333;">
                      You're Invited!
                    </h2>

                    <p style="font-size:16px;color:#555555;line-height:1.6;">
                      Hello,
                    </p>

                    <p style="font-size:16px;color:#555555;line-height:1.6;">
                      You have been invited to join
                      <strong>${companyName}</strong>
                      as an <strong>Incident Handler</strong>.
                    </p>

                    <p style="font-size:16px;color:#555555;line-height:1.6;">
                      As an Incident Handler, you'll be able to receive, manage,
                      and respond to incidents assigned to your organization.
                    </p>

                    <div style="text-align:center;margin:35px 0;">
                      <a
                        href="https://your-app.com/accept-invitation"
                        style="background:#2563eb;color:#ffffff;text-decoration:none;padding:14px 28px;border-radius:6px;font-weight:bold;display:inline-block;"
                      >
                        Accept Invitation
                      </a>
                    </div>

                    <p style="font-size:14px;color:#777777;line-height:1.6;">
                      If you were not expecting this invitation, you can safely
                      ignore this email.
                    </p>

                    <hr style="border:none;border-top:1px solid #eeeeee;margin:30px 0;" />

                    <p style="font-size:13px;color:#999999;">
                      This is an automated email. Please do not reply.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
    })
  }
}
