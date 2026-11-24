import { Response } from 'express';
import { Notification } from '../models/Notification.js';
import { Task } from '../models/Task.js';
import { Membership } from '../models/Membership.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

export async function listNotifications(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!._id;

    // Check deadlines for tasks assigned to this user to automatically create approaching/overdue alerts without duplication
    const memberships = await Membership.find({ user: userId, status: 'active' });
    const projectIds = memberships.map(m => m.project);

    if (projectIds.length > 0) {
      const now = new Date();
      const inThreeDays = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

      const assignedTasks = await Task.find({
        project: { $in: projectIds },
        assignee: userId,
        status: { $ne: 'Verified' },
        dueDate: { $exists: true, $ne: null },
      });

      for (const t of assignedTasks) {
        if (!t.dueDate) continue;

        if (t.dueDate < now) {
          // Check if already notified for overdue
          const existing = await Notification.findOne({
            recipient: userId,
            relatedTask: t._id,
            type: 'task_overdue',
          });
          if (!existing) {
            await Notification.create({
              recipient: userId,
              title: `Task Overdue: ${t.taskIdStr}`,
              description: `Task "${t.title}" was due on ${new Date(t.dueDate).toLocaleDateString()}. Please submit your progress evidence.`,
              type: 'task_overdue',
              relatedProject: t.project,
              relatedTask: t._id,
              linkUrl: `/tasks`,
            });
          }
        } else if (t.dueDate <= inThreeDays) {
          // Approaching deadline
          const existing = await Notification.findOne({
            recipient: userId,
            relatedTask: t._id,
            type: 'task_due_soon',
          });
          if (!existing) {
            await Notification.create({
              recipient: userId,
              title: `Deadline Approaching: ${t.taskIdStr}`,
              description: `Task "${t.title}" is due on ${new Date(t.dueDate).toLocaleDateString()}.`,
              type: 'task_due_soon',
              relatedProject: t.project,
              relatedTask: t._id,
              linkUrl: `/tasks`,
            });
          }
        }
      }
    }

    const notifications = await Notification.find({ recipient: userId })
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = await Notification.countDocuments({ recipient: userId, read: false });

    res.json({ notifications, unreadCount });
  } catch (err) {
    console.error('listNotifications error:', err);
    res.status(500).json({ error: 'Failed to retrieve notifications' });
  }
}

export async function markAsRead(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { notificationId } = req.params;
    const userId = req.user!._id;

    const notif = await Notification.findOneAndUpdate(
      { _id: notificationId, recipient: userId },
      { $set: { read: true } },
      { new: true }
    );

    if (!notif) {
      res.status(404).json({ error: 'Notification not found' });
      return;
    }

    res.json({ notification: notif });
  } catch (err) {
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
}

export async function markAllAsRead(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!._id;
    await Notification.updateMany({ recipient: userId, read: false }, { $set: { read: true } });
    res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to mark notifications as read' });
  }
}
