import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { BullModule } from '@nestjs/bull';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { AdminModule } from './modules/admin/admin.module';
import { FacebookModule } from './modules/social/facebook/facebook.module';
import { AutoPostModule } from './modules/tools/auto-post/auto-post.module';
import { ShortlinkModule } from './modules/tools/shortlink/shortlink.module';
import { PaymentModule } from './modules/payment/payment.module';
import { SubscriptionModule } from './modules/subscription/subscription.module';
import { AffiliateModule } from './modules/affiliate/affiliate.module';
import { SettingsModule } from './modules/settings/settings.module';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [
    // Config
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Scheduler
    ScheduleModule.forRoot(),

    // Bull Queue (Redis)
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD || undefined,
      },
    }),

    // Database
    DatabaseModule,

    // Core modules
    AuthModule,
    UsersModule,
    AdminModule,

    // Social media
    FacebookModule,

    // Tools
    AutoPostModule,
    ShortlinkModule,

    // Payment & Subscription
    PaymentModule,
    SubscriptionModule,

    // Affiliate
    AffiliateModule,

    // Settings
    SettingsModule,
  ],
})
export class AppModule {}
