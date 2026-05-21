import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AdminService } from './admin.service';
import { AdminPlanService, AdminBankService } from './admin-plan-bank.service';
import { AdminStatsService } from './admin-stats.service';
import {
  GetUsersQueryDto,
  UpdateUserDto,
  CreatePlanDto,
  UpdatePlanDto,
  CreateBankAccountDto,
  UpdateBankAccountDto,
  GetPaymentsQueryDto,
} from './dto/admin.dto';

@Controller('admin')
@Roles('ADMIN' as any)
export class AdminController {
  constructor(
    private adminService: AdminService,
    private adminPlanService: AdminPlanService,
    private adminBankService: AdminBankService,
    private adminStatsService: AdminStatsService,
  ) {}

  // Dashboard Stats
  @Get('stats/dashboard')
  async getDashboardStats() {
    return this.adminStatsService.getDashboardStats();
  }

  @Get('stats/revenue-by-method')
  async getRevenueByMethod() {
    return this.adminStatsService.getRevenueByMethod();
  }

  @Get('stats/user-growth')
  async getUserGrowth() {
    return this.adminStatsService.getUserGrowth();
  }

  // User Management
  @Get('users')
  async getUsers(@Query() query: GetUsersQueryDto) {
    return this.adminService.getUsers(query);
  }

  @Get('users/:id')
  async getUser(@Param('id') userId: string) {
    return this.adminService.getUser(userId);
  }

  @Put('users/:id')
  async updateUser(@Param('id') userId: string, @Body() dto: UpdateUserDto) {
    return this.adminService.updateUser(userId, dto);
  }

  @Delete('users/:id')
  async deleteUser(@Param('id') userId: string) {
    return this.adminService.deleteUser(userId);
  }

  // Payment Management
  @Get('payments')
  async getPayments(@Query() query: GetPaymentsQueryDto) {
    return this.adminService.getPayments(query);
  }

  @Get('payments/:id')
  async getPayment(@Param('id') paymentId: string) {
    return this.adminService.getPayment(paymentId);
  }

  // Plan Management
  @Get('plans')
  async getPlans() {
    return this.adminPlanService.getPlans();
  }

  @Get('plans/:id')
  async getPlan(@Param('id') planId: string) {
    return this.adminPlanService.getPlan(planId);
  }

  @Post('plans')
  async createPlan(@Body() dto: CreatePlanDto) {
    return this.adminPlanService.createPlan(dto);
  }

  @Put('plans/:id')
  async updatePlan(@Param('id') planId: string, @Body() dto: UpdatePlanDto) {
    return this.adminPlanService.updatePlan(planId, dto);
  }

  @Delete('plans/:id')
  async deletePlan(@Param('id') planId: string) {
    return this.adminPlanService.deletePlan(planId);
  }

  // Bank Account Management
  @Get('bank-accounts')
  async getBankAccounts() {
    return this.adminBankService.getBankAccounts();
  }

  @Get('bank-accounts/:id')
  async getBankAccount(@Param('id') bankAccountId: string) {
    return this.adminBankService.getBankAccount(bankAccountId);
  }

  @Post('bank-accounts')
  async createBankAccount(@Body() dto: CreateBankAccountDto) {
    return this.adminBankService.createBankAccount(dto);
  }

  @Put('bank-accounts/:id')
  async updateBankAccount(
    @Param('id') bankAccountId: string,
    @Body() dto: UpdateBankAccountDto,
  ) {
    return this.adminBankService.updateBankAccount(bankAccountId, dto);
  }

  @Delete('bank-accounts/:id')
  async deleteBankAccount(@Param('id') bankAccountId: string) {
    return this.adminBankService.deleteBankAccount(bankAccountId);
  }
}
