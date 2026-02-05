'use client';

import { useEffect, useState } from 'react';
import { Plus, BarChart3 } from 'lucide-react';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

interface Campaign {
  id: string;
  name: string;
  createdAt: string;
  _count?: {
    shortUrls: number;
  };
}

export default function HomePage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  async function fetchCampaigns() {
    try {
      const response = await fetch(`${API_URL}/api/campaigns`);
      const data = await response.json();
      setCampaigns(data);
    } catch (error) {
      console.error('Failed to fetch campaigns:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-white text-4xl font-bold mb-2">
              📊 Canva 追蹤系統
            </h1>
            <p className="text-white/60">
              追蹤你的 Canva 簡報 CTA 點擊和二維碼掃描
            </p>
          </div>
          <Link
            href="/new"
            className="flex items-center gap-2 bg-white text-black px-6 py-3 rounded-xl font-semibold hover:bg-white/90 transition"
          >
            <Plus className="w-5 h-5" />
            建立新活動
          </Link>
        </div>

        {/* Campaigns List */}
        {loading ? (
          <div className="text-white/60 text-center py-12">載入中...</div>
        ) : campaigns.length === 0 ? (
          <div className="bg-white/5 rounded-2xl p-12 border border-white/10 text-center">
            <div className="text-6xl mb-4">📝</div>
            <h2 className="text-white text-2xl mb-2">還沒有任何活動</h2>
            <p className="text-white/60 mb-6">
              建立你的第一個追蹤活動，開始追蹤 Canva 簡報的 CTA 數據
            </p>
            <Link
              href="/new"
              className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 rounded-xl font-semibold hover:bg-white/90 transition"
            >
              <Plus className="w-5 h-5" />
              建立第一個活動
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.map(campaign => (
              <Link
                key={campaign.id}
                href={`/campaign/${campaign.id}`}
                className="bg-white/5 rounded-2xl p-6 border border-white/10 hover:border-white/30 hover:bg-white/10 transition group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-white text-xl font-semibold mb-1 group-hover:text-white/90">
                      {campaign.name}
                    </h3>
                    <p className="text-white/50 text-sm">
                      {new Date(campaign.createdAt).toLocaleDateString('zh-TW')}
                    </p>
                  </div>
                  <BarChart3 className="w-5 h-5 text-white/40 group-hover:text-white/60 transition" />
                </div>
                <div className="text-white/60 text-sm">
                  點擊查看統計 →
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
