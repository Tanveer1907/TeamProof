import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50),
  bio: z.string().max(500, 'Bio cannot exceed 500 characters').optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
});

export const createProjectSchema = z.object({
  title: z.string().min(3, 'Project title must be at least 3 characters'),
  description: z.string().min(5, 'Project description is required'),
  category: z.string().default('Academic Engineering'),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export const updateProjectSchema = z.object({
  title: z.string().min(3).optional(),
  description: z.string().optional(),
  category: z.string().optional(),
  status: z.enum(['active', 'completed', 'archived']).optional(),
});

export const createTaskSchema = z.object({
  title: z.string().min(2, 'Task title is required'),
  description: z.string().default(''),
  assignee: z.string().optional(),
  priority: z.enum(['Low', 'Medium', 'High']).default('Medium'),
  status: z.enum(['To Do', 'In Progress', 'In Review', 'Verified']).default('To Do'),
  dueDate: z.string().optional(),
  acceptanceCriteria: z.string().optional(),
  milestone: z.string().optional(),
});

export const updateTaskSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  assignee: z.string().nullable().optional(),
  priority: z.enum(['Low', 'Medium', 'High']).optional(),
  status: z.enum(['To Do', 'In Progress', 'In Review', 'Verified']).optional(),
  dueDate: z.string().nullable().optional(),
  acceptanceCriteria: z.string().optional(),
  milestone: z.string().nullable().optional(),
});

const CATEGORY_MAP = {
  'Testing & Quality Assurance': 'Testing and Debugging',
  'System Design & Architecture': 'Research and Planning',
  'Research & Documentation': 'Documentation',
  'Data Engineering & Database': 'Code Development',
  'DevOps & Deployment': 'Deployment and Infrastructure',
  'UI/UX Prototyping': 'UI/UX Design',
};

export const createEvidenceSchema = z.object({
  taskId: z.string().optional(),
  title: z.string().min(3, 'Evidence title is required'),
  description: z.string().min(10, 'Detailed contribution description is required'),
  category: z.preprocess(
    (val) => (typeof val === 'string' && CATEGORY_MAP[val] ? CATEGORY_MAP[val] : val),
    z.enum([
      'Code Development',
      'UI/UX Design',
      'Testing and Debugging',
      'Documentation',
      'Research and Planning',
      'Deployment and Infrastructure',
      'Other Deliverables',
    ])
  ),
  externalUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  requestedReviewerId: z.string().optional(),
});

export const createReviewSchema = z.object({
  decision: z.enum(['Verified', 'Needs Changes']),
  comment: z.string().min(3, 'Review comment / explanation is required'),
});

export const createMilestoneSchema = z.object({
  title: z.string().min(2, 'Milestone title is required'),
  description: z.string().optional(),
  dueDate: z.string().optional(),
});
