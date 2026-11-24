import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IActivityDoc extends Document {
  project: Types.ObjectId;
  user: Types.ObjectId;
  action: string;
  description: string;
  relatedTask?: Types.ObjectId;
  relatedEvidence?: Types.ObjectId;
  createdAt: Date;
}

const ActivitySchema = new Schema<IActivityDoc>(
  {
    project: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, required: true },
    description: { type: String, required: true },
    relatedTask: { type: Schema.Types.ObjectId, ref: 'Task' },
    relatedEvidence: { type: Schema.Types.ObjectId, ref: 'Evidence' },
  },
  { timestamps: true }
);

export const Activity = mongoose.model<IActivityDoc>('Activity', ActivitySchema);
