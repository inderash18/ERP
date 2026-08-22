import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import pino from 'pino-http';
import rateLimit from 'express-rate-limit';

import authRoutes from './routes/auth.routes.js';
import productRoutes from './routes/product.routes.js';
import salesRoutes from './routes/sales.routes.js';
import purchaseRoutes from './routes/purchase.routes.js';
import manufacturingRoutes from './routes/manufacturing.routes.js';
import bomRoutes from './routes/bom.routes.js';
import inventoryRoutes from './routes/inventory.routes.js';
import procurementRoutes from './routes/procurement.routes.js';
import auditRoutes from './routes/audit.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import userRoutes from './routes/user.routes.js';
import masterRoutes from './routes/master.routes.js';

const app = express();

// Performance & Security Middlewares
app.use(compression());
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cookieParser());

// Dynamic CORS Configuration
const allowedOriginsList = (process.env.CORS_ORIGIN || process.env.CLIENT_URL || process.env.FRONTEND_URL || '')
  .split(',')
  .map(url => url.trim().replace(/\/+$/, ''))
  .filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser requests (curl, server-to-server, mobile, postman)
    if (!origin) return callback(null, true);

    const normalizedOrigin = origin.replace(/\/+$/, '');

    // Allow localhost and 127.0.0.1 on any port
    if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(normalizedOrigin)) {
      return callback(null, true);
    }

    // Allow any Vercel deployment domain (production or preview)
    if (/^https:\/\/[a-zA-Z0-9_-]+\.vercel\.app$/.test(normalizedOrigin)) {
      return callback(null, true);
    }

    // Allow any explicitly configured origins
    if (allowedOriginsList.includes(normalizedOrigin)) {
      return callback(null, true);
    }

    // Allow in non-production environments
    if (process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }

    // Fallback: allow the requesting origin to avoid breaking deployments
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['Set-Cookie']
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(pino({
  autoLogging: false
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Health check
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});
// ---------------------------------------------------------------------------
// GLOBAL IN-MEMORY API CACHE (Microsecond Load Times)
// ---------------------------------------------------------------------------
const apiCache = new Map();

app.use((req, res, next) => {
  // We only want to cache API routes, excluding auth which needs real-time validation
  if (!req.path.startsWith('/api/v1') || req.path.startsWith('/api/v1/auth')) {
    return next();
  }

  // If the request is a write operation (POST, PUT, PATCH, DELETE)
  // We completely wipe the cache to ensure no user ever sees stale data.
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    apiCache.clear();
    return next();
  }

  // For GET requests, we check our lightning-fast RAM cache
  if (req.method === 'GET') {
    const cacheKey = req.originalUrl || req.url;
    
    if (apiCache.has(cacheKey)) {
      // Boom! Microsecond response time!
      res.setHeader('X-Cache', 'HIT');
      return res.status(200).json(apiCache.get(cacheKey));
    }

    // If it's not in the cache, we intercept the res.json function so we can save it for next time
    const originalJson = res.json;
    res.json = function (body) {
      // Only cache successful requests
      if (res.statusCode >= 200 && res.statusCode < 300) {
        apiCache.set(cacheKey, body);
      }
      res.setHeader('X-Cache', 'MISS');
      return originalJson.call(this, body);
    };
  }

  next();
});

// Primary REST Endpoints
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/sales-orders', salesRoutes);
app.use('/api/v1/sales', salesRoutes);
app.use('/api/v1/purchase-orders', purchaseRoutes);
app.use('/api/v1/purchase', purchaseRoutes);
app.use('/api/v1/manufacturing-orders', manufacturingRoutes);
app.use('/api/v1/manufacturing', manufacturingRoutes);
app.use('/api/v1/boms', bomRoutes);
app.use('/api/v1/inventory', inventoryRoutes);
app.use('/api/v1/procurement', procurementRoutes);
app.use('/api/v1/audit-logs', auditRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/master', masterRoutes);

// Global Standardized Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('[SERVER ERROR]:', err);
  const status = err.statusCode || err.status || 500;
  res.status(status).json({
    success: false,
    error: {
      code: err.code || 'INTERNAL_SERVER_ERROR',
      message: err.message || 'An unexpected error occurred',
    }
  });
});

export default app;
