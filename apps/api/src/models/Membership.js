import mongoose, { Schema } from 'mongoose';

const MembershipSchema = new Schema(
  {
    project: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    role: { type: String, enum: ['owner', 'member', 'faculty_reviewer'], default: 'member' },
    joinedAt: { type: Date, default: Date.now },
    status: { type: String, enum: ['active', 'invited', 'left'], default: 'active' },
  },
  { timestamps: true }
);

MembershipSchema.index({ project: 1, user: 1 }, { unique: true });

export const Membership = mongoose.model('Membership', MembershipSchema);
