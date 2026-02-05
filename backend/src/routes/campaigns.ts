import { Router } from 'express';
import { CampaignService } from '../services/CampaignService';

export function createCampaignRouter() {
  const router = Router();
  const campaignService = new CampaignService();

  // 建立新活動
  router.post('/', async (req, res) => {
    try {
      const { name, checkoutUrl } = req.body;

      if (!name || !checkoutUrl) {
        return res.status(400).json({
          error: '缺少必要欄位',
          required: ['name', 'checkoutUrl']
        });
      }

      const result = await campaignService.createCampaign({
        name,
        checkoutUrl
      });

      res.status(201).json(result);
    } catch (error: any) {
      console.error('Create campaign error:', error);

      if (error.code === 'P2002') {
        return res.status(400).json({ error: '活動名稱已存在' });
      }

      res.status(500).json({ error: '建立活動失敗' });
    }
  });

  // 取得所有活動
  router.get('/', async (req, res) => {
    try {
      const campaigns = await campaignService.getAllCampaigns();
      res.json(campaigns);
    } catch (error) {
      console.error('Get campaigns error:', error);
      res.status(500).json({ error: '取得活動列表失敗' });
    }
  });

  // 取得單一活動
  router.get('/:id', async (req, res) => {
    try {
      const campaign = await campaignService.getCampaignById(req.params.id);

      if (!campaign) {
        return res.status(404).json({ error: '活動不存在' });
      }

      res.json(campaign);
    } catch (error) {
      console.error('Get campaign error:', error);
      res.status(500).json({ error: '取得活動失敗' });
    }
  });

  // 刪除活動
  router.delete('/:id', async (req, res) => {
    try {
      await campaignService.deleteCampaign(req.params.id);
      res.json({ message: '活動已刪除' });
    } catch (error) {
      console.error('Delete campaign error:', error);
      res.status(500).json({ error: '刪除活動失敗' });
    }
  });

  return router;
}
