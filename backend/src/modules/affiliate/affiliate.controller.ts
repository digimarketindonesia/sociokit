import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { AffiliateService } from './affiliate.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import {
  CreateWithdrawalDto,
  ProcessWithdrawalDto,
  UpdateAffiliateSettingsDto,
  GetEarningsQueryDto,
} from './dto/affiliate.dto';

@Controller('affiliate')
export class AffiliateController {
  constructor(private affiliateService: AffiliateService) {}

  @Get('info')
  async getAffiliateInfo(@CurrentUser('id') userId: string) {
    return this.affiliateService.getAffiliateInfo(userId);
  }

  @Get('earnings')
  async getEarnings(
    @CurrentUser('id') userId: string,
    @Query() query: GetEarningsQueryDto,
  ) {
    return this.affiliateService.getEarnings(userId, query);
  }

  @Post('withdrawals')
  async createWithdrawal(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateWithdrawalDto,
  ) {
    return this.affiliateService.createWithdrawal(userId, dto);
  }

  @Get('withdrawals')
  async getWithdrawals(@CurrentUser('id') userId: string) {
    return this.affiliateService.getWithdrawals(userId);
  }

  @Get('withdrawals/:id')
  async getWithdrawal(
    @CurrentUser('id') userId: string,
    @Param('id') withdrawalId: string,
  ) {
    return this.affiliateService.getWithdrawal(userId, withdrawalId);
  }

  // Admin endpoints
  @Get('admin/withdrawals')
  @Roles('ADMIN' as any)
  async getAllWithdrawals(@Query('status') status?: string) {
    return this.affiliateService.getAllWithdrawals(status);
  }

  @Put('admin/withdrawals/:id')
  @Roles('ADMIN' as any)
  async processWithdrawal(
    @CurrentUser('id') adminId: string,
    @Param('id') withdrawalId: string,
    @Body() dto: ProcessWithdrawalDto,
  ) {
    return this.affiliateService.processWithdrawal(adminId, withdrawalId, dto);
  }

  @Get('admin/settings')
  @Roles('ADMIN' as any)
  async getAffiliateSettings() {
    return this.affiliateService.getAffiliateSettings();
  }

  @Put('admin/settings')
  @Roles('ADMIN' as any)
  async updateAffiliateSettings(@Body() dto: UpdateAffiliateSettingsDto) {
    return this.affiliateService.updateAffiliateSettings(dto);
  }
}
