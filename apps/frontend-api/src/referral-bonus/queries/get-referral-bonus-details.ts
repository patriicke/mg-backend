import { FrontendUser } from '@app/modules/frontend-user';

export class GetReferralBonusDetailsQuery {
  constructor(readonly user: FrontendUser) {}
}
