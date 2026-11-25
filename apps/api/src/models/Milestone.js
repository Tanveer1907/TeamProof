import mongoose, { Schema } from 'mongoose';

const MilestoneSchema = new Schema(
  {
    project: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String },
    dueDate: { type: Date },
    status: { type: String, enum: ['upcoming', 'in_progress', 'completed'], default: 'upcoming' },
  },
  { timestamps: true }
);

export const Milestone = mongoose.model('Milestone', MilestoneSchema);
