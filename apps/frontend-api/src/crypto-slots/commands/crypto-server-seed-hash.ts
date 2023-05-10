import { ChangeType } from '@app/modules/nft-game';

export class CryptoServerSeedHashCommand {
  constructor(
    readonly userId: number,
    readonly params: {
      tokenId: string;
      name: string;
      symbol: string;
      price: number;
      winProbability: number;
      betAmount: number;
      nftImage?: string;
      changeType?: ChangeType;
    }
  ) {}
}
