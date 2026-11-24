export type UserRole = 'student' | 'project_owner' | 'faculty';

export interface IUser {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  role: UserRole;
  emailVerified: boolean;
  createdAt: string;
}

export type ProjectRole = 'owner' | 'member' | 'faculty_reviewer';

export interface IProject {
  _id: string;
  title: string;
  description: string;
  category: string;
  owner: string | IUser;
  startDate?: string;
  endDate?: string;
  status: 'active' | 'completed' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export interface IMembership {
  _id: string;
  project: string;
  user: IUser;
  role: ProjectRole;
  joinedAt: string;
  status: 'active' | 'invited' | 'left';
}

export type TaskStatus = 'To Do' | 'In Progress' | 'In Review' | 'Verified';
export type TaskPriority = 'Low' | 'Medium' | 'High';

export interface ITask {
  _id: string;
  project: string;
  milestone?: string | IMilestone;
  taskIdStr: string; // e.g. CC-18
  title: string;
  description: string;
  assignee?: IUser;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate?: string;
  acceptanceCriteria?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface IMilestone {
  _id: string;
  project: string;
  title: string;
  description?: string;
  dueDate?: string;
  status: 'upcoming' | 'in_progress' | 'completed';
}

export type EvidenceCategory =
  | 'Code Development'
  | 'UI/UX Design'
  | 'Testing and Debugging'
  | 'Documentation'
  | 'Research and Planning'
  | 'Deployment and Infrastructure'
  | 'Other Deliverables';

export type EvidenceStatus = 'Submitted' | 'Verified' | 'Needs Changes';

export interface IEvidence {
  _id: string;
  project: string;
  task?: ITask;
  contributor: IUser;
  evidenceIdStr: string; // e.g. EV-04
  title: string;
  description: string;
  category: EvidenceCategory;
  fileUrl?: string;
  externalUrl?: string;
  status: EvidenceStatus;
  requestedReviewer?: IUser;
  submittedAt: string;
  updatedAt: string;
  reviewCount?: number;
}

export interface IEvidenceReview {
  _id: string;
  evidence: string;
  reviewer: IUser;
  decision: 'Verified' | 'Needs Changes';
  comment: string;
  createdAt: string;
}

export interface IActivity {
  _id: string;
  project: string;
  user: IUser;
  action: string;
  description: string;
  relatedTask?: string | ITask;
  relatedEvidence?: string | IEvidence;
  createdAt: string;
}

export interface IGitHubActivity {
  _id: string;
  project: string;
  contributor: IUser;
  activityType: 'pull_request' | 'commit' | 'issue';
  title: string;
  repository: string;
  externalUrl?: string;
  refNumber?: string; // e.g. PR #18, Commit a4f8c12
  relatedTask?: ITask;
  relatedEvidence?: IEvidence;
  occurredAt: string;
  isDemoData: boolean;
}
