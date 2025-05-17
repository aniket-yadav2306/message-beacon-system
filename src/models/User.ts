
import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  phone?: string;
  preferences: {
    email: boolean;
    sms: boolean;
    inApp: boolean;
  };
}

const UserSchema: Schema = new Schema({
  email: { 
    type: String, 
    required: true,
    unique: true 
  },
  phone: { 
    type: String,
    default: null
  },
  preferences: {
    email: {
      type: Boolean,
      default: true
    },
    sms: {
      type: Boolean,
      default: true
    },
    inApp: {
      type: Boolean,
      default: true
    }
  }
}, {
  timestamps: true
});

export default mongoose.model<IUser>('User', UserSchema);
