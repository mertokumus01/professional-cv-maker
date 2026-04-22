const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const config = require('../../config/config');
const logger = require('../server/utils/logger');

/**
 * Generate JWT Token
 */
const generateToken = (userId, secret = config.jwt.secret, expiresIn = config.jwt.expire) => {
  return jwt.sign({ id: userId }, secret, { expiresIn });
};

/**
 * Generate Refresh Token
 */
const generateRefreshToken = (userId) => {
  return jwt.sign(
    { id: userId, type: 'refresh' },
    config.jwt.refreshSecret,
    { expiresIn: config.jwt.refreshExpire }
  );
};

/**
 * Hash Password
 */
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

/**
 * Compare Password
 */
const comparePassword = async (password, hashedPassword) => {
  return bcrypt.compare(password, hashedPassword);
};

/**
 * Verify JWT Token
 */
const verifyToken = (token, secret = config.jwt.secret) => {
  try {
    return jwt.verify(token, secret);
  } catch (error) {
    logger.error('Token verification failed:', error.message);
    return null;
  }
};

module.exports = {
  generateToken,
  generateRefreshToken,
  hashPassword,
  comparePassword,
  verifyToken,
};
