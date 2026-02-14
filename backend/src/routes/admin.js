import express from 'express';
import { authRequired, adminRequired } from '../middleware/auth.js';
import TimeEntry from '../models/TimeEntry.js';
import User from '../models/User.js';
import Joi from 'joi';

const router = express.Router();

router.use(authRequired);
router.use(adminRequired);

router.get('/users', async (req, res) => {
  const users = await User.find().select('-passwordHash').sort({ createdAt: -1 });
  res.json({ users });
});

router.patch('/users/:id/rates', async (req, res) => {
  const { id } = req.params;
  const bodySchema = Joi.object({ rate: Joi.number().min(0).required(), otRate: Joi.number().min(0).required() });
  const { error, value } = bodySchema.validate(req.body, { abortEarly: false, stripUnknown: true });
  if (error) return res.status(400).json({ error: 'Invalid body', details: error.details });
  const user = await User.findByIdAndUpdate(id, { rate: value.rate, otRate: value.otRate }, { new: true }).select('-passwordHash');
  res.json({ user });
});

router.get('/entries', async (req, res) => {
  const status = req.query.status || 'PENDING';
  const entries = await TimeEntry.find({ status }).populate('userId', 'name email rate otRate').sort({ createdAt: -1 });
  res.json({ entries });
});

router.patch('/entries/:id/approve', async (req, res) => {
  const { id } = req.params;
  const entry = await TimeEntry.findById(id);
  if (!entry) return res.status(404).json({ error: 'Entry not found' });
  entry.status = 'APPROVED';
  await entry.save();
  res.json({ entry });
});

router.patch('/entries/:id/reject', async (req, res) => {
  const { id } = req.params;
  const bodySchema = Joi.object({ comment: Joi.string().max(1000).optional() });
  const { error, value } = bodySchema.validate(req.body, { abortEarly: false, stripUnknown: true });
  if (error) return res.status(400).json({ error: 'Invalid body', details: error.details });
  const entry = await TimeEntry.findById(id);
  if (!entry) return res.status(404).json({ error: 'Entry not found' });
  entry.status = 'REJECTED';
  entry.adminComment = value.comment || '';
  await entry.save();
  res.json({ entry });
});

router.get('/summary', async (req, res) => {
  const from = req.query.from;
  const to = req.query.to;
  if (!from || !to) return res.status(400).json({ error: 'from and to required' });
  const entries = await TimeEntry.find({ date: { $gte: from, $lte: to }, status: 'APPROVED' }).populate('userId', 'name rate otRate');
  const map = new Map();
  for (const e of entries) {
    const uid = String(e.userId._id);
    if (!map.has(uid)) {
      map.set(uid, { user: e.userId, totalHours: 0, overtimeHours: 0, earnings: 0 });
    }
    const item = map.get(uid);
    item.totalHours += e.totalHours;
    item.overtimeHours += e.overtimeHours;
    item.earnings += (e.baseHours * (e.userId.rate || 0) + e.overtimeHours * (e.userId.otRate || 0));
  }
  const summary = Array.from(map.values()).map(s => ({ user: { id: s.user._id, name: s.user.name }, totalHours: Math.round(s.totalHours * 100) / 100, overtimeHours: Math.round(s.overtimeHours * 100) / 100, earnings: Math.round(s.earnings * 100) / 100 }));
  res.json({ summary });
});

export default router;
