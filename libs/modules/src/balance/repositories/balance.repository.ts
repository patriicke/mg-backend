import { DataSource } from 'typeorm';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import { BaseRepository } from '@app/common-module';

import { Injectable } from '@nestjs/common';
import { Balance, BalanceType } from '../entities/balance.entity';
import { BalanceSerializer } from '../serializers/balance.serializer';

@Injectable()
export class BalanceRepository extends BaseRepository<
  Balance,
  BalanceSerializer
> {
  constructor(private dataSource: DataSource) {
    super(Balance, dataSource.createEntityManager());
  }

  static transform(model: Balance, transformOption = {}): BalanceSerializer {
    return plainToInstance(
      BalanceSerializer,
      instanceToPlain(model, transformOption),
      transformOption
    );
  }

  static transformMany(
    models: Balance[],
    transformOption = {}
  ): BalanceSerializer[] {
    return models.map((model) => this.transform(model, transformOption));
  }

  depositBonusBalanceCount(userId: number) {
    return this.count({
      where: {
        type: BalanceType.DEPOSIT_BONUS,
        userId
      }
    });
  }
}
