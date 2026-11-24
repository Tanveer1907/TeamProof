import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ISessionDoc extends Document {
  sessionId: string;
  user: Types.ObjectId;
  expiresAt: Date;
  createdAt: Date;
}

const SessionSchema = new Schema<ISessionDoc>(
  {
    sessionId: { type: String, required: true, unique: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    expiresAt: { type: Date, required: true, index: { expires: '0s' } },
  },
  { timestamps: true }
);

export const Session = mongoose.model<ISessionDoc>('Session', SessionSchema);
