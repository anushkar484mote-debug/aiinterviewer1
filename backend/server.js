require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const authRoutes = require('./routes/auth');
const jobRoutes = require('./routes/jobs');
const interviewRoutes = require('./routes/interviews');
const voiceRoutes = require('./routes/voice');
const aiRoutes = require('./routes/ai');

const app = express();

// ── Middleware ──────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  credentials: true,
}));
app.use(express.json({ limit: '10kb' }));

// ── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/voice', voiceRoutes);
app.use('/api/ai', aiRoutes);

// ── Health check ─────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date() }));

// ── 404 handler ──────────────────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ error: 'Route not found' }));

// ── Global error handler ─────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('[ERROR]', err.message);
  const status = err.statusCode || 500;
  res.status(status).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// ── Database + Start ─────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    let mongoUri = process.env.MONGO_URI;

    // Use in-memory MongoDB for development if local connection is likely to fail
    if (process.env.NODE_ENV === 'development' && (!mongoUri || mongoUri.includes('localhost'))) {
      try {
        console.log('⏳ Starting in-memory MongoDB (v4.4.18)...');
        const { MongoMemoryServer } = require('mongodb-memory-server');
        const mongoServer = await MongoMemoryServer.create({
          binary: { version: '4.4.18' }
        });
        mongoUri = mongoServer.getUri();
        console.log('✅ In-memory MongoDB started');
      } catch (err) {
        console.warn('⚠️ Failed to start in-memory MongoDB, attempting local connection:', err.message);
      }
    }

    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB connected');

    // Run seed script automatically if it's the first run (optional, but good for demo)
    const User = require('./models/User');
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('🌱 No users found, seeding demo data...');
      const { seed } = require('./utils/seed_helper'); // I'll create this helper
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
