import mongoose from 'mongoose';

const timeEntrySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: String, required: true, index: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  breakMinutes: { type: Number, default: 0 },
  totalHours: { type: Number, required: true },
  baseHours: { type: Number, required: true },
  overtimeHours: { type: Number, required: true },
  notes: { type: String },
  status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'PENDING' },
  adminComment: { type: String },
  createdAt: { type: Date, default: Date.now }
});

timeEntrySchema.index({ userId: 1, date: 1 });

export default mongoose.model('TimeEntry', timeEntrySchema);
