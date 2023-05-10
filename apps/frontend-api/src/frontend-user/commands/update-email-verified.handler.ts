import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { FrontendUserRepository } from '@app/modules/frontend-user';

import { UpdateEmailVerified } from './update-email-verified';

@CommandHandler(UpdateEmailVerified)
export class UpdateEmailVerifiedHandler
  implements ICommandHandler<UpdateEmailVerified>
{
  constructor(readonly repository: FrontendUserRepository) {}

  async execute(command: UpdateEmailVerified): Promise<void> {
    await this.repository.update(
      { id: command.id },
      {
        accountVerified: true
      }
    );
  }
}
