import { DeepPartial, DataSource, FindManyOptions } from 'typeorm';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import {
  BaseRepository,
  Pagination,
  PaginationInfoInterface,
  SearchFilterInterface
} from '@app/common-module';

import { GameEntity, GameType } from '../entities/game.entity';
import { GameSerializer } from '../serializers/game.serializer';
import { Injectable } from '@nestjs/common';
import { GameStatus } from '../enums';
@Injectable()
export class GameRepository extends BaseRepository<GameEntity, GameSerializer> {
  constructor(private dataSource: DataSource) {
    super(GameEntity, dataSource.createEntityManager());
  }

  transform(model: GameEntity, transformOption = {}): GameSerializer {
    return plainToInstance(
      GameSerializer,
      instanceToPlain(model, transformOption),
      transformOption
    );
  }

  transformMany(models: GameEntity[], transformOption = {}): GameSerializer[] {
    return models.map((model) => this.transform(model, transformOption));
  }

  async store(payload: DeepPartial<GameEntity>): Promise<GameEntity> {
    const game = this.create(payload);
    await game.save();
    return game;
  }

  async getNonce() {
    const startingNonce = 1122233;
    const gameData = await this.createQueryBuilder('game')
      .orderBy('game."createdAt"', 'DESC')
      .getOne();
    if (!gameData) {
      return startingNonce;
    } else {
      return gameData.nonce + 1;
    }
  }

  async getLatestPendingGame(
    userId: number,
    gameType: GameType,
    selectedColumns = []
  ) {
    return this.findOne({
      where: {
        userId,
        status: 'pending',
        type: gameType
      },
      select: selectedColumns,
      order: {
        createdAt: 'DESC'
      }
    });
  }

  async getGameHistory(
    searchFilter: DeepPartial<SearchFilterInterface>,
    whereCondition: Record<string, any> = {},
    relations = [],
    transformOptions = {}
  ) {
    const findOptions: FindManyOptions = {};

    const paginationInfo: PaginationInfoInterface =
      this.getPaginationInfo(searchFilter);
    findOptions.order = {
      createdAt: 'DESC'
    };
    findOptions.relations = relations;
    findOptions.skip = paginationInfo.skip;
    findOptions.take = paginationInfo.limit;

    if (Object.keys(whereCondition).length > 0)
      findOptions.where = whereCondition;

    const { page, skip, limit } = paginationInfo;
    const [results, total] = await this.findAndCount(findOptions);
    const serializedResult = this.transformMany(results, transformOptions);
    return new Pagination<GameSerializer>({
      results: serializedResult,
      totalItems: total,
      pageSize: limit,
      currentPage: page,
      previous: page > 1 ? page - 1 : 0,
      next: total > skip + limit ? page + 1 : 0
    });
  }

  getWonNftGameImages(userId: number): Promise<GameEntity[]> {
    return this.createQueryBuilder('game')
      .select(['game.nftImage', 'game.id', 'game.status'])
      .where('game."userId" = :userId', { userId })
      .andWhere('game.status != :status', { status: GameStatus.PENDING })
      .orderBy('game.createdAt', 'DESC')
      .getMany();
  }
}
