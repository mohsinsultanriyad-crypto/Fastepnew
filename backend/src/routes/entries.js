import express from 'express';
import Joi from 'joi';
import TimeEntry from '../models/TimeEntry.js';
import { authRequired } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { computeEntry } from '../utils/calc.js';
import User from '../models/User.js';

const router = express.Router();

const createSchema = Joi.object({ date: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required(), startTime: Joi.string().pattern(/^\d{2}:\d{2}$/).required(), endTime: Joi.string().pattern(/^\d{2}:\d{2}$/).required(), breakMinutes: Joi.number().min(0).max(480).optional(), notes: Joi.string().max(1000).optional() });

router.post('/', authRequired, validateBody(createSchema), async (req, res) => {
  try {
    const user = req.user;
    if (user.role !== 'worker') return res.status(403).json({ error: 'Workers only' });
    const { date, startTime, endTime, breakMinutes = 0, notes } = req.body;
    // Check existing entry for that date not rejected
    const existing = await TimeEntry.findOne({ userId: user._id, date, status: { $ne: 'REJECTED' } });
    if (existing) return res.status(400).json({ error: 'An entry for this date already exists' });
    const baseDaily = Number(process.env.DAILY_BASE_HOURS || 8);
    const { totalHours, baseHours, overtimeHours, dailyEarning } = computeEntry({ startTime, endTime, breakMinutes, baseDaily, rate: user.rate || 0, otRate: user.otRate || 0 });
    const entry = await TimeEntry.create({ userId: user._id, date, startTime, endTime, breakMinutes, totalHours, baseHours, overtimeHours, notes, status: 'PENDING' });
    return res.json({ entry });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

router.get('/my', authRequired, async (req, res) => {
  try {
    const user = req.user;
    const entries = await TimeEntry.find({ userId: user._id }).sort({ date: -1 });
    return res.json({ entries });
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
});

export default router;
