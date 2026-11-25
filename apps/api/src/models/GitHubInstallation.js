import mongoose, { Schema } from 'mongoose';

const GitHubInstallationSchema = new Schema(
  {
    installationId: { type: Number, required: true, unique: true, index: true },
    accountLogin: { type: String, required: true },
    accountType: { type: String, enum: ['User', 'Organization'], default: 'User' },
    accountAvatarUrl: { type: String },
    installedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    repositorySelection: { type: String, enum: ['all', 'selected'], default: 'all' },
  },
  { timestamps: true }
);

export const GitHubInstallation = mongoose.model('GitHubInstallation', GitHubInstallationSchema);
