import express from 'express';
import dotenv from 'dotenv';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import mongoose from 'mongoose';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/auth.js';
import entriesRoutes from './routes/entries.js';
import adminRoutes from './routes/admin.js';
import User from './models/User.js';
import bcrypt from 'bcryptjs';
import { createLogger } from './utils/logger.js';
import { getCorsOptions } from './config.js';

dotenv.config();

const logger = createLogger();
const app = express();

app.use(helmet());
app.use(express.json());
app.use(morgan('combined'));

const corsOptions = getCorsOptions();
app.use(cors(corsOptions));

const limiter = rateLimit({ windowMs: 60 * 1000, max: 100 });
app.use(limiter);

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', authRoutes);
app.use('/api/entries', entriesRoutes);
app.use('/api/admin', adminRoutes);

const PORT = process.env.PORT || 4000;
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  logger.error('MONGODB_URI not set in environment');
  process.exit(1);
}

mongoose
  .connect(MONGODB_URI, { dbName: process.env.DB_NAME || undefined })
  .then(() => {
    logger.info('Connected to MongoDB');
    (async () => {
      // Ensure single admin exists
      try {
        const ADMIN_ID = 'FASTEP121';
        const ADMIN_PWD = 'password123';
        const existing = await User.findOne({ adminId: ADMIN_ID });
        if (!existing) {
          const hash = await bcrypt.hash(ADMIN_PWD, 10);
          await User.create({ name: 'Admin', adminId: ADMIN_ID, passwordHash: hash, role: 'admin', rate: 0, otRate: 0 });
          logger.info('Created default admin', ADMIN_ID);
        } else {
          logger.info('Default admin exists');
        }
      } catch (err) {
        logger.error('Error ensuring admin user', err);
      }

      app.listen(PORT, '0.0.0.0', () => {
        logger.info(`Server running on port ${PORT}`);
      });
    })();
  })
  .catch((err) => {
    logger.error('Mongo connection error', err);
    process.exit(1);
  });
