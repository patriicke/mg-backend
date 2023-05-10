import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { HttpModule } from '@nestjs/axios';
import { FrontendUserModule } from '../frontend-user/frontend-user.module';
import { NftController } from './http/controller/nft-controller';
import { NftCollectionQueryHandler } from './queries/nft-collection.handler';
import { NftRepository, NftService } from '@app/modules/nft';
import { NftQueryHandler } from './queries/nft.handler';
import { SyncNftHandler } from './commands/sync-nft.handler';
import { NftFilterhandler } from './queries/nft-filter.handler';
@Module({
  imports: [CqrsModule, HttpModule, FrontendUserModule],
  providers: [
    NftService,
    NftRepository,
    NftCollectionQueryHandler,
    NftQueryHandler,
    SyncNftHandler,
    NftFilterhandler
  ],
  exports: [NftService, NftRepository],
  controllers: [NftController]
})
export class NftModule {}
