import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_FILTER, APP_GUARD, APP_PIPE } from '@nestjs/core';
import config from 'config';
import { ServeStaticModule } from '@nestjs/serve-static';
import path, { join } from 'path';
import {
  AcceptLanguageResolver,
  CookieResolver,
  HeaderResolver,
  I18nModule,
  QueryResolver
} from 'nestjs-i18n';
import { WinstonModule, WinstonModuleOptions } from 'nest-winston';
import {
  I18nExceptionFilterPipe,
  CustomValidationPipe,
  ThrottlerBehindProxyGuard,
  CustomThrottlerGuard
} from '@app/common-module';
import winstonConfig from '@app/config/config/winston';

import { AuthModule } from './auth/auth.module';
import { RolesModule } from './role/roles.module';
import { PermissionsModule } from './permission/permissions.module';
import { throttleConfig } from '@app/config/config/throttle-config';
import { MailModule } from './mail/mail.module';
import { EmailTemplateModule } from './email-template/email-template.module';
import { RefreshTokenModule } from './refresh-token/refresh-token.module';
import { TwofaModule } from './twofa/twofa.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { AppController } from './app.controller';
import { DataSourceModule } from './datasource/datasource.module';
import { FrontendUserModule } from './frontend-user/frontend-user.module';
import { CommonModule } from './common/common.module';
import { AdminActivityLogModule } from './admin-activity-logs/admin-activity-log.module';
import { winstonTransports } from '@app/config';
import { RequestContextModule, RequestUserContext } from '@app/request-context';
import { TransactionModule } from './transaction/transaction.module';

const appConfig = config.get('app');

const winstonTransportConfig = winstonTransports('logs/backend-api');
@Module({
  imports: [
    RequestContextModule.forRoot({
      contextClass: RequestUserContext,
      isGlobal: true
    }),
    ScheduleModule.forRoot(),
    WinstonModule.forRoot({
      ...winstonConfig,
      transports: [
        winstonTransportConfig.console,
        winstonTransportConfig.combinedFile,
        winstonTransportConfig.errorFile
      ],
      defaultMeta: { service: 'Backend-api' }
    } as WinstonModuleOptions),
    ThrottlerModule.forRootAsync({
      useFactory: () => throttleConfig
    }),
    DataSourceModule,
    I18nModule.forRoot({
      fallbackLanguage: appConfig.fallbackLanguage,
      loaderOptions: {
        path: path.join(__dirname, '/i18n/'),
        watch: true
      },
      resolvers: [
        { use: QueryResolver, options: ['lang'] },
        AcceptLanguageResolver,
        new HeaderResolver(['x-custom-lang']),
        new CookieResolver(['lang', 'locale', 'l'])
      ]
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      exclude: ['/api*']
    }),
    AuthModule,
    RolesModule,
    PermissionsModule,
    MailModule,
    EmailTemplateModule,
    RefreshTokenModule,
    TwofaModule,
    DashboardModule,
    FrontendUserModule,
    CommonModule,
    AdminActivityLogModule,
    TransactionModule
  ],
  providers: [
    {
      provide: APP_PIPE,
      useClass: CustomValidationPipe
    },
    {
      provide: APP_GUARD,
      useClass: CustomThrottlerGuard
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerBehindProxyGuard
    },
    {
      provide: APP_FILTER,
      useClass: I18nExceptionFilterPipe
    }
  ],
  controllers: [AppController]
})
export class AppModule {}
