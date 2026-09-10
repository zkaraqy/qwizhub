import nodemailer from 'nodemailer'
import { config } from 'dotenv'

config()

/**
 * Create a reusable Nodemailer transporter.
 * Configure SMTP credentials in .env (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS).
 */
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
  port: Number(process.env.SMTP_PORT || 587),
  secure: false,
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
})

export interface SendMailOptions {
  to: string
  subject: string
  html: string
}

/**
 * Send an email using the configured SMTP transporter.
 */
export async function sendMail(options: SendMailOptions): Promise<void> {
  const from = process.env.SMTP_FROM || 'noreply@qwizhub.com'

  await transporter.sendMail({
    from,
    to: options.to,
    subject: options.subject,
    html: options.html,
  })
}

/**
 * Send a password reset email with a tokenized link.
 */
export async function sendPasswordResetEmail(email: string, token: string): Promise<void> {
  const appUrl = process.env.APP_URL || 'http://localhost:3000'
  const resetLink = `${appUrl}/reset-password?token=${token}`

  await sendMail({
    to: email,
    subject: 'QwizHub — Reset Password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Reset Password</h2>
        <p>Anda menerima email ini karena ada permintaan reset password untuk akun QwizHub Anda.</p>
        <p>Klik tombol di bawah ini untuk mengatur ulang password Anda:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" 
             style="background-color: #4285F4; color: white; padding: 12px 30px; 
                    text-decoration: none; border-radius: 5px; font-weight: bold;">
            Reset Password
          </a>
        </div>
        <p style="color: #666; font-size: 14px;">
          Link ini akan kedaluwarsa dalam 1 jam. Jika Anda tidak meminta reset password, 
          abaikan email ini.
        </p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #999; font-size: 12px;">QwizHub — Platform Marketplace Penelitian</p>
      </div>
    `,
  })
}
