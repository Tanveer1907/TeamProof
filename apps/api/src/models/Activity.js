import mongoose, { Schema } from 'mongoose';

const ActivitySchema = new Schema(
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

export const Activity = mongoose.model('Activity', ActivitySchema);
