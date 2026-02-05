import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createCampaignRouter } from './routes/campaigns';
import { createTrackingRouter } from './routes/tracking';
import { createAnalyticsRouter } from './routes/analytics';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = [
      'http://localhost:3000',
      'https://canva-tracking-4ktx36evg-karens-projects-1e2ad0d5.vercel.app',
      process.env.FRONTEND_URL
    ].filter(Boolean);

    // 允許沒有 origin 的請求（如 Postman）或在允許列表中的來源
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());

// 健康檢查
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/campaigns', createCampaignRouter());
app.use('/api/analytics', createAnalyticsRouter());
app.use('/', createTrackingRouter()); // 短網址重定向路由

// 錯誤處理
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    error: '服務暫時無法使用',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Canva Tracking Backend running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});
