'use client';

import { useEffect, useState } from 'react';
import { usersApi } from '@/services/api';

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [statsRes, subRes] = await Promise.all([
        usersApi.getMyStats(),
        usersApi.getMySubscription(),
      ]);
      setStats(statsRes.data);
      setSubscription(subRes.data);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6">
        <h2 className="text-2xl font-bold mb-2">Welcome to SocioTools! 👋</h2>
        <p className="text-blue-100">
          Manage your social media accounts with powerful automation tools
        </p>
      </div>

      {/* Subscription Status */}
      {subscription ? (
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-lg font-semibold mb-4">Subscription Status</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <div className="text-sm text-gray-400">Plan</div>
              <div className="text-xl font-bold">{subscription.plan.name}</div>
            </div>
            <div>
              <div className="text-sm text-gray-400">Status</div>
              <div className="text-xl font-bold">
                <span
                  className={`px-3 py-1 rounded-full text-sm ${
                    subscription.status === 'ACTIVE'
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-yellow-500/20 text-yellow-400'
                  }`}
                >
                  {subscription.status}
                </span>
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-400">Expires At</div>
              <div className="text-xl font-bold">
                {new Date(subscription.expiresAt).toLocaleDateString('id-ID')}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-yellow-500/10 border border-yellow-500/50 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-2">No Active Subscription</h3>
          <p className="text-gray-400 mb-4">
            Subscribe to unlock all features and start automating your social media
          </p>
          <a
            href="/billing"
            className="inline-block px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium"
          >
            View Plans
          </a>
        </div>
      )}

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-6">
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <div className="text-3xl">👤</div>
            <div className="text-2xl font-bold">{stats?.accountsCount || 0}</div>
          </div>
          <div className="text-sm text-gray-400">FB Accounts</div>
        </div>

        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <div className="text-3xl">🔗</div>
            <div className="text-2xl font-bold">{stats?.shortlinksCount || 0}</div>
          </div>
          <div className="text-sm text-gray-400">Shortlinks</div>
        </div>

        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <div className="text-3xl">📤</div>
            <div className="text-2xl font-bold">{stats?.postsCount || 0}</div>
          </div>
          <div className="text-sm text-gray-400">Posts</div>
        </div>

        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <div className="text-3xl">💰</div>
            <div className="text-2xl font-bold">{stats?.referralsCount || 0}</div>
          </div>
          <div className="text-sm text-gray-400">Referrals</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <a
            href="/fb-accounts"
            className="p-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition"
          >
            <div className="text-2xl mb-2">➕</div>
            <div className="font-medium">Add FB Account</div>
            <div className="text-sm text-gray-400">Connect new account</div>
          </a>

          <a
            href="/auto-post"
            className="p-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition"
          >
            <div className="text-2xl mb-2">📤</div>
            <div className="font-medium">Create Post</div>
            <div className="text-sm text-gray-400">Auto post to groups</div>
          </a>

          <a
            href="/shortlink"
            className="p-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition"
          >
            <div className="text-2xl mb-2">🔗</div>
            <div className="font-medium">New Shortlink</div>
            <div className="text-sm text-gray-400">Create shortlink</div>
          </a>
        </div>
      </div>
    </div>
  );
}
