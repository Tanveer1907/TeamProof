import { Response } from 'express';
import crypto from 'crypto';
import argon2 from 'argon2';
import { User } from '../models/User.js';
import { Session } from '../models/Session.js';
import { registerSchema, loginSchema } from '../validators/schemas.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export async function register(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const parse = registerSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ error: parse.error.errors[0].message });
      return;
    }

    const { name, email, password } = parse.data;

    const existing = await User.findOne({ email });
    if (existing) {
      res.status(409).json({ error: 'An account with this email address already exists.' });
      return;
    }

    const passwordHash = await argon2.hash(password);
    // Public registrations are strictly created as 'student' to prevent privilege escalation
    const user = await User.create({
      name,
      email,
      passwordHash,
      role: 'student',
      avatar: name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase(),
    });

    // Create session
    const sessionId = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

    await Session.create({
      sessionId,
      user: user._id,
      expiresAt,
    });

    // Set secure HTTP-only cookie; never return sessionId in response body
    res.cookie('teamproof_session', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: expiresAt,
      path: '/',
    });

    res.status(201).json({
      message: 'Account registered successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (err: any) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Failed to create user account' });
  }
}

export async function login(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const parse = loginSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ error: parse.error.errors[0].message });
      return;
    }

    const { email, password } = parse.data;

    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const validPassword = await argon2.verify(user.passwordHash, password);
    if (!validPassword) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    // Invalidate prior sessions for security hygiene if desired, or issue new session
    const sessionId = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

    await Session.create({
      sessionId,
      user: user._id,
      expiresAt,
    });

    // Set secure HTTP-only cookie; never return sessionId in response body
    res.cookie('teamproof_session', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: expiresAt,
      path: '/',
    });

    res.json({
      message: 'Login successful',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Failed to authenticate user' });
  }
}

export async function logout(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const sessionId = req.cookies?.teamproof_session;
    if (sessionId) {
      await Session.deleteOne({ sessionId });
    }
    res.clearCookie('teamproof_session', { path: '/' });
    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to log out' });
  }
}

export async function me(req: AuthenticatedRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }

  res.json({
    user: {
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      avatar: req.user.avatar,
    },
  });
}
