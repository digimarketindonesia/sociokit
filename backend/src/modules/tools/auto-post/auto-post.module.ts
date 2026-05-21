import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { AutoPostService } from './auto-post.service';
import { AutoPostController } from './auto-post.controller';
import { AutoPostProcessor } from './auto-post.processor';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'auto-post',
    }),
  ],
  controllers: [AutoPostController],
  providers: [AutoPostService, AutoPostProcessor],
  exports: [AutoPostService],
})
export class AutoPostModule {}
