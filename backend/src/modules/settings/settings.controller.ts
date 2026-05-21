import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { SettingsService } from './settings.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { CreateSettingDto, UpdateSettingDto } from './dto/settings.dto';

@Controller('settings')
@Roles('ADMIN' as any)
export class SettingsController {
  constructor(private settingsService: SettingsService) {}

  @Get()
  async getAllSettings() {
    return this.settingsService.getAllSettings();
  }

  @Get(':key')
  async getSetting(@Param('key') key: string) {
    return this.settingsService.getSetting(key);
  }

  @Post()
  async createSetting(@Body() dto: CreateSettingDto) {
    return this.settingsService.createSetting(dto);
  }

  @Put(':key')
  async updateSetting(
    @Param('key') key: string,
    @Body() dto: UpdateSettingDto,
  ) {
    return this.settingsService.updateSetting(key, dto);
  }

  @Delete(':key')
  async deleteSetting(@Param('key') key: string) {
    return this.settingsService.deleteSetting(key);
  }
}
