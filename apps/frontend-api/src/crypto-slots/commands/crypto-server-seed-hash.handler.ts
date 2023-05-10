import { ICommandHandler, CommandHandler, QueryBus } from '@nestjs/cqrs';
import { CryptoServerSeedHashCommand } from './crypto-server-seed-hash';
import {
  GameRepository,
  GameSerializer,
  GameStatus,
  GameType,
  NftGameService
} from '@app/modules/nft-game';
import { FrontendUserRepository } from '@app/modules/frontend-user';
import { GetLatestPendingGameQuery } from '../../nft-game/queries/get-latest-pending-game';
@CommandHandler(CryptoServerSeedHashCommand)
export class CryptoServerSeedHashCommandHandler
  implements ICommandHandler<CryptoServerSeedHashCommand>
{
  constructor(
    private readonly queryBus: QueryBus,
    private readonly service: NftGameService,
    private readonly repository: GameRepository,
    private readonly frontendUserRepository: FrontendUserRepository
  ) {}
  async execute(command: CryptoServerSeedHashCommand) {
    const { price, winProbability } = command.params;
    let gameData: Partial<GameSerializer>;
    const serverHash = await this.service.generateServerSeed();

    const pendingGame = await this.queryBus.execute(
      new GetLatestPendingGameQuery(command.userId, GameType.CRYPTO_SLOT)
    );
    const gamePayload = {
      ...command.params,
      userId: command.userId,
      serverHash,
      nonce: await this.repository.getNonce(),
      type: GameType.CRYPTO_SLOT,
      contractName: command.params.name,
      detail: {
        symbol: command.params.symbol
      },
      status: GameStatus.PENDING
    };

    if (pendingGame) {
      gameData = await this.service.updatePendingGame(pendingGame, gamePayload);
    } else {
      delete gamePayload.changeType;
      gamePayload['betAmount'] = this.service.calculateBetAmount(
        winProbability,
        price
      );
      this.service.checkBetAmount(gamePayload['betAmount'], price);
      gameData = await this.repository.createEntity(gamePayload, [], {
        groups: ['basic']
      });
    }

    gameData.serverHash = this.service.hashString(serverHash);

    await this.frontendUserRepository.update(command.userId, {
      serverHash,
      nonce: this.service.generateNonce()
    });
    gameData.serverHash = '';
    delete gameData.detail;
    return gameData;
  }
}
