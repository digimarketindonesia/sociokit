import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class XenditService {
  private readonly secretKey: string;
  private readonly webhookToken: string;
  private readonly baseUrl = 'https://api.xendit.co';

  constructor(private configService: ConfigService) {
    this.secretKey = this.configService.get<string>('XENDIT_SECRET_KEY');
    this.webhookToken = this.configService.get<string>('XENDIT_WEBHOOK_TOKEN');
  }

  async createInvoice(data: {
    externalId: string;
    amount: number;
    payerEmail: string;
    description: string;
    successRedirectUrl?: string;
    failureRedirectUrl?: string;
  }) {
    const payload = {
      external_id: data.externalId,
      amount: data.amount,
      payer_email: data.payerEmail,
      description: data.description,
      success_redirect_url:
        data.successRedirectUrl ||
        `${this.configService.get('FRONTEND_URL')}/billing?status=success`,
      failure_redirect_url:
        data.failureRedirectUrl ||
        `${this.configService.get('FRONTEND_URL')}/billing?status=failed`,
    };

    try {
      const response = await axios.post(
        `${this.baseUrl}/v2/invoices`,
        payload,
        {
          auth: {
            username: this.secretKey,
            password: '',
          },
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      return response.data;
    } catch (error) {
      throw new BadRequestException('Failed to create Xendit invoice');
    }
  }

  async getInvoice(invoiceId: string) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/v2/invoices/${invoiceId}`,
        {
          auth: {
            username: this.secretKey,
            password: '',
          },
        },
      );

      return response.data;
    } catch (error) {
      throw new BadRequestException('Failed to fetch invoice');
    }
  }

  verifyWebhookToken(token: string): boolean {
    return token === this.webhookToken;
  }

  mapStatusToPaymentStatus(xenditStatus: string): string {
    const statusMap: Record<string, string> = {
      PENDING: 'PENDING',
      PAID: 'PAID',
      SETTLED: 'PAID',
      EXPIRED: 'EXPIRED',
      FAILED: 'FAILED',
    };

    return statusMap[xenditStatus] || 'PENDING';
  }
}
