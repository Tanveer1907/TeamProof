import mongoose, { Schema } from 'mongoose';

const ProjectSchema = new Schema(
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

export const Project = mongoose.model('Project', ProjectSchema);
