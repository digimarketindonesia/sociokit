import { Controller, Get, Param } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';

@Controller('subscriptions')
export class SubscriptionController {
  constructor(private subscriptionService: SubscriptionService) {}

  @Public()
  @Get('plans')
  async getPlans() {
    return this.subscriptionService.getPlans();
  }

  @Public()
  @Get('plans/:id')
  async getPlan(@Param('id') planId: string) {
    return this.subscriptionService.getPlan(planId);
  }

  @Get('me')
  async getMySubscription(@CurrentUser('id') userId: string) {
    return this.subscriptionService.getUserSubscription(userId);
  }

  @Get('me/all')
  async getMySubscriptions(@CurrentUser('id') userId: string) {
    return this.subscriptionService.getUserSubscriptions(userId);
  }

  @Get('me/status')
  async checkMyStatus(@CurrentUser('id') userId: string) {
    const hasActive = await this.subscriptionService.checkSubscriptionStatus(userId);
    return { hasActiveSubscription: hasActive };
  }
}
