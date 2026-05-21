import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class AdminStatsService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats() {
    const [
      totalUsers,
      activeUsers,
      totalRevenue,
      pendingPayments,
      activeSubscriptions,
      totalShortlinks,
      totalPosts,
      totalAffiliateEarnings,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({
        where: {
          subscriptions: {
            some: {
              status: 'ACTIVE',
              expiresAt: { gt: new Date() },
            },
          },
        },
      }),
      this.prisma.payment.aggregate({
        where: { status: 'PAID' },
        _sum: { amount: true },
      }),
      this.prisma.payment.count({
        where: { status: 'PENDING', method: 'MANUAL_BANK' },
      }),
      this.prisma.subscription.count({
        where: {
          status: 'ACTIVE',
          expiresAt: { gt: new Date() },
        },
      }),
      this.prisma.shortlink.count(),
      this.prisma.post.count(),
      this.prisma.affiliateEarning.aggregate({
        where: { status: { in: ['AVAILABLE', 'WITHDRAWN'] } },
        _sum: { amount: true },
      }),
    ]);

    // Get monthly revenue (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const recentPayments = await this.prisma.payment.findMany({
      where: {
        status: 'PAID',
        createdAt: { gte: sixMonthsAgo },
      },
      select: {
        amount: true,
        createdAt: true,
      },
    });

    const monthlyRevenue: Record<string, number> = {};
    recentPayments.forEach((p) => {
      const monthKey = `${p.createdAt.getFullYear()}-${String(p.createdAt.getMonth() + 1).padStart(2, '0')}`;
      monthlyRevenue[monthKey] = (monthlyRevenue[monthKey] || 0) + p.amount;
    });

    // Recent activity
    const recentUsers = await this.prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        username: true,
        fullName: true,
        createdAt: true,
      },
    });

    const recentPaymentsList = await this.prisma.payment.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { email: true, username: true },
        },
      },
    });

    return {
      stats: {
        totalUsers,
        activeUsers,
        totalRevenue: totalRevenue._sum.amount || 0,
        pendingPayments,
        activeSubscriptions,
        totalShortlinks,
        totalPosts,
        totalAffiliateEarnings: totalAffiliateEarnings._sum.amount || 0,
      },
      monthlyRevenue,
      recentUsers,
      recentPayments: recentPaymentsList,
    };
  }

  async getRevenueByMethod() {
    const payments = await this.prisma.payment.groupBy({
      by: ['method', 'status'],
      where: { status: 'PAID' },
      _sum: { amount: true },
      _count: true,
    });

    return payments;
  }

  async getUserGrowth() {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const users = await this.prisma.user.findMany({
      where: { createdAt: { gte: sixMonthsAgo } },
      select: { createdAt: true },
    });

    const monthlySignups: Record<string, number> = {};
    users.forEach((u) => {
      const monthKey = `${u.createdAt.getFullYear()}-${String(u.createdAt.getMonth() + 1).padStart(2, '0')}`;
      monthlySignups[monthKey] = (monthlySignups[monthKey] || 0) + 1;
    });

    return monthlySignups;
  }
}
