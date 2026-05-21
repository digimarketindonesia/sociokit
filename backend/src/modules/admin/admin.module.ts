import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminPlanService, AdminBankService } from './admin-plan-bank.service';
import { AdminStatsService } from './admin-stats.service';
import { AdminController } from './admin.controller';

@Module({
  controllers: [AdminController],
  providers: [AdminService, AdminPlanService, AdminBankService, AdminStatsService],
  exports: [AdminService, AdminPlanService, AdminBankService, AdminStatsService],
})
export class AdminModule {}
