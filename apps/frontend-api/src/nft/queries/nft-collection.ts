import { RankingEnum } from '../http/requests/nft-collection.request';

export class NftCollectionQuery {
  constructor(
    readonly filter: {
      readonly ranking?: RankingEnum;
      readonly cursor?: string;
      readonly pageSize?: number;
    }
  ) {}
}
