import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { JwtTwoFactorGuard } from '../../../../apps/backend-api/src/common/guard/jwt-two-factor.guard';
import { PermissionGuard } from '../../../../apps/backend-api/src/common/guard/permission.guard';
import {
  AdminActivityLogService,
  SearchLogsDto
} from '@app/modules/admin-activity-log';

@ApiTags('admin-activity-logs')
@Controller('admin-activity-logs')
@UseGuards(JwtTwoFactorGuard, PermissionGuard)
export class AdminActivityLogController {
  constructor(private readonly service: AdminActivityLogService) {}

  @Get()
  getLogs(@Query() filter: SearchLogsDto) {
    return this.service.getPaginatedLogs(filter);
  }
}
