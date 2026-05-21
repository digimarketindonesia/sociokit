import { Controller, Get, Param, Req, Res } from '@nestjs/common';
import { Public } from '../../../common/decorators/public.decorator';
import { ShortlinkService } from './shortlink.service';
import { Request, Response } from 'express';

@Controller('r')
export class RedirectController {
  constructor(private shortlinkService: ShortlinkService) {}

  @Public()
  @Get(':slug')
  async redirect(
    @Param('slug') slug: string,
    @Req() request: Request,
    @Res() response: Response,
  ) {
    try {
      const result = await this.shortlinkService.handleRedirect(slug, request);
      return response.redirect(302, result.redirectUrl);
    } catch (error) {
      return response.status(404).json({ message: 'Link not found' });
    }
  }
}
