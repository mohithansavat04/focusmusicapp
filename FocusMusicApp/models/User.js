import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  isSubscribed: { type: Boolean, default: false },
  subscriptionEndsAt: { type: Date }
}, { timestamps: true });

export default mongoose.model('User', userSchema);
