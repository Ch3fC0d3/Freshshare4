const jwt = require('jsonwebtoken');
const db = require('../models');
const authConfig = require('../config/auth.config');
const logger = require('../utils/logger');
const CONSTANTS = require('../config/constants');
const User = db.user;

// Retrieve JWT secret from shared auth config
const JWT_SECRET = authConfig.secret;
const LEGACY_JWT_SECRET = process.env.LEGACY_JWT_SECRET;

/**
 * Verify JWT token from request headers
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Object} - Continues to next middleware or returns error response
 */
const verifyToken = (req, res, next) => {
  // Get token from request headers (case-insensitive) or cookies
  const getHeaderCaseInsensitive = (headers, headerName) => {
    const headerKeys = Object.keys(headers);
    const key = headerKeys.find(k => k.toLowerCase() === headerName.toLowerCase());
    return key ? headers[key] : null;
  };
  
  // Enhanced token extraction with detailed logging
  let token = null;
  const cookieToken = req.cookies && req.cookies.token;
  const authHeaderValue = getHeaderCaseInsensitive(req.headers, 'authorization');

  // Only log in development
  if (process.env.NODE_ENV !== 'production') {
    logger.debug(`Auth middleware: ${req.method} ${req.originalUrl}`, {
      hasCookie: !!cookieToken,
      hasAuthHeader: !!authHeaderValue
    });
  }
  
  // Check cookies first (preferred method for web pages)
  if (cookieToken) {
    token = cookieToken;
    logger.debug('Token found in cookies');
  } 
  // Then check authorization header (for API calls)
  else if (authHeaderValue) {
    const authHeader = authHeaderValue;
    
    // IMPORTANT: Always extract token properly regardless of format
    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7).trim();
    } else {
      token = authHeader.trim();
    }
    
    logger.debug('Token found in Authorization header');
    
    // If token is valid, set it as a cookie for future requests
    try {
      // Verify token before setting cookie
      const decoded = jwt.verify(token, JWT_SECRET);
      if (decoded && decoded.id) {
        // Set token as cookie
        res.cookie('token', token, {
          httpOnly: CONSTANTS.COOKIE.HTTP_ONLY,
          secure: process.env.NODE_ENV === 'production',
          maxAge: CONSTANTS.COOKIE.MAX_AGE_MS,
          sameSite: CONSTANTS.COOKIE.SAME_SITE,
          path: '/'
        });
        logger.debug('Set token cookie from Authorization header');
      }
    } catch (err) {
      logger.debug('Token verification failed, not setting cookie');
      // Continue with normal flow, don't set cookie for invalid token
    }
  } 
  // Finally check x-access-token (legacy support)
  else if (getHeaderCaseInsensitive(req.headers, 'x-access-token')) {
    token = getHeaderCaseInsensitive(req.headers, 'x-access-token');
    logger.debug('Token found in x-access-token header');
    
    // If token is valid, set it as a cookie for future requests
    try {
      // Verify token before setting cookie
      const decoded = jwt.verify(token, JWT_SECRET);
      if (decoded && decoded.id) {
        // Set token as cookie
        res.cookie('token', token, {
          httpOnly: CONSTANTS.COOKIE.HTTP_ONLY,
          secure: process.env.NODE_ENV === 'production',
          maxAge: CONSTANTS.COOKIE.MAX_AGE_MS,
          sameSite: CONSTANTS.COOKIE.SAME_SITE,
          path: '/'
        });
        logger.debug('Set token cookie from x-access-token header');
      }
    } catch (err) {
      logger.debug('Token verification failed, not setting cookie');
      // Continue with normal flow, don't set cookie for invalid token
    }
  }
  
  // Make authentication optional for the groups API
  if (req.originalUrl === '/api/groups' && req.method === 'GET') {
    if (!token) {
      // For public access to groups, continue without setting userId
      return next();
    }
  }
  
  // If no token for protected routes, return error
  if (!token) {
    logger.debug(`No token found for ${req.method} ${req.originalUrl}`);
    
    // For API routes, return JSON error
    if (req.originalUrl.startsWith('/api/')) {
      return res.status(403).json({
        success: false,
        message: 'No token provided!'
      });
    }
    
    // For web routes, redirect to login
    return res.redirect('/login?redirect=' + encodeURIComponent(req.originalUrl));
  }
  
  // Remove Bearer prefix if present
  const tokenValue = token.startsWith('Bearer ') ? token.slice(7) : token;
  
  let decoded = null;
  try {
    logger.debug('Verifying token with primary JWT secret');
    decoded = jwt.verify(tokenValue, JWT_SECRET);
    logger.debug('Token verified successfully');
  } catch (primaryError) {
    logger.debug('Primary token verification failed', { error: primaryError.message });
    
    try {
      if (!LEGACY_JWT_SECRET) throw new Error('Legacy JWT secret not configured');
      decoded = jwt.verify(tokenValue, LEGACY_JWT_SECRET);
      logger.warn('Token verified using legacy JWT secret. Consider reissuing tokens.');
    } catch (legacyError) {
      logger.debug('Legacy token verification failed', { error: legacyError.message });
      // For public endpoints, continue without authentication
      if (req.originalUrl === '/api/groups' && req.method === 'GET') {
        return next();
      }

      // For API routes, return JSON error
      if (req.originalUrl.startsWith('/api/')) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized! Token is invalid or expired.'
        });
      }

      // For web routes, clear cookie and redirect to login
      res.clearCookie('token');
      return res.redirect('/login?redirect=' + encodeURIComponent(req.originalUrl) + 
                         '&error=' + encodeURIComponent('Your session has expired. Please log in again.'));
    }
  }

  try {
    
    // Set userId in request
    req.userId = decoded.id;
    
    // Check if token is close to expiration and renew it if needed
    if (decoded.exp && decoded.exp - (Date.now() / 1000) < CONSTANTS.JWT.RENEWAL_THRESHOLD_SECONDS) {
      logger.debug('Token close to expiration, renewing');
      
      // Generate new token with fresh expiration
      const newToken = jwt.sign({ id: decoded.id }, JWT_SECRET, {
        expiresIn: CONSTANTS.JWT.EXPIRATION_SECONDS
      });
      
      // Set new token as cookie
      res.cookie('token', newToken, {
        httpOnly: CONSTANTS.COOKIE.HTTP_ONLY,
        secure: process.env.NODE_ENV === 'production',
        maxAge: CONSTANTS.COOKIE.MAX_AGE_MS,
        sameSite: CONSTANTS.COOKIE.SAME_SITE,
        path: '/'
      });
      
      logger.debug('Token renewed successfully');
    }
    
    next();
  } catch (error) {
    logger.error('Token post-verification processing failed', { error: error.message });
    if (req.originalUrl.startsWith('/api/')) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized! Token is invalid or expired.'
      });
    }
    res.clearCookie('token');
    return res.redirect('/login?redirect=' + encodeURIComponent(req.originalUrl) +
                       '&error=' + encodeURIComponent('Your session has expired. Please log in again.'));
  }
};

/**
 * Check if request is from an authenticated user
 * Creates middleware that verifies token and validates against database
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Object} - Continues to next middleware or returns error response
 */
const isAuthenticated = async (req, res, next) => {
  try {
    // Verify token first
    verifyToken(req, res, async () => {
      // Skip user check for public endpoints
      if (req.originalUrl === '/api/groups' && req.method === 'GET' && !req.userId) {
        return next();
      }
      
      // Check if user exists
      const user = await User.findById(req.userId);
      
      if (!user) {
        logger.warn('User not found for authenticated token');
        
        // For API routes, return JSON error
        if (req.originalUrl.startsWith('/api/')) {
          return res.status(404).json({
            success: false,
            message: 'User not found!'
          });
        }
        
        // For web routes, clear cookie and redirect to login
        res.clearCookie('token');
        return res.redirect('/login?error=' + encodeURIComponent('User account not found. Please log in again.'));
      }
      
      next();
    });
  } catch (error) {
    logger.error('Authentication error', { error: error.message });
    
    // For API routes, return JSON error
    if (req.originalUrl.startsWith('/api/')) {
      return res.status(500).json({
        success: false,
        message: 'An error occurred while authenticating user.',
        error: error.message
      });
    }
    
    // For web routes, redirect to error page
    return res.status(500).render('error', {
      title: 'Authentication Error',
      message: 'An error occurred during authentication. Please try again later.'
    });
  }
};

const authJwt = {
  verifyToken,
  isAuthenticated
};

module.exports = authJwt;
