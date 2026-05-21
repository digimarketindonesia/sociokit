import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Headers,
  UseGuards,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import { TripayService } from './tripay/tripay.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import {
  CreateTripayPaymentDto,
  CreateXenditPaymentDto,
  CreateManualPaymentDto,
  VerifyManualPaymentDto,
} from './dto/payment.dto';

@Controller('payments')
export class PaymentController {
  constructor(
    private paymentService: PaymentService,
    private tripayService: TripayService,
  ) {}

  // Bank accounts (public - users need to see options)
  @Get('bank-accounts')
  async getBankAccounts() {
    return this.paymentService.getBankAccounts();
  }

  // Tripay
  @Get('tripay/channels')
  async getTripayChannels() {
    return this.tripayService.getChannels();
  }

  @Post('tripay')
  async createTripayPayment(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateTripayPaymentDto,
  ) {
    return this.paymentService.createTripayPayment(userId, dto.planId, dto.channel);
  }

  // Xendit
  @Post('xendit')
  async createXenditPayment(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateXenditPaymentDto,
  ) {
    return this.paymentService.createXenditPayment(userId, dto.planId);
  }

  // Manual Bank Transfer
  @Post('manual')
  async createManualPayment(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateManualPaymentDto,
  ) {
    return this.paymentService.createManualPayment(
      userId,
      dto.planId,
      dto.bankAccountId,
      dto.proofImageUrl,
    );
  }

  @Post('manual/verify')
  @Roles('ADMIN' as any)
  async verifyManualPayment(
    @CurrentUser('id') adminId: string,
    @Body() dto: VerifyManualPaymentDto & { approved: boolean },
  ) {
    return this.paymentService.verifyManualPayment(
      dto.paymentId,
      adminId,
      dto.approved,
    );
  }
}
