import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IEvidenceDoc extends Document {
  project: Types.ObjectId;
  task?: Types.ObjectId;
  contributor: Types.ObjectId;
  evidenceIdStr: string; // e.g. EV-04
  title: string;
  description: string;
  category:
    | 'Code Development'
    | 'UI/UX Design'
    | 'Testing and Debugging'
    | 'Documentation'
    | 'Research and Planning'
    | 'Deployment and Infrastructure'
    | 'Other Deliverables';
  fileUrl?: string;
  externalUrl?: string;
  status: 'Submitted' | 'Verified' | 'Needs Changes';
  requestedReviewer?: Types.ObjectId;
  submittedAt: Date;
  updatedAt: Date;
}

const EvidenceSchema = new Schema<IEvidenceDoc>(
  {
    project: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    task: { type: Schema.Types.ObjectId, ref: 'Task' },
    contributor: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    evidenceIdStr: { type: String, required: true, trim: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: {
      type: String,
      enum: [
        'Code Development',
        'UI/UX Design',
        'Testing and Debugging',
        'Documentation',
        'Research and Planning',
        'Deployment and Infrastructure',
        'Other Deliverables',
      ],
      default: 'Code Development',
    },
    fileUrl: { type: String },
    externalUrl: { type: String },
    status: { type: String, enum: ['Submitted', 'Verified', 'Needs Changes'], default: 'Submitted' },
    requestedReviewer: { type: Schema.Types.ObjectId, ref: 'User' },
    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

EvidenceSchema.index({ project: 1, evidenceIdStr: 1 }, { unique: true });

export const Evidence = mongoose.model<IEvidenceDoc>('Evidence', EvidenceSchema);
