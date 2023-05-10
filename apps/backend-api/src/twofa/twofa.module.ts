import { Module } from '@nestjs/common';

import { TwofaService } from './twofa.service';
import { AuthModule } from '../auth/auth.module';
import { RefreshTokenModule } from '../refresh-token/refresh-token.module';
import { TwofaController } from './twofa.controller';

@Module({
  imports: [AuthModule, RefreshTokenModule],
  controllers: [TwofaController],
  providers: [TwofaService],
  exports: [TwofaService]
})
export class TwofaModule {}
