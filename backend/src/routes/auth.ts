import express from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { User } from '../models';
import { upload, uploadToCloudinary } from '../utils/cloudinary';

const router = express.Router();

// ── Fail fast if JWT_SECRET is missing ─────────────────────────────────────────
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error('FATAL: JWT_SECRET environment variable is not set. Add it to your .env file.');

// Only expose error details to the developer, never in production
const devErr = (e: any): object => process.env.NODE_ENV === 'development' ? { error: e.message } : {};

// ── Middleware: verify JWT ──────────────────────────────────────────────────────
function authMiddleware(req: any, res: any, next: any) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ success: false, message: 'No token provided' });
  try {
    req.user = jwt.verify(token, JWT_SECRET) as any;
    next();
  } catch {
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
}

// POST /api/auth/register - Register new user
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    // role is ALWAYS 'customer' on public registration — never trust client input

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Create new user — role hardcoded, not from request body
    const user = await User.create({
      name,
      email,
      password,
      role: 'customer',
    });

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        },
        token
      }
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: 'Registration failed', ...devErr(error) });
  }
});

// POST /api/auth/login - User login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user with password field
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        },
        token
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Login failed', ...devErr(error) });
  }
});

// GET /api/auth/me - Get current user
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
        avatar: user.avatar,
        createdAt: user.createdAt,
      }
    });
  } catch (error: any) {
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
});

// PUT /api/auth/profile - Update profile info
router.put('/profile', authMiddleware, async (req: any, res) => {
  try {
    const { name, phone, address } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { name, phone, address },
      { new: true, runValidators: true }
    );
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({
      success: true,
      message: 'Profile updated',
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
        avatar: user.avatar,
      }
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: 'Failed to update profile', ...devErr(error) });
  }
});

// PUT /api/auth/password - Change password
router.put('/password', authMiddleware, async (req: any, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Both currentPassword and newPassword are required' });
    }
    const user = await User.findById(req.user.userId).select('+password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const valid = await user.comparePassword(currentPassword);
    if (!valid) return res.status(401).json({ success: false, message: 'Current password is incorrect' });

    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error: any) {
    res.status(400).json({ success: false, message: 'Failed to change password', ...devErr(error) });
  }
});

// POST /api/auth/avatar - Upload avatar to Cloudinary
router.post('/avatar', authMiddleware, upload.single('avatar'), async (req: any, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No image file provided' });

    const { url } = await uploadToCloudinary(req.file.buffer, 'maxystyles/avatars');

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { avatar: url },
      { new: true }
    );
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    res.json({ success: true, message: 'Avatar updated', data: { avatar: url } });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Avatar upload failed', ...devErr(error) });
  }
});

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email is required' });

    const user = await (User as any).findOne({ email: email.toLowerCase() }).select('+password');
    // Don't reveal whether user exists
    if (!user) {
      return res.json({ success: true, message: 'If that email is registered, a reset token has been generated.' });
    }

    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save({ validateBeforeSave: false });

    // In production: email rawToken to the user. Never expose it in the response.
    const responseBody: any = {
      success: true,
      message: 'If that email is registered, a password reset link has been sent.',
    };
    if (process.env.NODE_ENV === 'development') {
      // Dev-only convenience: return the token directly so you can test without email
      responseBody.resetToken = rawToken;
      responseBody._devNote = 'resetToken is only returned in development mode';
    }
    res.json(responseBody);
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Forgot password failed', ...devErr(error) });
  }
});

// POST /api/auth/reset-password
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).json({ success: false, message: 'Token and new password are required' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await (User as any).findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ success: true, message: 'Password has been reset successfully. You can now log in.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Password reset failed', ...devErr(error) });
  }
});

export default router;