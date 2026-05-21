import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class SubscriptionService {
  constructor(private prisma: PrismaService) {}

  async getPlans() {
    return this.prisma.plan.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async getPlan(planId: string) {
    const plan = await this.prisma.plan.findUnique({
      where: { id: planId },
    });

    if (!plan || !plan.isActive) {
      throw new NotFoundException('Plan not found');
    }

    return plan;
  }

  async getUserSubscription(userId: string) {
    const subscription = await this.prisma.subscription.findFirst({
      where: {
        userId,
        status: 'ACTIVE',
        expiresAt: { gt: new Date() },
      },
      include: { plan: true },
      orderBy: { createdAt: 'desc' },
    });

    return subscription;
  }

  async getUserSubscriptions(userId: string) {
    return this.prisma.subscription.findMany({
      where: { userId },
      include: { plan: true, payment: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async checkSubscriptionStatus(userId: string): Promise<boolean> {
    const subscription = await this.getUserSubscription(userId);
    return !!subscription;
  }

  @Cron(CronExpression.EVERY_HOUR)
  async checkExpiredSubscriptions() {
    const now = new Date();

    const expiredSubscriptions = await this.prisma.subscription.findMany({
      where: {
        status: 'ACTIVE',
        expiresAt: { lte: now },
      },
    });

    for (const subscription of expiredSubscriptions) {
      await this.prisma.subscription.update({
        where: { id: subscription.id },
        data: { status: 'EXPIRED' },
      });
    }

    if (expiredSubscriptions.length > 0) {
      console.log(`Expired ${expiredSubscriptions.length} subscriptions`);
    }
  }
}
