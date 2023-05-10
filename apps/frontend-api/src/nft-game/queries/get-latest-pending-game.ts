import { GameType } from '@app/modules/nft-game';
export class GetLatestPendingGameQuery {
  constructor(
    readonly userId: number,
    readonly gameType: GameType,
    readonly selectedColumns?: string[]
  ) {}
}
