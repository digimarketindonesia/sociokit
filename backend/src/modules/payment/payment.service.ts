import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { TripayService } from './tripay/tripay.service';
import { XenditService } from './xendit/xendit.service';
import { ConfigService } from '@nestjs/config';
import { addMonths } from 'date-fns';
import { PaymentStatus } from '@prisma/client';

@Injectable()
export class PaymentService {
  constructor(
    private prisma: PrismaService,
    private tripayService: TripayService,
    private xenditService: XenditService,
    private configService: ConfigService,
  ) {}

  async createTripayPayment(userId: string, planId: string, channel: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    const plan = await this.prisma.plan.findUnique({ where: { id: planId } });

    if (!plan || !plan.isActive) {
      throw new NotFoundException('Plan not found');
    }

    // Create payment record
    const payment = await this.prisma.payment.create({
      data: {
        userId,
        planId,
        amount: plan.price,
        method: 'TRIPAY',
        status: 'PENDING',
      },
    });

    // Create Tripay transaction
    const merchantRef = `PAY-${payment.id}`;
    const transaction = await this.tripayService.createTransaction({
      method: channel,
      merchantRef,
      amount: plan.price,
      customerName: user.fullName,
      customerEmail: user.email,
      orderItems: [
        {
          name: `Subscription - ${plan.name}`,
          price: plan.price,
          quantity: 1,
        },
      ],
    });

    // Update payment with provider reference
    await this.prisma.payment.update({
      where: { id: payment.id },
      data: {
        providerReference: transaction.reference,
        providerData: transaction,
      },
    });

    return {
      paymentId: payment.id,
      checkoutUrl: transaction.checkout_url,
      reference: transaction.reference,
      amount: plan.price,
      expiresAt: new Date(transaction.expired_time * 1000),
    };
  }

  async createXenditPayment(userId: string, planId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    const plan = await this.prisma.plan.findUnique({ where: { id: planId } });

    if (!plan || !plan.isActive) {
      throw new NotFoundException('Plan not found');
    }

    // Create payment record
    const payment = await this.prisma.payment.create({
      data: {
        userId,
        planId,
        amount: plan.price,
        method: 'XENDIT',
        status: 'PENDING',
      },
    });

    // Create Xendit invoice
    const externalId = `PAY-${payment.id}`;
    const invoice = await this.xenditService.createInvoice({
      externalId,
      amount: plan.price,
      payerEmail: user.email,
      description: `Subscription - ${plan.name}`,
    });

    // Update payment with provider reference
    await this.prisma.payment.update({
      where: { id: payment.id },
      data: {
        providerReference: invoice.id,
        providerData: invoice,
      },
    });

    return {
      paymentId: payment.id,
      invoiceUrl: invoice.invoice_url,
      invoiceId: invoice.id,
      amount: plan.price,
      expiresAt: new Date(invoice.expiry_date),
    };
  }

  async createManualPayment(
    userId: string,
    planId: string,
    bankAccountId: string,
    proofImageUrl: string,
  ) {
    const plan = await this.prisma.plan.findUnique({ where: { id: planId } });
    const bankAccount = await this.prisma.bankAccount.findUnique({
      where: { id: bankAccountId },
    });

    if (!plan || !plan.isActive) {
      throw new NotFoundException('Plan not found');
    }

    if (!bankAccount || !bankAccount.isActive) {
      throw new NotFoundException('Bank account not found');
    }

    // Create payment record
    const payment = await this.prisma.payment.create({
      data: {
        userId,
        planId,
        amount: plan.price,
        method: 'MANUAL_BANK',
        status: 'PENDING',
        bankAccountId,
        proofImageUrl,
      },
    });

    return {
      paymentId: payment.id,
      status: 'PENDING',
      message: 'Payment proof uploaded. Waiting for admin verification.',
    };
  }

  async verifyManualPayment(paymentId: string, adminId: string, approved: boolean) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: { user: true },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.method !== 'MANUAL_BANK') {
      throw new BadRequestException('Only manual payments can be verified');
    }

    const status = approved ? 'PAID' : 'FAILED';

    await this.prisma.payment.update({
      where: { id: paymentId },
      data: {
        status,
        verifiedById: adminId,
        verifiedAt: new Date(),
      },
    });

    if (approved) {
      await this.activateSubscription(payment);
    }

    return { message: `Payment ${approved ? 'approved' : 'rejected'}` };
  }

  async handleTripayCallback(data: any) {
    const payment = await this.prisma.payment.findFirst({
      where: { providerReference: data.reference },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    const status = this.tripayService.mapStatusToPaymentStatus(data.status) as PaymentStatus;

    await this.prisma.payment.update({
      where: { id: payment.id },
      data: { status, providerData: data },
    });

    if (status === 'PAID') {
      await this.activateSubscription(payment);
    }

    return { success: true };
  }

  async handleXenditCallback(data: any) {
    const payment = await this.prisma.payment.findFirst({
      where: { providerReference: data.id },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    const status = this.xenditService.mapStatusToPaymentStatus(data.status) as PaymentStatus;

    await this.prisma.payment.update({
      where: { id: payment.id },
      data: { status, providerData: data },
    });

    if (status === 'PAID') {
      await this.activateSubscription(payment);
    }

    return { success: true };
  }

  private async activateSubscription(payment: any) {
    const plan = await this.prisma.plan.findUnique({
      where: { id: payment.planId },
    });

    const startDate = new Date();
    const expiresAt = addMonths(startDate, plan.durationMonths);

    // Create subscription
    const subscription = await this.prisma.subscription.create({
      data: {
        userId: payment.userId,
        planId: payment.planId,
        status: 'ACTIVE',
        startedAt: startDate,
        expiresAt,
        paymentId: payment.id,
      },
    });

    // Create affiliate earning if user was referred
    const user = await this.prisma.user.findUnique({
      where: { id: payment.userId },
    });

    if (user.referredById) {
      const settings = await this.prisma.affiliateSettings.findFirst();
      const commissionAmount = Math.floor(
        (payment.amount * settings.commissionRate) / 100,
      );

      await this.prisma.affiliateEarning.create({
        data: {
          affiliateUserId: user.referredById,
          paymentId: payment.id,
          commissionRate: settings.commissionRate,
          amount: commissionAmount,
          status: 'AVAILABLE',
        },
      });
    }

    return subscription;
  }

  async getBankAccounts() {
    return this.prisma.bankAccount.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
  }
}
