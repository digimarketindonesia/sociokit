import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as crypto from 'crypto';

@Injectable()
export class TripayService {
  private readonly apiKey: string;
  private readonly privateKey: string;
  private readonly merchantCode: string;
  private readonly baseUrl: string;

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('TRIPAY_API_KEY');
    this.privateKey = this.configService.get<string>('TRIPAY_PRIVATE_KEY');
    this.merchantCode = this.configService.get<string>('TRIPAY_MERCHANT_CODE');
    this.baseUrl = this.configService.get<string>('TRIPAY_BASE_URL');
  }

  async getChannels() {
    try {
      const response = await axios.get(`${this.baseUrl}/merchant/payment-channel`, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      });

      return response.data.data;
    } catch (error) {
      throw new BadRequestException('Failed to fetch payment channels');
    }
  }

  async createTransaction(data: {
    method: string;
    merchantRef: string;
    amount: number;
    customerName: string;
    customerEmail: string;
    orderItems: Array<{
      name: string;
      price: number;
      quantity: number;
    }>;
    returnUrl?: string;
    expiredTime?: number;
  }) {
    const signature = this.generateSignature(
      data.merchantRef,
      data.amount,
    );

    const payload = {
      method: data.method,
      merchant_ref: data.merchantRef,
      amount: data.amount,
      customer_name: data.customerName,
      customer_email: data.customerEmail,
      order_items: data.orderItems,
      return_url: data.returnUrl || this.configService.get('FRONTEND_URL'),
      expired_time: data.expiredTime || Math.floor(Date.now() / 1000) + 86400, // 24 hours
      signature,
    };

    try {
      const response = await axios.post(
        `${this.baseUrl}/transaction/create`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
          },
        },
      );

      return response.data.data;
    } catch (error) {
      throw new BadRequestException('Failed to create transaction');
    }
  }

  async getTransactionDetail(reference: string) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/transaction/detail?reference=${reference}`,
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
          },
        },
      );

      return response.data.data;
    } catch (error) {
      throw new BadRequestException('Failed to fetch transaction detail');
    }
  }

  verifyCallbackSignature(
    callbackSignature: string,
    data: any,
  ): boolean {
    const json = JSON.stringify(data);
    const signature = crypto
      .createHmac('sha256', this.privateKey)
      .update(json)
      .digest('hex');

    return signature === callbackSignature;
  }

  private generateSignature(merchantRef: string, amount: number): string {
    const data = `${this.merchantCode}${merchantRef}${amount}`;
    return crypto
      .createHmac('sha256', this.privateKey)
      .update(data)
      .digest('hex');
  }

  mapStatusToPaymentStatus(tripayStatus: string): string {
    const statusMap: Record<string, string> = {
      UNPAID: 'PENDING',
      PAID: 'PAID',
      FAILED: 'FAILED',
      EXPIRED: 'EXPIRED',
      REFUND: 'REFUNDED',
    };

    return statusMap[tripayStatus] || 'PENDING';
  }
}
