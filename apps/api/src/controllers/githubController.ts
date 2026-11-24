import { Response } from 'express';
import { GitHubActivity } from '../models/GitHubActivity.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

export async function listGitHubActivity(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { projectId } = req.params;
    const activities = await GitHubActivity.find({ project: projectId })
      .populate('contributor', 'name email avatar role')
      .populate('relatedTask', 'taskIdStr title status')
      .populate('relatedEvidence', 'evidenceIdStr title status')
      .sort({ occurredAt: -1 });

    res.json({
      activities,
      meta: {
        repository: 'team-atlas/campusconnect-demo',
        branch: 'main',
        status: 'Connected (Demo Sandbox)',
        connectionType: 'GitHub App connection • Demo repository',
        notice: 'Commit counts alone do not measure contribution quality.',
      },
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch GitHub activity' });
  }
}

export async function getGitHubStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
  res.json({
    connected: true,
    isDemoData: true,
    repository: 'team-atlas/campusconnect-demo',
    branch: 'main',
    providerNotice: 'Using TeamProof GitHub Demonstration Sandbox. External OAuth can be configured via GITHUB_CLIENT_ID.',
  });
}
