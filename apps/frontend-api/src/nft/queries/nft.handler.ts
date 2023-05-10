import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { NftService } from '@app/modules/nft';
import { NftQuery } from './nft';

@QueryHandler(NftQuery)
export class NftQueryHandler implements IQueryHandler<NftQuery> {
  constructor(private service: NftService) {}
  async execute(query: NftQuery) {
    const { slug, props } = query;
    return this.service.getAllNFTsWithPrices(slug, {
      limit: props.limit,
      page: props.page
    });
  }
}
