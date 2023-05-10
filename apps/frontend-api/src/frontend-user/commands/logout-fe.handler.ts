import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { FeRefreshTokenService } from '@app/modules/fe-refresh-token';
import { FeRefreshTokenFeCommand } from './refresh-token-fe';
import { FeLogoutCommand } from './logout-fe';
import {
  CustomHttpException,
  ExceptionTitleList,
  StatusCodesList
} from '@app/common-module';
import { HttpStatus } from '@nestjs/common';

@CommandHandler(FeLogoutCommand)
export class FeLogoutHandler implements ICommandHandler<FeLogoutCommand> {
  constructor(private readonly tokenService: FeRefreshTokenService) {}

  async execute(command: FeRefreshTokenFeCommand) {
    const { refreshToken } = command;
    if (refreshToken) {
      try {
        const { token } = await this.tokenService.resolveRefreshToken(
          refreshToken
        );
        if (token) {
          token.isRevoked = true;
          await token.save();
        }
      } catch (e) {
        throw new CustomHttpException(
          ExceptionTitleList.InvalidRefreshToken,
          HttpStatus.PRECONDITION_FAILED,
          StatusCodesList.InvalidRefreshToken
        );
      }
    }
  }
}
