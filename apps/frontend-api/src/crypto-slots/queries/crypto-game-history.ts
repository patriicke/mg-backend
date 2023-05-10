import { GameHistoryType, GameType } from '@app/modules/nft-game';

export class CryptoGameHistory {
  constructor(
    readonly historyType: GameHistoryType,
    readonly gameType: GameType,
    readonly page?: number,
    readonly limit?: number,
    readonly userId?: number
  ) {}
}
