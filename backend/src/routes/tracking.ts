import { Router } from 'express';
import { TrackingService } from '../services/TrackingService';

export function createTrackingRouter() {
  const router = Router();
  const trackingService = new TrackingService();

  // 短網址重定向（核心功能）
  router.get('/s/:code', async (req, res) => {
    try {
      const { code } = req.params;

      // 查詢短網址
      const shortUrl = await trackingService.findByCode(code);

      if (!shortUrl || !shortUrl.isActive) {
        return res.status(404).send(`
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="UTF-8">
              <title>連結不存在</title>
            </head>
            <body style="font-family: sans-serif; text-align: center; padding: 50px;">
              <h1>❌ 連結不存在或已失效</h1>
              <p>此追蹤連結可能已被刪除或停用</p>
            </body>
          </html>
        `);
      }

      // 記錄點擊（含去重邏輯）
      const userAgent = req.headers['user-agent'];
      const referer = req.headers['referer'] || req.headers['referrer'];

      await trackingService.recordClick({
        shortUrlId: shortUrl.id,
        ipAddress: req.ip || req.socket.remoteAddress || '',
        userAgent: Array.isArray(userAgent) ? userAgent[0] : (userAgent || ''),
        referer: Array.isArray(referer) ? referer[0] : (referer || '')
      });

      // 重定向到目標網址
      res.redirect(302, shortUrl.originalUrl);
    } catch (error) {
      console.error('Redirect error:', error);
      res.status(500).send(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <title>服務錯誤</title>
          </head>
          <body style="font-family: sans-serif; text-align: center; padding: 50px;">
            <h1>⚠️ 服務暫時無法使用</h1>
            <p>請稍後再試</p>
          </body>
        </html>
      `);
    }
  });

  return router;
}
