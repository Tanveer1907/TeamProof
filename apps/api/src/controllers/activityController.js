import { Activity } from '../models/Activity.js';

export async function listActivities(req, res) {
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
