export class UpdateUserAuthorized {
  constructor(
    readonly id: number,
    readonly params: Partial<{
      readonly email: string;
      readonly checkEmail: string;
      readonly checkPassword: string;
      readonly password: string;
      readonly updateEmail: boolean;
    }>
  ) {}
}
