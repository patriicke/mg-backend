import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { FrontendUserRepository } from '@app/modules/frontend-user';
import { v4 as uuidv4 } from 'uuid';

import { GetIdentifier } from './get-identifier';
import { RegisterFrontendUser } from './register-frontend-user';
import { WalletType } from '../../auth/http/requests/verify-wallet-signature.request';

@CommandHandler(GetIdentifier)
export class GetIdentifierHandler implements ICommandHandler<GetIdentifier> {
  constructor(
    readonly repository: FrontendUserRepository,
    readonly commandBus: CommandBus
  ) {}
  async execute(command: GetIdentifier) {
    const { address, referredBy, type } = command;
    const condition = {
      ...(type === WalletType.METAMASK && { address }),
      ...(type === WalletType.PHANTOM && { phantomAddress: address })
    };
    try {
      return await this.repository.findOneByOrFail(condition);
    } catch (error) {
      console.log(
        '🚀 ~ file: get-identifier.handler.ts:24 ~ GetIdentifierHandler ~ execute ~ error:',
        error
      );

      const identifier = uuidv4();
      return this.commandBus.execute(
        new RegisterFrontendUser(false, {
          ...condition,
          identifier,
          referralCode: referredBy,
          createNew: true
        })
      );
    }
  }
}
