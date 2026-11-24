import mongoose, { Schema, Document } from 'mongoose';

export interface IUserDoc extends Document {
  name: string;
  email: string;
  passwordHash: string;
  avatar?: string;
  role: 'student' | 'project_owner' | 'faculty';
  bio?: string;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUserDoc>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    avatar: { type: String },
    role: { type: String, enum: ['student', 'project_owner', 'faculty'], default: 'student' },
    bio: { type: String, default: '', trim: true, maxlength: 500 },
    emailVerified: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const User = mongoose.model<IUserDoc>('User', UserSchema);
