const nodemailer = require('nodemailer');
const logger = require('./logger');
const emailTemplates = require('./emailTemplates');

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
 * Send email
 */
const sendEmail = async (to, subject, html, attachments = []) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to,
      subject,
      html,
      attachments,
    };

    const info = await transporter.sendMail(mailOptions);
    logger.info('Email sent successfully', {
      to,
      subject,
      messageId: info.messageId,
    });

    return true;
  } catch (error) {
    logger.error('Failed to send email:', error);
    return false;
  }
};

/**
 * Send verification email
 */
const sendVerificationEmail = async (email, firstName, verificationToken, baseUrl) => {
  try {
    const verificationLink = `${baseUrl}/api/auth/verify-email?token=${verificationToken}`;
    const template = emailTemplates.verificationEmail(firstName, verificationToken);

    return await sendEmail(email, template.subject, template.html);
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
    const template = emailTemplates.passwordResetEmail(firstName, resetLink);

    return await sendEmail(email, template.subject, template.html);
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
    const verificationLink = `${process.env.APP_URL || 'http://localhost:3000'}/login`;
    const template = emailTemplates.welcomeEmail(firstName, verificationLink);

    return await sendEmail(email, template.subject, template.html);
  } catch (error) {
    logger.error('Failed to send welcome email:', error);
    return false;
  }
};

/**
 * Send CV created notification
 */
const sendCVCreatedEmail = async (email, firstName, cvTitle, cvId) => {
  try {
    const cvLink = `${process.env.APP_URL || 'http://localhost:3000'}/cvs/${cvId}`;
    const template = emailTemplates.cvCreatedEmail(firstName, cvTitle, cvLink);

    return await sendEmail(email, template.subject, template.html);
  } catch (error) {
    logger.error('Failed to send CV created email:', error);
    return false;
  }
};

/**
 * Send CV updated notification
 */
const sendCVUpdatedEmail = async (email, firstName, cvTitle) => {
  try {
    const template = emailTemplates.cvUpdatedEmail(firstName, cvTitle);

    return await sendEmail(email, template.subject, template.html);
  } catch (error) {
    logger.error('Failed to send CV updated email:', error);
    return false;
  }
};

/**
 * Send notification digest
 */
const sendNotificationDigest = async (email, firstName, notifications) => {
  try {
    const template = emailTemplates.notificationDigestEmail(
      firstName,
      notifications.map((n) => ({
        title: n.title,
        message: n.message,
        timestamp: new Date(n.timestamp).toLocaleDateString(),
      }))
    );

    return await sendEmail(email, template.subject, template.html);
  } catch (error) {
    logger.error('Failed to send notification digest:', error);
    return false;
  }
};

/**
 * Send generic notification
 */
const sendNotification = async (email, title, message) => {
  try {
    const template = emailTemplates.notificationEmail('User', title, message);

    return await sendEmail(email, template.subject, template.html);
  } catch (error) {
    logger.error('Failed to send notification email:', error);
    return false;
  }
};

module.exports = {
  sendEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
  sendCVCreatedEmail,
  sendCVUpdatedEmail,
  sendNotificationDigest,
  sendNotification,
};

