import { IsEmail, IsString, MinLength, MaxLength, IsOptional } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(3)
  @MaxLength(30)
  username: string;

  @IsString()
  @MinLength(6)
  @MaxLength(100)
  password: string;

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  fullName: string;

  @IsOptional()
  @IsString()
  referralCode?: string;
}

export class LoginDto {
  @IsString()
  emailOrUsername: string;

  @IsString()
  @MinLength(6)
  password: string;
}

export class RefreshTokenDto {
  @IsString()
  refreshToken: string;
}
