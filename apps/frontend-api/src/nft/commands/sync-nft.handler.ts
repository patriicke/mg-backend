import { ICommandHandler, CommandHandler } from '@nestjs/cqrs';
import { CustomHttpException } from '@app/common-module';
import { HttpStatus } from '@nestjs/common';
import { SyncNft } from './sync-nft';
import { NftService } from '@app/modules/nft';

@CommandHandler(SyncNft)
export class SyncNftHandler implements ICommandHandler<SyncNft> {
  constructor(readonly service: NftService) {}
  async execute() {
    try {
      return this.service.syncNftCollection();
    } catch (error) {
      throw new CustomHttpException(
        error.message || 'Error In Syncing.',
        HttpStatus.BAD_REQUEST
      );
    }
  }
}
