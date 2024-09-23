import mongoose, { Document } from 'mongoose';

export interface IUser extends Document {
  fullName: string;
  email: string;
  password?: string;
  phone?: string;
}

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String }, // Not required for Google users
  phone: { type: String }, // Optional
});

const User = mongoose.model<IUser>('User', userSchema);
export default User;
