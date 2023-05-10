import { GetUser, JwtAuthGuard, referralBonus } from '@app/common-module';
import { Controller, Get, UseGuards } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { GetReferralBonusDetailsQuery } from '../queries/get-referral-bonus-details';
import { FrontendUser } from '@app/modules/frontend-user';

@Controller('referral-bonus')
@ApiTags('referral-bonus')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ReferralBonusController {
  constructor(private readonly queryBus: QueryBus) {}
  @Get('/info')
  async getReferralInfo() {
    const mapped = {};
    Object.keys(referralBonus).forEach((item) => {
      mapped[item] = `USD ${referralBonus[item]}`;
    });
    return mapped;
  }

  @Get('/details')
  async getReferralDetails(@GetUser() user: FrontendUser) {
    return this.queryBus.execute(new GetReferralBonusDetailsQuery(user));
  }
}
