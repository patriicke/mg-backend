import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';
import { HttpModule } from '@nestjs/axios';

import { FindFrontendUserInfoHandler } from './queries/find-frontend-user-info.handler';
import {
  FrontendUser,
  FrontendUserRepository,
  FrontendUserService
} from '@app/modules/frontend-user';
import { ExcelService } from '@app/modules/excel';
import Redis from 'ioredis';
import { RateLimiterRedis } from 'rate-limiter-flexible';
import config from 'config';

import { AuthModule } from '../auth/auth.module';
import { FrontendUserController } from './http/controllers/frontend-user.controller';
import { UpdateUserAuthorizedHandler } from './commands/update-user-authorized.handler';
import { UpdateEmailVerifiedHandler } from './commands/update-email-verified.handler';
import { RegisterFrontendUserHandler } from './commands/register-frontend-user.handler';
import { RequestPasswordResetHandler } from './commands/request-password-reset.handler';
import { UpdateUserProfileHandler } from './commands/update-user-profile.handler';
import { DeleteAccountHandler } from './commands/delete-account.handler';
import { LoginFrontendUserHandler } from './commands/login-frontend-user.handler';
import { FeRefreshTokenHandler } from './commands/refresh-token-fe.handler';
import { FeLogoutHandler } from './commands/logout-fe.handler';
import { BullQueueModule } from '@app/bull-queue-lib';
import { GetIdentifierHandler } from './commands/get-identifier.handler';
import { VerifySignedMessageHandler } from './commands/verify-signature-message.handler';
import { GoogleLoginFrontendUserHandler } from './commands/login-with-google.handler';
import { DefaultProfileImagesHandler } from './queries/get-default-profile-images.handler';

const redisConfig = config.get('queue');
const THROTTLE_KEY_PREFIX = 'try_limit';
const tryLimitFactory = {
  provide: 'TRY_LIMIT_FACTORY',
  useFactory: () => {
    const redisClient = new Redis({
      enableOfflineQueue: false,
      host: process.env.REDIS_HOST || redisConfig.host,
      port: process.env.REDIS_PORT || redisConfig.port,
      password: process.env.REDIS_PASSWORD || redisConfig.password
    });

    return new RateLimiterRedis({
      storeClient: redisClient,
      keyPrefix: THROTTLE_KEY_PREFIX,
      points: 1,
      duration: 20, // Store number for 30 days since first fail
      blockDuration: 20
    });
  }
};
@Module({
  imports: [
    AuthModule,
    CqrsModule,
    HttpModule,
    BullQueueModule,
    TypeOrmModule.forFeature([FrontendUser])
  ],
  controllers: [FrontendUserController],
  providers: [
    FrontendUserRepository,
    FrontendUserService,
    FindFrontendUserInfoHandler,
    UpdateEmailVerifiedHandler,
    RegisterFrontendUserHandler,
    LoginFrontendUserHandler,
    GoogleLoginFrontendUserHandler,
    FeRefreshTokenHandler,
    FeLogoutHandler,
    RequestPasswordResetHandler,
    UpdateUserProfileHandler,
    UpdateUserAuthorizedHandler,
    DeleteAccountHandler,
    ExcelService,
    tryLimitFactory,
    GetIdentifierHandler,
    VerifySignedMessageHandler,
    DefaultProfileImagesHandler
  ],
  exports: [FrontendUserService, FrontendUserRepository]
})
export class FrontendUserModule {}
