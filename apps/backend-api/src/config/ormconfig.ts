import { DataSource, DataSourceOptions } from 'typeorm';
import config from 'config';

import { AdminActivityLog } from '@app/modules/admin-activity-log';
import { DefaultProfileImage, FrontendUser } from '@app/modules/frontend-user';
import { FeRefreshToken } from '@app/modules/fe-refresh-token';
import { EmailTemplateEntity } from '@app/modules/email-template';
import { Transaction } from '@app/modules/transaction';
import { Balance } from '@app/modules/balance';

const dbConfig = config.get('db');
export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || dbConfig.host,
  port: process.env.DB_PORT || dbConfig.port,
  username: process.env.DB_USERNAME || dbConfig.username,
  password: process.env.DB_PASSWORD || dbConfig.password,
  database: process.env.DB_DATABASE_NAME || dbConfig.database,
  migrationsTransactionMode: 'each',
  entities: [
    __dirname + '/../../**/*.entity.{js,ts}',
    AdminActivityLog,
    Transaction,
    Balance,
    FrontendUser,
    DefaultProfileImage,
    FeRefreshToken,
    EmailTemplateEntity
  ],
  logging: false,
  synchronize: false,
  migrationsRun: process.env.NODE_ENV === 'test',
  dropSchema: process.env.NODE_ENV === 'test',
  migrationsTableName: 'migrations',
  migrations: [__dirname + '/../database/migrations/**/*{.ts,.js}']
};
export const AppDataSource = new DataSource(dataSourceOptions);
