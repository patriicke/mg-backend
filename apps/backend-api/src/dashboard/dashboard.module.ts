import { Module } from '@nestjs/common';

import { DashboardService } from '../dashboard/dashboard.service';
import { DashboardController } from '../dashboard/dashboard.controller';
import { AuthModule } from '../auth/auth.module';
import { FrontendUserModule } from '../frontend-user/frontend-user.module';

@Module({
  imports: [AuthModule, FrontendUserModule],
  controllers: [DashboardController],
  providers: [DashboardService]
})
export class DashboardModule {}
