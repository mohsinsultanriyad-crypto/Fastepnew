import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Joi from 'joi';
import User from '../models/User.js';
import { validateBody } from '../middleware/validate.js';
import { createLogger } from '../utils/logger.js';

const router = express.Router();
const logger = createLogger();
const JWT_SECRET = process.env.JWT_SECRET || 'change_this_in_env';


router.post('/login', async (req, res) => {
  const body = req.body || {};
  const password = (body.password || '').toString();
  const workerId = body.workerId ? String(body.workerId) : null;
  const adminId = body.adminId ? String(body.adminId) : null;
  const email = body.email ? String(body.email) : null;

  if (!password) return res.status(400).json({ error: 'Password is required' });
  if (!workerId && !adminId && !email) return res.status(400).json({ error: 'Provide workerId or adminId' });

  try {
    let user = null;
    if (workerId) {
      user = await User.findOne({ workerId });
      if (!user) return res.status(400).json({ error: 'Invalid credentials (workerId)' });
      if (user.role !== 'worker') return res.status(403).json({ error: 'Not a worker account' });
    } else if (adminId) {
      user = await User.findOne({ adminId });
      if (!user) return res.status(400).json({ error: 'Invalid credentials (adminId)' });
      if (user.role !== 'admin') return res.status(403).json({ error: 'Not an admin account' });
    } else if (email) {
      user = await User.findOne({ email });
      if (!user) return res.status(400).json({ error: 'Invalid credentials (email)' });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(400).json({ error: 'Invalid credentials (password)' });
    const token = jwt.sign({ sub: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    return res.json({ token, user: { id: user._id, name: user.name, email: user.email, workerId: user.workerId, adminId: user.adminId, role: user.role, rate: user.rate, otRate: user.otRate, photoBase64: user.photoBase64 } });
  } catch (err) {
    logger.error('Login error', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

export default router;
