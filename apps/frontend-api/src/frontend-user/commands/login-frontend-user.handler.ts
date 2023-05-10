import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { FrontendUserRepository } from '@app/modules/frontend-user';
import { LoginFrontendUser } from './login-frontend-user';
import { UnauthorizedException } from '@app/common-module';
import { FeRefreshTokenService } from '@app/modules/fe-refresh-token';

@CommandHandler(LoginFrontendUser)
export class LoginFrontendUserHandler
  implements ICommandHandler<LoginFrontendUser>
{
  constructor(
    private readonly tokenService: FeRefreshTokenService,
    private readonly repository: FrontendUserRepository
  ) {}

  async execute(command: LoginFrontendUser) {
    const { email, password } = command.params;
    const [user, error, code] = await this.repository.login({
      email,
      password
    });
    if (!user) {
      throw new UnauthorizedException(error, code);
    }
    const accessToken = await this.tokenService.generateAccessToken(user);
    const refreshToken = await this.tokenService.generateRefreshToken(
      user,
      command.refreshTokenPayload
    );
    return this.tokenService.buildResponsePayload(accessToken, refreshToken);
  }
}
