import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ITaskDoc extends Document {
  project: Types.ObjectId;
  milestone?: Types.ObjectId;
  taskIdStr: string; // e.g., CC-18
  title: string;
  description: string;
  assignee?: Types.ObjectId;
  priority: 'Low' | 'Medium' | 'High';
  status: 'To Do' | 'In Progress' | 'In Review' | 'Verified';
  dueDate?: Date;
  acceptanceCriteria?: string;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema = new Schema<ITaskDoc>(
  {
    project: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    milestone: { type: Schema.Types.ObjectId, ref: 'Milestone' },
    taskIdStr: { type: String, required: true, trim: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    assignee: { type: Schema.Types.ObjectId, ref: 'User' },
    priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
    status: { type: String, enum: ['To Do', 'In Progress', 'In Review', 'Verified'], default: 'To Do' },
    dueDate: { type: Date },
    acceptanceCriteria: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

TaskSchema.index({ project: 1, taskIdStr: 1 }, { unique: true });

export const Task = mongoose.model<ITaskDoc>('Task', TaskSchema);
