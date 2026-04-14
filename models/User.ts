import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  role: 'user' | 'admin';
  createdAt: Date;
  updatedAt: Date;
  comparePassword: (password: string) => Promise<boolean>;
}

const UserSchema: Schema<IUser> = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
  },
  { timestamps: true }
);

// Hashing is now handled in the API route for better compatibility with Next.js 16

// Method to compare password
UserSchema.methods.comparePassword = async function(password: string) {
  return bcrypt.compare(password, this.password);
};

// Force re-registration in development to clear stale middleware from HMR
if (process.env.NODE_ENV === 'development') {
  delete mongoose.models['User'];
}

export const User: Model<IUser> =
  mongoose.models['User'] || mongoose.model<IUser>('User', UserSchema);
