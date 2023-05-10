import { Inject, Injectable } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { AdminActivityLogRepository } from '../repositories/admin-activity-log.repository';
import { SearchLogsDto } from '../dto/search-logs.dto';
import { AdminActivityLog } from '../entities/admin-activity-log.entity';

@Injectable()
export class AdminActivityLogService {
  constructor(
    private readonly repository: AdminActivityLogRepository,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger
  ) {}

  getPaginatedLogs(filter: SearchLogsDto) {
    this.logger.info(`AdminActivityLog`, {
      context: 'AdminActivityLog',
      meta: {
        payload: {
          filter
        },
        type: 'get paginated logs'
      }
    });
    return this.repository.getPaginatedLogs(filter);
  }

  store(log: Partial<AdminActivityLog>) {
    return this.repository.save(log);
  }
}
