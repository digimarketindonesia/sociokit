import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { AutoPostService } from './auto-post.service';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import {
  CreateAutoPostDto,
  UpdateAutoPostDto,
  GetPostsQueryDto,
} from './dto/auto-post.dto';

@Controller('tools/auto-post')
export class AutoPostController {
  constructor(private autoPostService: AutoPostService) {}

  @Post()
  async createPost(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateAutoPostDto,
  ) {
    return this.autoPostService.createPost(userId, dto);
  }

  @Get()
  async getPosts(
    @CurrentUser('id') userId: string,
    @Query() query: GetPostsQueryDto,
  ) {
    return this.autoPostService.getPosts(userId, query);
  }

  @Get(':id')
  async getPost(@CurrentUser('id') userId: string, @Param('id') postId: string) {
    return this.autoPostService.getPost(userId, postId);
  }

  @Put(':id')
  async updatePost(
    @CurrentUser('id') userId: string,
    @Param('id') postId: string,
    @Body() dto: UpdateAutoPostDto,
  ) {
    return this.autoPostService.updatePost(userId, postId, dto);
  }

  @Delete(':id')
  async deletePost(
    @CurrentUser('id') userId: string,
    @Param('id') postId: string,
  ) {
    return this.autoPostService.deletePost(userId, postId);
  }

  @Post(':id/start')
  async startPost(@CurrentUser('id') userId: string, @Param('id') postId: string) {
    return this.autoPostService.startPost(userId, postId);
  }
}
