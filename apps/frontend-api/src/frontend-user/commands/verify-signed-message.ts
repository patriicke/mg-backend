import { WalletType } from '../../auth/http/requests/verify-wallet-signature.request';

export class VerifySignedMessage {
  constructor(
    readonly address: string,
    readonly signature: string,
    readonly type: WalletType,
    readonly refreshTokenPayload: Partial<{
      readonly ip: string;
      readonly userAgent: string;
      readonly browser: string;
      readonly os: string;
    }>
  ) {}
}
