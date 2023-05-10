import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { HttpModule } from '@nestjs/axios';
import { NftGameController } from './http/controller/nft-game.controller';
import { ServerSeedHashCommandHandler } from './commands/server-seed-hash.handler';
import {
  GameRepository,
  GameSerializer,
  NftGameService
} from '@app/modules/nft-game';
import { SpinCommandHandler } from './commands/spin.handler';
import { FrontendUserModule } from '../frontend-user/frontend-user.module';
import { VerifyGameCommandHandler } from './commands/verify-game.handler';
import { GetLatestPendingGameHandler } from './queries/get-latest-pending-game.handler';
import { GetGameHistoryQueryHandler } from './queries/get-game-history.handler';
import { NftRepository, NftService } from '@app/modules/nft';
import { GetNftWonImagesHandler } from './queries/get-nft-won-images.handler';
import { GenerateNewSeedHandler } from './commands/generate-new-seed.handler';
@Module({
  imports: [CqrsModule, HttpModule, FrontendUserModule],
  providers: [
    GameRepository,
    GameSerializer,
    NftService,
    NftRepository,
    NftGameService,
    ServerSeedHashCommandHandler,
    SpinCommandHandler,
    VerifyGameCommandHandler,
    GetLatestPendingGameHandler,
    GetGameHistoryQueryHandler,
    GetNftWonImagesHandler,
    GenerateNewSeedHandler
  ],
  exports: [NftGameService, GameRepository],
  controllers: [NftGameController]
})
export class NftGameModule {}
