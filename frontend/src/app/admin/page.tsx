'use client';

import { useEffect, useState } from 'react';
import { adminApi } from '@/services/api';
import {
  Users,
  UserCheck,
  DollarSign,
  Clock,
  CheckCircle,
  Link2,
  FileText,
  Wallet,
} from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const { data } = await adminApi.getDashboardStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-zinc-400">Loading...</div>
      </div>
    );
  }

  const statCards = [
    {
      label: 'Total Users',
      value: stats?.stats.totalUsers || 0,
      icon: Users,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      label: 'Active Users',
      value: stats?.stats.activeUsers || 0,
      icon: UserCheck,
      color: 'from-green-500 to-emerald-500',
    },
    {
      label: 'Total Revenue',
      value: `Rp ${(stats?.stats.totalRevenue || 0).toLocaleString('id-ID')}`,
      icon: DollarSign,
      color: 'from-purple-500 to-pink-500',
    },
    {
      label: 'Pending Payments',
      value: stats?.stats.pendingPayments || 0,
      icon: Clock,
      color: 'from-orange-500 to-red-500',
    },
    {
      label: 'Active Subscriptions',
      value: stats?.stats.activeSubscriptions || 0,
      icon: CheckCircle,
      color: 'from-teal-500 to-green-500',
    },
    {
      label: 'Total Shortlinks',
      value: stats?.stats.totalShortlinks || 0,
      icon: Link2,
      color: 'from-indigo-500 to-purple-500',
    },
    {
      label: 'Total Posts',
      value: stats?.stats.totalPosts || 0,
      icon: FileText,
      color: 'from-pink-500 to-rose-500',
    },
    {
      label: 'Affiliate Earnings',
      value: `Rp ${(stats?.stats.totalAffiliateEarnings || 0).toLocaleString('id-ID')}`,
      icon: Wallet,
      color: 'from-yellow-500 to-orange-500',
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="mt-2 text-zinc-400">Overview of system statistics</p>
      </div>

      <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="rounded-xl border border-zinc-800 bg-zinc-900 p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-zinc-400">{card.label}</p>
                  <p className="mt-2 text-2xl font-bold">{card.value}</p>
                </div>
                <div
                  className={`rounded-lg bg-gradient-to-br ${card.color} p-3 text-white`}
                >
                  <Icon size={24} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
          <h2 className="mb-4 text-lg font-semibold">Recent Users</h2>
          <div className="space-y-3">
            {stats?.recentUsers?.map((user: any) => (
              <div
                key={user.id}
                className="flex items-center justify-between rounded-lg border border-zinc-800 p-3"
              >
                <div>
                  <div className="font-medium">{user.fullName}</div>
                  <div className="text-sm text-zinc-400">{user.email}</div>
                </div>
                <div className="text-sm text-zinc-500">
                  {new Date(user.createdAt).toLocaleDateString('id-ID')}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
          <h2 className="mb-4 text-lg font-semibold">Recent Payments</h2>
          <div className="space-y-3">
            {stats?.recentPayments?.map((payment: any) => (
              <div
                key={payment.id}
                className="flex items-center justify-between rounded-lg border border-zinc-800 p-3"
              >
                <div>
                  <div className="font-medium">{payment.user.username}</div>
                  <div className="text-sm text-zinc-400">{payment.plan.name}</div>
                </div>
                <div className="text-right">
                  <div className="font-medium">
                    Rp {payment.amount.toLocaleString('id-ID')}
                  </div>
                  <div
                    className={`text-sm ${
                      payment.status === 'PAID'
                        ? 'text-green-500'
                        : payment.status === 'PENDING'
                          ? 'text-yellow-500'
                          : 'text-red-500'
                    }`}
                  >
                    {payment.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
