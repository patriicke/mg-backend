import { Module, CacheModule } from '@nestjs/common';
import { WinstonModule, WinstonModuleOptions } from 'nest-winston';
import { TypeOrmModule } from '@nestjs/typeorm';
import ormConfig from '@app/config/config/ormconfig';
import winstonConfig from '@app/config/config/winston';
import redisStore from 'cache-manager-redis-store';
import { ScheduleModule } from '@nestjs/schedule';

import config from 'config';

import { FrontendApiController } from './frontend-api.controller';
import { FrontendApiService } from './frontend-api.service';
import { FrontendUserModule } from './frontend-user/frontend-user.module';
import { AuthModule } from './auth/auth.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { throttleConfig } from '@app/config/config/throttle-config';
import { APP_GUARD } from '@nestjs/core';
import {
  CustomThrottlerGuard,
  ThrottlerBehindProxyGuard
} from '@app/common-module';
import { winstonTransports } from '@app/config';
import { DataSource } from 'typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { NftGameModule } from './nft-game/nft-game.module';
import { NftModule } from './nft/nft.module';
import { TransactionModule } from './transaction/transaction.module';
import { CronJobsModule } from '@app/modules/cron-jobs/cron-jobs.module';
import { ReferralBonusModule } from './referral-bonus/referral-bonus.module';
import { CryptoSlotModule } from './crypto-slots/crypto-slots.module';

const redisConfig = config.get('queue');
const winstonTransportConfig = winstonTransports('logs/frontend-api');
@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '../../../../', 'public'),
      exclude: ['/api*']
    }),
    CacheModule.registerAsync({
      useFactory: () => ({
        store: redisStore,
        host: process.env.REDIS_HOST || redisConfig.host,
        port: process.env.REDIS_PORT || redisConfig.port,
        password: process.env.REDIS_PASSWORD || redisConfig.password
      }),
      isGlobal: true
    }),
    WinstonModule.forRoot({
      ...winstonConfig,
      transports: [
        winstonTransportConfig.console,
        winstonTransportConfig.combinedFile,
        winstonTransportConfig.errorFile
      ],
      defaultMeta: { service: 'Backend-api' }
    } as WinstonModuleOptions),
    TypeOrmModule.forRootAsync({
      useFactory: () => new DataSource(ormConfig).options
    }),
    ThrottlerModule.forRootAsync({
      useFactory: () => throttleConfig
    }),
    ScheduleModule.forRoot(),
    FrontendUserModule,
    AuthModule,
    ReferralBonusModule,
    NftGameModule,
    NftModule,
    CryptoSlotModule,
    TransactionModule,
    CronJobsModule
  ],
  controllers: [FrontendApiController],
  exports: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: CustomThrottlerGuard
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerBehindProxyGuard
    },
    FrontendApiService
  ]
})
export class FrontendApiModule {}
