import { Session } from '../models/Session.js';
import { User } from '../models/User.js';
import { Membership } from '../models/Membership.js';
import { Project } from '../models/Project.js';

/**
 * Enforces authentication strictly based on secure HTTP-only cookies.
 * Removed legacy header fallback to eliminate token theft vectors.
 */
export async function requireAuth(req, res, next) {
  try {
    const sessionId = req.cookies?.teamproof_session;
    if (!sessionId) {
      res.status(401).json({ error: 'Authentication required. Please log in.' });
      return;
    }

    const session = await Session.findOne({ sessionId });
    if (!session || session.expiresAt < new Date()) {
      if (session) await Session.deleteOne({ _id: session._id });
      res.clearCookie('teamproof_session', { path: '/' });
      res.status(401).json({ error: 'Session expired or invalid. Please log in again.' });
      return;
    }

    const user = await User.findById(session.user);
    if (!user) {
      res.status(401).json({ error: 'User associated with session not found.' });
      return;
    }

    req.user = user;
    req.sessionId = sessionId;
    next();
  } catch (err) {
    console.error('requireAuth error:', err);
    res.status(500).json({ error: 'Internal authentication error' });
  }
}

/**
 * Enforces project-level authorization based on active project memberships and permitted roles.
 */
export function requireProjectMember(allowedRoles) {
  return async (req, res, next) => {
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

      let membership = await Membership.findOne({
        project: projectId,
        user: req.user._id,
        status: 'active',
      });

      if (!membership) {
        // Fallback: Check if the user is the owner of the project
        const project = await Project.findById(projectId);
        if (project && String(project.owner) === String(req.user._id)) {
          membership = { project: projectId, user: req.user._id, role: 'owner', status: 'active' };
        } else {
          res.status(403).json({ error: 'You are not an authorized member of this project.' });
          return;
        }
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
