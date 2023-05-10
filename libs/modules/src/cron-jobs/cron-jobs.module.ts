import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CronJobsService } from './cron-jobs.service';
import { Transaction, TransactionService } from '../transaction';
import {
  ReferralDepositTrack,
  ReferralDepositTrackService
} from '../referral-deposit-track';
import { Balance, BalanceRepository, BalanceService } from '../balance';

@Module({
  imports: [
    TypeOrmModule.forFeature([Balance, Transaction, ReferralDepositTrack])
  ],
  providers: [
    CronJobsService,
    TransactionService,
    BalanceRepository,
    BalanceService,
    ReferralDepositTrackService
  ],
  exports: [CronJobsService]
})
export class CronJobsModule {}
