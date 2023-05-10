import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { FrontendUserRepository } from '@app/modules/frontend-user';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

import { RequestPasswordReset } from './request-password-reset';
import { RateLimiterStoreAbstract } from 'rate-limiter-flexible';
import { ThrottlerException } from '@nestjs/throttler';
import { LimitConsumerHandlerHelper } from '@app/common-module';

@CommandHandler(RequestPasswordReset)
export class RequestPasswordResetHandler
  extends LimitConsumerHandlerHelper
  implements ICommandHandler<RequestPasswordReset>
{
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    readonly frontendUserRepository: FrontendUserRepository,
    @Inject('TRY_LIMIT_FACTORY')
    protected readonly rateLimiter: RateLimiterStoreAbstract
  ) {
    super(rateLimiter);
  }

  async execute(command: RequestPasswordReset): Promise<void> {
    const throttleKey = `forget_password_${command.email}`;
    const throttleResponse = await this.rateLimiter.get(throttleKey);
    let retrySecs = 0;

    // Check if user is already blocked
    if (throttleResponse !== null && throttleResponse.consumedPoints > 1) {
      retrySecs = Math.ceil(throttleResponse.msBeforeNext / 1000);
    }
    if (retrySecs > 0) {
      this.logger.warn('FrontendUser_MODULE<Forget Password>', {
        meta: {
          payload: {
            username: command.email
          },
          type: 'too many attempts'
        }
      });
      throw new ThrottlerException(
        `Too many attempts, please retry after ${String(retrySecs)}`
      );
    }

    const user = await this.frontendUserRepository.findOne({
      where: {
        email: command.email
      }
    });
    const [result, throttleError] = await this.limitConsumerPromiseHandler(
      throttleKey
    );
    if (!result) {
      throw new ThrottlerException(
        `Too many attempts, please retry after ${String(
          Math.ceil(throttleError.msBeforeNext / 1000)
        )}`
      );
    }
    if (!user) {
      return Promise.resolve(null);
    }
    this.logger.info('FrontendUser_MODULE<Forget Password>', {
      meta: {
        payload: {
          username: command.email
        },
        type: 'forget password link requested successfully'
      }
    });
    return;
  }
}
