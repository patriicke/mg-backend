import { Injectable } from '@nestjs/common';
import { FrontendUserService } from '@app/modules/frontend-user';

import { UserStatusEnum } from '../auth/user-status.enum';
import { AuthService } from '../auth/auth.service';
import { UsersStatsInterface } from '../dashboard/interface/user-stats.interface';
import { BrowserStatsInterface } from '../dashboard/interface/browser-stats.interface';
import { OsStatsInterface } from '../dashboard/interface/os-stats.interface';

@Injectable()
export class DashboardService {
  constructor(
    private readonly authService: AuthService,
    private readonly frontendUserService: FrontendUserService
  ) {}

  async getDashboard(): Promise<any> {
    const totalUsers = await Promise.all([
      this.frontendUserService.findActiveFrontendUserCount()
    ]);
    return { totalUsers };
  }

  async getUserStat(): Promise<UsersStatsInterface> {
    const totalUserPromise = this.authService.countByCondition({});
    const totalActiveUserPromise = this.authService.countByCondition({
      status: UserStatusEnum.ACTIVE
    });
    const totalInActiveUserPromise = this.authService.countByCondition({
      status: UserStatusEnum.INACTIVE
    });
    const [total, active, inactive] = await Promise.all([
      totalUserPromise,
      totalActiveUserPromise,
      totalInActiveUserPromise
    ]);
    return {
      total,
      active,
      inactive
    };
  }

  getOsData(): Promise<Array<OsStatsInterface>> {
    return this.authService.getRefreshTokenGroupedData('os');
  }

  getBrowserData(): Promise<Array<BrowserStatsInterface>> {
    return this.authService.getRefreshTokenGroupedData('browser');
  }
}
