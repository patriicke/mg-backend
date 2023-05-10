import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { NftService } from '@app/modules/nft';
import { NftFilterQuery } from './nft-filter';

@QueryHandler(NftFilterQuery)
export class NftFilterhandler implements IQueryHandler<NftFilterQuery> {
  constructor(private service: NftService) {}
  async execute(query: NftFilterQuery) {
    return this.service.getFilteredNft(query);
  }
}
