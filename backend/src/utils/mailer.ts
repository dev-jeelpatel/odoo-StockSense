import nodemailer from "nodemailer";
import { env } from "../config/env";

const transporter = env.smtp.host
  ? nodemailer.createTransport({
      host: env.smtp.host,
      port: env.smtp.port,
      secure: env.smtp.secure,
      auth: env.smtp.user ? { user: env.smtp.user, pass: env.smtp.pass } : undefined,
    })
  : null;

export async function sendOtpEmail(to: string, otp: string) {
  const subject = "Your StockSense password reset code";
  const text = `Your password reset code is ${otp}. It expires in ${env.otpExpiresMinutes} minutes. If you did not request this, ignore this email.`;

  if (!transporter) {
    // No SMTP configured (e.g. local dev without credentials) — log instead of failing signup/reset flows.
    // eslint-disable-next-line no-console
    console.warn(`[mailer] SMTP not configured. OTP for ${to}: ${otp}`);
    return;
  }

  await transporter.sendMail({
    from: env.smtp.from,
    to,
    subject,
    text,
  });
}
