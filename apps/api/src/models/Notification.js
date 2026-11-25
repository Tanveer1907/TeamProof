import mongoose, { Schema } from 'mongoose';

const NotificationSchema = new Schema(
  {
    recipient: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: [
        'task_assigned',
        'task_due_soon',
        'task_overdue',
        'evidence_submitted',
        'evidence_verified',
        'evidence_changes_requested',
        'review_request',
        'milestone_approaching',
        'project_update',
      ],
      required: true,
      index: true,
    },
    relatedProject: { type: Schema.Types.ObjectId, ref: 'Project' },
    relatedTask: { type: Schema.Types.ObjectId, ref: 'Task' },
    relatedEvidence: { type: Schema.Types.ObjectId, ref: 'Evidence' },
    read: { type: Boolean, default: false, index: true },
    linkUrl: { type: String },
  },
  { timestamps: true }
);

NotificationSchema.index({ recipient: 1, createdAt: -1 });

export const Notification = mongoose.model('Notification', NotificationSchema);
