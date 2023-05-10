import { ChangeType } from '@app/modules/nft-game';

export class ServerSeedHashCommand {
  constructor(
    readonly userId: number,
    readonly params: {
      chain: string;
      tokenId: string;
      nftAddress: string;
      winProbability: number;
      betAmount: number;
      nftImage?: string;
      changeType?: ChangeType;
    }
  ) {}
}
