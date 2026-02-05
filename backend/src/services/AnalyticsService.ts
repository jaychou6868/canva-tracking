import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class AnalyticsService {
  /**
   * 取得活動統計數據
   */
  async getCampaignStats(campaignId: string) {
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      include: {
        shortUrls: {
          include: {
            _count: {
              select: { clicks: true }
            }
          }
        }
      }
    });

    if (!campaign) {
      return null;
    }

    // 計算各類型點擊數
    const stats = {
      purchaseClicks: 0,
      qrScans: 0
    };

    campaign.shortUrls.forEach(url => {
      const count = url._count.clicks;
      if (url.linkType === 'PURCHASE_CLICK') {
        stats.purchaseClicks = count;
      } else if (url.linkType === 'QRCODE_SCAN') {
        stats.qrScans = count;
      }
    });

    const totalCTA = stats.purchaseClicks + stats.qrScans;

    return {
      campaignId: campaign.id,
      campaignName: campaign.name,
      createdAt: campaign.createdAt,
      stats: {
        purchaseClicks: stats.purchaseClicks,
        qrScans: stats.qrScans,
        totalCTA
      }
    };
  }

  /**
   * 取得每日統計明細
   */
  async getDailyBreakdown(campaignId: string, days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    // 取得所有點擊記錄
    const clicks = await prisma.click.findMany({
      where: {
        shortUrl: {
          campaignId
        },
        clickedAt: {
          gte: startDate
        }
      },
      include: {
        shortUrl: {
          select: { linkType: true }
        }
      },
      orderBy: {
        clickedAt: 'asc'
      }
    });

    // 按日期分組
    const grouped = new Map<string, {
      date: string;
      purchaseClicks: number;
      qrScans: number;
      total: number;
    }>();

    clicks.forEach(click => {
      const date = click.clickedAt.toISOString().split('T')[0];

      if (!grouped.has(date)) {
        grouped.set(date, {
          date,
          purchaseClicks: 0,
          qrScans: 0,
          total: 0
        });
      }

      const day = grouped.get(date)!;

      if (click.shortUrl.linkType === 'PURCHASE_CLICK') {
        day.purchaseClicks++;
      } else if (click.shortUrl.linkType === 'QRCODE_SCAN') {
        day.qrScans++;
      }

      day.total++;
    });

    // 填充沒有數據的日期（顯示為 0）
    const result = [];
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];

      result.push(
        grouped.get(dateStr) || {
          date: dateStr,
          purchaseClicks: 0,
          qrScans: 0,
          total: 0
        }
      );
    }

    return result;
  }
}
