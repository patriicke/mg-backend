export class VerifyGameCommand {
  constructor(
    readonly userId: number,
    readonly params: {
      serverSeed: string;
      clientSeed: string;
      winProbability: number;
      nonce: string;
    }
  ) {}
}
