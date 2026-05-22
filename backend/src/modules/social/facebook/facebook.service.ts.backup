import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import axios from 'axios';
import { PrismaService } from '../../../database/prisma.service';
import { CryptoUtil } from '../../../common/utils/crypto.util';
import { AddFacebookAccountDto, UpdateFacebookAccountDto } from './dto/facebook.dto';

@Injectable()
export class FacebookService {
  constructor(private prisma: PrismaService) {}

  async addAccount(userId: string, dto: AddFacebookAccountDto) {
    // Validate cookies by making a test request to Facebook
    const validation = await this.validateCookies(dto.cookies);

    if (!validation.valid) {
      throw new BadRequestException('Invalid Facebook cookies');
    }

    // Check if account already exists
    const existing = await this.prisma.socialAccount.findFirst({
      where: {
        userId,
        platform: 'FACEBOOK',
        accountId: validation.accountId,
      },
    });

    if (existing) {
      throw new ConflictException('This Facebook account is already connected');
    }

    // Encrypt cookies
    const encryptedCookies = CryptoUtil.encrypt(dto.cookies);

    // Create account
    const account = await this.prisma.socialAccount.create({
      data: {
        userId,
        platform: 'FACEBOOK',
        accountName: dto.accountName || validation.name,
        accountId: validation.accountId,
        encryptedCookies,
        proxyEnabled: dto.proxyEnabled || false,
        proxyConfig: dto.proxyConfig || null,
        status: 'ACTIVE',
      },
    });

    // Fetch fanpages
    await this.fetchAndSaveFanpages(account.id, dto.cookies);

    return this.getAccountById(account.id);
  }

  async getAccounts(userId: string) {
    const accounts = await this.prisma.socialAccount.findMany({
      where: {
        userId,
        platform: 'FACEBOOK',
      },
      include: {
        fanpages: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return accounts.map((account) => ({
      ...account,
      encryptedCookies: undefined, // Don't expose encrypted cookies
    }));
  }

  async getAccountById(accountId: string) {
    const account = await this.prisma.socialAccount.findUnique({
      where: { id: accountId },
      include: {
        fanpages: true,
      },
    });

    if (!account) {
      throw new NotFoundException('Account not found');
    }

    return {
      ...account,
      encryptedCookies: undefined,
    };
  }

  async updateAccount(accountId: string, userId: string, dto: UpdateFacebookAccountDto) {
    const account = await this.prisma.socialAccount.findFirst({
      where: { id: accountId, userId },
    });

    if (!account) {
      throw new NotFoundException('Account not found');
    }

    const updated = await this.prisma.socialAccount.update({
      where: { id: accountId },
      data: {
        accountName: dto.accountName,
        proxyEnabled: dto.proxyEnabled,
        proxyConfig: dto.proxyConfig,
      },
    });

    return this.getAccountById(updated.id);
  }

  async deleteAccount(accountId: string, userId: string) {
    const account = await this.prisma.socialAccount.findFirst({
      where: { id: accountId, userId },
    });

    if (!account) {
      throw new NotFoundException('Account not found');
    }

    await this.prisma.socialAccount.delete({
      where: { id: accountId },
    });

    return { message: 'Account deleted successfully' };
  }

  async getFanpages(accountId: string, userId: string) {
    const account = await this.prisma.socialAccount.findFirst({
      where: { id: accountId, userId },
      include: { fanpages: true },
    });

    if (!account) {
      throw new NotFoundException('Account not found');
    }

    return account.fanpages;
  }

  async refreshFanpages(accountId: string, userId: string) {
    const account = await this.prisma.socialAccount.findFirst({
      where: { id: accountId, userId },
    });

    if (!account) {
      throw new NotFoundException('Account not found');
    }

    const cookies = CryptoUtil.decrypt(account.encryptedCookies);

    // Delete existing fanpages
    await this.prisma.fanpage.deleteMany({
      where: { socialAccountId: accountId },
    });

    // Fetch and save new fanpages
    await this.fetchAndSaveFanpages(accountId, cookies);

    return this.getFanpages(accountId, userId);
  }

  private async validateCookies(cookies: string): Promise<{
    valid: boolean;
    accountId?: string;
    name?: string;
  }> {
    try {
      // Make a request to Facebook to validate cookies
      const response = await axios.get('https://www.facebook.com/me', {
        headers: {
          Cookie: cookies,
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
        maxRedirects: 0,
        validateStatus: (status) => status < 400,
      });

      // Extract account ID from response
      const html = response.data;
      const accountIdMatch = html.match(/"userID":"(\d+)"/);
      const nameMatch = html.match(/"name":"([^"]+)"/);

      if (accountIdMatch) {
        return {
          valid: true,
          accountId: accountIdMatch[1],
          name: nameMatch ? nameMatch[1] : 'Facebook User',
        };
      }

      return { valid: false };
    } catch (error) {
      return { valid: false };
    }
  }

  private async fetchAndSaveFanpages(accountId: string, cookies: string) {
    try {
      // Fetch fanpages from Facebook Graph API
      const response = await axios.get(
        'https://graph.facebook.com/me/accounts?fields=id,name,access_token',
        {
          headers: {
            Cookie: cookies,
          },
        },
      );

      const fanpages = response.data.data || [];

      // Save fanpages
      for (const fanpage of fanpages) {
        await this.prisma.fanpage.create({
          data: {
            socialAccountId: accountId,
            fanpageId: fanpage.id,
            fanpageName: fanpage.name,
            accessToken: fanpage.access_token,
          },
        });
      }
    } catch (error) {
      console.error('Failed to fetch fanpages:', error);
      // Don't throw error, just log it
    }
  }

  async getGroups(accountId: string, userId: string) {
    const account = await this.prisma.socialAccount.findFirst({
      where: { id: accountId, userId },
    });

    if (!account) {
      throw new NotFoundException('Account not found');
    }

    const cookies = CryptoUtil.decrypt(account.encryptedCookies);

    try {
      // Fetch groups from Facebook
      const response = await axios.get('https://www.facebook.com/api/graphql/', {
        headers: {
          Cookie: cookies,
        },
        params: {
          // Facebook GraphQL query for groups
          // This is a simplified version - actual implementation would need proper FB API
        },
      });

      // Parse and return groups
      // This is a placeholder - actual implementation depends on FB API
      return [];
    } catch (error) {
      throw new BadRequestException('Failed to fetch groups');
    }
  }
}
