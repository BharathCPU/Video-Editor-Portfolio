require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const prisma = require('./lib/prisma');
const quotesRouter = require('./routes/quotes');

const app = express();
const PORT = process.env.PORT || 3000;

/* ---- GLOBAL MIDDLEWARE ---- */

// CORS — must come BEFORE helmet so preflight responses include the right headers
const corsOptions = {
  origin: [
    'https://bharathcpu.github.io',
    'http://localhost:3000',
    'http://127.0.0.1:5500',
    'null', // file:// origins
  ],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
  credentials: false,
};
app.use(cors(corsOptions));
// Handle preflight OPTIONS requests for all routes
app.options('*', cors(corsOptions));

// Security headers (after CORS so it doesn't strip CORS headers)
app.use(helmet());

// Parse JSON bodies (limit payload size to prevent abuse)
app.use(express.json({ limit: '16kb' }));

// Rate limiting — 10 requests per 15 minutes per IP
const quoteLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests. Please try again later.' },
});

/* ---- ROUTES ---- */
app.use('/api/quotes', quoteLimiter, quotesRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

/* ---- ERROR HANDLING ---- */
app.use((err, req, res, _next) => {
  console.error('[server] Unhandled error:', err);
  res.status(500).json({ message: 'Internal server error' });
});

/* ---- START ---- */
app.listen(PORT, () => {
  console.log(`✓ Portfolio API running on http://localhost:${PORT}`);
});

/* ---- GRACEFUL SHUTDOWN ---- */
async function shutdown() {
  console.log('\nShutting down…');
  await prisma.$disconnect();
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
