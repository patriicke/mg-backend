import { BaseRepository } from '@app/common-module';
import { Injectable } from '@nestjs/common';
import { DataSource, ILike } from 'typeorm';

import { NftEntity } from '../entities/nft.entity';
import { NftSerializer } from '../serializer/nft-serializer';

@Injectable()
export class NftRepository extends BaseRepository<NftEntity, NftSerializer> {
  constructor(private dataSource: DataSource) {
    super(NftEntity, dataSource.createEntityManager());
  }

  getFilteredResults(keyword, filterCriteria) {
    const whereCondition = [];
    if (keyword) {
      for (const key of filterCriteria) {
        whereCondition.push({
          [key]: ILike(`%${keyword}%`)
        });
      }
    }
    return this.find({
      where: whereCondition,
      take: 10
    });
  }
}
