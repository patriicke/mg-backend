import {
  BaseRepository,
  Pagination,
  PaginationInfoInterface
} from '@app/common-module';
import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { SearchLogsDto } from '../dto/search-logs.dto';
import { AdminActivityLog } from '../entities/admin-activity-log.entity';
import { AdminActivityLogSerializer } from '../serializer/admin-activity-log.serializer';

@Injectable()
export class AdminActivityLogRepository extends BaseRepository<
  AdminActivityLog,
  AdminActivityLogSerializer
> {
  constructor(private dataSource: DataSource) {
    super(AdminActivityLog, dataSource.createEntityManager());
  }
  async getPaginatedLogs(searchFilter: SearchLogsDto) {
    const queryBuilder = this.createQueryBuilder('logs');
    if (searchFilter.hasOwnProperty('keywords') && searchFilter.keywords) {
      queryBuilder.andWhere(`message ILIKE :keywords`, {
        keywords: `%${searchFilter.keywords}%`
      });
    }

    if (searchFilter.userId) {
      queryBuilder.andWhere('logs.userId = :userId', {
        userId: searchFilter.userId
      });
    }

    if (searchFilter.module) {
      queryBuilder.andWhere('logs.module = :module', {
        module: searchFilter.module
      });
    }

    if (searchFilter.dateFrom && searchFilter.dateTo) {
      queryBuilder.andWhere('logs."createdAt" >= :dateFrom', {
        dateFrom: searchFilter.dateFrom
      });
      queryBuilder.andWhere('logs."createdAt" <= :dateTo', {
        dateTo: searchFilter.dateTo
      });
    }

    const paginationInfo: PaginationInfoInterface =
      this.getPaginationInfo(searchFilter);

    const { page, skip, limit } = paginationInfo;
    const [results, total] = await queryBuilder
      .leftJoinAndSelect('logs.user', 'user')

      // used offset, limit instead of skip, take
      // because skip, take throws error when used with orderBy
      .offset(skip)
      .limit(limit)
      .orderBy('logs."createdAt"', 'DESC')
      .getManyAndCount();
    const serializedResult = results.map((result) => {
      return {
        ...result,
        user: result.user.firstName + ' ' + result.user.lastName
      };
    });
    return new Pagination<AdminActivityLogSerializer>({
      results: serializedResult,
      totalItems: total,
      pageSize: limit,
      currentPage: page,
      previous: page > 1 ? page - 1 : 0,
      next: total > skip + limit ? page + 1 : 0
    });
  }
}
