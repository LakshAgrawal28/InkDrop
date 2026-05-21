import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  database: {
    url: process.env.DATABASE_URL || 'postgresql://localhost:5432/inkdrop',
  },
  
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'dev-access-secret',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret',
    accessExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
    refreshExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
  },
  
  cors: {
    origins: (() => {
      const raw = process.env.FRONTEND_URL;
      if (raw && raw.trim()) {
        return raw
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);
      }

      // Sensible defaults for local development (Vite + common ports)
      if ((process.env.NODE_ENV || 'development') !== 'production') {
        return [
          'http://localhost:3000',
          'http://localhost:5173',
          'http://localhost:4173',
          'http://127.0.0.1:3000',
          'http://127.0.0.1:5173',
          'http://127.0.0.1:4173',
        ];
      }

      // If FRONTEND_URL isn't set in production, allow all origins to avoid
      // surprising breakage. Prefer setting FRONTEND_URL explicitly.
      return ['*'];
    })(),
  },
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || '',
  },
};
