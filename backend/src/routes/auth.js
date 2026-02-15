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
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || '';

const registerSchema = Joi.object({ name: Joi.string().min(2).required(), email: Joi.string().email().required(), password: Joi.string().min(6).required() });
const loginSchema = Joi.object({ email: Joi.string().email().optional(), workerId: Joi.string().optional(), adminId: Joi.string().optional(), password: Joi.string().min(3).required() });

router.post('/register', validateBody(registerSchema), async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: 'Email already registered' });
    const passwordHash = await bcrypt.hash(password, 10);
    let role = 'worker';
    const count = await User.countDocuments();
    if (ADMIN_EMAIL && email === ADMIN_EMAIL) role = 'admin';
    else if (count === 0) role = 'admin';
    const user = await User.create({ name, email, passwordHash, role, rate: 0, otRate: 0 });
    logger.info('User registered', user.email);
    const token = jwt.sign({ sub: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    return res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role, rate: user.rate, otRate: user.otRate } });
  } catch (err) {
    logger.error('Register error', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

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
