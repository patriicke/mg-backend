import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { HttpModule } from '@nestjs/axios';
import { FrontendUserModule } from '../frontend-user/frontend-user.module';
import { ReferralBonusController } from './http/referral-bonus-controller';
import { GetReferralBonusDetailsHandler } from './queries/get-referral-bonus-details.handler';
@Module({
  imports: [CqrsModule, HttpModule, FrontendUserModule],
  providers: [GetReferralBonusDetailsHandler],
  controllers: [ReferralBonusController]
})
export class ReferralBonusModule {}
