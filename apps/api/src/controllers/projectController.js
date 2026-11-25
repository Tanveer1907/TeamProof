import { Project } from '../models/Project.js';
import { Membership } from '../models/Membership.js';
import { Activity } from '../models/Activity.js';
import { User } from '../models/User.js';
import { createProjectSchema, updateProjectSchema } from '../validators/schemas.js';

export async function listProjects(req, res) {
  try {
    const userId = req.user._id;
    // Find all memberships for this user
    const memberships = await Membership.find({ user: userId, status: 'active' }).populate('project');
    const projects = memberships
      .map(m => m.project)
      .filter(p => Boolean(p));

    res.json({ projects });
  } catch (err) {
    res.status(500).json({ error: 'Failed to list user projects' });
  }
}

export async function createProject(req, res) {
  try {
    const parse = createProjectSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ error: parse.error.errors[0].message });
      return;
    }

    const { title, description, category, startDate, endDate } = parse.data;
    const project = await Project.create({
      title,
      description,
      category,
      owner: req.user._id,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });

    // Create owner membership
    await Membership.create({
      project: project._id,
      user: req.user._id,
      role: 'owner',
      status: 'active',
    });

    await Activity.create({
      project: project._id,
      user: req.user._id,
      action: 'project_created',
      description: `${req.user.name} created project ${project.title}.`,
    });

    res.status(201).json({ project });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create project' });
  }
}

export async function getProject(req, res) {
  try {
    const { projectId } = req.params;
    const project = await Project.findById(projectId).populate('owner', 'name email avatar role');
    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    res.json({ project });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch project' });
  }
}

export async function updateProject(req, res) {
  try {
    const { projectId } = req.params;
    const parse = updateProjectSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ error: parse.error.errors[0].message });
      return;
    }

    const updated = await Project.findByIdAndUpdate(projectId, parse.data, { new: true });
    res.json({ project: updated });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update project' });
  }
}

export async function getProjectMembers(req, res) {
  try {
    const { projectId } = req.params;
    const members = await Membership.find({ project: projectId, status: 'active' })
      .populate('user', 'name email avatar role')
      .sort({ joinedAt: 1 });

    res.json({ members });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get members' });
  }
}

export async function addProjectMember(req, res) {
  try {
    const { projectId } = req.params;
    const { email, role = 'member' } = req.body;

    const targetUser = await User.findOne({ email });
    if (!targetUser) {
      res.status(404).json({ error: `User with email ${email} not registered in TeamProof.` });
      return;
    }

    const existing = await Membership.findOne({ project: projectId, user: targetUser._id });
    if (existing) {
      if (existing.status === 'active') {
        res.status(409).json({ error: 'User is already an active member of this project.' });
        return;
      }
      existing.status = 'active';
      existing.role = role;
      await existing.save();
      res.json({ message: 'User re-activated in project', membership: existing });
      return;
    }

    const membership = await Membership.create({
      project: projectId,
      user: targetUser._id,
      role,
      status: 'active',
    });

    res.status(201).json({ membership });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add project member' });
  }
}
