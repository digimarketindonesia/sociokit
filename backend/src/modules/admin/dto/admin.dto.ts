import {
  IsString,
  IsEmail,
  IsOptional,
  IsInt,
  IsBoolean,
  IsEnum,
  Min,
  Max,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class GetUsersQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(['USER', 'ADMIN'])
  role?: string;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(1)
  page?: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(1)
  @Max(100)
  limit?: number;
}

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  fullName?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsEnum(['USER', 'ADMIN'])
  @IsOptional()
  role?: string;

  @IsBoolean()
  @IsOptional()
  emailVerified?: boolean;
}

export class CreatePlanDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsInt()
  @Min(1)
  durationMonths: number;

  @IsInt()
  @Min(1000)
  price: number;

  @IsOptional()
  features?: string[];

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsInt()
  @IsOptional()
  sortOrder?: number;
}

export class UpdatePlanDto {
  @IsString()
  @MinLength(2)
  @IsOptional()
  name?: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  durationMonths?: number;

  @IsInt()
  @Min(1000)
  @IsOptional()
  price?: number;

  @IsOptional()
  features?: string[];

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsInt()
  @IsOptional()
  sortOrder?: number;
}

export class CreateBankAccountDto {
  @IsString()
  @MinLength(2)
  bankName: string;

  @IsString()
  @MinLength(5)
  accountNumber: string;

  @IsString()
  @MinLength(2)
  accountHolder: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsInt()
  @IsOptional()
  sortOrder?: number;
}

export class UpdateBankAccountDto {
  @IsString()
  @MinLength(2)
  @IsOptional()
  bankName?: string;

  @IsString()
  @MinLength(5)
  @IsOptional()
  accountNumber?: string;

  @IsString()
  @MinLength(2)
  @IsOptional()
  accountHolder?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsInt()
  @IsOptional()
  sortOrder?: number;
}

export class GetPaymentsQueryDto {
  @IsOptional()
  @IsEnum(['PENDING', 'PAID', 'FAILED', 'EXPIRED', 'REFUNDED'])
  status?: string;

  @IsOptional()
  @IsEnum(['TRIPAY', 'XENDIT', 'MANUAL_BANK'])
  method?: string;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(1)
  page?: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(1)
  @Max(100)
  limit?: number;
}
