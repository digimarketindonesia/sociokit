import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UpdateProfileDto, ChangePasswordDto } from './dto/users.dto';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  async getMe(@CurrentUser('id') userId: string) {
    return this.usersService.findById(userId);
  }

  @Get('me/subscription')
  async getMySubscription(@CurrentUser('id') userId: string) {
    return this.usersService.getActiveSubscription(userId);
  }

  @Get('me/stats')
  async getMyStats(@CurrentUser('id') userId: string) {
    return this.usersService.getUserStats(userId);
  }

  @Put('me')
  async updateProfile(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(userId, dto);
  }

  @Put('me/password')
  async changePassword(
    @CurrentUser('id') userId: string,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.usersService.changePassword(
      userId,
      dto.currentPassword,
      dto.newPassword,
    );
  }
}
