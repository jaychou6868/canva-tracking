'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { LinksDisplay } from '@/components/LinksDisplay';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

interface CreateResult {
  campaign: {
    id: string;
    name: string;
  };
  links: {
    purchaseClick: string;
    qrCodeScan: string;
    qrCodeImage: string;
  };
}

export default function NewCampaignPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CreateResult | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const checkoutUrl = formData.get('checkoutUrl') as string;

    try {
      const response = await fetch(`${API_URL}/api/campaigns`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, checkoutUrl })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '建立失敗');
      }

      const data = await response.json();
      setResult(data);
      toast.success('✅ 追蹤連結生成成功！');
    } catch (error: any) {
      console.error('Create campaign error:', error);
      toast.error(`❌ ${error.message || '建立活動失敗'}`);
    } finally {
      setLoading(false);
    }
  }

  if (result) {
    return (
      <div className="min-h-screen bg-black p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-white/60 hover:text-white transition"
            >
              <ArrowLeft className="w-4 h-4" />
              返回列表
            </Link>
          </div>

          <LinksDisplay result={result} />

          <div className="mt-8 text-center">
            <Link
              href={`/campaign/${result.campaign.id}`}
              className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 rounded-xl font-semibold hover:bg-white/90 transition"
            >
              查看統計報表 →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-white/60 hover:text-white transition mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            返回列表
          </Link>
          <h1 className="text-white text-3xl font-bold mb-2">
            建立新的追蹤活動
          </h1>
          <p className="text-white/60">
            填寫活動資訊，系統會自動生成追蹤連結和二維碼
          </p>
        </div>

        {/* Form */}
        <div className="bg-white/5 rounded-2xl p-8 border border-white/10">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-white/80 font-medium mb-2">
                活動名稱 *
              </label>
              <input
                name="name"
                type="text"
                placeholder="例如：2025-02-課程推廣"
                required
                className="w-full bg-white/10 text-white rounded-lg p-3 border border-white/20 focus:border-white/40 outline-none placeholder:text-white/30"
              />
              <p className="text-white/40 text-sm mt-1">
                給這個活動一個好記的名稱
              </p>
            </div>

            <div>
              <label className="block text-white/80 font-medium mb-2">
                購課頁面網址 *
              </label>
              <input
                name="checkoutUrl"
                type="url"
                placeholder="https://your-site.com/checkout"
                required
                className="w-full bg-white/10 text-white rounded-lg p-3 border border-white/20 focus:border-white/40 outline-none placeholder:text-white/30"
              />
              <p className="text-white/40 text-sm mt-1">
                學生點擊購買按鈕或掃描二維碼後會被導向這個頁面
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-black font-semibold py-3 rounded-lg hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  生成中...
                </>
              ) : (
                '🚀 生成追蹤連結'
              )}
            </button>
          </form>
        </div>

        {/* Info Box */}
        <div className="mt-6 bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
          <h3 className="text-white font-semibold mb-2">💡 小提示</h3>
          <p className="text-white/70 text-sm">
            生成後，你會得到兩個追蹤連結：一個給購買按鈕使用，一個是二維碼。
            把它們放到 Canva 簡報最後一頁，就可以開始追蹤數據了！
          </p>
        </div>
      </div>
    </div>
  );
}
