require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const mongoose = require('mongoose');

const authRoutes = require('./routes/auth');
const jobRoutes = require('./routes/jobs');
const interviewRoutes = require('./routes/interviews');
const voiceRoutes = require('./routes/voice');
const aiRoutes = require('./routes/ai');

const app = express();

// ── Production Middleware ──────────────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: false, // Allow local development/images
}));
app.use(compression());
app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  credentials: true,
}));
app.use(express.json({ limit: '50kb' }));

// ── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/voice', voiceRoutes);
app.use('/api/ai', aiRoutes);

// ── Health check ─────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date() }));

// ── Global error handler ─────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('[ERROR]', err.message);
  const status = err.statusCode || 500;
  res.status(status).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
});

// ── Database + Start ─────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    let mongoUri = process.env.MONGO_URI;

    // Use memory server ONLY if specified in dev AND no URI provided
    const useMemoryServer = process.env.NODE_ENV === 'development' && 
                           (!mongoUri || mongoUri === 'memory' || mongoUri.includes('localhost:27017'));

    if (useMemoryServer) {
      try {
        console.log('⏳ Starting in-memory MongoDB (v4.4.18)...');
        const { MongoMemoryServer } = require('mongodb-memory-server');
        const mongoServer = await MongoMemoryServer.create({
          binary: { version: '4.4.18' }
        });
        mongoUri = mongoServer.getUri();
        console.log('✅ In-memory MongoDB started');
      } catch (err) {
        console.warn('⚠️ Memory Server failed, falling back to local host connection:', err.message);
      }
    }

    if (!mongoUri) {
      throw new Error('MONGO_URI is not defined in environment variables.');
    }

    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB connected');

    // Auto-seed if empty
    const User = require('./models/User');
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('🌱 Seeding demo data...');
      const { seed } = require('./utils/seed_helper');
      await seed();
    }

    app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
  } catch (err) {
    console.error('❌ Server startup failed:', err.message);
    process.exit(1);
  }
};

startServer();

module.exports = app;
