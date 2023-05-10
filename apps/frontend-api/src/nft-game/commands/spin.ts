import { ChangeType } from '@app/modules/nft-game';

export class SpinCommand {
  constructor(
    readonly userId: number,
    readonly params: {
      clientSeed: string;
      tokenId: string;
      nftAddress: string;
      winProbability: number;
      betAmount: number;
      changeType: ChangeType;
    }
  ) {}
}
