import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import Redis from 'ioredis';
import config from 'config';
import { RateLimiterRedis } from 'rate-limiter-flexible';
import {
  DisposableEmailValidator,
  UniqueValidatorPipe
} from '@app/common-module';

import { AuthController } from '../auth/auth.controller';
import { AuthService } from '../auth/auth.service';
import { UserRepository } from '../auth/user.repository';
import { MailModule } from '../mail/mail.module';
import { RefreshTokenModule } from '../refresh-token/refresh-token.module';
import { JwtTwoFactorStrategy } from '../common/strategy/jwt-two-factor.strategy';
import { JwtStrategy } from '../common/strategy/jwt.strategy';
import { AdminActivityLogModule } from '../../../../libs/modules/src/admin-activity-log/admin-activity-log.module';
import { UserEntity } from './entity/user.entity';

const throttleConfig = config.get('throttle.login');
const redisConfig = config.get('queue');
const jwtConfig = config.get('jwt');
const LoginThrottleFactory = {
  provide: 'LOGIN_THROTTLE',
  useFactory: () => {
    const redisClient = new Redis({
      enableOfflineQueue: false,
      host: process.env.REDIS_HOST || redisConfig.host,
      port: process.env.REDIS_PORT || redisConfig.port,
      password: process.env.REDIS_PASSWORD || redisConfig.password
    });

    return new RateLimiterRedis({
      storeClient: redisClient,
      keyPrefix: throttleConfig.prefix,
      points: throttleConfig.limit,
      duration: 60 * 60 * 24 * 30, // Store number for 30 days since first fail
      blockDuration: throttleConfig.blockDuration
    });
  }
};

@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: process.env.JWT_SECRET || jwtConfig.secret,
        signOptions: {
          expiresIn: process.env.JWT_EXPIRES_IN || jwtConfig.expiresIn
        }
      })
    }),
    PassportModule.register({
      defaultStrategy: 'jwt'
    }),
    TypeOrmModule.forFeature([UserEntity]),
    MailModule,
    RefreshTokenModule,
    AdminActivityLogModule
  ],
  controllers: [AuthController],
  providers: [
    UserRepository,
    AuthService,
    JwtTwoFactorStrategy,
    JwtStrategy,
    UniqueValidatorPipe,
    DisposableEmailValidator,
    LoginThrottleFactory
  ],
  exports: [
    AuthService,
    JwtTwoFactorStrategy,
    JwtStrategy,
    PassportModule,
    JwtModule
  ]
})
export class AuthModule {}
