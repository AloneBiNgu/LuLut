import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import path from 'path';
import os from 'os';

import routes from './routes';

const app: Express = express();


// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

const isProduction = process.env.NODE_ENV === 'production';
const uploadDir = isProduction ? path.join(os.tmpdir(), 'uploads') : 'uploads';
app.use('/uploads', express.static(uploadDir));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Routes
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api', routes);

// Error handling middleware

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Lỗi máy chủ nội bộ';
  
  res.status(statusCode).json({
    status: 'error',
    statusCode,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

export default app;
