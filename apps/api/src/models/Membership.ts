import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IMembershipDoc extends Document {
  project: Types.ObjectId;
  user: Types.ObjectId;
  role: 'owner' | 'member' | 'faculty_reviewer';
  joinedAt: Date;
  status: 'active' | 'invited' | 'left';
}

const MembershipSchema = new Schema<IMembershipDoc>(
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

export const Membership = mongoose.model<IMembershipDoc>('Membership', MembershipSchema);
