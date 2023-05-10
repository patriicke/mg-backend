import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RefreshTokenService } from '../refresh-token/refresh-token.service';
import { AuthModule } from '../auth/auth.module';
import { RefreshTokenRepository } from '../refresh-token/refresh-token.repository';
import { RefreshToken } from './entities/refresh-token.entity';

@Module({
  imports: [
    forwardRef(() => AuthModule),
    TypeOrmModule.forFeature([RefreshToken])
  ],
  providers: [RefreshTokenService, RefreshTokenRepository],
  exports: [RefreshTokenService],
  controllers: []
})
export class RefreshTokenModule {}
