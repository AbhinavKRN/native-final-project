import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import swapRoutes from './routes/swaps.js';
import ratingRoutes from './routes/ratings.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (_req, res) => {
  res.json({ status: 'ok', message: 'SkillSwap API ready' });
});

app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/swaps', swapRoutes);
app.use('/ratings', ratingRoutes);

// Global error handler
app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
});

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`SkillSwap API running on port ${port}`);
});

