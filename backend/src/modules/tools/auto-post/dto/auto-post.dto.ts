import {
  IsString,
  IsOptional,
  IsArray,
  IsInt,
  IsDateString,
  IsBoolean,
  ValidateNested,
  Min,
  Max,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';

export class FanpageTargetDto {
  @IsString()
  fanpageId: string;

  @IsBoolean()
  shareToStory: boolean;
}

export class AccountTargetDto {
  @IsString()
  accountId: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  groups?: string[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FanpageTargetDto)
  @IsOptional()
  fanpages?: FanpageTargetDto[];
}

export class CreateAutoPostDto {
  @IsString()
  @IsOptional()
  content?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  mediaUrls?: string[];

  @IsString()
  @IsOptional()
  linkUrl?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AccountTargetDto)
  @ArrayMinSize(1, { message: 'At least one account target is required' })
  targetAccounts: AccountTargetDto[];

  @IsInt()
  @Min(1)
  @Max(10)
  @IsOptional()
  threadCount?: number;

  @IsInt()
  @Min(0)
  @Max(300)
  @IsOptional()
  delaySeconds?: number;

  @IsDateString()
  @IsOptional()
  scheduledAt?: string;
}

export class UpdateAutoPostDto {
  @IsString()
  @IsOptional()
  content?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  mediaUrls?: string[];

  @IsString()
  @IsOptional()
  linkUrl?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AccountTargetDto)
  @IsOptional()
  targetAccounts?: AccountTargetDto[];

  @IsInt()
  @Min(1)
  @Max(10)
  @IsOptional()
  threadCount?: number;

  @IsInt()
  @Min(0)
  @Max(300)
  @IsOptional()
  delaySeconds?: number;

  @IsDateString()
  @IsOptional()
  scheduledAt?: string;
}

export class GetPostsQueryDto {
  @IsOptional()
  @IsString()
  status?: string;

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
