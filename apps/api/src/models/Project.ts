import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IGitHubConnectionDoc {
  installationId?: number;
  repositoryId?: number;
  owner?: string;
  name?: string;
  fullName?: string;
  htmlUrl?: string;
  defaultBranch?: string;
  connectedBy?: Types.ObjectId;
  connectedAt?: Date;
}

export interface IContributorMappingDoc {
  githubUsername: string;
  user: Types.ObjectId;
}

export interface IProjectDoc extends Document {
  title: string;
  description: string;
  category: string;
  owner: Types.ObjectId;
  startDate?: Date;
  endDate?: Date;
  status: 'active' | 'completed' | 'archived';
  githubConnection?: IGitHubConnectionDoc;
  githubContributorMappings?: IContributorMappingDoc[];
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema = new Schema<IProjectDoc>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: { type: String, default: 'Academic Engineering' },
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    startDate: { type: Date },
    endDate: { type: Date },
    status: { type: String, enum: ['active', 'completed', 'archived'], default: 'active' },
    githubConnection: {
      installationId: { type: Number },
      repositoryId: { type: Number },
      owner: { type: String },
      name: { type: String },
      fullName: { type: String },
      htmlUrl: { type: String },
      defaultBranch: { type: String },
      connectedBy: { type: Schema.Types.ObjectId, ref: 'User' },
      connectedAt: { type: Date },
    },
    githubContributorMappings: [
      {
        githubUsername: { type: String, required: true, lowercase: true, trim: true },
        user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
      },
    ],
  },
  { timestamps: true }
);

export const Project = mongoose.model<IProjectDoc>('Project', ProjectSchema);
