import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ServerSeedHashCommand } from '../../commands/server-seed-hash';
import { SpinRequest } from '../requests/spin.request';
import { SpinCommand } from '../../commands/spin';
import { GetUser, JwtAuthGuard } from '@app/common-module';
import { FrontendUser } from '@app/modules/frontend-user';
import { VerifyGameCommand } from '../../commands/verify-game';
import { VerifyGameRequest } from '../requests/verify-game.request';
import { InitGameRequest } from '../requests/init-game.request';
import { GameHistoryRequest } from '../requests/game-history.request';
import { GetGameHistoryQuery } from '../../queries/get-game-history';
import { GameHistoryType, GameType } from '@app/modules/nft-game';
import { NftWonImages } from '../../queries/get-nft-won-images';
import { GenerateNewSeed } from '../../commands/generate-new-seed';
import { GenerateNewSeedRequest } from '../requests/generate-new-seed';

@Controller('nft-game')
@ApiTags('NftGame')
@ApiBearerAuth()
export class NftGameController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post('/server-seed-hash')
  async getServerHashSeed(
    @GetUser() user: FrontendUser,
    @Body() body: InitGameRequest
  ) {
    return this.commandBus.execute(
      new ServerSeedHashCommand(user.id, { ...body })
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('/spin')
  async spin(@GetUser() user: FrontendUser, @Body() body: SpinRequest) {
    return this.commandBus.execute(new SpinCommand(user.id, { ...body }));
  }

  @UseGuards(JwtAuthGuard)
  @Post('/verify')
  async verify(@GetUser() user: FrontendUser, @Body() body: VerifyGameRequest) {
    return this.commandBus.execute(new VerifyGameCommand(user.id, { ...body }));
  }

  @UseGuards(JwtAuthGuard)
  @Get('/personal-bets')
  async personalBets(
    @GetUser() user: FrontendUser,
    @Query() query: GameHistoryRequest
  ) {
    return this.queryBus.execute(
      new GetGameHistoryQuery(
        GameHistoryType.PERSONAL,
        GameType.NFT_SLOT,
        query.page,
        query.limit,
        user.id
      )
    );
  }

  @Get('/all-bets')
  async allBets(@Query() query: GameHistoryRequest) {
    return this.queryBus.execute(
      new GetGameHistoryQuery(
        GameHistoryType.ALL,
        GameType.NFT_SLOT,
        query.page,
        query.limit
      )
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('/won-images')
  async wonNftImages(@GetUser() user: FrontendUser) {
    return this.queryBus.execute(new NftWonImages(user.id));
  }

  @UseGuards(JwtAuthGuard)
  @Post('/new-seed')
  async generateNewSeed(
    @GetUser() user: FrontendUser,
    @Body() body: GenerateNewSeedRequest
  ) {
    return this.commandBus.execute(
      new GenerateNewSeed(user.id, body.clientSeed)
    );
  }
}
