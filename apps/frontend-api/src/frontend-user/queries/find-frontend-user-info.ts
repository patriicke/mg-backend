export class FindFrontendUserInfo {
  private constructor(
    readonly identifier: string | number,
    readonly identifierType: 'email' | 'id' | 'auth0Id' | 'emailUsername',
    readonly token?: string,
    readonly checkPendingOrOngoingMatches?: boolean
  ) {}

  static byEmail(email: string) {
    return new FindFrontendUserInfo(email, 'email');
  }

  static byEmailUsername(
    emailUsername: string,
    checkPendingOrOngoingMatches = false
  ) {
    return new FindFrontendUserInfo(
      emailUsername,
      'emailUsername',
      '',
      checkPendingOrOngoingMatches
    );
  }

  static byId(id: string | number) {
    return new FindFrontendUserInfo(id, 'id');
  }

  static byAuth0Id(auth0Id: string) {
    return new FindFrontendUserInfo(auth0Id, 'auth0Id');
  }
}
