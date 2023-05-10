import { ICommandHandler, CommandHandler } from '@nestjs/cqrs';
import { NftGameService } from '@app/modules/nft-game';
import { VerifyGameCommand } from './verify-game';

@CommandHandler(VerifyGameCommand)
export class VerifyGameCommandHandler
  implements ICommandHandler<VerifyGameCommand>
{
  constructor(private readonly service: NftGameService) {}
  async execute(command: VerifyGameCommand) {
    const { clientSeed, serverSeed, nonce, winProbability } = command.params;
    const combination = this.service.concat(serverSeed, clientSeed, nonce);
    const hashedCombination = this.service.hashString(combination);
    const result = this.service.playGame(hashedCombination, winProbability);
    return {
      result,
      serverSeed,
      nonce
    };
  }
}
