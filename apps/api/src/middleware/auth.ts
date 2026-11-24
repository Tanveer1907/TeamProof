import { Request, Response, NextFunction } from 'express';
import { Session } from '../models/Session.js';
import { User, IUserDoc } from '../models/User.js';
import { Membership } from '../models/Membership.js';

export interface AuthenticatedRequest extends Request {
  user?: IUserDoc;
  sessionId?: string;
  projectMembership?: any;
}

export async function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const sessionId = req.cookies?.teamproof_session || req.headers['x-session-id'];
    if (!sessionId) {
      res.status(401).json({ error: 'Authentication required. Please log in.' });
      return;
    }

    const session = await Session.findOne({ sessionId });
    if (!session || session.expiresAt < new Date()) {
      if (session) await Session.deleteOne({ _id: session._id });
      res.clearCookie('teamproof_session');
      res.status(401).json({ error: 'Session expired or invalid. Please log in again.' });
      return;
    }

    const user = await User.findById(session.user);
    if (!user) {
      res.status(401).json({ error: 'User associated with session not found.' });
      return;
    }

    req.user = user;
    req.sessionId = sessionId as string;
    next();
  } catch (err) {
    console.error('requireAuth error:', err);
    res.status(500).json({ error: 'Internal authentication error' });
  }
}

export function requireProjectMember(allowedRoles?: string[]) {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const { projectId } = req.params;
      if (!projectId) {
        res.status(400).json({ error: 'Project ID is required in URL' });
        return;
      }

      const membership = await Membership.findOne({
        project: projectId,
        user: req.user._id,
        status: 'active',
      });

      if (!membership) {
        res.status(403).json({ error: 'You are not an authorized member of this project.' });
        return;
      }

      if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(membership.role)) {
        res.status(403).json({ error: `Permission denied. Requires one of: ${allowedRoles.join(', ')}` });
        return;
      }

      req.projectMembership = membership;
      next();
    } catch (err) {
      console.error('requireProjectMember error:', err);
      res.status(500).json({ error: 'Authorization error' });
    }
  };
}
