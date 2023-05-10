import { Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { NftCollectionRequest } from '../requests/nft-collection.request';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { NftCollectionQuery } from '../../queries/nft-collection';
import { NftRequest } from '../requests/nft.request';
import { NftQuery } from '../../queries/nft';
import { JwtAuthGuard } from '@app/common-module';
import { SyncNft } from '../../commands/sync-nft';
import { NftFilterQuery } from '../../queries/nft-filter';
import { NftFilterRequest } from '../requests/nft-filter.request';

@Controller('nft')
@ApiTags('Nft')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NftController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus
  ) {}

  @Get('/top-collections')
  async getPopularNftCollection(@Query() query: NftCollectionRequest) {
    return this.queryBus.execute(new NftCollectionQuery(query));
  }

  @Get('/search')
  async searchnft(@Query() query: NftFilterRequest) {
    return this.queryBus.execute(new NftFilterQuery(query.keyword));
  }

  @Post('/sync')
  async syncNft() {
    return this.commandBus.execute(new SyncNft());
  }

  @Get(':address')
  async getServerHash(
    @Param('address') slug: string,
    @Query() query: NftRequest
  ) {
    return this.queryBus.execute(
      new NftQuery(slug, {
        limit: query.limit,
        page: query.page
      })
    );
  }
}
