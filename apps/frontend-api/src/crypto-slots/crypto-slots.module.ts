import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { HttpModule } from '@nestjs/axios';
import { CryptoSlotService } from '@app/modules/crypto-slots';
import { FrontendUserModule } from '../frontend-user/frontend-user.module';
import { CryptoSlotCollectionQueryHandler } from './queries/crypto-slot-collection.handler';
import { NftGameModule } from '../nft-game/nft-game.module';
import { CryptoSlotController } from './http/controller/crypto-slot.controller';
import { CryptoServerSeedHashCommandHandler } from './commands/crypto-server-seed-hash.handler';
import { CryptoSpinCommandHandler } from './commands/crypto-spin.handler';
import { CryptoGameHistoryHandler } from './queries/crypto-game-history.handler';

@Module({
  imports: [CqrsModule, HttpModule, FrontendUserModule, NftGameModule],
  providers: [
    CryptoSlotService,
    CryptoSlotCollectionQueryHandler,
    CryptoServerSeedHashCommandHandler,
    CryptoSpinCommandHandler,
    CryptoGameHistoryHandler
  ],
  exports: [CryptoSlotService],
  controllers: [CryptoSlotController]
})
export class CryptoSlotModule {}
