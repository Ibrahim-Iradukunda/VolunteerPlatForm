import nodemailer from "nodemailer"

const getTransporter = () => {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return null
  }

  const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : undefined
  
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: port || 587,
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })
}

export interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    const transporter = getTransporter()
    
    // If email is not configured, return false
    if (!transporter || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      return false
    }

    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      ...options,
    })
    return true
  } catch (error) {
    // Error logging for production debugging
    if (process.env.NODE_ENV === "development") {
      console.error("Error sending email:", error)
    }
    return false
  }
}

export function generateApplicationEmail(
  volunteerName: string,
  opportunityTitle: string,
  organizationName: string
): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Application Submitted</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #2563eb;">Application Submitted Successfully</h2>
          <p>Dear ${volunteerName},</p>
          <p>Thank you for your interest in volunteering! Your application for the following opportunity has been submitted:</p>
          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0;">${opportunityTitle}</h3>
            <p><strong>Organization:</strong> ${organizationName}</p>
          </div>
          <p>The organization will review your application and get back to you soon.</p>
          <p>Best regards,<br>Inclusive Volunteer Opportunities Finder</p>
        </div>
      </body>
    </html>
  `
}

export function generateStatusUpdateEmail(
  volunteerName: string,
  opportunityTitle: string,
  status: "accepted" | "rejected"
): string {
  const statusMessage =
    status === "accepted"
      ? "Congratulations! Your application has been accepted."
      : "Unfortunately, your application was not selected at this time."
  const statusColor = status === "accepted" ? "#10b981" : "#ef4444"

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Application Status Update</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: ${statusColor};">Application Status Update</h2>
          <p>Dear ${volunteerName},</p>
          <p>${statusMessage}</p>
          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0;">${opportunityTitle}</h3>
            <p><strong>Status:</strong> <span style="color: ${statusColor}; font-weight: bold;">${status.toUpperCase()}</span></p>
          </div>
          <p>Thank you for your interest in volunteering with us!</p>
          <p>Best regards,<br>Inclusive Volunteer Opportunities Finder</p>
        </div>
      </body>
    </html>
  `
}

