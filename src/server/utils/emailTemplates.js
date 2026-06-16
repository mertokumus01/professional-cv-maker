/**
 * Email Templates
 * Reusable email templates for various notifications
 */

const emailTemplates = {
  /**
   * Welcome Email
   */
  welcomeEmail: (userName, verificationLink) => ({
    subject: 'Welcome to CV Builder!',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 5px 5px 0 0; }
            .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; }
            .button { display: inline-block; padding: 10px 20px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to CV Builder</h1>
            </div>
            <div class="content">
              <p>Hi <strong>${userName}</strong>,</p>
              <p>Thank you for signing up! We're excited to have you on board.</p>
              <p>To verify your email address and get started, please click the button below:</p>
              <a href="${verificationLink}" class="button">Verify Email Address</a>
              <p>If you didn't create this account, please ignore this email.</p>
              <div class="footer">
                <p>Best regards,<br/>The CV Builder Team</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `,
  }),

  /**
   * Email Verification
   */
  verificationEmail: (userName, verificationCode) => ({
    subject: 'Verify Your Email Address',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 5px 5px 0 0; }
            .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; }
            .code { background: white; padding: 10px; border-radius: 5px; font-size: 24px; font-weight: bold; letter-spacing: 2px; text-align: center; margin: 20px 0; border: 2px dashed #667eea; }
            .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Email Verification</h1>
            </div>
            <div class="content">
              <p>Hi <strong>${userName}</strong>,</p>
              <p>Your email verification code is:</p>
              <div class="code">${verificationCode}</div>
              <p>This code will expire in 24 hours. If you didn't request this code, please ignore this email.</p>
              <div class="footer">
                <p>Best regards,<br/>The CV Builder Team</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `,
  }),

  /**
   * Password Reset Email
   */
  passwordResetEmail: (userName, resetLink) => ({
    subject: 'Reset Your Password',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 20px; border-radius: 5px 5px 0 0; }
            .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; }
            .button { display: inline-block; padding: 10px 20px; background: #f5576c; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .warning { background: #fff3cd; padding: 10px; border-radius: 5px; margin: 20px 0; }
            .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Password Reset Request</h1>
            </div>
            <div class="content">
              <p>Hi <strong>${userName}</strong>,</p>
              <p>We received a request to reset your password. Click the button below to create a new password:</p>
              <a href="${resetLink}" class="button">Reset Password</a>
              <div class="warning">
                <strong>⚠️ Security Notice:</strong><br/>
                This link will expire in 1 hour. If you didn't request a password reset, please ignore this email.
              </div>
              <div class="footer">
                <p>Best regards,<br/>The CV Builder Team</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `,
  }),

  /**
   * CV Created Notification
   */
  cvCreatedEmail: (userName, cvTitle, cvLink) => ({
    subject: `Your CV "${cvTitle}" Has Been Created`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #56ab2f 0%, #a8e063 100%); color: white; padding: 20px; border-radius: 5px 5px 0 0; }
            .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; }
            .button { display: inline-block; padding: 10px 20px; background: #56ab2f; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>CV Created Successfully! 🎉</h1>
            </div>
            <div class="content">
              <p>Hi <strong>${userName}</strong>,</p>
              <p>Great news! Your CV "<strong>${cvTitle}</strong>" has been created and is ready to use.</p>
              <p>Now you can:</p>
              <ul>
                <li>View and edit your CV</li>
                <li>Download it as PDF or Word</li>
                <li>Share it with employers</li>
                <li>Create multiple versions</li>
              </ul>
              <a href="${cvLink}" class="button">View Your CV</a>
              <div class="footer">
                <p>Best regards,<br/>The CV Builder Team</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `,
  }),

  /**
   * CV Update Notification
   */
  cvUpdatedEmail: (userName, cvTitle) => ({
    subject: `Your CV "${cvTitle}" Has Been Updated`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 5px 5px 0 0; }
            .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; }
            .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>CV Updated</h1>
            </div>
            <div class="content">
              <p>Hi <strong>${userName}</strong>,</p>
              <p>Your CV "<strong>${cvTitle}</strong>" has been successfully updated.</p>
              <p>All your changes have been saved and are ready for download or sharing.</p>
              <div class="footer">
                <p>Best regards,<br/>The CV Builder Team</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `,
  }),

  /**
   * Notification Email Digest
   */
  notificationDigestEmail: (userName, notifications) => ({
    subject: 'Your CV Builder Activity Summary',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 5px 5px 0 0; }
            .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; }
            .notification-item { background: white; padding: 15px; margin: 10px 0; border-left: 4px solid #667eea; }
            .notification-time { color: #999; font-size: 12px; }
            .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Activity Summary</h1>
            </div>
            <div class="content">
              <p>Hi <strong>${userName}</strong>,</p>
              <p>Here's a summary of your recent CV Builder activity:</p>
              ${notifications.map(notif => `
                <div class="notification-item">
                  <strong>${notif.title}</strong>
                  <p>${notif.message}</p>
                  <span class="notification-time">${notif.timestamp}</span>
                </div>
              `).join('')}
              <div class="footer">
                <p>Best regards,<br/>The CV Builder Team</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `,
  }),

  /**
   * Generic Notification Email
   */
  notificationEmail: (userName, title, message) => ({
    subject: title,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 5px 5px 0 0; }
            .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; }
            .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${title}</h1>
            </div>
            <div class="content">
              <p>Hi <strong>${userName}</strong>,</p>
              <p>${message}</p>
              <div class="footer">
                <p>Best regards,<br/>The CV Builder Team</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `,
  }),
};

module.exports = emailTemplates;
