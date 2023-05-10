import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetLatestPendingGameQuery } from './get-latest-pending-game';
import { GameEntity, NftGameService } from '@app/modules/nft-game';

@QueryHandler(GetLatestPendingGameQuery)
export class GetLatestPendingGameHandler
  implements IQueryHandler<GetLatestPendingGameQuery>
{
  constructor(private service: NftGameService) {}
  async execute(query: GetLatestPendingGameQuery): Promise<GameEntity> {
    return this.service.getLatestPendingGame(
      query.userId,
      query.gameType,
      query.selectedColumns
    );
  }
}
