import dotenv from 'dotenv';
dotenv.config({ path: './.env' });

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import session from 'express-session';
import passport from 'passport';
import path from 'path';

import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import configuration
import { connectDB, initializeSocket } from './config/index.js';
import configurePassport from './config/passport.js'; // Import passport configuration

// Call the passport configuration function
configurePassport(passport);

// Import routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import chefRoutes from './routes/chefs.js';
import bookingRoutes from './routes/bookings.js';
import paymentRoutes from './routes/payments.js';
import adminRoutes from './routes/admin.js';
import b2bRoutes from './routes/b2b.js';
import messageRoutes from './routes/messages.js';
import notificationRoutes from './routes/notifications.js';
import dashboardRoutes from './routes/dashboard.js';
import analyticsRoutes from './routes/analytics.js';
import chefHomeSessionRoutes from './routes/chefHomeSessions.js';

// Import middleware
import { errorHandler } from './middleware/errorHandler.js';
import { notFound } from './middleware/notFound.js';
import { initializeSchedulers } from './utils/scheduler.js';
import { createSeedUsers } from './config/seedUsers.js';

const app = express();
const server = createServer(app);

// Initialize Socket.io
const io = initializeSocket(server);

// Security middleware
// app.use(helmet());
app.use(compression());

// CORS configuration
// CORS configuration
app.use(cors({
  origin: [
    'http://chefathome-app.fr',
    'https://chefathome-app.fr',
    'http://www.chefathome-app.fr',
    'https://www.chefathome-app.fr',
    'http://localhost:5173'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Rate limiting (relaxed for local development to avoid accidental lockouts)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 100 : 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  }
});

if (process.env.NODE_ENV === 'production') {
  app.use('/api/', limiter);
}

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));



// Serve static files for uploads
app.use('/uploads', (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*'); // Allow all origins
  next();
}, express.static(path.join(__dirname, 'uploads')));

// Serve static files for chef profile pictures
app.use('/chef-images', express.static(path.join(__dirname, '..', 'public', 'chef')));

// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'supersecret',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: true, // ← Changez à true pour HTTPS
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: 'lax'
  }
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Connect to MongoDB
connectDB();

// Conditionally seed users in development
if (process.env.NODE_ENV === 'development') {
  createSeedUsers().catch(err => console.error('Error seeding users on startup:', err));
}

// Make io accessible to routes
app.set('io', io);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Documentation endpoint
app.get('/api', (req, res) => {
  res.json({
    name: 'Chef@Home API',
    version: '1.0.0',
    description: 'Professional chef booking platform API',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      chefs: '/api/chefs',
      bookings: '/api/bookings',
      payments: '/api/payments',
      admin: '/api/admin',
      b2b: '/api/b2b',
      messages: '/api/messages',
      notifications: '/api/notifications',
      dashboard: '/api/dashboard',
      analytics: '/api/analytics',
      chefHomeSessions: '/api/chef-home-sessions'
    }
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/chefs', chefRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/b2b', b2bRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/chef-home-sessions', chefHomeSessionRoutes);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Socket.io server ready for real-time connections`);
  console.log(`🌐 API Documentation available at http://localhost:${PORT}/api`);
  console.log(`❤️  Health check available at http://localhost:${PORT}/health`);
  
  // Initialize schedulers for automated tasks
  initializeSchedulers(io);
});
