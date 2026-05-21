import {
  Controller,
  Post,
  Body,
  Headers,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import { TripayService } from './tripay/tripay.service';
import { XenditService } from './xendit/xendit.service';
import { Public } from '../../common/decorators/public.decorator';

@Controller('webhooks')
export class WebhookController {
  constructor(
    private paymentService: PaymentService,
    private tripayService: TripayService,
    private xenditService: XenditService,
  ) {}

  @Public()
  @Post('tripay')
  @HttpCode(HttpStatus.OK)
  async handleTripayWebhook(
    @Body() body: any,
    @Headers('x-callback-signature') signature: string,
  ) {
    if (!signature) {
      throw new BadRequestException('Missing callback signature');
    }

    const isValid = this.tripayService.verifyCallbackSignature(signature, body);

    if (!isValid) {
      throw new BadRequestException('Invalid callback signature');
    }

    return this.paymentService.handleTripayCallback(body);
  }

  @Public()
  @Post('xendit')
  @HttpCode(HttpStatus.OK)
  async handleXenditWebhook(
    @Body() body: any,
    @Headers('x-callback-token') token: string,
  ) {
    if (!token) {
      throw new BadRequestException('Missing callback token');
    }

    const isValid = this.xenditService.verifyWebhookToken(token);

    if (!isValid) {
      throw new BadRequestException('Invalid callback token');
    }

    return this.paymentService.handleXenditCallback(body);
  }
}
