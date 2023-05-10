import { GetUser, JwtAuthGuard } from '@app/common-module';
import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { QueryBus, CommandBus } from '@nestjs/cqrs';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { CryptoSlotCollectionQuery } from '../../queries/crypto-slot-collection';
import { InitCryptoGameRequest } from '../requests/init-game.request';
import { CryptoServerSeedHashCommand } from '../../commands/crypto-server-seed-hash';
import { FrontendUser } from '@app/modules/frontend-user';
import { CryptoSpinCommand } from '../../commands/crypto-spin';
import { CryptoSpinRequest } from '../requests/crypto-spin.request';
import { CryptoGameHistoryRequest } from '../requests/crypto-game-history';
import { GameHistoryType, GameType } from '@app/modules/nft-game';
import { CryptoGameHistory } from '../../queries/crypto-game-history';
@Controller('crypto-slot')
@ApiTags('crypto-slot')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CryptoSlotController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus
  ) {}

  @Get('/collections')
  async getCryptoSlotCollection() {
    return this.queryBus.execute(new CryptoSlotCollectionQuery());
  }

  @Post('/server-seed-hash')
  async serverSeedHash(
    @GetUser() user: FrontendUser,
    @Body() body: InitCryptoGameRequest
  ) {
    return this.commandBus.execute(
      new CryptoServerSeedHashCommand(user.id, { ...body })
    );
  }

  @Post('/spin')
  async spin(@GetUser() user: FrontendUser, @Body() body: CryptoSpinRequest) {
    return this.commandBus.execute(new CryptoSpinCommand(user.id, { ...body }));
  }

  @UseGuards(JwtAuthGuard)
  @Get('/personal-bets')
  async personalBets(
    @GetUser() user: FrontendUser,
    @Query() query: CryptoGameHistoryRequest
  ) {
    return this.queryBus.execute(
      new CryptoGameHistory(
        GameHistoryType.PERSONAL,
        GameType.CRYPTO_SLOT,
        query.page,
        query.limit,
        user.id
      )
    );
  }

  @Get('/all-bets')
  async allBets(@Query() query: CryptoGameHistoryRequest) {
    return this.queryBus.execute(
      new CryptoGameHistory(
        GameHistoryType.ALL,
        GameType.CRYPTO_SLOT,
        query.page,
        query.limit
      )
    );
  }
}
