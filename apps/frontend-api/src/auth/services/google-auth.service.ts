import { Injectable } from '@nestjs/common';
import { google, Auth } from 'googleapis';
import config from 'config';
const googleOauthConfig = config.get('googleOauth');

@Injectable()
export class GoogleOAuthService {
  readonly oauthClient: Auth.OAuth2Client;
  constructor() {
    this.oauthClient = new google.auth.OAuth2(
      googleOauthConfig.clientId,
      googleOauthConfig.clientSecret
    );
  }

  authenticate(token: string) {
    return this.oauthClient.getTokenInfo(token);
  }
}
