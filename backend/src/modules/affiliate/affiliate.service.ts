import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import {
  CreateWithdrawalDto,
  ProcessWithdrawalDto,
  UpdateAffiliateSettingsDto,
  GetEarningsQueryDto,
} from './dto/affiliate.dto';

@Injectable()
export class AffiliateService {
  constructor(private prisma: PrismaService) {}

  async getAffiliateInfo(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        affiliateCode: true,
        referredById: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Get total referrals
    const totalReferrals = await this.prisma.user.count({
      where: { referredById: userId },
    });

    // Get earnings summary
    const earnings = await this.prisma.affiliateEarning.groupBy({
      by: ['status'],
      where: { affiliateUserId: userId },
      _sum: { amount: true },
      _count: true,
    });

    const earningsSummary = {
      pending: 0,
      available: 0,
      withdrawn: 0,
      total: 0,
    };

    earnings.forEach((e) => {
      const amount = e._sum.amount || 0;
      earningsSummary.total += amount;

      if (e.status === 'PENDING') earningsSummary.pending = amount;
      if (e.status === 'AVAILABLE') earningsSummary.available = amount;
      if (e.status === 'WITHDRAWN') earningsSummary.withdrawn = amount;
    });

    // Get affiliate settings
    const settings = await this.prisma.affiliateSettings.findFirst();

    return {
      affiliateCode: user.affiliateCode,
      totalReferrals,
      earnings: earningsSummary,
      settings: {
        commissionRate: settings?.commissionRate || 0,
        minWithdrawal: settings?.minWithdrawal || 50000,
        isActive: settings?.isActive || false,
      },
    };
  }

  async getEarnings(userId: string, query: GetEarningsQueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = { affiliateUserId: userId };
    if (query.status) {
      where.status = query.status;
    }

    const [earnings, total] = await Promise.all([
      this.prisma.affiliateEarning.findMany({
        where,
        include: {
          payment: {
            include: {
              user: {
                select: {
                  email: true,
                  username: true,
                  fullName: true,
                },
              },
              plan: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.affiliateEarning.count({ where }),
    ]);

    return {
      data: earnings,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async createWithdrawal(userId: string, dto: CreateWithdrawalDto) {
    // Get available balance
    const availableEarnings = await this.prisma.affiliateEarning.findMany({
      where: {
        affiliateUserId: userId,
        status: 'AVAILABLE',
      },
    });

    const availableBalance = availableEarnings.reduce(
      (sum, e) => sum + e.amount,
      0,
    );

    if (availableBalance < dto.amount) {
      throw new BadRequestException(
        `Insufficient balance. Available: ${availableBalance}`,
      );
    }

    // Check minimum withdrawal
    const settings = await this.prisma.affiliateSettings.findFirst();
    if (dto.amount < (settings?.minWithdrawal || 50000)) {
      throw new BadRequestException(
        `Minimum withdrawal is ${settings?.minWithdrawal || 50000}`,
      );
    }

    // Create withdrawal request
    const withdrawal = await this.prisma.withdrawal.create({
      data: {
        userId,
        amount: dto.amount,
        bankName: dto.bankName,
        accountNumber: dto.accountNumber,
        accountHolder: dto.accountHolder,
        status: 'PENDING',
      },
    });

    // Mark earnings as withdrawn (reserve them)
    let remaining = dto.amount;
    for (const earning of availableEarnings) {
      if (remaining <= 0) break;

      const toWithdraw = Math.min(earning.amount, remaining);
      await this.prisma.affiliateEarning.update({
        where: { id: earning.id },
        data: {
          status: 'WITHDRAWN',
          withdrawalId: withdrawal.id,
        },
      });

      remaining -= toWithdraw;
    }

    return withdrawal;
  }

  async getWithdrawals(userId: string) {
    return this.prisma.withdrawal.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getWithdrawal(userId: string, withdrawalId: string) {
    const withdrawal = await this.prisma.withdrawal.findFirst({
      where: { id: withdrawalId, userId },
    });

    if (!withdrawal) {
      throw new NotFoundException('Withdrawal not found');
    }

    return withdrawal;
  }

  // Admin methods
  async getAllWithdrawals(status?: string) {
    const where: any = {};
    if (status) {
      where.status = status;
    }

    return this.prisma.withdrawal.findMany({
      where,
      include: {
        user: {
          select: {
            email: true,
            username: true,
            fullName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async processWithdrawal(
    adminId: string,
    withdrawalId: string,
    dto: ProcessWithdrawalDto,
  ) {
    const withdrawal = await this.prisma.withdrawal.findUnique({
      where: { id: withdrawalId },
      include: { earnings: true },
    });

    if (!withdrawal) {
      throw new NotFoundException('Withdrawal not found');
    }

    if (withdrawal.status !== 'PENDING') {
      throw new BadRequestException('Withdrawal already processed');
    }

    // If rejected, return earnings to AVAILABLE
    if (dto.status === 'REJECTED') {
      await this.prisma.affiliateEarning.updateMany({
        where: { withdrawalId },
        data: {
          status: 'AVAILABLE',
          withdrawalId: null,
        },
      });
    }

    // Update withdrawal
    await this.prisma.withdrawal.update({
      where: { id: withdrawalId },
      data: {
        status: dto.status,
        notes: dto.notes,
        processedById: adminId,
        processedAt: new Date(),
      },
    });

    return { message: `Withdrawal ${dto.status.toLowerCase()}` };
  }

  async getAffiliateSettings() {
    let settings = await this.prisma.affiliateSettings.findFirst();

    if (!settings) {
      settings = await this.prisma.affiliateSettings.create({
        data: {
          commissionRate: 20,
          minWithdrawal: 50000,
          cookieDays: 30,
          isActive: true,
        },
      });
    }

    return settings;
  }

  async updateAffiliateSettings(dto: UpdateAffiliateSettingsDto) {
    let settings = await this.prisma.affiliateSettings.findFirst();

    if (!settings) {
      settings = await this.prisma.affiliateSettings.create({
        data: {
          commissionRate: dto.commissionRate || 20,
          minWithdrawal: dto.minWithdrawal || 50000,
          cookieDays: dto.cookieDays || 30,
          isActive: dto.isActive ?? true,
        },
      });
    } else {
      settings = await this.prisma.affiliateSettings.update({
        where: { id: settings.id },
        data: dto,
      });
    }

    return settings;
  }
}
