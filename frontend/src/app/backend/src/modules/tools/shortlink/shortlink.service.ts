import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { CryptoUtil } from '../../../common/utils/crypto.util';
import { CreateShortlinkDto, CreateDomainDto, UpdateDomainDto } from './dto/shortlink.dto';

@Injectable()
export class ShortlinkService {
  constructor(private prisma: PrismaService) {}

  // Domain Management (Admin)
  async createDomain(dto: CreateDomainDto) {
    const existing = await this.prisma.domain.findUnique({
      where: { domain: dto.domain },
    });

    if (existing) {
      throw new ConflictException('Domain already exists');
    }

    // If this is set as default, unset other defaults
    if (dto.isDefault) {
      await this.prisma.domain.updateMany({
        where: { isDefault: true },
        data: { isDefault: false },
      });
    }

    return this.prisma.domain.create({
      data: {
        domain: dto.domain,
        isDefault: dto.isDefault || false,
        sortOrder: dto.sortOrder || 0,
      },
    });
  }

  async getDomains() {
    return this.prisma.domain.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async updateDomain(domainId: string, dto: UpdateDomainDto) {
    const domain = await this.prisma.domain.findUnique({
      where: { id: domainId },
    });

    if (!domain) {
      throw new NotFoundException('Domain not found');
    }

    // If setting as default, unset other defaults
    if (dto.isDefault) {
      await this.prisma.domain.updateMany({
        where: { isDefault: true, id: { not: domainId } },
        data: { isDefault: false },
      });
    }

    return this.prisma.domain.update({
      where: { id: domainId },
      data: dto,
    });
  }

  async deleteDomain(domainId: string) {
    const domain = await this.prisma.domain.findUnique({
      where: { id: domainId },
      include: { _count: { select: { shortlinks: true } } },
    });

    if (!domain) {
      throw new NotFoundException('Domain not found');
    }

    if (domain._count.shortlinks > 0) {
      throw new BadRequestException(
        'Cannot delete domain with existing shortlinks',
      );
    }

    await this.prisma.domain.delete({
      where: { id: domainId },
    });

    return { message: 'Domain deleted successfully' };
  }

  // Shortlink Management
  async createShortlink(userId: string, dto: CreateShortlinkDto) {
    // Generate slug if not provided
    let slug = dto.slug || CryptoUtil.generateSlug(6);

    // Ensure slug is unique
    let isUnique = false;
    let attempts = 0;

    while (!isUnique && attempts < 10) {
      const existing = await this.prisma.shortlink.findUnique({
        where: { slug },
      });

      if (!existing) {
        isUnique = true;
      } else {
        slug = CryptoUtil.generateSlug(6);
        attempts++;
      }
    }

    if (!isUnique) {
      throw new BadRequestException('Failed to generate unique slug');
    }

    // Validate domain if provided
    if (dto.domainId) {
      const domain = await this.prisma.domain.findUnique({
        where: { id: dto.domainId, isActive: true },
      });

      if (!domain) {
        throw new BadRequestException('Invalid domain');
      }
    }

    // Create shortlink
    return this.prisma.shortlink.create({
      data: {
        userId,
        slug,
        domainId: dto.domainId,
        useRandomDomain: dto.useRandomDomain || false,
        targetUrls: dto.targetUrls,
        type: dto.type,
        fakeUrl: dto.fakeUrl,
        fakeContent: dto.fakeContent,
      },
      include: {
        domain: true,
      },
    });
  }

  async getShortlinks(userId: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [shortlinks, total] = await Promise.all([
      this.prisma.shortlink.findMany({
        where: { userId },
        include: {
          domain: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.shortlink.count({ where: { userId } }),
    ]);

    return {
      data: shortlinks,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getShortlinkById(shortlinkId: string, userId: string) {
    const shortlink = await this.prisma.shortlink.findFirst({
      where: { id: shortlinkId, userId },
      include: {
        domain: true,
      },
    });

    if (!shortlink) {
      throw new NotFoundException('Shortlink not found');
    }

    return shortlink;
  }

  async deleteShortlink(shortlinkId: string, userId: string) {
    const shortlink = await this.prisma.shortlink.findFirst({
      where: { id: shortlinkId, userId },
    });

    if (!shortlink) {
      throw new NotFoundException('Shortlink not found');
    }

    await this.prisma.shortlink.delete({
      where: { id: shortlinkId },
    });

    return { message: 'Shortlink deleted successfully' };
  }

  async getClicks(shortlinkId: string, userId: string) {
    const shortlink = await this.prisma.shortlink.findFirst({
      where: { id: shortlinkId, userId },
    });

    if (!shortlink) {
      throw new NotFoundException('Shortlink not found');
    }

    const clicks = await this.prisma.shortlinkClick.findMany({
      where: { shortlinkId },
      orderBy: { clickedAt: 'desc' },
      take: 100,
    });

    return {
      shortlink: {
        id: shortlink.id,
        slug: shortlink.slug,
        totalClicks: shortlink.totalClicks,
        clicksToday: shortlink.clicksToday,
      },
      clicks,
    };
  }

  // Public redirect handler
  async handleRedirect(slug: string, request: any) {
    const shortlink = await this.prisma.shortlink.findUnique({
      where: { slug },
      include: { domain: true },
    });

    if (!shortlink) {
      throw new NotFoundException('Shortlink not found');
    }

    // Record click
    await this.recordClick(shortlink.id, request);

    // Determine target URL based on routing rules
    const targetUrl = this.resolveTargetUrl(shortlink, request);

    return { redirectUrl: targetUrl };
  }

  private async recordClick(shortlinkId: string, request: any) {
    const ip = request.ip || request.headers['x-forwarded-for'];
    const userAgent = request.headers['user-agent'];

    await this.prisma.shortlinkClick.create({
      data: {
        shortlinkId,
        ip,
        userAgent,
        referrer: request.headers['referer'],
      },
    });

    // Update click counts
    await this.prisma.shortlink.update({
      where: { id: shortlinkId },
      data: {
        totalClicks: { increment: 1 },
        clicksToday: { increment: 1 },
      },
    });
  }

  private resolveTargetUrl(shortlink: any, request: any): string {
    const targetUrls = shortlink.targetUrls as any;

    // Check device routing
    const userAgent = request.headers['user-agent'] || '';
    const isMobile = /mobile|android|iphone/i.test(userAgent);

    if (targetUrls.device) {
      if (isMobile && targetUrls.device.mobile) {
        return targetUrls.device.mobile;
      }
      if (!isMobile && targetUrls.device.desktop) {
        return targetUrls.device.desktop;
      }
    }

    // Check country routing (would need GeoIP lookup)
    // For now, just return default

    return targetUrls.default;
  }
}
