import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        username: true,
        fullName: true,
        role: true,
        emailVerified: true,
        affiliateCode: true,
        referredById: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            socialAccounts: true,
            shortlinks: true,
            posts: true,
            referrals: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async getActiveSubscription(userId: string) {
    const subscription = await this.prisma.subscription.findFirst({
      where: {
        userId,
        status: 'ACTIVE',
        expiresAt: { gt: new Date() },
      },
      include: {
        plan: true,
      },
      orderBy: { expiresAt: 'desc' },
    });

    return subscription;
  }

  async updateProfile(userId: string, data: { fullName?: string; email?: string }) {
    if (data.email) {
      const existing = await this.prisma.user.findUnique({
        where: { email: data.email },
      });

      if (existing && existing.id !== userId) {
        throw new BadRequestException('Email already in use');
      }
    }

    const user = await this.prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        email: true,
        username: true,
        fullName: true,
        role: true,
        affiliateCode: true,
      },
    });

    return user;
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isValid = await bcrypt.compare(currentPassword, user.passwordHash);

    if (!isValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    const newHash = await bcrypt.hash(newPassword, 10);

    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newHash },
    });

    return { message: 'Password changed successfully' };
  }

  async getUserStats(userId: string) {
    const [accountsCount, shortlinksCount, postsCount, referralsCount] = await Promise.all([
      this.prisma.socialAccount.count({ where: { userId } }),
      this.prisma.shortlink.count({ where: { userId } }),
      this.prisma.post.count({ where: { userId } }),
      this.prisma.user.count({ where: { referredById: userId } }),
    ]);

    return {
      accountsCount,
      shortlinksCount,
      postsCount,
      referralsCount,
    };
  }
}
