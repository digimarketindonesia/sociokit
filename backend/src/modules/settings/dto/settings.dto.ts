import { IsString, IsOptional, IsObject } from 'class-validator';

export class CreateSettingDto {
  @IsString()
  key: string;

  @IsObject()
  value: any;

  @IsString()
  @IsOptional()
  description?: string;
}

export class UpdateSettingDto {
  @IsObject()
  @IsOptional()
  value?: any;

  @IsString()
  @IsOptional()
  description?: string;
}
