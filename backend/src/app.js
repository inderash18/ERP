import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
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

// Security Middlewares
app.use(helmet());
app.use(cookieParser());
const allowedOrigins = ['http://localhost:5173', 'http://127.0.0.1:5173'];
if (process.env.CLIENT_URL) allowedOrigins.push(process.env.CLIENT_URL);

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
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
