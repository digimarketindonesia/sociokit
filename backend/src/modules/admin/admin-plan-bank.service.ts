import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import {
  CreatePlanDto,
  UpdatePlanDto,
  CreateBankAccountDto,
  UpdateBankAccountDto,
} from './dto/admin.dto';

@Injectable()
export class AdminPlanService {
  constructor(private prisma: PrismaService) {}

  async getPlans() {
    return this.prisma.plan.findMany({
      orderBy: { sortOrder: 'asc' },
      include: {
        _count: {
          select: { subscriptions: true },
        },
      },
    });
  }

  async getPlan(planId: string) {
    const plan = await this.prisma.plan.findUnique({
      where: { id: planId },
      include: {
        _count: {
          select: { subscriptions: true },
        },
      },
    });

    if (!plan) {
      throw new NotFoundException('Plan not found');
    }

    return plan;
  }

  async createPlan(dto: CreatePlanDto) {
    return this.prisma.plan.create({
      data: {
        name: dto.name,
        durationMonths: dto.durationMonths,
        price: dto.price,
        features: dto.features || [],
        isActive: dto.isActive ?? true,
        sortOrder: dto.sortOrder ?? 0,
      },
    });
  }

  async updatePlan(planId: string, dto: UpdatePlanDto) {
    const plan = await this.prisma.plan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      throw new NotFoundException('Plan not found');
    }

    return this.prisma.plan.update({
      where: { id: planId },
      data: dto,
    });
  }

  async deletePlan(planId: string) {
    const plan = await this.prisma.plan.findUnique({
      where: { id: planId },
      include: { _count: { select: { subscriptions: true } } },
    });

    if (!plan) {
      throw new NotFoundException('Plan not found');
    }

    if (plan._count.subscriptions > 0) {
      throw new BadRequestException(
        'Cannot delete plan with active subscriptions. Deactivate it instead.',
      );
    }

    await this.prisma.plan.delete({ where: { id: planId } });

    return { message: 'Plan deleted successfully' };
  }
}

@Injectable()
export class AdminBankService {
  constructor(private prisma: PrismaService) {}

  async getBankAccounts() {
    return this.prisma.bankAccount.findMany({
      orderBy: { sortOrder: 'asc' },
    });
  }

  async getBankAccount(bankAccountId: string) {
    const account = await this.prisma.bankAccount.findUnique({
      where: { id: bankAccountId },
    });

    if (!account) {
      throw new NotFoundException('Bank account not found');
    }

    return account;
  }

  async createBankAccount(dto: CreateBankAccountDto) {
    return this.prisma.bankAccount.create({
      data: {
        bankName: dto.bankName,
        accountNumber: dto.accountNumber,
        accountHolder: dto.accountHolder,
        isActive: dto.isActive ?? true,
        sortOrder: dto.sortOrder ?? 0,
      },
    });
  }

  async updateBankAccount(bankAccountId: string, dto: UpdateBankAccountDto) {
    const account = await this.prisma.bankAccount.findUnique({
      where: { id: bankAccountId },
    });

    if (!account) {
      throw new NotFoundException('Bank account not found');
    }

    return this.prisma.bankAccount.update({
      where: { id: bankAccountId },
      data: dto,
    });
  }

  async deleteBankAccount(bankAccountId: string) {
    const account = await this.prisma.bankAccount.findUnique({
      where: { id: bankAccountId },
    });

    if (!account) {
      throw new NotFoundException('Bank account not found');
    }

    await this.prisma.bankAccount.delete({ where: { id: bankAccountId } });

    return { message: 'Bank account deleted successfully' };
  }
}
