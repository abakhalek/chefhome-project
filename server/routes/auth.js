import express from 'express';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';
import passport from 'passport';

const router = express.Router();

// Generate JWT Token
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('phone').isString().trim().isLength({ min: 6, max: 20 }).withMessage('Please enter a valid phone number'),
  body('role').isIn(['client', 'chef', 'b2b']).withMessage('Invalid role')
], async (req, res) => {
  console.log(`[AUTH] Register attempt for email: ${req.body.email}`);
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log(`[AUTH] Registration validation errors for ${req.body.email}:`, errors.array());
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { name, email, password, phone, role, company } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log(`[AUTH] Registration failed: User already exists with email ${email}`);
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Create user
    const userData = { name, email, password, phone, role };
    if (role === 'b2b' && company) {
      userData.company = company;
    }

    const user = await User.create(userData);

    // Generate token
    const token = generateToken(user._id, user.role);

    console.log(`[AUTH] User registered successfully: ${user.email} (${user.role})`);
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified
      }
    });

  } catch (error) {
    console.error('[AUTH] Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
router.post('/login', [
  body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email'),
  body('password').exists().withMessage('Password is required')
], async (req, res) => {
  console.log(`[AUTH] Login attempt for email: ${req.body.email}`);
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log(`[AUTH] Login validation errors for ${req.body.email}:`, errors.array());
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Find user and include password
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      console.log(`[AUTH] Login failed for ${email}: User not found`);
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      console.log(`[AUTH] Login failed for ${email}: Account deactivated`);
      return res.status(401).json({
        success: false,
        message: 'Account has been deactivated'
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      console.log(`[AUTH] Login failed for ${email}: Invalid password`);
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id, user.role);

    console.log(`[AUTH] User logged in successfully: ${user.email} (${user.role})`);
    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        avatar: user.avatar
      }
    });

  } catch (error) {
    console.error('[AUTH] Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});

// @desc    Authenticate with Google
// @route   GET /api/auth/google
// @access  Public
router.get('/google', (req, res, next) => {
  console.log('[AUTH] Google OAuth initiation');
  passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
});

// @desc    Google OAuth callback
// @route   GET /api/auth/google/callback
// @access  Public
router.get(
  '/google/callback',
  (req, res, next) => {
    console.log('[AUTH] Google OAuth callback received');
    passport.authenticate('google', { failureRedirect: process.env.CLIENT_URL + '/login' })(req, res, next);
  },
  (req, res) => {
    console.log(`[AUTH] Google OAuth successful for user: ${req.user.email}`);
    // Successful authentication, redirect home.
    // Generate a JWT token for the user
    const token = generateToken(req.user._id, req.user.role);
    // Redirect to client with token
    res.redirect(`${process.env.CLIENT_URL}/auth-success?token=${token}`);
  }
);

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
router.post('/logout', protect, (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

// @desc    Refresh token
// @route   POST /api/auth/refresh
// @access  Private
router.post('/refresh', protect, (req, res) => {
  const token = generateToken(req.user.id, req.user.role);
  
  res.json({
    success: true,
    token
  });
});

export default router;