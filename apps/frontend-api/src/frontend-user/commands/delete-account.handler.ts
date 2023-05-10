import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { FrontendUserRepository } from '@app/modules/frontend-user';

import { messages } from '../../constants/custom-messages';
import { customMessageResponse } from '../../reponses';
import { DeleteAccount } from './delete-account';
@CommandHandler(DeleteAccount)
export class DeleteAccountHandler implements ICommandHandler<DeleteAccount> {
  constructor(readonly frontendUserRepository: FrontendUserRepository) {}
  async execute(command: DeleteAccount): Promise<{ message: string }> {
    try {
      const { FrontendUserId } = command;
      const FrontendUser = await this.frontendUserRepository.findOneOrFail({
        where: {
          id: FrontendUserId
        }
      });
      const username = `guest_${FrontendUser.id}`;
      const email = `${username}@app.com`;
      await this.frontendUserRepository.update(
        { id: FrontendUser.id },
        {
          username,
          email,
          deletedAt: new Date(),
          accountVerified: false
        }
      );
      return customMessageResponse(messages.accountDeleted);
    } catch (err) {
      throw err;
    }
  }
}
