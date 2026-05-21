import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ShortlinkService } from './shortlink.service';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Roles } from '../../../common/decorators/roles.decorator';
import { Public } from '../../../common/decorators/public.decorator';
import { CreateShortlinkDto, CreateDomainDto, UpdateDomainDto } from './dto/shortlink.dto';

@Controller('tools/shortlinks')
export class ShortlinkController {
  constructor(private shortlinkService: ShortlinkService) {}

  // Shortlink CRUD
  @Post()
  async create(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateShortlinkDto,
  ) {
    return this.shortlinkService.createShortlink(userId, dto);
  }

  @Get()
  async findAll(
    @CurrentUser('id') userId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.shortlinkService.getShortlinks(userId, +page, +limit);
  }

  @Get('domains')
  async getDomains() {
    return this.shortlinkService.getDomains();
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.shortlinkService.getShortlinkById(id, userId);
  }

  @Get(':id/clicks')
  async getClicks(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.shortlinkService.getClicks(id, userId);
  }

  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.shortlinkService.deleteShortlink(id, userId);
  }

  // Admin Domain Management
  @Post('domains')
  @Roles('ADMIN' as any)
  async createDomain(@Body() dto: CreateDomainDto) {
    return this.shortlinkService.createDomain(dto);
  }

  @Delete('domains/:id')
  @Roles('ADMIN' as any)
  async deleteDomain(@Param('id') id: string) {
    return this.shortlinkService.deleteDomain(id);
  }
}
