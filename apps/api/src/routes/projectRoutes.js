import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { requireAuth, requireProjectMember } from '../middleware/auth.js';
import {
  listProjects,
  createProject,
  getProject,
  updateProject,
  getProjectMembers,
  addProjectMember,
} from '../controllers/projectController.js';
import { listTasks, createTask, getTask, updateTask, deleteTask } from '../controllers/taskController.js';
import { listMilestones, createMilestone } from '../controllers/milestoneController.js';
import {
  listEvidence,
  createEvidence,
  getEvidence,
  reviewEvidence,
  getPendingReviews,
} from '../controllers/evidenceController.js';
import { listActivities } from '../controllers/activityController.js';
import {
  listGitHubActivity,
  getGitHubStatus,
  listAvailableRepositories,
  connectRepository,
  disconnectRepository,
  syncRepository,
  mapContributor,
  linkActivityToTaskOrEvidence,
} from '../controllers/githubController.js';
import { getFacultyWorkspace } from '../controllers/facultyController.js';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.resolve(process.cwd(), 'uploads'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, unique);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowed = ['.pdf', '.png', '.jpg', '.jpeg', '.zip', '.doc', '.docx'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, PNG, JPG, and DOC files are accepted.'));
    }
  },
});

export const projectRouter = Router();

// Project collection routes
projectRouter.get('/', requireAuth, listProjects);
projectRouter.post('/', requireAuth, createProject);

// Single project routes
projectRouter.get('/:projectId', requireAuth, requireProjectMember(), getProject);
projectRouter.patch('/:projectId', requireAuth, requireProjectMember(['owner']), updateProject);
projectRouter.get('/:projectId/members', requireAuth, requireProjectMember(), getProjectMembers);
projectRouter.post('/:projectId/members', requireAuth, requireProjectMember(['owner']), addProjectMember);

// Tasks
projectRouter.get('/:projectId/tasks', requireAuth, requireProjectMember(), listTasks);
projectRouter.post('/:projectId/tasks', requireAuth, requireProjectMember(), createTask);
projectRouter.get('/:projectId/tasks/:taskId', requireAuth, requireProjectMember(), getTask);
projectRouter.patch('/:projectId/tasks/:taskId', requireAuth, requireProjectMember(), updateTask);
projectRouter.delete('/:projectId/tasks/:taskId', requireAuth, requireProjectMember(['owner']), deleteTask);

// Milestones
projectRouter.get('/:projectId/milestones', requireAuth, requireProjectMember(), listMilestones);
projectRouter.post('/:projectId/milestones', requireAuth, requireProjectMember(['owner']), createMilestone);

// Evidence
projectRouter.get('/:projectId/evidence', requireAuth, requireProjectMember(), listEvidence);
projectRouter.post('/:projectId/evidence', requireAuth, requireProjectMember(), upload.single('file'), createEvidence);
projectRouter.get('/:projectId/evidence/:evidenceId', requireAuth, requireProjectMember(), getEvidence);

// Reviews
projectRouter.post('/:projectId/evidence/:evidenceId/reviews', requireAuth, requireProjectMember(), reviewEvidence);
projectRouter.get('/:projectId/reviews/pending', requireAuth, requireProjectMember(), getPendingReviews);

// Activity
projectRouter.get('/:projectId/activity', requireAuth, requireProjectMember(), listActivities);

// GitHub
projectRouter.get('/:projectId/github/status', requireAuth, requireProjectMember(), getGitHubStatus);
projectRouter.get(
  '/:projectId/github/repositories',
  requireAuth,
  requireProjectMember(['owner', 'faculty_reviewer', 'member']),
  listAvailableRepositories
);
projectRouter.post(
  '/:projectId/github/connect',
  requireAuth,
  requireProjectMember(['owner', 'faculty_reviewer', 'member']),
  connectRepository
);
projectRouter.post(
  '/:projectId/github/disconnect',
  requireAuth,
  requireProjectMember(['owner', 'faculty_reviewer', 'member']),
  disconnectRepository
);
projectRouter.post(
  '/:projectId/github/sync',
  requireAuth,
  requireProjectMember(),
  syncRepository
);
projectRouter.get('/:projectId/github/activity', requireAuth, requireProjectMember(), listGitHubActivity);
projectRouter.post(
  '/:projectId/github/map-contributor',
  requireAuth,
  requireProjectMember(['owner', 'faculty_reviewer', 'member']),
  mapContributor
);
projectRouter.post(
  '/:projectId/github/activities/:activityId/link',
  requireAuth,
  requireProjectMember(),
  linkActivityToTaskOrEvidence
);

// Faculty Workspace: Strictly restricted to 'faculty_reviewer' and 'owner'. Ordinary members cannot access.
projectRouter.get(
  '/:projectId/faculty-workspace',
  requireAuth,
  requireProjectMember(['faculty_reviewer', 'owner']),
  getFacultyWorkspace
);
