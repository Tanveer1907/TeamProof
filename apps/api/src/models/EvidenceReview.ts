import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IEvidenceReviewDoc extends Document {
  evidence: Types.ObjectId;
  reviewer: Types.ObjectId;
  decision: 'Verified' | 'Needs Changes';
  comment: string;
  createdAt: Date;
}

const EvidenceReviewSchema = new Schema<IEvidenceReviewDoc>(
  {
    evidence: { type: Schema.Types.ObjectId, ref: 'Evidence', required: true, index: true },
    reviewer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    decision: { type: String, enum: ['Verified', 'Needs Changes'], required: true },
    comment: { type: String, required: true },
  },
  { timestamps: true }
);

export const EvidenceReview = mongoose.model<IEvidenceReviewDoc>('EvidenceReview', EvidenceReviewSchema);
