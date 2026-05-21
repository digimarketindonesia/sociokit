import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsObject,
  IsEnum,
  IsNumber,
  Min,
} from 'class-validator';

export class CreateDomainDto {
  @IsString()
  @IsNotEmpty()
  domain: string;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  sortOrder?: number;
}

export class UpdateDomainDto {
  @IsOptional()
  @IsString()
  domain?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  sortOrder?: number;
}

export enum ShortlinkType {
  FAKEURL = 'FAKEURL',
  CONTENT = 'CONTENT',
}

export class CreateShortlinkDto {
  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsString()
  domainId?: string;

  @IsOptional()
  @IsBoolean()
  useRandomDomain?: boolean;

  @IsNotEmpty()
  @IsObject()
  targetUrls: {
    default: string;
    country?: Record<string, string>;
    device?: {
      desktop?: string;
      mobile?: string;
    };
  };

  @IsEnum(ShortlinkType)
  type: ShortlinkType;

  @IsOptional()
  @IsString()
  fakeUrl?: string;

  @IsOptional()
  @IsObject()
  fakeContent?: {
    title?: string;
    description?: string;
    image?: string;
  };
}
