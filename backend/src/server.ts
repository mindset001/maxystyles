import express from 'express';
import { createServer } from 'http';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import jwt from 'jsonwebtoken';
import { Server as SocketIOServer } from 'socket.io';
import { Media } from './models/Media';
import { Content } from './models/Content';
import { createChatRouter } from './routes/chat';

// Load environment variables — explicit path so it works regardless of cwd
dotenv.config({ path: path.join(__dirname, '../.env') });

// Guard: reject server startup in production if critical secrets are missing
if (process.env.NODE_ENV === 'production') {
  const required = ['JWT_SECRET', 'MONGODB_URI', 'PAYSTACK_SECRET_KEY'];
  const missing = required.filter(k => !process.env[k]);
  if (missing.length) {
    console.error(`FATAL: Missing required environment variables: ${missing.join(', ')}`);
    process.exit(1);
  }
}

// Import routes
import productRoutes from './routes/products';
import userRoutes from './routes/users';
import orderRoutes from './routes/orders';
import authRoutes from './routes/auth';
import gradeRoutes from './routes/grades';

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 5000;

// Socket.io setup
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      if (!origin) return callback(null, true);
      const normalised = origin.replace(/\/+$/, '');
      const rawOrigins2 = [
        process.env.FRONTEND_URL || 'http://localhost:3000',
        'http://localhost:3000',
      ];
      if (rawOrigins2.some(o => o.replace(/\/+$/, '') === normalised)) return callback(null, true);
      return callback(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true,
    methods: ['GET', 'POST'],
  },
});

// Socket.io connection handler
io.on('connection', (socket) => {
  // Customer or admin joins a specific chat room
  socket.on('join-chat', ({ chatId, token }: { chatId: string; token: string }) => {
    try {
      jwt.verify(token, process.env.JWT_SECRET!);
      socket.join(`chat:${chatId}`);
    } catch {
      socket.emit('error', { message: 'Invalid token' });
    }
  });

  // Admin joins the admin-room to receive all chat notifications
  socket.on('join-admin', ({ token }: { token: string }) => {
    try {
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
      if (decoded.role === 'admin') {
        socket.join('admin-room');
      }
    } catch {
      socket.emit('error', { message: 'Invalid token' });
    }
  });

  socket.on('leave-chat', ({ chatId }: { chatId: string }) => {
    socket.leave(`chat:${chatId}`);
  });
});

// Build allowed origins list — strip trailing slashes to avoid mismatch
const rawOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:3000',
  'http://localhost:3000',
];
if (process.env.VERCEL_URL) rawOrigins.push(`https://${process.env.VERCEL_URL}`);
const allowedOrigins = [...new Set(rawOrigins.map((o) => o.replace(/\/+$/, '')))];

// Security middleware — CORS must come before helmet
const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    const normalised = origin.replace(/\/+$/, '');
    if (allowedOrigins.includes(normalised)) return callback(null, true);
    return callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 204,
};
app.use(cors(corsOptions));

app.use(helmet({ crossOriginResourcePolicy: false }));

// Rate limiting — relaxed in development
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 200 : 2000,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === 'development', // disable entirely in dev
});

// Stricter limiter for auth routes in production only
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 20 : 1000,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === 'development',
  message: { success: false, message: 'Too many login attempts. Please try again later.' },
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// MongoDB connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/maxystyles');
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    console.log('⚠️  Server starting without MongoDB connection...');
    // Continue without DB if connection fails
  }
};

// Import admin routes
import adminRoutes from './routes/admin';
import paymentRoutes from './routes/payments';
import analyticsRoutes from './routes/analytics';

// Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/chat', createChatRouter(io));
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/grades', gradeRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/analytics', analyticsRoutes);

// Public media / gallery endpoint — no auth required
app.get('/api/media', async (req, res) => {
  try {
    const { category, limit = 200 } = req.query;
    const query: any = { isPublic: true };
    if (category && category !== 'all') query.category = category;
    const media = await Media.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .select('url filename altText caption category createdAt');
    res.json({ success: true, data: media });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching gallery' });
  }
});

// Public content endpoint — returns one or all sections, no auth required
app.get('/api/content', async (req, res) => {
  try {
    const { section } = req.query;
    if (section) {
      const doc = await Content.findOne({ section, isActive: true });
      return res.json({ success: true, data: doc ?? null });
    }
    const docs = await Content.find({ isActive: true });
    res.json({ success: true, data: docs });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching content' });
  }
});

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'MaxyStyles Backend API'
  });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Route not found' 
  });
});

// Start server
const startServer = async () => {
  try {
    await connectDB();
  } catch (error) {
    console.log('Continuing without MongoDB...');
  }
  
  httpServer.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`💬 Socket.io enabled for real-time chat`);
  });
};

startServer().catch(console.error);

export default app;