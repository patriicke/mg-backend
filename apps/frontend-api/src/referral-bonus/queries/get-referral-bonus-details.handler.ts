import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetReferralBonusDetailsQuery } from './get-referral-bonus-details';
import { FrontendUserRepository } from '@app/modules/frontend-user';

@QueryHandler(GetReferralBonusDetailsQuery)
export class GetReferralBonusDetailsHandler
  implements IQueryHandler<GetReferralBonusDetailsQuery>
{
  constructor(
    private readonly frontendUserRepository: FrontendUserRepository
  ) {}

  async execute(query: GetReferralBonusDetailsQuery) {
    return this.frontendUserRepository.getReferralBonusDetails(query.user);
  }
}
