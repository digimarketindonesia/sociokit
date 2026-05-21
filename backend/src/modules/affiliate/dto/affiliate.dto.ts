import {
  IsString,
  IsInt,
  IsOptional,
  IsNumber,
  IsBoolean,
  Min,
  Max,
  MinLength,
} from 'class-validator';

export class CreateWithdrawalDto {
  @IsInt()
  @Min(1000)
  amount: number;

  @IsString()
  @MinLength(2)
  bankName: string;

  @IsString()
  @MinLength(5)
  accountNumber: string;

  @IsString()
  @MinLength(2)
  accountHolder: string;
}

export class ProcessWithdrawalDto {
  @IsString()
  status: 'APPROVED' | 'PAID' | 'REJECTED';

  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdateAffiliateSettingsDto {
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  commissionRate?: number;

  @IsInt()
  @Min(1000)
  @IsOptional()
  minWithdrawal?: number;

  @IsInt()
  @Min(1)
  @Max(365)
  @IsOptional()
  cookieDays?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class GetEarningsQueryDto {
  @IsOptional()
  @IsString()
  status?: 'PENDING' | 'AVAILABLE' | 'WITHDRAWN' | 'CANCELLED';

  @IsOptional()
  @IsInt()
  page?: number;

  @IsOptional()
  @IsInt()
  @Max(100)
  limit?: number;
}
