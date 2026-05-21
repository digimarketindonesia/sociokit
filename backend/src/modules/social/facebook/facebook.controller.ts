import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { FacebookService } from './facebook.service';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { AddFacebookAccountDto, UpdateFacebookAccountDto } from './dto/facebook.dto';

@Controller('social/facebook')
export class FacebookController {
  constructor(private facebookService: FacebookService) {}

  @Post('accounts')
  async addAccount(
    @CurrentUser('id') userId: string,
    @Body() dto: AddFacebookAccountDto,
  ) {
    return this.facebookService.addAccount(userId, dto);
  }

  @Get('accounts')
  async getAccounts(@CurrentUser('id') userId: string) {
    return this.facebookService.getAccounts(userId);
  }

  @Get('accounts/:id')
  async getAccount(
    @Param('id') accountId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.facebookService.getAccountById(accountId);
  }

  @Put('accounts/:id')
  async updateAccount(
    @Param('id') accountId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateFacebookAccountDto,
  ) {
    return this.facebookService.updateAccount(accountId, userId, dto);
  }

  @Delete('accounts/:id')
  async deleteAccount(
    @Param('id') accountId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.facebookService.deleteAccount(accountId, userId);
  }

  @Get('accounts/:id/fanpages')
  async getFanpages(
    @Param('id') accountId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.facebookService.getFanpages(accountId, userId);
  }

  @Post('accounts/:id/fanpages/refresh')
  async refreshFanpages(
    @Param('id') accountId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.facebookService.refreshFanpages(accountId, userId);
  }

  @Get('accounts/:id/groups')
  async getGroups(
    @Param('id') accountId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.facebookService.getGroups(accountId, userId);
  }
}
