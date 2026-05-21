import express from 'express';
import cors from 'cors';
import { config } from './config';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import authRoutes from './routes/auth';
import postRoutes from './routes/posts';
import uploadRoutes from './routes/upload';
import { pool } from './db';

const app = express();

// Middleware
app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = config.cors.origins;

      // Allow non-browser requests (no Origin header)
      if (!origin) return callback(null, true);

      // Wildcard: reflect any origin (required when credentials=true)
      if (allowedOrigins.includes('*')) return callback(null, true);

      if (allowedOrigins.includes(origin)) return callback(null, true);

      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
  })
);
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/upload', uploadRoutes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Export app for serverless (Vercel)
export default app;

// Only start server if not in serverless environment
if (process.env.VERCEL !== '1' && !process.env.AWS_LAMBDA_FUNCTION_NAME) {
  const PORT = config.port;

  const server = app.listen(PORT, async () => {
    console.log(`🚀 InkDrop backend running on port ${PORT}`);
    console.log(`📝 Environment: ${config.nodeEnv}`);
    console.log(`🔗 CORS enabled for: ${config.cors.origins.join(', ')}`);
    
    // Test database connection
    try {
      await pool.query('SELECT NOW()');
      console.log('✓ Database connected');
    } catch (error) {
      console.error('✗ Database connection failed:', error);
    }
  });

  // Handle port already in use error
  server.on('error', (error: any) => {
    if (error.code === 'EADDRINUSE') {
      console.error(`\n❌ Port ${PORT} is already in use!`);
      console.error(`💡 Please free up port ${PORT} manually and restart.\n`);
      process.exit(1);
    } else {
      console.error('Server error:', error);
      process.exit(1);
    }
  });
}
