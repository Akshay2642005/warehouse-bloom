import nodemailer from 'nodemailer';

export interface MailOptions {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
}

let transporter: nodemailer.Transporter | null = null;

export function getMailer(): nodemailer.Transporter {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const secure = process.env.SMTP_SECURE === 'true';

  transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: user && pass ? { user, pass } : undefined,
  });

  return transporter;
}

export async function sendMail(options: MailOptions): Promise<void> {
  const from = process.env.MAIL_FROM || 'no-reply@example.com';
  const mailer = getMailer();
  await mailer.sendMail({ from, ...options });
} 