import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AdminActivityLogRepository } from './repositories/admin-activity-log.repository';
import { AdminActivityLogService } from './services/admin-activity-log.service';
import { AdminActivityLog } from './entities/admin-activity-log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AdminActivityLog])],
  controllers: [],
  providers: [AdminActivityLogService, AdminActivityLogRepository],
  exports: [AdminActivityLogService]
})
export class AdminActivityLogModule {}
