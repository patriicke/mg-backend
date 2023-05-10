import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { GameRepository } from '../repositories/game.repository';
import { GameEntity, GameType } from '../entities/game.entity';
import { IGameHistory } from '../interfaces';
import { Not, ObjectLiteral } from 'typeorm';
import { ChangeType, GameHistoryType, GameStatus } from '../enums';
import {
  GameSerializer,
  historyGroupsForSerializing,
  nftGameImageForSerializing,
  personalGroupsForSerializing
} from '../serializers/game.serializer';
import { CustomHttpException, roundOff } from '@app/common-module';
import { NftService } from '../../nft/services/nft.service';
import { BalanceType, Balance } from '@app/modules/balance';
@Injectable()
export class NftGameService {
  constructor(
    private repository: GameRepository,
    private nftService: NftService
  ) {}
  async generateServerSeed(): Promise<string> {
    const bytes = crypto.randomBytes(32);
    return crypto.createHash('blake2b512').update(bytes).digest('hex');
  }

  generateNonce(length = 16): string {
    const bytes = crypto.randomBytes(length);
    return bytes.toString('hex');
  }

  concat(serverSeed: string, clientSeed = '', nonce: string): string {
    return serverSeed + clientSeed + nonce;
  }

  hashString(string: string): string {
    const encoder = new TextEncoder();
    const hash = crypto
      .createHash('blake2b512')
      .update(encoder.encode(string))
      .digest('hex');
    return hash;
  }

  playGame(hashedValue: string, winProbability: number): boolean {
    // the offset of the interval
    let index = 0;
    // result variable
    let result: number;

    do {
      // get the decimal value from an interval of 5 hex letters
      result = parseInt(hashedValue.substring(index * 5, index * 5 + 5), 16);
      // increment the offset in case we will need to repeat the operation above
      index += 1;
      // if all the numbers were over 999999 and we reached the end of the string, we set that to a default value of 9999 (99 as a result)
      if (index * 5 + 5 > 129) {
        result = 9999;
        break;
      }
    } while (result >= 1.1e6);

    // adjust the winFraction based on the result to slightly increase the probability of the result being true
    const winFraction = winProbability / 100;
    const adjustment = (1 - result / 1e6) * 0.03; // subtract up to 3% based on the result
    const adjustedWinFraction = Math.max(0, winFraction - adjustment);

    // apply a power function to the adjustedWinFraction to increase the curve of the win probability distribution
    const power = 1.5; // increase this value to make it even harder to get a true result
    const adjustedWinProbability = Math.pow(adjustedWinFraction, power);

    // calculate the cutoff point for a win based on adjusted win probability
    const cutoff = Math.floor(1e6 * adjustedWinProbability);

    // determine if user won or not based on result
    return Math.floor(Math.random() * 1e6) < cutoff;
  }

  async getLatestPendingGame(
    userId: number,
    type: GameType,
    selectedColumns?: string[]
  ): Promise<GameEntity> {
    return this.repository.getLatestPendingGame(userId, type, selectedColumns);
  }

  async updateBalanceId(payload: { gameId: number; balanceId: number }) {
    return this.repository.update(payload.gameId, {
      balanceId: payload.balanceId
    });
  }

  async updatePendingGame(
    pendingGame: GameSerializer,
    gamePayload: Record<string, any>
  ) {
    const {
      betAmount,
      nftAddress,
      tokenId,
      changeType,
      winProbability,
      price,
      type
    } = gamePayload;
    let nftPrice = pendingGame.price;

    // FOR NFT-SLOT GAME LOGIC
    if (
      (pendingGame?.tokenId?.trim() !== tokenId?.trim() ||
        pendingGame?.nftAddress?.trim() !== nftAddress?.trim()) &&
      type === GameType.NFT_SLOT
    ) {
      const nftData = await this.nftService.getFloorPrice(nftAddress, tokenId);
      nftPrice = roundOff(nftData?.price, 2);
      gamePayload['price'] = nftPrice;
      gamePayload['contractName'] = nftData.collectionName;
    }

    // FOR CRYPTO-SLOT GAME LOGIC
    if (
      (pendingGame?.tokenId?.trim() !== tokenId?.trim() ||
        roundOff(pendingGame?.price, 2) !== roundOff(price, 2)) &&
      type === GameType.CRYPTO_SLOT
    ) {
      nftPrice = price;
    }

    this.checkBetAmount(gamePayload['betAmount'], nftPrice);

    if (changeType === ChangeType.BET_AMOUNT) {
      gamePayload['winProbability'] = this.calculateWinProbability(
        betAmount,
        nftPrice
      );

      if (gamePayload['winProbability'] > 100) {
        gamePayload['winProbability'] = 100;
      }
    }
    if (changeType === ChangeType.WIN_PROBABILITY) {
      gamePayload['betAmount'] = this.calculateBetAmount(
        winProbability,
        nftPrice
      );
    }
    delete gamePayload.changeType;
    delete gamePayload.clientSeed;
    delete gamePayload.name;
    delete gamePayload.symbol;

    return this.repository.updateEntity(pendingGame, gamePayload, [], {
      groups: ['basic']
    });
  }

  calculateWinProbability(betAmount: number, price: number): number {
    return roundOff((betAmount / price) * 100, 2);
  }

  calculateBetAmount(winProbability: number, price: number): number {
    return roundOff((winProbability / 100) * price, 2);
  }

  checkBetAmount(betAmount: number, price: number) {
    if (betAmount > price) {
      throw new CustomHttpException(
        'Bet amount cannot be greater than nft price',
        400
      );
    }
  }

  async getGameHistory(payload: IGameHistory) {
    let groups = historyGroupsForSerializing;
    const { historyType, userId, gameType, page, limit } = payload;
    const whereCondition: ObjectLiteral = {};
    whereCondition['status'] = Not('pending');
    whereCondition['type'] = gameType;

    if (historyType === GameHistoryType.PERSONAL) {
      groups = personalGroupsForSerializing;
      whereCondition.userId = userId;
    }
    if (gameType === GameType.CRYPTO_SLOT) {
      groups = [...groups, ...nftGameImageForSerializing];
    }
    return this.repository.getGameHistory(
      {
        page,
        limit
      },
      whereCondition,
      ['user'],
      {
        groups
      }
    );
  }

  async getWonNftGameImages(userId: number) {
    const data = await this.repository.getWonNftGameImages(userId);
    return this.repository.transformMany(data, {
      groups: nftGameImageForSerializing
    });
  }

  async updateBalanceDataAndGameData(payload: {
    amount: number;
    userId: number;
    gameId: number;
    state: GameStatus.WIN | GameStatus.LOST;
    queryRunner: any;
  }) {
    const { amount, userId, gameId, state, queryRunner } = payload;
    const balancePayload = {
      amount,
      userId,
      type: null
    };
    if (state == GameStatus.LOST) {
      balancePayload.amount = -amount;
      balancePayload.type = BalanceType.GAME_LOSS;
    }
    if (state == GameStatus.WIN) {
      balancePayload.type = BalanceType.GAME_WIN;
    }
    const balanceData = await queryRunner.manager.save(Balance, balancePayload);

    const gamePayload = {
      balanceId: balanceData.id,
      status: GameStatus.WIN
    };

    if (state == GameStatus.LOST) {
      gamePayload.status = GameStatus.LOST;
    }
    await queryRunner.manager.update(GameEntity, gameId, gamePayload);
  }
}
