export type UserRole = 'student' | 'project_owner' | 'faculty';

export interface IUser {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  role: UserRole;
  bio?: string;
  emailVerified: boolean;
  createdAt: string;
}

export type ProjectRole = 'owner' | 'member' | 'faculty_reviewer';

export interface IGitHubConnection {
  installationId?: number;
  repositoryId?: number;
  owner?: string;
  name?: string;
  fullName?: string;
  htmlUrl?: string;
  defaultBranch?: string;
  connectedAt?: string;
}

export interface IContributorMapping {
  githubUsername: string;
  user: IUser | string;
}

export interface IProject {
  _id: string;
  title: string;
  description: string;
  category: string;
  owner: string | IUser;
  startDate?: string;
  endDate?: string;
  status: 'active' | 'completed' | 'archived';
  githubConnection?: IGitHubConnection;
  githubContributorMappings?: IContributorMapping[];
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
  contributor?: IUser;
  githubUsername?: string;
  githubAuthorName?: string;
  githubAuthorAvatar?: string;
  activityType: 'pull_request' | 'commit' | 'issue';
  title: string;
  description?: string;
  repository: string;
  externalId?: string;
  externalUrl?: string;
  refNumber?: string; // e.g. PR #18, Commit a4f8c12
  branch?: string;
  state?: string;
  deliveryId?: string;
  relatedTask?: ITask;
  relatedEvidence?: IEvidence;
  occurredAt: string;
  isDemoData: boolean;
}

export type NotificationType =
  | 'task_assigned'
  | 'task_due_soon'
  | 'task_overdue'
  | 'evidence_submitted'
  | 'evidence_verified'
  | 'evidence_changes_requested'
  | 'review_request'
  | 'milestone_approaching'
  | 'project_update';

export interface INotification {
  _id: string;
  recipient: string;
  title: string;
  description: string;
  type: NotificationType;
  relatedProject?: string;
  relatedTask?: string;
  relatedEvidence?: string;
  read: boolean;
  linkUrl?: string;
  createdAt: string;
  updatedAt: string;
}
