'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, MousePointer, QrCode, TrendingUp, Loader2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

interface Stats {
  campaignId: string;
  campaignName: string;
  createdAt: string;
  stats: {
    purchaseClicks: number;
    qrScans: number;
    totalCTA: number;
  };
}

interface DailyData {
  date: string;
  purchaseClicks: number;
  qrScans: number;
  total: number;
}

export default function CampaignStatsPage() {
  const params = useParams();
  const campaignId = params.id as string;

  const [stats, setStats] = useState<Stats | null>(null);
  const [dailyData, setDailyData] = useState<DailyData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    fetchDailyData();

    // 每 30 秒刷新一次
    const interval = setInterval(() => {
      fetchStats();
      fetchDailyData();
    }, 30000);

    return () => clearInterval(interval);
  }, [campaignId]);

  async function fetchStats() {
    try {
      const response = await fetch(`${API_URL}/api/analytics/campaign/${campaignId}`);
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchDailyData() {
    try {
      const response = await fetch(`${API_URL}/api/analytics/campaign/${campaignId}/daily?days=30`);
      if (response.ok) {
        const data = await response.json();
        setDailyData(data);
      }
    } catch (error) {
      console.error('Failed to fetch daily data:', error);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-white animate-spin mx-auto mb-4" />
          <p className="text-white/60">載入統計數據中...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-white text-2xl mb-2">找不到活動</h2>
          <Link href="/" className="text-white/60 hover:text-white">
            返回列表
          </Link>
        </div>
      </div>
    );
  }

  const pieData = [
    { name: 'Desktop (購買按鈕)', value: stats.stats.purchaseClicks, color: '#3b82f6' },
    { name: 'Mobile (二維碼)', value: stats.stats.qrScans, color: '#a855f7' }
  ];

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-white/60 hover:text-white transition mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            返回列表
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-white text-3xl font-bold mb-1">
                {stats.campaignName}
              </h1>
              <p className="text-white/60">
                建立於 {new Date(stats.createdAt).toLocaleDateString('zh-TW')}
                {' • '}
                <span className="text-green-400">● 即時更新</span>
              </p>
            </div>
          </div>
        </div>

        {/* 關鍵指標卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <MetricCard
            icon={<MousePointer className="w-6 h-6" />}
            label="購買按鈕點擊"
            value={stats.stats.purchaseClicks}
            color="blue"
          />
          <MetricCard
            icon={<QrCode className="w-6 h-6" />}
            label="二維碼掃描"
            value={stats.stats.qrScans}
            color="purple"
          />
          <MetricCard
            icon={<TrendingUp className="w-6 h-6" />}
            label="CTA 總互動"
            value={stats.stats.totalCTA}
            color="green"
            highlight
          />
        </div>

        {/* 每日趨勢圖 */}
        <div className="bg-white/5 rounded-2xl p-6 border border-white/10 mb-8">
          <h2 className="text-white text-xl font-semibold mb-6">📈 每日互動趨勢</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis
                dataKey="date"
                stroke="rgba(255,255,255,0.5)"
                tick={{ fill: 'rgba(255,255,255,0.5)' }}
              />
              <YAxis
                stroke="rgba(255,255,255,0.5)"
                tick={{ fill: 'rgba(255,255,255,0.5)' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(0,0,0,0.9)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '8px',
                  color: '#fff'
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="purchaseClicks"
                stroke="#3b82f6"
                name="購買點擊"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="qrScans"
                stroke="#a855f7"
                name="二維碼掃描"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* 設備分布 */}
        <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
          <h2 className="text-white text-xl font-semibold mb-6">📊 設備來源分布</h2>
          <div className="flex justify-center">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {pieData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(0,0,0,0.9)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="text-center">
              <div className="text-3xl mb-2">🖥️</div>
              <div className="text-white/60 text-sm">Desktop</div>
              <div className="text-white text-2xl font-bold">{stats.stats.purchaseClicks}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">📱</div>
              <div className="text-white/60 text-sm">Mobile</div>
              <div className="text-white text-2xl font-bold">{stats.stats.qrScans}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  icon,
  label,
  value,
  color,
  highlight
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: 'blue' | 'purple' | 'green';
  highlight?: boolean;
}) {
  const colorClasses = {
    blue: 'from-blue-500/20 to-blue-600/10 border-blue-500/30',
    purple: 'from-purple-500/20 to-purple-600/10 border-purple-500/30',
    green: 'from-green-500/20 to-green-600/10 border-green-500/30'
  };

  return (
    <div
      className={`
        bg-gradient-to-br ${colorClasses[color]}
        rounded-2xl p-6 border
        ${highlight ? 'ring-2 ring-white/20' : ''}
      `}
    >
      <div className="flex items-center gap-3 mb-3 text-white/80">
        {icon}
        <span className="font-medium">{label}</span>
      </div>
      <div className="text-white text-4xl font-bold">{value}</div>
    </div>
  );
}
