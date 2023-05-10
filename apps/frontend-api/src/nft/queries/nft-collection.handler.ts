import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { NftCollectionQuery } from './nft-collection';
import { NftService } from '@app/modules/nft';

@QueryHandler(NftCollectionQuery)
export class NftCollectionQueryHandler
  implements IQueryHandler<NftCollectionQuery>
{
  constructor(private service: NftService) {}
  async execute(query: NftCollectionQuery) {
    const { filter } = query;
    return this.service.getPopularNFTCollections(filter);
  }
}
