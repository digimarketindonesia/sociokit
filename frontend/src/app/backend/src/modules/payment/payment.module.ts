import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { WebhookController } from './webhook.controller';
import { TripayService } from './tripay/tripay.service';
import { XenditService } from './xendit/xendit.service';

@Module({
  controllers: [PaymentController, WebhookController],
  providers: [PaymentService, TripayService, XenditService],
  exports: [PaymentService, TripayService, XenditService],
})
export class PaymentModule {}
