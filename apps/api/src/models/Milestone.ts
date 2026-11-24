import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IMilestoneDoc extends Document {
  project: Types.ObjectId;
  title: string;
  description?: string;
  dueDate?: Date;
  status: 'upcoming' | 'in_progress' | 'completed';
}

const MilestoneSchema = new Schema<IMilestoneDoc>(
  {
    project: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String },
    dueDate: { type: Date },
    status: { type: String, enum: ['upcoming', 'in_progress', 'completed'], default: 'upcoming' },
  },
  { timestamps: true }
);

export const Milestone = mongoose.model<IMilestoneDoc>('Milestone', MilestoneSchema);
