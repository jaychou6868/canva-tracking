import { Router } from 'express';
import { AnalyticsService } from '../services/AnalyticsService';

export function createAnalyticsRouter() {
  const router = Router();
  const analyticsService = new AnalyticsService();

  // 取得活動統計
  router.get('/campaign/:id', async (req, res) => {
    try {
      const stats = await analyticsService.getCampaignStats(req.params.id);

      if (!stats) {
        return res.status(404).json({ error: '活動不存在' });
      }

      res.json(stats);
    } catch (error) {
      console.error('Get stats error:', error);
      res.status(500).json({ error: '取得統計失敗' });
    }
  });

  // 取得每日明細
  router.get('/campaign/:id/daily', async (req, res) => {
    try {
      const days = parseInt(req.query.days as string) || 30;
      const breakdown = await analyticsService.getDailyBreakdown(req.params.id, days);

      res.json(breakdown);
    } catch (error) {
      console.error('Get daily breakdown error:', error);
      res.status(500).json({ error: '取得每日明細失敗' });
    }
  });

  return router;
}
