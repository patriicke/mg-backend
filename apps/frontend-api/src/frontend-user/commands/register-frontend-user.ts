export class RegisterFrontendUser {
  constructor(
    readonly sendToken: boolean,
    readonly params: Partial<{
      readonly email: string;
      readonly referralCode: string;
      readonly username: string;
      readonly token: string;
      readonly password: string;
      readonly identifier: string;
      readonly phantomAddress: string;
      readonly address: string;
      readonly createNew: boolean;
    }>
  ) {}
}
