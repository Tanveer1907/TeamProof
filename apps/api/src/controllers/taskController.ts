import { Response } from 'express';
import { Task } from '../models/Task.js';
import { Activity } from '../models/Activity.js';
import { Notification } from '../models/Notification.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { createTaskSchema, updateTaskSchema } from '../validators/schemas.js';

export async function listTasks(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { projectId } = req.params;
    const { status, milestone } = req.query;

    const filter: any = { project: projectId };
    if (status) filter.status = status;
    if (milestone) filter.milestone = milestone;

    const tasks = await Task.find(filter)
      .populate('assignee', 'name email avatar role')
      .populate('milestone', 'title status dueDate')
      .sort({ createdAt: -1 });

    res.json({ tasks });
  } catch (err) {
    res.status(500).json({ error: 'Failed to list tasks' });
  }
}

export async function createTask(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { projectId } = req.params;
    const parse = createTaskSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ error: parse.error.errors[0].message });
      return;
    }

    // Generate unique taskIdStr like CC-1, CC-2...
    const count = await Task.countDocuments({ project: projectId });
    const taskIdStr = `CC-${count + 1}`;

    const { title, description, assignee, priority, status, dueDate, acceptanceCriteria, milestone } = parse.data;

    const task = await Task.create({
      project: projectId,
      milestone: milestone || undefined,
      taskIdStr,
      title,
      description,
      assignee: assignee || undefined,
      priority,
      status: status || 'To Do',
      dueDate: dueDate ? new Date(dueDate) : undefined,
      acceptanceCriteria,
      createdBy: req.user!._id,
    });

    const populatedTask = await Task.findById(task._id).populate('assignee', 'name email avatar');

    await Activity.create({
      project: projectId,
      user: req.user!._id,
      action: 'task_created',
      description: `${req.user!.name} created task ${taskIdStr}: ${title}`,
      relatedTask: task._id,
    });

    if (assignee && assignee !== req.user!._id.toString()) {
      await Notification.create({
        recipient: assignee,
        title: `Task Assigned: ${taskIdStr}`,
        description: `${req.user!.name} assigned task "${title}" to you.`,
        type: 'task_assigned',
        relatedProject: projectId,
        relatedTask: task._id,
        linkUrl: `/tasks`,
      });
    }

    res.status(201).json({ task: populatedTask });
  } catch (err) {
    console.error('createTask error:', err);
    res.status(500).json({ error: 'Failed to create task' });
  }
}

export async function getTask(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { taskId } = req.params;
    const task = await Task.findById(taskId)
      .populate('assignee', 'name email avatar role')
      .populate('milestone', 'title status dueDate');

    if (!task) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }

    res.json({ task });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get task' });
  }
}

export async function updateTask(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { taskId } = req.params;
    const parse = updateTaskSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ error: parse.error.errors[0].message });
      return;
    }

    const existing = await Task.findById(taskId);
    if (!existing) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }

    // SPEC RULE: A task must not become Verified merely because the assignee marks it complete.
    // The evidence verification workflow must govern that transition.
    if (parse.data.status === 'Verified' && existing.status !== 'Verified') {
      res.status(400).json({
        error: 'Tasks cannot be directly moved to Verified. Verification requires evidence submission and teammate/faculty verification.',
      });
      return;
    }

    const updated = await Task.findByIdAndUpdate(taskId, parse.data, { new: true })
      .populate('assignee', 'name email avatar role')
      .populate('milestone', 'title status dueDate');

    if (parse.data.status && parse.data.status !== existing.status) {
      await Activity.create({
        project: existing.project,
        user: req.user!._id,
        action: 'task_status_changed',
        description: `${req.user!.name} moved task ${existing.taskIdStr} to ${parse.data.status}`,
        relatedTask: existing._id,
      });
    }

    res.json({ task: updated });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update task' });
  }
}

export async function deleteTask(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { taskId } = req.params;
    const task = await Task.findById(taskId);
    if (!task) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }

    await Task.findByIdAndDelete(taskId);
    res.json({ message: 'Task deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete task' });
  }
}
