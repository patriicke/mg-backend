export class FrontendUserInfoResult {
  readonly id: number;
  readonly email: string;
  readonly username: string;
  readonly accountVerified: boolean;
  readonly referralCode: string;
  readonly referralId: number;
  readonly referralPoints: number;
  readonly avatar?: string;
  readonly showUsername: boolean;
  readonly getPlainUsername?: boolean;
  readonly totalWalletBalance: number;
  readonly totalDepositCount: number;
  constructor(props: FrontendUserInfoResult) {
    Object.assign(this, props);
  }
}
