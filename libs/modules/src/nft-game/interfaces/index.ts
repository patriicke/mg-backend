import { GameType } from '../entities/game.entity';
import { GameHistoryType } from '../enums';

export interface IGameHistory {
  historyType: GameHistoryType;
  gameType: GameType;
  userId: number;
  page?: number;
  limit?: number;
}
