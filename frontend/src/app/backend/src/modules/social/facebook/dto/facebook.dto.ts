import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsObject } from 'class-validator';

export class AddFacebookAccountDto {
  @IsString()
  @IsNotEmpty()
  cookies: string;

  @IsString()
  @IsNotEmpty()
  accountName: string;

  @IsOptional()
  @IsBoolean()
  proxyEnabled?: boolean;

  @IsOptional()
  @IsObject()
  proxyConfig?: {
    host: string;
    port: number;
    username?: string;
    password?: string;
  };
}

export class UpdateFacebookAccountDto {
  @IsOptional()
  @IsString()
  accountName?: string;

  @IsOptional()
  @IsBoolean()
  proxyEnabled?: boolean;

  @IsOptional()
  @IsObject()
  proxyConfig?: {
    host: string;
    port: number;
    username?: string;
    password?: string;
  };
}
