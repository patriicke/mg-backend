import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { HttpModule } from '@nestjs/axios';
import { BalanceRepository, BalanceService } from '@app/modules/balance';
@Module({
  imports: [CqrsModule, HttpModule],
  providers: [BalanceService, BalanceRepository],
  exports: [BalanceService],
  controllers: []
})
export class BalanceModule {}
