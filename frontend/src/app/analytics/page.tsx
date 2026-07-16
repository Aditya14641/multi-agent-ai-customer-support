'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAnalytics } from '@/services/api';
import { ArrowLeft, MessageSquare, Users, Clock, TrendingUp } from 'lucide-react';

interface AnalyticsData {
  total_conversations: number;
  total_messages: number;
  agent_usage: { _id: string; count: number }[];
  avg_response_time: number;
  conversations_last_7_days: number;
}

export default function AnalyticsPage() {
  const router = useRouter();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAnalytics()
      .then(setData)
      .catch(() => router.push('/login'))
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-gray-900 text-white">
      <div className="text-center">
        <div className="text-4xl mb-4">📊</div>
        <p className="text-gray-400">Loading analytics...</p>
      </div>
    </div>
  );

  if (!data) return null;

  const maxCount = data.agent_usage.length > 0
    ? Math.max(...data.agent_usage.map(a => a.count))
    : 1;

  const agentColors: Record<string, string> = {
    billing: 'bg-green-500',
    technical: 'bg-blue-500',
    product: 'bg-purple-500',
    complaint: 'bg-red-500',
    faq: 'bg-yellow-500',
    refund: 'bg-orange-500',
  };

  const stats = [
    { label: 'Total Conversations', value: data.total_conversations, icon: <Users size={20} />, color: 'text-blue-400' },
    { label: 'Total Messages', value: data.total_messages, icon: <MessageSquare size={20} />, color: 'text-green-400' },
    { label: 'Avg Response Time', value: `${data.avg_response_time}s`, icon: <Clock size={20} />, color: 'text-yellow-400' },
    { label: 'Last 7 Days', value: data.conversations_last_7_days, icon: <TrendingUp size={20} />, color: 'text-purple-400' },
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <button onClick={() => router.push('/chat')}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition">
          <ArrowLeft size={16} /> Back to Chat
        </button>

        <h1 className="text-2xl font-bold mb-2">Analytics Dashboard</h1>
        <p className="text-gray-400 text-sm mb-8">TechMart AI Support System Performance</p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map(stat => (
            <div key={stat.label} className="bg-gray-800 rounded-xl p-5 border border-gray-700">
              <div className={`mb-2 ${stat.color}`}>{stat.icon}</div>
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              <div className="text-xs text-gray-400 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h2 className="font-semibold mb-6 text-lg">Agent Usage Breakdown</h2>
          {data.agent_usage.length === 0 ? (
            <p className="text-gray-400 text-sm">No agent usage data yet. Start chatting!</p>
          ) : (
            <div className="space-y-4">
              {data.agent_usage.map((item) => (
                <div key={item._id} className="flex items-center gap-4">
                  <div className="w-20 text-sm text-gray-400 capitalize flex-shrink-0">{item._id}</div>
                  <div className="flex-1 bg-gray-700 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all ${agentColors[item._id] || 'bg-blue-500'}`}
                      style={{ width: `${(item.count / maxCount) * 100}%` }}
                    />
                  </div>
                  <div className="text-sm text-gray-300 w-8 text-right">{item.count}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h2 className="font-semibold mb-4">System Info</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="text-gray-400">RAG Pipeline<span className="ml-2 text-green-400">Active</span></div>
            <div className="text-gray-400">Vector DB<span className="ml-2 text-green-400">FAISS</span></div>
            <div className="text-gray-400">Embedding Model<span className="ml-2 text-blue-400">MiniLM-L6-v2</span></div>
            <div className="text-gray-400">Active Agents<span className="ml-2 text-purple-400">5</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
