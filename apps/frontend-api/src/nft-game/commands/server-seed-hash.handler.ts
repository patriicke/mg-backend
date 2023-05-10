import { ICommandHandler, CommandHandler, QueryBus } from '@nestjs/cqrs';
import { ServerSeedHashCommand } from './server-seed-hash';
import {
  GameRepository,
  GameSerializer,
  GameStatus,
  GameType,
  NftGameService
} from '@app/modules/nft-game';
import { FrontendUserRepository } from '@app/modules/frontend-user';
import { GetLatestPendingGameQuery } from '../queries/get-latest-pending-game';
import { NftService } from '@app/modules/nft';
import { roundOff } from '@app/common-module';
@CommandHandler(ServerSeedHashCommand)
export class ServerSeedHashCommandHandler
  implements ICommandHandler<ServerSeedHashCommand>
{
  constructor(
    private readonly queryBus: QueryBus,
    private readonly service: NftGameService,
    private readonly nftService: NftService,
    private readonly repository: GameRepository,
    private readonly frontendUserRepository: FrontendUserRepository
  ) {}
  async execute(
    command: ServerSeedHashCommand
  ): Promise<Partial<GameSerializer>> {
    const { winProbability, tokenId, nftAddress } = command.params;
    let gameData: Partial<GameSerializer>;
    const serverHash = await this.service.generateServerSeed();

    const pendingGame = await this.queryBus.execute(
      new GetLatestPendingGameQuery(command.userId, GameType.NFT_SLOT)
    );
    const gamePayload = {
      ...command.params,
      userId: command.userId,
      serverHash,
      nonce: await this.repository.getNonce(),
      type: GameType.NFT_SLOT,
      status: GameStatus.PENDING
    };

    if (pendingGame) {
      gameData = await this.service.updatePendingGame(pendingGame, gamePayload);
    } else {
      delete gamePayload.changeType;
      const nftData = await this.nftService.getFloorPrice(nftAddress, tokenId);
      const nftPrice = roundOff(nftData.price, 2);
      gamePayload['contractName'] = nftData.collectionName;
      gamePayload['price'] = nftPrice;
      gamePayload['betAmount'] = this.service.calculateBetAmount(
        winProbability,
        nftPrice
      );
      this.service.checkBetAmount(gamePayload['betAmount'], nftPrice);
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
