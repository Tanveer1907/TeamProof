import { Project } from '../models/Project.js';
import { Task } from '../models/Task.js';
import { Evidence } from '../models/Evidence.js';
import { Milestone } from '../models/Milestone.js';
import { Membership } from '../models/Membership.js';
import { Activity } from '../models/Activity.js';

export async function getDashboardOverview(req, res) {
  try {
    const userId = req.user._id;
    let projectId = req.query.projectId;

    if (!projectId) {
      // Pick first active membership project
      const membership = await Membership.findOne({ user: userId, status: 'active' });
      if (membership) {
        projectId = membership.project.toString();
      }
    }

    if (!projectId) {
      res.json({
        hasProjects: false,
        message: 'No active projects found. Create or join your first project to get started.',
      });
      return;
    }

    const project = await Project.findById(projectId).populate('owner', 'name email avatar');
    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    // Check membership
    const membership = await Membership.findOne({ project: projectId, user: userId, status: 'active' });
    if (!membership) {
      res.status(403).json({ error: 'Access denied to this project' });
      return;
    }

    const [memberships, nextMilestone, awaitingReviewCount, upcomingTasks, recentActivity] = await Promise.all([
      Membership.find({ project: projectId, status: 'active' }).populate('user', 'name email avatar role'),
      Milestone.findOne({ project: projectId, status: { $ne: 'completed' } }).sort({ dueDate: 1 }),
      Evidence.countDocuments({ project: projectId, status: 'Submitted' }),
      Task.find({ project: projectId })
        .populate('assignee', 'name email avatar')
        .sort({ dueDate: 1 })
        .limit(6),
      Activity.find({ project: projectId })
        .populate('user', 'name email avatar')
        .populate('relatedEvidence', 'evidenceIdStr title')
        .populate('relatedTask', 'taskIdStr title')
        .sort({ createdAt: -1 })
        .limit(6),
    ]);

    const members = memberships.map(m => m.user);

    res.json({
      hasProjects: true,
      project,
      currentMemberRole: membership.role,
      nextMilestone: nextMilestone || {
        title: 'Project Initial Review',
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      },
      awaitingReviewCount,
      members,
      upcomingTasks,
      recentActivity,
    });
  } catch (err) {
    console.error('getDashboardOverview error:', err);
    res.status(500).json({ error: 'Failed to generate dashboard overview' });
  }
}
