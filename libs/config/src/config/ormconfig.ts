import { DataSourceOptions } from 'typeorm';
import config from 'config';
import { UserEntity } from '../../../../apps/backend-api/src/auth/entity/user.entity';
import { RoleEntity } from '../../../../apps/backend-api/src/role/entities/role.entity';
import { PermissionEntity } from '../../../../apps/backend-api/src/permission/entities/permission.entity';
import { DefaultProfileImage, FrontendUser } from '@app/modules/frontend-user';
import { FeRefreshToken } from '@app/modules/fe-refresh-token';
import { EmailTemplateEntity } from '@app/modules/email-template';
import { GameEntity } from '@app/modules/nft-game';
import { Transaction } from '@app/modules/transaction';
import { Balance } from '@app/modules/balance';
import { ReferralDepositTrack } from '@app/modules/referral-deposit-track';
import { NftEntity } from '@app/modules/nft';

const dbConfig = config.get('db');

const ormConfig: DataSourceOptions = {
  type: process.env.DB_TYPE || dbConfig.type,
  host: process.env.DB_HOST || dbConfig.host,
  port: process.env.DB_PORT || dbConfig.port,
  username: process.env.DB_USERNAME || dbConfig.username,
  password: process.env.DB_PASSWORD || dbConfig.password,
  database: process.env.DB_DATABASE_NAME || dbConfig.database,
  migrationsTransactionMode: 'each',
  entities: [
    __dirname + '/../../../../dist/apps/backend-api/**/*.entity.{js,ts}',
    UserEntity,
    RoleEntity,
    PermissionEntity,
    Transaction,
    FrontendUser,
    FeRefreshToken,
    EmailTemplateEntity,
    GameEntity,
    Balance,
    ReferralDepositTrack,
    DefaultProfileImage,
    NftEntity
  ],
  logging: false,
  synchronize: false,
  migrationsRun: process.env.NODE_ENV === 'test',
  dropSchema: process.env.NODE_ENV === 'test',
  migrationsTableName: 'migrations',
  migrations: [
    __dirname +
      '/../../../../dist/apps/backend-api/src/database/migrations/**/*{.ts,.js}'
  ]
};

export default ormConfig;
