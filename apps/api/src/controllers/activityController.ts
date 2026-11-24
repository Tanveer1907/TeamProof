import { Response } from 'express';
import { Activity } from '../models/Activity.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

export async function listActivities(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { projectId } = req.params;
    const activities = await Activity.find({ project: projectId })
      .populate('user', 'name email avatar role')
      .populate('relatedTask', 'taskIdStr title status')
      .populate('relatedEvidence', 'evidenceIdStr title status')
      .sort({ createdAt: -1 })
      .limit(30);

    res.json({ activities });
  } catch (err) {
    res.status(500).json({ error: 'Failed to list activities' });
  }
}
