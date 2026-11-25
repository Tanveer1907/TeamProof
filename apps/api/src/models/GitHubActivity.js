import mongoose, { Schema } from 'mongoose';

const GitHubActivitySchema = new Schema(
  {
    project: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    contributor: { type: Schema.Types.ObjectId, ref: 'User' },
    githubUsername: { type: String, lowercase: true, trim: true },
    githubAuthorName: { type: String },
    githubAuthorEmail: { type: String },
    githubAuthorAvatar: { type: String },
    activityType: { type: String, enum: ['pull_request', 'commit', 'issue'], required: true },
    title: { type: String, required: true },
    description: { type: String },
    repository: { type: String, required: true },
    externalId: { type: String },
    externalUrl: { type: String },
    refNumber: { type: String },
    branch: { type: String },
    state: { type: String },
    deliveryId: { type: String },
    relatedTask: { type: Schema.Types.ObjectId, ref: 'Task' },
    relatedEvidence: { type: Schema.Types.ObjectId, ref: 'Evidence' },
    occurredAt: { type: Date, default: Date.now },
    isDemoData: { type: Boolean, default: false },
  },
  { timestamps: true }
);

GitHubActivitySchema.index({ project: 1, activityType: 1, externalId: 1 }, { sparse: true });
GitHubActivitySchema.index({ project: 1, deliveryId: 1 }, { sparse: true });

export const GitHubActivity = mongoose.model('GitHubActivity', GitHubActivitySchema);
