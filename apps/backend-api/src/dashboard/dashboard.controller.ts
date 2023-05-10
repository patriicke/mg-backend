import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { JwtTwoFactorGuard } from '../common/guard/jwt-two-factor.guard';
import { DashboardService } from '../dashboard/dashboard.service';
import { OsStatsInterface } from '../dashboard/interface/os-stats.interface';
import { UsersStatsInterface } from '../dashboard/interface/user-stats.interface';
import { BrowserStatsInterface } from '../dashboard/interface/browser-stats.interface';

@ApiTags('dashboard')
@UseGuards(JwtTwoFactorGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  async getDashboard(): Promise<any> {
    return this.dashboardService.getDashboard();
  }

  @Get('/users')
  userStat(): Promise<UsersStatsInterface> {
    return this.dashboardService.getUserStat();
  }

  @Get('/os')
  osStat(): Promise<Array<OsStatsInterface>> {
    return this.dashboardService.getOsData();
  }

  @Get('/browser')
  browserStat(): Promise<Array<BrowserStatsInterface>> {
    return this.dashboardService.getBrowserData();
  }
}
