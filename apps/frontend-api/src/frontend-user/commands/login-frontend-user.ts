export class LoginFrontendUser {
  constructor(
    readonly params: Partial<{
      readonly email: string;
      readonly password: string;
    }>,
    readonly refreshTokenPayload: Partial<{
      readonly ip: string;
      readonly userAgent: string;
      readonly browser: string;
      readonly os: string;
    }>
  ) {}
}
