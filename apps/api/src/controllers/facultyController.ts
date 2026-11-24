import { Response } from 'express';
import { Project } from '../models/Project.js';
import { Membership } from '../models/Membership.js';
import { Evidence } from '../models/Evidence.js';
import { Task } from '../models/Task.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

export async function getFacultyWorkspace(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { projectId } = req.params;

    const project = await Project.findById(projectId).populate('owner', 'name email avatar');
    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    const [memberships, evidenceList, tasks] = await Promise.all([
      Membership.find({ project: projectId, status: 'active' }).populate('user', 'name email avatar role'),
      Evidence.find({ project: projectId })
        .populate('contributor', 'name email avatar role')
        .populate('task', 'taskIdStr title status')
        .sort({ submittedAt: -1 }),
      Task.find({ project: projectId }).populate('assignee', 'name email avatar'),
    ]);

    const students = memberships.filter(m => m.role !== 'faculty_reviewer').map(m => m.user);

    // Deterministic factual AI-assisted summary (Slide 14 target)
    // Clearly labeled: Automated Project Summary — Not an Academic Grade
    const verifiedCount = evidenceList.filter(e => e.status === 'Verified').length;
    const submittedCount = evidenceList.filter(e => e.status === 'Submitted').length;
    const needsChangesCount = evidenceList.filter(e => e.status === 'Needs Changes').length;

    const categoriesMap: Record<string, number> = {};
    for (const e of evidenceList) {
      categoriesMap[e.category] = (categoriesMap[e.category] || 0) + 1;
    }

    const aiSummary = {
      title: 'Automated Project Summary — Not an Academic Grade',
      disclaimer: 'Faculty make the final evaluation. Automated summaries do not assign grades or rank students.',
      highlights: [
        `Research and design work verified across ${evidenceList.filter(e => e.category === 'UI/UX Design' || e.category === 'Research and Planning').length} milestones.`,
        `${submittedCount} submission(s) currently await teammate or faculty review.`,
        `${verifiedCount} total contributions verified across technical and documentation domains.`,
      ],
      distribution: categoriesMap,
      verificationProgress: {
        total: evidenceList.length,
        verified: verifiedCount,
        pending: submittedCount,
        needsChanges: needsChangesCount,
      },
      peerInsightsTheme: 'Clear task ownership, cross-functional collaboration, and verified research handoffs.',
    };

    res.json({
      project,
      evaluationTitle: 'Evaluation 1 • Project review',
      course: 'Back End Engineering-II',
      teamName: 'Team Atlas',
      students,
      evidence: evidenceList,
      tasks,
      aiSummary,
    });
  } catch (err) {
    console.error('getFacultyWorkspace error:', err);
    res.status(500).json({ error: 'Failed to fetch faculty workspace data' });
  }
}
