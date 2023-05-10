import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppDataSource } from '../config/ormconfig';
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: () => AppDataSource.options
    })
  ]
})
export class DataSourceModule {}
