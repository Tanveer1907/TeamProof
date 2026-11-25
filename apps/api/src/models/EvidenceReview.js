import mongoose, { Schema } from 'mongoose';

const EvidenceReviewSchema = new Schema(
  {
    evidence: { type: Schema.Types.ObjectId, ref: 'Evidence', required: true, index: true },
    reviewer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    decision: { type: String, enum: ['Verified', 'Needs Changes'], required: true },
    comment: { type: String, required: true },
  },
  { timestamps: true }
);

export const EvidenceReview = mongoose.model('EvidenceReview', EvidenceReviewSchema);
