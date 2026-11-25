import mongoose, { Schema } from 'mongoose';

const SessionSchema = new Schema(
  {
    sessionId: { type: String, required: true, unique: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    expiresAt: { type: Date, required: true, index: { expires: '0s' } },
  },
  { timestamps: true }
);

export const Session = mongoose.model('Session', SessionSchema);
