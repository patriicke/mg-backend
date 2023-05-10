import { WalletType } from '../../auth/http/requests/verify-wallet-signature.request';

export class GetIdentifier {
  constructor(
    readonly address: string,
    readonly referredBy: string,
    readonly type: WalletType
  ) {}
}
