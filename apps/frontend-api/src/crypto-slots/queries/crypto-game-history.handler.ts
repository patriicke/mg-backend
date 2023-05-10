import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { CryptoGameHistory } from './crypto-game-history';
import { NftGameService } from '@app/modules/nft-game';

@QueryHandler(CryptoGameHistory)
export class CryptoGameHistoryHandler
  implements IQueryHandler<CryptoGameHistory>
{
  constructor(private service: NftGameService) {}

  async execute(query: CryptoGameHistory) {
    const { historyType, userId, gameType, page, limit } = query;
    return this.service.getGameHistory({
      historyType,
      userId,
      gameType,
      page,
      limit
    });
  }
}
