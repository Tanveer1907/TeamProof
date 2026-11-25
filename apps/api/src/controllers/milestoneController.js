import { Milestone } from '../models/Milestone.js';
import { createMilestoneSchema } from '../validators/schemas.js';

export async function listMilestones(req, res) {
  try {
    const { projectId } = req.params;
    const milestones = await Milestone.find({ project: projectId }).sort({ dueDate: 1 });
    res.json({ milestones });
  } catch (err) {
    res.status(500).json({ error: 'Failed to list milestones' });
  }
}

export async function createMilestone(req, res) {
  try {
    const { projectId } = req.params;
    const parse = createMilestoneSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ error: parse.error.errors[0].message });
      return;
    }

    const { title, description, dueDate } = parse.data;
    const milestone = await Milestone.create({
      project: projectId,
      title,
      description,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      status: 'upcoming',
    });

    res.status(201).json({ milestone });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create milestone' });
  }
}
