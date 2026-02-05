import { PrismaClient } from '@prisma/client';
import { customAlphabet } from 'nanoid';
import QRCode from 'qrcode';

const prisma = new PrismaClient();
const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 8);

export class CampaignService {
  /**
   * 建立新的行銷活動
   */
  async createCampaign(data: { name: string; checkoutUrl: string }) {
    const { name, checkoutUrl } = data;
    const baseUrl = process.env.BASE_URL || 'http://localhost:3002';

    // 1. 建立活動
    const campaign = await prisma.campaign.create({
      data: { name }
    });

    // 2. 生成兩個短網址（購買按鈕 + 二維碼）
    const purchaseShortUrl = await this.createShortUrl({
      campaignId: campaign.id,
      originalUrl: checkoutUrl,
      linkType: 'PURCHASE_CLICK'
    });

    const qrShortUrl = await this.createShortUrl({
      campaignId: campaign.id,
      originalUrl: checkoutUrl,
      linkType: 'QRCODE_SCAN'
    });

    // 3. 生成二維碼圖片
    const qrCodeUrl = `${baseUrl}/s/${qrShortUrl.shortCode}`;
    const qrCodeImage = await QRCode.toDataURL(qrCodeUrl, {
      width: 500,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    return {
      campaign,
      links: {
        purchaseClick: `${baseUrl}/s/${purchaseShortUrl.shortCode}`,
        qrCodeScan: qrCodeUrl,
        qrCodeImage // Base64 data URL
      }
    };
  }

  /**
   * 建立短網址
   */
  private async createShortUrl(data: {
    campaignId: string;
    originalUrl: string;
    linkType: 'PURCHASE_CLICK' | 'QRCODE_SCAN';
  }) {
    const shortCode = nanoid();

    return prisma.shortUrl.create({
      data: {
        shortCode,
        originalUrl: data.originalUrl,
        linkType: data.linkType,
        campaignId: data.campaignId
      }
    });
  }

  /**
   * 取得所有活動
   */
  async getAllCampaigns() {
    return prisma.campaign.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { shortUrls: true }
        }
      }
    });
  }

  /**
   * 取得單一活動
   */
  async getCampaignById(id: string) {
    return prisma.campaign.findUnique({
      where: { id },
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
  }

  /**
   * 刪除活動
   */
  async deleteCampaign(id: string) {
    return prisma.campaign.delete({
      where: { id }
    });
  }
}
