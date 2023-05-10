import { ChangeType } from '@app/modules/nft-game';

export class CryptoSpinCommand {
  constructor(
    readonly userId: number,
    readonly params: {
      tokenId: string;
      clientSeed: string;
      name: string;
      symbol: string;
      price: number;
      winProbability: number;
      betAmount: number;
      changeType?: ChangeType;
    }
  ) {}
}
