import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IProjectDoc extends Document {
  title: string;
  description: string;
  category: string;
  owner: Types.ObjectId;
  startDate?: Date;
  endDate?: Date;
  status: 'active' | 'completed' | 'archived';
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
  },
  { timestamps: true }
);

export const Project = mongoose.model<IProjectDoc>('Project', ProjectSchema);
