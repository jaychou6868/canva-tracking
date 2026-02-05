import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

export class TrackingService {
  /**
   * 根據短代碼查詢短網址
   */
  async findByCode(shortCode: string) {
    return prisma.shortUrl.findUnique({
      where: { shortCode },
      include: { campaign: true }
    });
  }

  /**
   * 記錄點擊事件（含去重邏輯）
   */
  async recordClick(data: {
    shortUrlId: string;
    ipAddress: string;
    userAgent: string;
    referer: string;
  }) {
    // 生成 fingerprint（用於去重）
    const fingerprint = this.generateFingerprint(data.ipAddress, data.userAgent);

    // 檢查 24 小時內是否重複點擊
    const isDuplicate = await this.checkDuplicate(data.shortUrlId, fingerprint);

    if (isDuplicate) {
      console.log('Duplicate click ignored:', { fingerprint });
      return { recorded: false, reason: 'duplicate' };
    }

    // 記錄新點擊
    const click = await prisma.click.create({
      data: {
        shortUrlId: data.shortUrlId,
        fingerprint,
        ipHash: this.hashIP(data.ipAddress),
        userAgent: data.userAgent,
        referer: data.referer,
        deviceType: this.detectDevice(data.userAgent)
      }
    });

    console.log('Click recorded:', { id: click.id, deviceType: click.deviceType });
    return { recorded: true, clickId: click.id };
  }

  /**
   * 生成 fingerprint（IP + User Agent 的 hash）
   */
  private generateFingerprint(ip: string, userAgent: string): string {
    return crypto
      .createHash('sha256')
      .update(`${ip}-${userAgent}`)
      .digest('hex')
      .substring(0, 16);
  }

  /**
   * 將 IP 地址 hash 處理（隱私保護）
   */
  private hashIP(ip: string): string {
    const salt = process.env.IP_SALT || 'default-salt';
    return crypto
      .createHash('sha256')
      .update(ip + salt)
      .digest('hex')
      .substring(0, 16);
  }

  /**
   * 檢查是否為重複點擊（24 小時內）
   */
  private async checkDuplicate(shortUrlId: string, fingerprint: string): Promise<boolean> {
    const recentClick = await prisma.click.findFirst({
      where: {
        shortUrlId,
        fingerprint,
        clickedAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // 24小時
        }
      }
    });

    return !!recentClick;
  }

  /**
   * 偵測設備類型（mobile 或 desktop）
   */
  private detectDevice(userAgent: string): string {
    return /mobile/i.test(userAgent) ? 'mobile' : 'desktop';
  }
}
