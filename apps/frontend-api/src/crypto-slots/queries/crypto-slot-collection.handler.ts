import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { CryptoSlotCollectionQuery } from './crypto-slot-collection';
import { CryptoSlotService } from '@app/modules/crypto-slots';

@QueryHandler(CryptoSlotCollectionQuery)
export class CryptoSlotCollectionQueryHandler
  implements IQueryHandler<CryptoSlotCollectionQuery>
{
  constructor(private service: CryptoSlotService) {}
  async execute() {
    return this.service.getCollections();
  }
}
