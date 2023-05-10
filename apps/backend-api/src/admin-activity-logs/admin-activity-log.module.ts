import { Module } from '@nestjs/common';
// import { Rabbitmq } from '@app/rabbitmq';
import { AdminActivityLogModule as ActivityLogModule } from '@app/modules/admin-activity-log';

import { AdminActivityLogController } from './admin-activity-log.controller';

@Module({
  imports: [ActivityLogModule],
  controllers: [AdminActivityLogController]
})
export class AdminActivityLogModule {}
