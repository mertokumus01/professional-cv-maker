const nodemailer = require('nodemailer');
const logger = require('./logger');

// Email transporter configuration
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Verify transporter connection
transporter.verify((error, success) => {
  if (error) {
    logger.warn('Email transporter verification failed:', error);
  } else {
    logger.info('Email transporter ready');
  }
});

/**
 * Send verification email
 */
const sendVerificationEmail = async (email, firstName, verificationToken, baseUrl) => {
  try {
    const verificationLink = `${baseUrl}/api/auth/verify-email?token=${verificationToken}`;

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: email,
      subject: 'Email Verification - CV Builder',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome to CV Builder, ${firstName}!</h2>
          <p>Thank you for signing up. Please verify your email address by clicking the link below:</p>
          <a href="${verificationLink}" style="
            display: inline-block;
            padding: 12px 24px;
            background-color: #007bff;
            color: white;
            text-decoration: none;
            border-radius: 4px;
            margin: 20px 0;
          ">Verify Email</a>
          <p>Or copy this link: ${verificationLink}</p>
          <p>This link will expire in 24 hours.</p>
          <hr style="margin-top: 40px; border: none; border-top: 1px solid #ddd;">
          <p style="color: #666; font-size: 12px;">
            If you didn't create this account, please ignore this email.
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    logger.info('Verification email sent:', { email });
    return true;
  } catch (error) {
    logger.error('Failed to send verification email:', error);
    return false;
  }
};

/**
 * Send password reset email
 */
const sendPasswordResetEmail = async (email, firstName, resetToken, baseUrl) => {
  try {
    const resetLink = `${baseUrl}/reset-password?token=${resetToken}`;

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset Request - CV Builder',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Password Reset Request</h2>
          <p>Hi ${firstName},</p>
          <p>We received a request to reset your password. Click the link below to set a new password:</p>
          <a href="${resetLink}" style="
            display: inline-block;
            padding: 12px 24px;
            background-color: #28a745;
            color: white;
            text-decoration: none;
            border-radius: 4px;
            margin: 20px 0;
          ">Reset Password</a>
          <p>Or copy this link: ${resetLink}</p>
          <p>This link will expire in 1 hour.</p>
          <hr style="margin-top: 40px; border: none; border-top: 1px solid #ddd;">
          <p style="color: #666; font-size: 12px;">
            If you didn't request a password reset, please ignore this email.
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    logger.info('Password reset email sent:', { email });
    return true;
  } catch (error) {
    logger.error('Failed to send password reset email:', error);
    return false;
  }
};

/**
 * Send welcome email
 */
const sendWelcomeEmail = async (email, firstName) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: email,
      subject: 'Welcome to CV Builder!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome to CV Builder, ${firstName}!</h2>
          <p>Your account has been successfully verified.</p>
          <p>You can now start creating your professional CV. Here's what you can do:</p>
          <ul>
            <li>Create multiple CV versions</li>
            <li>Use professional templates</li>
            <li>Download as PDF</li>
            <li>Share your CV online</li>
          </ul>
          <a href="http://localhost:3000/cvs" style="
            display: inline-block;
            padding: 12px 24px;
            background-color: #007bff;
            color: white;
            text-decoration: none;
            border-radius: 4px;
            margin: 20px 0;
          ">Get Started</a>
          <hr style="margin-top: 40px; border: none; border-top: 1px solid #ddd;">
          <p style="color: #666; font-size: 12px;">
            Need help? Visit our documentation or contact support.
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    logger.info('Welcome email sent:', { email });
    return true;
  } catch (error) {
    logger.error('Failed to send welcome email:', error);
    return false;
  }
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
};
