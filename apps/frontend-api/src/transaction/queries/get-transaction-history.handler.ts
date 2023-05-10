import { IQueryHandler, QueryBus, QueryHandler } from '@nestjs/cqrs';
import {
  TransactionSerializer,
  TransactionService
} from '@app/modules/transaction';
import { GetTransactionHistoryQuery } from './get-transaction-history';
import { Pagination } from 'libs/common-module/paginate/pagination';

@QueryHandler(GetTransactionHistoryQuery)
export class GetTransactionHistoryHandler
  implements IQueryHandler<GetTransactionHistoryQuery>
{
  constructor(
    readonly queryBus: QueryBus,
    private readonly service: TransactionService
  ) {}

  async execute(
    query: GetTransactionHistoryQuery
  ): Promise<Pagination<TransactionSerializer>> {
    query.params['userId'] = query.userId;
    return this.service.getfilteredTransactions(
      query.params,
      {
        groups: ['basic']
      },
      ['balancesOnlyBonus']
    );
  }
}
