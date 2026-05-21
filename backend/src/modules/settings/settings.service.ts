import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateSettingDto, UpdateSettingDto } from './dto/settings.dto';

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  async getAllSettings() {
    return this.prisma.systemSetting.findMany({
      orderBy: { key: 'asc' },
    });
  }

  async getSetting(key: string) {
    const setting = await this.prisma.systemSetting.findUnique({
      where: { key },
    });

    if (!setting) {
      throw new NotFoundException(`Setting with key "${key}" not found`);
    }

    return setting;
  }

  async createSetting(dto: CreateSettingDto) {
    return this.prisma.systemSetting.create({
      data: {
        key: dto.key,
        value: dto.value,
        description: dto.description,
      },
    });
  }

  async updateSetting(key: string, dto: UpdateSettingDto) {
    const setting = await this.prisma.systemSetting.findUnique({
      where: { key },
    });

    if (!setting) {
      throw new NotFoundException(`Setting with key "${key}" not found`);
    }

    return this.prisma.systemSetting.update({
      where: { key },
      data: dto,
    });
  }

  async deleteSetting(key: string) {
    const setting = await this.prisma.systemSetting.findUnique({
      where: { key },
    });

    if (!setting) {
      throw new NotFoundException(`Setting with key "${key}" not found`);
    }

    await this.prisma.systemSetting.delete({ where: { key } });

    return { message: 'Setting deleted successfully' };
  }

  async getSettingValue(key: string): Promise<any> {
    const setting = await this.prisma.systemSetting.findUnique({
      where: { key },
    });

    return setting?.value;
  }

  async setSettingValue(key: string, value: any) {
    const existing = await this.prisma.systemSetting.findUnique({
      where: { key },
    });

    if (existing) {
      return this.prisma.systemSetting.update({
        where: { key },
        data: { value },
      });
    } else {
      return this.prisma.systemSetting.create({
        data: { key, value },
      });
    }
  }
}
