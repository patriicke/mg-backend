import { HttpModule } from '@nestjs/axios';
import { Module, forwardRef } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { CqrsModule } from '@nestjs/cqrs';
import { UniqueValidatorPipe } from '@app/common-module';
import { AuthController } from './http/controllers/auth.controller';
import { JwtStrategyProvider } from './providers/strategy.provider';
import { FrontendUserModule } from '../frontend-user/frontend-user.module';
import config from 'config';
import {
  FeRefreshTokenRepository,
  FeRefreshTokenService
} from '@app/modules/fe-refresh-token';
import { GoogleOAuthService } from './services/google-auth.service';
const jwtConfig = config.get('feJwt');
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
    PassportModule.register({ defaultStrategy: 'jwt' }),
    CqrsModule,
    HttpModule,
    forwardRef(() => FrontendUserModule)
  ],
  providers: [
    JwtStrategyProvider,
    GoogleOAuthService,
    UniqueValidatorPipe,
    FeRefreshTokenRepository,
    FeRefreshTokenService
  ],
  exports: [
    PassportModule,
    JwtModule,
    JwtStrategyProvider,
    FeRefreshTokenRepository,
    FeRefreshTokenService,
    GoogleOAuthService
  ],
  controllers: [AuthController]
})
export class AuthModule {}
