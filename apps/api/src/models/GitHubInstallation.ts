import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IGitHubInstallationDoc extends Document {
  installationId: number;
  accountLogin: string;
  accountType: 'User' | 'Organization';
  accountAvatarUrl?: string;
  installedBy?: Types.ObjectId;
  repositorySelection: 'all' | 'selected';
  createdAt: Date;
  updatedAt: Date;
}

const GitHubInstallationSchema = new Schema<IGitHubInstallationDoc>(
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

export const GitHubInstallation = mongoose.model<IGitHubInstallationDoc>('GitHubInstallation', GitHubInstallationSchema);
