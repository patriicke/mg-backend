import { CommandHandler, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { InjectConnection } from '@nestjs/typeorm';
import { Connection } from 'typeorm';
import { CryptoSpinCommand } from './crypto-spin';
import { GameStatus, GameType, NftGameService } from '@app/modules/nft-game';
import { FrontendUserRepository } from '@app/modules/frontend-user';
import { GetLatestPendingGameQuery } from '../../nft-game/queries/get-latest-pending-game';
import { CustomHttpException, NotFoundException } from '@app/common-module';

@CommandHandler(CryptoSpinCommand)
export class CryptoSpinCommandHandler
  implements ICommandHandler<CryptoSpinCommand>
{
  constructor(
    private queryBus: QueryBus,
    @InjectConnection()
    private readonly connection: Connection,
    private readonly service: NftGameService,
    private readonly frontendUserRepository: FrontendUserRepository
  ) {}
  async execute(command: CryptoSpinCommand): Promise<{
    id: string;
    image: string;
    result: boolean;
    serverSeed: string;
    serverSeedHash: string;
  }> {
    let hashedCombination = '';
    let pendingGameData = await this.queryBus.execute(
      new GetLatestPendingGameQuery(command.userId, GameType.CRYPTO_SLOT)
    );

    if (!pendingGameData) {
      throw new NotFoundException('Pending Game Data not found.');
    }

    const totalWalletBalance =
      await this.frontendUserRepository.getTotalRemainingBalance(
        command.userId
      );
    command.params['type'] = GameType.CRYPTO_SLOT;
    command.params['contractName'] = command?.params?.name;
    command.params['detail'] = {
      symbol: command.params.symbol
    };

    pendingGameData = await this.service.updatePendingGame(
      pendingGameData,
      command.params
    );
    if (pendingGameData.betAmount <= 0)
      throw new CustomHttpException('Invalid Game.');
    if (totalWalletBalance < pendingGameData.betAmount) {
      throw new CustomHttpException('Insufficient Wallet Balance.');
    }

    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await this.service.updateBalanceDataAndGameData({
        amount: pendingGameData.betAmount,
        userId: command.userId,
        gameId: pendingGameData.id,
        state: GameStatus.LOST,
        queryRunner
      });

      const { clientSeed } = command.params;
      const userData = await this.frontendUserRepository.findOne({
        where: {
          id: command.userId
        },
        select: ['id', 'serverHash']
      });
      const serverSeed = userData.serverHash;
      const nonce = userData.nonce;
      const combination = this.service.concat(serverSeed, clientSeed, nonce);
      hashedCombination = this.service.hashString(combination);
      const result = this.service.playGame(
        hashedCombination,
        pendingGameData.winProbability
      );

      if (result) {
        await this.service.updateBalanceDataAndGameData({
          amount: pendingGameData.price,
          userId: command.userId,
          gameId: pendingGameData.id,
          state: GameStatus.WIN,
          queryRunner
        });
      }
      this.frontendUserRepository.update(userData.id, {
        serverHash: await this.service.generateServerSeed(),
        nonce: this.service.generateNonce()
      });
      await queryRunner.commitTransaction();
      return {
        id: pendingGameData.uuid,
        image: pendingGameData.nftImage,
        result,
        serverSeed,
        serverSeedHash: hashedCombination
      };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw new CustomHttpException('Something Went Wrong.');
    } finally {
      await queryRunner.release();
    }
  }
}
