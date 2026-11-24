import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IGitHubActivityDoc extends Document {
  project: Types.ObjectId;
  contributor: Types.ObjectId;
  activityType: 'pull_request' | 'commit' | 'issue';
  title: string;
  repository: string;
  externalUrl?: string;
  refNumber?: string;
  relatedTask?: Types.ObjectId;
  relatedEvidence?: Types.ObjectId;
  occurredAt: Date;
  isDemoData: boolean;
}

const GitHubActivitySchema = new Schema<IGitHubActivityDoc>(
  {
    project: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    contributor: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    activityType: { type: String, enum: ['pull_request', 'commit', 'issue'], required: true },
    title: { type: String, required: true },
    repository: { type: String, default: 'team-atlas/campusconnect-demo' },
    externalUrl: { type: String },
    refNumber: { type: String },
    relatedTask: { type: Schema.Types.ObjectId, ref: 'Task' },
    relatedEvidence: { type: Schema.Types.ObjectId, ref: 'Evidence' },
    occurredAt: { type: Date, default: Date.now },
    isDemoData: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const GitHubActivity = mongoose.model<IGitHubActivityDoc>('GitHubActivity', GitHubActivitySchema);
