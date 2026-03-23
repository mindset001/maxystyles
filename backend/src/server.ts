import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import { Media } from './models/Media';
import { Content } from './models/Content';

// Load environment variables — explicit path so it works regardless of cwd
dotenv.config({ path: path.join(__dirname, '../.env') });

// Import routes
import productRoutes from './routes/products';
import userRoutes from './routes/users';
import orderRoutes from './routes/orders';
import authRoutes from './routes/auth';
import gradeRoutes from './routes/grades';

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware — CORS must come before helmet
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 204,
};
app.use(cors(corsOptions));

app.use(helmet({ crossOriginResourcePolicy: false }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
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

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/grades', gradeRoutes);
app.use('/api/payments', paymentRoutes);

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
  
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  });
};

startServer().catch(console.error);

export default app;