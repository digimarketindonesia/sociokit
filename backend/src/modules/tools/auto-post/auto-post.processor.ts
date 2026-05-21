import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { PrismaService } from '../../../database/prisma.service';
import { CryptoUtil } from '../../../common/utils/crypto.util';
import axios from 'axios';

interface PostJobData {
  postId: string;
}

interface AccountTargetData {
  accountId: string;
  groups?: string[];
  fanpages?: Array<{
    fanpageId: string;
    shareToStory: boolean;
  }>;
}

@Processor('auto-post')
export class AutoPostProcessor {
  private readonly logger = new Logger(AutoPostProcessor.name);

  constructor(private prisma: PrismaService) {}

  @Process('process-post')
  async handlePostProcessing(job: Job<PostJobData>) {
    const { postId } = job.data;

    this.logger.log(`Processing post ${postId}`);

    try {
      const post = await this.prisma.post.findUnique({
        where: { id: postId },
        include: {
          user: true,
        },
      });

      if (!post) {
        throw new Error('Post not found');
      }

      const targetAccounts = (post.targetAccounts as any) as AccountTargetData[];
      const threadCount = post.threadCount || 1;
      const delaySeconds = post.delaySeconds || 0;

      let completedTargets = 0;
      let failedTargets = 0;

      // Process each account
      for (const target of targetAccounts) {
        const account = await this.prisma.socialAccount.findUnique({
          where: { id: target.accountId },
          include: { fanpages: true },
        });

        if (!account || account.status !== 'ACTIVE') {
          this.logger.warn(`Account ${target.accountId} not found or inactive`);
          failedTargets += (target.groups?.length || 0) + (target.fanpages?.length || 0);
          continue;
        }

        // Decrypt cookies
        const cookies = CryptoUtil.decryptJson(account.encryptedCookies);

        // Post to groups
        if (target.groups && target.groups.length > 0) {
          for (const groupId of target.groups) {
            try {
              await this.postToGroup(
                groupId,
                post.content,
                post.linkUrl,
                post.mediaUrls,
                cookies,
              );
              completedTargets++;
              this.logger.log(`Posted to group ${groupId}`);
            } catch (error) {
              this.logger.error(`Failed to post to group ${groupId}: ${error.message}`);
              failedTargets++;
            }

            // Delay between posts
            if (delaySeconds > 0) {
              await this.sleep(delaySeconds * 1000);
            }
          }
        }

        // Post to fanpages
        if (target.fanpages && target.fanpages.length > 0) {
          for (const fanpage of target.fanpages) {
            try {
              const fanpageData = account.fanpages.find(
                (f) => f.fanpageId === fanpage.fanpageId,
              );

              if (!fanpageData) {
                throw new Error('Fanpage not found');
              }

              await this.postToFanpage(
                fanpageData.fanpageId,
                fanpageData.accessToken,
                post.content,
                post.linkUrl,
                post.mediaUrls,
              );

              // Share to story if enabled
              if (fanpage.shareToStory) {
                await this.shareToStory(
                  fanpageData.fanpageId,
                  fanpageData.accessToken,
                  post.linkUrl,
                );
              }

              completedTargets++;
              this.logger.log(`Posted to fanpage ${fanpage.fanpageId}`);
            } catch (error) {
              this.logger.error(
                `Failed to post to fanpage ${fanpage.fanpageId}: ${error.message}`,
              );
              failedTargets++;
            }

            // Delay between posts
            if (delaySeconds > 0) {
              await this.sleep(delaySeconds * 1000);
            }
          }
        }
      }

      // Update post status
      const finalStatus = failedTargets === 0 ? 'POSTED' : 'FAILED';
      await this.prisma.post.update({
        where: { id: postId },
        data: {
          status: finalStatus,
          completedTargets,
          failedTargets,
          completedAt: new Date(),
          errorMessage:
            failedTargets > 0
              ? `${failedTargets} targets failed out of ${post.totalTargets}`
              : null,
        },
      });

      this.logger.log(
        `Post ${postId} completed: ${completedTargets} succeeded, ${failedTargets} failed`,
      );
    } catch (error) {
      this.logger.error(`Post ${postId} processing failed: ${error.message}`);

      await this.prisma.post.update({
        where: { id: postId },
        data: {
          status: 'FAILED',
          errorMessage: error.message,
        },
      });

      throw error;
    }
  }

  private async postToGroup(
    groupId: string,
    content: string,
    linkUrl: string,
    mediaUrls: string[],
    cookies: any,
  ) {
    // Facebook Graph API post to group
    const url = `https://graph.facebook.com/v18.0/${groupId}/feed`;

    const params: any = {
      message: content || '',
    };

    if (linkUrl) {
      params.link = linkUrl;
    }

    // Note: For media uploads, you'd need to handle photo/video uploads separately
    // This is a simplified version

    const response = await axios.post(url, params, {
      headers: {
        Cookie: this.formatCookies(cookies),
      },
    });

    return response.data;
  }

  private async postToFanpage(
    fanpageId: string,
    accessToken: string,
    content: string,
    linkUrl: string,
    mediaUrls: string[],
  ) {
    const url = `https://graph.facebook.com/v18.0/${fanpageId}/feed`;

    const params: any = {
      message: content || '',
      access_token: accessToken,
    };

    if (linkUrl) {
      params.link = linkUrl;
    }

    const response = await axios.post(url, params);

    return response.data;
  }

  private async shareToStory(
    fanpageId: string,
    accessToken: string,
    linkUrl: string,
  ) {
    if (!linkUrl) {
      return;
    }

    const url = `https://graph.facebook.com/v18.0/${fanpageId}/photo`;

    const params = {
      url: linkUrl,
      published: true,
      access_token: accessToken,
    };

    const response = await axios.post(url, params);

    return response.data;
  }

  private formatCookies(cookies: any): string {
    return Object.entries(cookies)
      .map(([key, value]) => `${key}=${value}`)
      .join('; ');
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
