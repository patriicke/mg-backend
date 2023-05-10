import { IQueryHandler, QueryBus, QueryHandler } from '@nestjs/cqrs';
import { GetTransactionById } from './get-transaction-by-id';
import { TransactionResult } from '../query-results/transaction.result';
import { TransactionService } from '@app/modules/transaction';

@QueryHandler(GetTransactionById)
export class GetTransactionByIdHandler
  implements IQueryHandler<GetTransactionById>
{
  constructor(
    readonly queryBus: QueryBus,
    private readonly service: TransactionService
  ) {}

  async execute(query: GetTransactionById): Promise<TransactionResult> {
    return this.service.getById(query.id);
  }
}
