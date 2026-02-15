import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  // identification fields
  email: { type: String, required: false, unique: true, sparse: true, index: true },
  workerId: { type: String, required: false, unique: true, sparse: true, index: true },
  adminId: { type: String, required: false, unique: true, sparse: true, index: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['admin', 'worker'], default: 'worker' },
  rate: { type: Number, default: 0 },
  otRate: { type: Number, default: 0 },
  photoBase64: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('User', userSchema);
