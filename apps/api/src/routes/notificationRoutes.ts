import { Router } from 'express';
import { listNotifications, markAsRead, markAllAsRead } from '../controllers/notificationController.js';
import { requireAuth } from '../middleware/auth.js';

export const notificationRouter = Router();

notificationRouter.get('/', requireAuth, listNotifications);
notificationRouter.patch('/read-all', requireAuth, markAllAsRead);
notificationRouter.post('/read-all', requireAuth, markAllAsRead);
notificationRouter.patch('/:notificationId/read', requireAuth, markAsRead);
