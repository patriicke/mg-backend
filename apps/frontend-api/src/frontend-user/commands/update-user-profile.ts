import { FrontendUser } from '@app/modules/frontend-user';

export class UpdateUserProfile {
  constructor(
    readonly userData: Partial<FrontendUser>,
    readonly params: Partial<{
      readonly email: string;
      readonly username: string;
      avatar: string;
      defaultPicId: number;
    }>
  ) {}
}
