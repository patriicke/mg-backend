import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { FeRefreshTokenService } from '@app/modules/fe-refresh-token';
import { FeRefreshTokenFeCommand } from './refresh-token-fe';

@CommandHandler(FeRefreshTokenFeCommand)
export class FeRefreshTokenHandler
  implements ICommandHandler<FeRefreshTokenFeCommand>
{
  constructor(private readonly tokenService: FeRefreshTokenService) {}

  async execute(command: FeRefreshTokenFeCommand) {
    const { refreshToken } = command;
    const { _token } =
      await this.tokenService.createAccessTokenFromRefreshToken(refreshToken);
    return this.tokenService.buildResponsePayload(_token);
  }
}
