import { Request, Response, NextFunction } from 'express';
import { UserModel } from '../models/User';
import { RefreshTokenModel } from '../models/RefreshToken';
import {
  hashPassword,
  comparePassword,
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  getRefreshTokenExpiry,
} from '../utils/auth';

/**
 * Register a new user
 * POST /api/auth/register
 */
export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, username, password } = req.body;
    
    // Check if email already exists
    if (await UserModel.emailExists(email)) {
      return res.status(409).json({
        error: 'Conflict',
        message: 'Email already registered',
      });
    }
    
    // Check if username already exists
    if (await UserModel.usernameExists(username)) {
      return res.status(409).json({
        error: 'Conflict',
        message: 'Username already taken',
      });
    }
    
    // Hash password and create user
    const passwordHash = await hashPassword(password);
    const user = await UserModel.create(email, username, passwordHash);
    
    // Generate tokens
    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);
    
    // Store refresh token in database
    await RefreshTokenModel.create(user.id, refreshToken, getRefreshTokenExpiry());
    
    res.status(201).json({
      message: 'User registered successfully',
      user,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Login with email and password
 * POST /api/auth/login
 */
export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body;
    
    // Find user by email
    const user = await UserModel.findByEmail(email);
    
    if (!user) {
      return res.status(401).json({
        error: 'Authentication failed',
        message: 'Invalid email or password',
      });
    }
    
    // Verify password
    const isValidPassword = await comparePassword(password, user.password_hash);
    
    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Authentication failed',
        message: 'Invalid email or password',
      });
    }
    
    // Generate tokens
    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);
    
    // Store refresh token in database
    await RefreshTokenModel.create(user.id, refreshToken, getRefreshTokenExpiry());
    
    // Remove password hash from response
    const { password_hash, ...userWithoutPassword } = user;
    
    res.json({
      message: 'Login successful',
      user: userWithoutPassword,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Refresh access token using refresh token
 * POST /api/auth/refresh
 */
export async function refresh(req: Request, res: Response, next: NextFunction) {
  try {
    const { refreshToken } = req.body;
    
    // Verify refresh token signature
    const { userId } = verifyRefreshToken(refreshToken);
    
    // Check if refresh token exists in database
    const storedToken = await RefreshTokenModel.findByToken(refreshToken);
    
    if (!storedToken) {
      return res.status(401).json({
        error: 'Authentication failed',
        message: 'Invalid refresh token',
      });
    }
    
    // Check if token is expired
    if (new Date(storedToken.expires_at) < new Date()) {
      await RefreshTokenModel.deleteByToken(refreshToken);
      return res.status(401).json({
        error: 'Authentication failed',
        message: 'Refresh token expired',
      });
    }
    
    // Generate new access token
    const accessToken = generateAccessToken(userId);
    
    res.json({
      message: 'Token refreshed successfully',
      accessToken,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Logout (invalidate refresh token)
 * POST /api/auth/logout
 */
export async function logout(req: Request, res: Response, next: NextFunction) {
  try {
    const { refreshToken } = req.body;
    
    // Delete refresh token from database
    await RefreshTokenModel.deleteByToken(refreshToken);
    
    res.json({
      message: 'Logout successful',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get current user profile
 * GET /api/auth/me
 */
export async function getProfile(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.userId!; // Set by authenticate middleware
    
    const user = await UserModel.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'User not found',
      });
    }
    
    res.json({ user });
  } catch (error) {
    next(error);
  }
}
