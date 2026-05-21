import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  Min,
} from 'class-validator';

export class CreateTripayPaymentDto {
  @IsString()
  @IsNotEmpty()
  planId: string;

  @IsString()
  @IsNotEmpty()
  channel: string; // Payment channel code (e.g., BRIVA, QRIS, etc.)
}

export class CreateXenditPaymentDto {
  @IsString()
  @IsNotEmpty()
  planId: string;
}

export class CreateManualPaymentDto {
  @IsString()
  @IsNotEmpty()
  planId: string;

  @IsString()
  @IsNotEmpty()
  bankAccountId: string;

  @IsString()
  @IsNotEmpty()
  proofImageUrl: string; // URL after upload
}

export class VerifyManualPaymentDto {
  @IsString()
  @IsNotEmpty()
  paymentId: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class TripayCallbackDto {
  @IsString()
  reference: string;

  @IsString()
  merchant_ref: string;

  @IsString()
  payment_method: string;

  @IsNumber()
  amount: number;

  @IsString()
  status: string;

  @IsOptional()
  paid_at?: number;
}

export class XenditCallbackDto {
  @IsString()
  id: string;

  @IsString()
  external_id: string;

  @IsString()
  status: string;

  @IsNumber()
  amount: number;

  @IsOptional()
  @IsString()
  paid_at?: string;
}
