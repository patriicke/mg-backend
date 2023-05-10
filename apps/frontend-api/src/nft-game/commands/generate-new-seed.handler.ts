import { ICommandHandler, CommandHandler, QueryBus } from '@nestjs/cqrs';
import { NftGameService } from '@app/modules/nft-game';
import { GenerateNewSeed } from './generate-new-seed';
import { FrontendUserRepository } from '@app/modules/frontend-user';

@CommandHandler(GenerateNewSeed)
export class GenerateNewSeedHandler
  implements ICommandHandler<GenerateNewSeed>
{
  constructor(
    private readonly service: NftGameService,
    private readonly querybus: QueryBus,
    private readonly userRepository: FrontendUserRepository
  ) {}
  async execute(command: GenerateNewSeed) {
    const userData = await this.userRepository.findOne({
      where: {
        id: command.userId
      },
      select: ['nonce', 'serverHash']
    });
    const combination = this.service.concat(
      userData.serverHash,
      command.clientSeed,
      userData.nonce
    );
    const hashString = this.service.hashString(combination);
    return hashString;
  }
}
