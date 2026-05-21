import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { PrismaService } from '../../../database/prisma.service';
import {
  CreateAutoPostDto,
  UpdateAutoPostDto,
  GetPostsQueryDto,
} from './dto/auto-post.dto';

@Injectable()
export class AutoPostService {
  constructor(
    private prisma: PrismaService,
    @InjectQueue('auto-post') private autoPostQueue: Queue,
  ) {}

  async createPost(userId: string, dto: CreateAutoPostDto) {
    // Validate accounts belong to user
    const accountIds = dto.targetAccounts.map((t) => t.accountId);
    const accounts = await this.prisma.socialAccount.findMany({
      where: {
        id: { in: accountIds },
        userId,
        platform: 'FACEBOOK',
        status: 'ACTIVE',
      },
      include: { fanpages: true },
    });

    if (accounts.length !== accountIds.length) {
      throw new BadRequestException('One or more accounts not found or inactive');
    }

    // Validate fanpage IDs exist in user's accounts
    for (const target of dto.targetAccounts) {
      if (target.fanpages && target.fanpages.length > 0) {
        const account = accounts.find((a) => a.id === target.accountId);
        const accountFanpageIds = account.fanpages.map((f) => f.fanpageId);

        for (const fp of target.fanpages) {
          if (!accountFanpageIds.includes(fp.fanpageId)) {
            throw new BadRequestException(
              `Fanpage ${fp.fanpageId} not found in account ${target.accountId}`,
            );
          }
        }
      }
    }

    // Calculate total targets (groups + fanpages)
    const totalTargets = dto.targetAccounts.reduce((sum, target) => {
      const groupCount = target.groups?.length || 0;
      const fanpageCount = target.fanpages?.length || 0;
      return sum + groupCount + fanpageCount;
    }, 0);

    if (totalTargets === 0) {
      throw new BadRequestException('No groups or fanpages selected');
    }

    // Create post
    const post = await this.prisma.post.create({
      data: {
        userId,
        type: 'AUTO_POST_GROUP',
        content: dto.content,
        mediaUrls: dto.mediaUrls || [],
        linkUrl: dto.linkUrl,
        targetAccounts: dto.targetAccounts as any,
        threadCount: dto.threadCount || 1,
        delaySeconds: dto.delaySeconds || 0,
        scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : null,
        status: dto.scheduledAt ? 'SCHEDULED' : 'DRAFT',
        totalTargets,
      },
    });

    return post;
  }

  async updatePost(userId: string, postId: string, dto: UpdateAutoPostDto) {
    const post = await this.prisma.post.findFirst({
      where: { id: postId, userId },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.status === 'PROCESSING' || post.status === 'POSTED') {
      throw new BadRequestException('Cannot update post that is processing or posted');
    }

    // If targetAccounts updated, recalculate totalTargets
    let totalTargets = post.totalTargets;
    if (dto.targetAccounts) {
      totalTargets = dto.targetAccounts.reduce((sum, target) => {
        const groupCount = target.groups?.length || 0;
        const fanpageCount = target.fanpages?.length || 0;
        return sum + groupCount + fanpageCount;
      }, 0);
    }

    const updated = await this.prisma.post.update({
      where: { id: postId },
      data: {
        content: dto.content,
        mediaUrls: dto.mediaUrls,
        linkUrl: dto.linkUrl,
        targetAccounts: dto.targetAccounts as any,
        threadCount: dto.threadCount,
        delaySeconds: dto.delaySeconds,
        scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : undefined,
        status: dto.scheduledAt ? 'SCHEDULED' : undefined,
        totalTargets,
      },
    });

    return updated;
  }

  async deletePost(userId: string, postId: string) {
    const post = await this.prisma.post.findFirst({
      where: { id: postId, userId },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.status === 'PROCESSING') {
      throw new BadRequestException('Cannot delete post that is currently processing');
    }

    await this.prisma.post.delete({ where: { id: postId } });

    return { message: 'Post deleted successfully' };
  }

  async getPost(userId: string, postId: string) {
    const post = await this.prisma.post.findFirst({
      where: { id: postId, userId },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    return post;
  }

  async getPosts(userId: string, query: GetPostsQueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = { userId };
    if (query.status) {
      where.status = query.status;
    }

    const [posts, total] = await Promise.all([
      this.prisma.post.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.post.count({ where }),
    ]);

    return {
      data: posts,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async startPost(userId: string, postId: string) {
    const post = await this.prisma.post.findFirst({
      where: { id: postId, userId },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.status !== 'DRAFT' && post.status !== 'SCHEDULED') {
      throw new BadRequestException('Post must be in DRAFT or SCHEDULED status');
    }

    // Update status to PROCESSING
    await this.prisma.post.update({
      where: { id: postId },
      data: { status: 'PROCESSING' },
    });

    // Add to queue
    await this.autoPostQueue.add('process-post', { postId }, { delay: 0 });

    return { message: 'Post queued for processing' };
  }

  async updatePostProgress(
    postId: string,
    completed: number,
    failed: number,
    status?: string,
    errorMessage?: string,
  ) {
    const data: any = {
      completedTargets: completed,
      failedTargets: failed,
    };

    if (status) {
      data.status = status;
    }

    if (status === 'POSTED') {
      data.completedAt = new Date();
    }

    if (errorMessage) {
      data.errorMessage = errorMessage;
    }

    return this.prisma.post.update({
      where: { id: postId },
      data,
    });
  }
}
