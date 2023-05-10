import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GameSerializer, NftGameService } from '@app/modules/nft-game';
import { NftWonImages } from './get-nft-won-images';
@QueryHandler(NftWonImages)
export class GetNftWonImagesHandler implements IQueryHandler<NftWonImages> {
  constructor(private service: NftGameService) {}
  async execute(query: NftWonImages): Promise<GameSerializer[]> {
    return this.service.getWonNftGameImages(query.userId);
  }
}
