import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetGameHistoryQuery } from './get-game-history';
import { NftGameService } from '@app/modules/nft-game';

@QueryHandler(GetGameHistoryQuery)
export class GetGameHistoryQueryHandler
  implements IQueryHandler<GetGameHistoryQuery>
{
  constructor(private service: NftGameService) {}

  async execute(query: GetGameHistoryQuery) {
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
