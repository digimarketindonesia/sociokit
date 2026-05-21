import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../database/prisma.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import { CryptoUtil } from '../../common/utils/crypto.util';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, username, password, fullName, referralCode } = registerDto;

    // Check if email exists
    const existingEmail = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingEmail) {
      throw new ConflictException('Email already exists');
    }

    // Check if username exists
    const existingUsername = await this.prisma.user.findUnique({
      where: { username },
    });

    if (existingUsername) {
      throw new ConflictException('Username already exists');
    }

    // Validate referral code if provided
    let referredBy = null;
    if (referralCode) {
      referredBy = await this.prisma.user.findUnique({
        where: { affiliateCode: referralCode },
      });

      if (!referredBy) {
        throw new BadRequestException('Invalid referral code');
      }
    }

    // Hash password
    const passwordHash = await this.hashPassword(password);

    // Generate unique affiliate code
    let affiliateCode = CryptoUtil.generateAffiliateCode();
    let isUnique = false;

    while (!isUnique) {
      const existing = await this.prisma.user.findUnique({
        where: { affiliateCode },
      });

      if (!existing) {
        isUnique = true;
      } else {
        affiliateCode = CryptoUtil.generateAffiliateCode();
      }
    }

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email,
        username,
        passwordHash,
        fullName,
        affiliateCode,
        referredById: referredBy?.id,
      },
      select: {
        id: true,
        email: true,
        username: true,
        fullName: true,
        role: true,
        affiliateCode: true,
        createdAt: true,
      },
    });

    // Generate tokens
    const tokens = await this.generateTokens(user);

    return {
      user,
      ...tokens,
    };
  }

  async login(loginDto: LoginDto) {
    const { emailOrUsername, password } = loginDto;

    // Find user by email or username
    const user = await this.findByEmailOrUsername(emailOrUsername);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await this.comparePassword(
      password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate tokens
    const tokens = await this.generateTokens(user);

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        fullName: user.fullName,
        role: user.role,
        affiliateCode: user.affiliateCode,
      },
      ...tokens,
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        select: {
          id: true,
          email: true,
          username: true,
          fullName: true,
          role: true,
          affiliateCode: true,
        },
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      const tokens = await this.generateTokens(user);

      return tokens;
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async validateUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        fullName: true,
        role: true,
        emailVerified: true,
        affiliateCode: true,
      },
    });

    return user;
  }

  private async findByEmailOrUsername(emailOrUsername: string) {
    return this.prisma.user.findFirst({
      where: {
        OR: [{ email: emailOrUsername }, { username: emailOrUsername }],
      },
    });
  }

  private async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }

  private async comparePassword(
    password: string,
    hash: string,
  ): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  private async generateTokens(user: any) {
    const payload = {
      sub: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: this.configService.get<string>('JWT_EXPIRES_IN'),
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN'),
    });

    return {
      accessToken,
      refreshToken,
    };
  }
}
