export class DeleteAccount {
  constructor(
    readonly FrontendUserId: number,
    readonly params: Partial<{
      readonly checkEmail: string;
      readonly checkPassword: string;
    }>
  ) {}
}
