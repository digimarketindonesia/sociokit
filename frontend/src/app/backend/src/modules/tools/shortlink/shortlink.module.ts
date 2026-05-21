import { Module } from '@nestjs/common';
import { ShortlinkService } from './shortlink.service';
import { ShortlinkController } from './shortlink.controller';
import { RedirectController } from './redirect.controller';

@Module({
  controllers: [ShortlinkController, RedirectController],
  providers: [ShortlinkService],
  exports: [ShortlinkService],
})
export class ShortlinkModule {}
