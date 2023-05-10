import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { FrontendUserRepository } from '@app/modules/frontend-user';
import { FeRefreshTokenService } from '@app/modules/fe-refresh-token';
import { GoogleLoginFrontendUser } from './login-with-google';
import { GoogleOAuthService } from '../../auth/services/google-auth.service';
import { CustomHttpException } from '@app/common-module';
import { RegisterFrontendUser } from './register-frontend-user';

@CommandHandler(GoogleLoginFrontendUser)
export class GoogleLoginFrontendUserHandler
  implements ICommandHandler<GoogleLoginFrontendUser>
{
  constructor(
    private readonly commandBus: CommandBus,
    private readonly tokenService: FeRefreshTokenService,
    private readonly repository: FrontendUserRepository,
    private readonly googleOauthService: GoogleOAuthService
  ) {}

  async execute(command: GoogleLoginFrontendUser) {
    try {
      const tokenInfo = await this.googleOauthService.authenticate(
        command.token
      );
      let userData = await this.repository.findOne({
        where: { email: tokenInfo.email }
      });
      if (!userData) {
        userData = await this.commandBus.execute(
          new RegisterFrontendUser(false, {
            email: tokenInfo.email,
            referralCode: command.referralCode,
            createNew: true
          })
        );
      }
      const accessToken = await this.tokenService.generateAccessToken(userData);
      const refreshToken = await this.tokenService.generateRefreshToken(
        userData,
        command.refreshTokenPayload
      );
      return this.tokenService.buildResponsePayload(accessToken, refreshToken);
    } catch (err) {
      throw new CustomHttpException(err?.message, err?.status);
    }
  }
}
