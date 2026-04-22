const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const config = require('../../config/config');
const errorHandler = require('../middleware/errorHandler');
const requestLogger = require('../middleware/requestLogger');

const app = express();

// ==================== Security Middleware ====================
app.use(helmet());

// ==================== CORS ====================
app.use(cors(config.cors));

// ==================== Rate Limiting ====================
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api/', limiter);

// ==================== Body Parser ====================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// ==================== Logging ====================
app.use(requestLogger);

// ==================== Static Files ====================
app.use(express.static(path.join(__dirname, '../../public')));

// ==================== Health Check ====================
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// ==================== API Routes ====================
const authRoutes = require('../routes/auth');
const cvRoutes = require('../routes/cvs');
const userRoutes = require('../routes/users');

app.use('/api/auth', authRoutes);
app.use('/api/cvs', cvRoutes);
app.use('/api/users', userRoutes);

// ==================== Error Handler ====================
app.use(errorHandler);

// ==================== 404 Handler ====================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

module.exports = app;
