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
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
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
