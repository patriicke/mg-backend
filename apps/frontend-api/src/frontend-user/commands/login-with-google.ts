export class GoogleLoginFrontendUser {
  constructor(
    readonly token: string,
    readonly referralCode: string,
    readonly refreshTokenPayload: Partial<{
      readonly ip: string;
      readonly userAgent: string;
      readonly browser: string;
      readonly os: string;
    }>
  ) {}
}
