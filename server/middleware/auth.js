import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Protect routes - verify JWT token
export const protect = async (req, res, next) => {
  let token;

  console.log('[AUTH] Entering protect middleware');

  // Check for token in headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
    console.log('[AUTH] Token found in headers');
  }

  if (!token) {
    console.log('[AUTH] No token provided');
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no token provided'
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(`[AUTH] Token verified for user ID: ${decoded.id}, role: ${decoded.role}`);
    
    // Get user from token
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      console.log(`[AUTH] User not found for token ID: ${decoded.id}`);
      return res.status(401).json({
        success: false,
        message: 'Not authorized, user not found'
      });
    }

    if (!user.isActive) {
      console.log(`[AUTH] User account deactivated for ID: ${user._id}`);
      return res.status(401).json({
        success: false,
        message: 'Account has been deactivated'
      });
    }

    req.user = user;
    console.log(`[AUTH] User ${user.email} (${user.role}) authorized`);
    next();
  } catch (error) {
    console.error('[AUTH] Token verification error:', error.message);
    return res.status(401).json({
      success: false,
      message: 'Not authorized, invalid token'
    });
  }
};

// Authorize specific roles
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role ${req.user.role} is not authorized to access this route`
      });
    }
    next();
  };
};

// Check if user can access chef data (is owner or admin)
export const canAccessChefData = (req, res, next) => {
  if (req.user.role === 'admin' || req.user.id === req.params.id) {
    return next();
  }
  return res.status(403).json({
    success: false,
    message: 'Not authorized to access this resource'
  });
};

// Check if user owns resource or is admin
export const ownerOrAdmin = (resourceField = 'user') => {
  return (req, res, next) => {
    if (req.user.role === 'admin') {
      return next();
    }

    // Check if user owns the resource
    if (req[resourceField] && req[resourceField].toString() === req.user.id) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: 'Not authorized to access this resource'
    });
  };
};