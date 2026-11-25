import mongoose, { Schema } from 'mongoose';

const UserSchema = new Schema(
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

export const User = mongoose.model('User', UserSchema);
