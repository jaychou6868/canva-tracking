'use client';

import { useState } from 'react';
import { Copy, Check, Download } from 'lucide-react';
import { toast } from 'sonner';

interface LinksDisplayProps {
  result: {
    campaign: {
      id: string;
      name: string;
    };
    links: {
      purchaseClick: string;
      qrCodeScan: string;
      qrCodeImage: string;
    };
  };
}

export function LinksDisplay({ result }: LinksDisplayProps) {
  const { campaign, links } = result;

  return (
    <div className="space-y-6">
      <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
        <h2 className="text-white text-2xl font-bold mb-1">
          ✅ 追蹤連結已生成
        </h2>
        <p className="text-white/60 mb-6">
          活動名稱：{campaign.name}
        </p>

        {/* 購買按鈕連結 */}
        <div className="bg-white/5 rounded-xl p-6 mb-6 border border-white/10">
          <div className="flex items-start gap-4">
            <div className="text-3xl">🛒</div>
            <div className="flex-1">
              <h3 className="text-white font-semibold text-lg mb-2">
                購買按鈕連結
              </h3>
              <p className="text-white/70 text-sm mb-3">
                在 Canva 簡報中設定購買按鈕時，使用此連結
              </p>
              <div className="flex gap-2">
                <input
                  readOnly
                  value={links.purchaseClick}
                  className="flex-1 bg-white/10 text-white px-4 py-2 rounded-lg text-sm font-mono border border-white/20"
                />
                <CopyButton text={links.purchaseClick} />
              </div>
            </div>
          </div>
        </div>

        {/* 二維碼 */}
        <div className="bg-white/5 rounded-xl p-6 border border-white/10">
          <div className="flex flex-col md:flex-row items-start gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">📱</span>
                <h3 className="text-white font-semibold text-lg">二維碼</h3>
              </div>
              <p className="text-white/70 text-sm mb-4">
                下載此二維碼圖片，然後上傳到 Canva 簡報最後一頁
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => downloadQRCode(links.qrCodeImage, campaign.name)}
                  className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-lg font-semibold hover:bg-white/90 transition"
                >
                  <Download className="w-4 h-4" />
                  下載圖片
                </button>
                <CopyButton text={links.qrCodeScan} />
              </div>
              <div className="mt-4 bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                <p className="text-white/70 text-sm">
                  💡 用手機掃描測試：應該會開啟您的購課頁面
                </p>
              </div>
            </div>

            {/* 二維碼預覽 */}
            <div className="bg-white p-4 rounded-xl shadow-lg">
              <img
                src={links.qrCodeImage}
                alt="QR Code"
                className="w-40 h-40"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 使用說明 */}
      <SetupGuide />
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success('已複製到剪貼簿');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('複製失敗');
    }
  }

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition"
    >
      {copied ? (
        <>
          <Check className="w-4 h-4 text-green-400" />
          <span>已複製</span>
        </>
      ) : (
        <>
          <Copy className="w-4 h-4" />
          <span>複製</span>
        </>
      )}
    </button>
  );
}

function downloadQRCode(dataUrl: string, campaignName: string) {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = `qrcode-${campaignName}-${Date.now()}.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  toast.success('二維碼已下載');
}

function SetupGuide() {
  const steps = [
    '在 Canva 簡報最後一頁設計一個購買按鈕',
    '選中按鈕元素，點擊上方工具列的「連結」圖示 🔗',
    '貼上「購買按鈕連結」',
    '下載二維碼圖片',
    '在 Canva 中點擊「上傳」→「上傳檔案」',
    '將二維碼圖片拖曳到簡報最後一頁',
    '調整二維碼大小（建議 3-4 cm 方便掃描）',
    '完成！分享 Canva 連結到郵件即可開始追蹤'
  ];

  return (
    <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-white/10 rounded-2xl p-6">
      <h3 className="text-white font-semibold text-lg mb-4">
        📝 如何在 Canva 中設置
      </h3>
      <ol className="space-y-3">
        {steps.map((step, i) => (
          <li key={i} className="flex gap-3 text-white/80">
            <span className="flex-shrink-0 w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-sm font-semibold">
              {i + 1}
            </span>
            <span>{step}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
