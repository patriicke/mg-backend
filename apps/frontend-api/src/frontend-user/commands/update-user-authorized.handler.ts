import { Not } from 'typeorm';
import {
  HttpStatus,
  Inject,
  UnprocessableEntityException
} from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  LimitConsumerHandlerHelper,
  ValidationPayloadInterface
} from '@app/common-module';
import { FrontendUserRepository } from '@app/modules/frontend-user';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

import { UpdateUserAuthorized } from './update-user-authorized';
import { RateLimiterStoreAbstract } from 'rate-limiter-flexible';
import { ThrottlerException } from '@nestjs/throttler';
import { InvalidPasswordException } from '../../auth/http/exceptions/invalid-password.exception';

@CommandHandler(UpdateUserAuthorized)
export class UpdateUserAuthorizedHandler
  extends LimitConsumerHandlerHelper
  implements ICommandHandler<UpdateUserAuthorized>
{
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    readonly frontendUserRepository: FrontendUserRepository,
    @Inject('TRY_LIMIT_FACTORY')
    protected readonly rateLimiter: RateLimiterStoreAbstract
  ) {
    super(rateLimiter);
  }

  async execute(command: UpdateUserAuthorized): Promise<void> {
    try {
      const { params } = command;
      const existingUser = await this.frontendUserRepository.findOneOrFail({
        where: {
          id: command.id
        }
      });

      await this.checkUniqueEmail(command);

      const emailChangedBool = Boolean(
        params.email && existingUser.email !== params.email
      );
      const loggerTitle = emailChangedBool ? 'Change Email' : 'Change Password';
      const throttleKey = loggerTitle.replace(' ', '_') + existingUser.id;
      const throttleResponse = await this.rateLimiter.get(throttleKey);
      let retrySecs = 0;
      // Check if user is already blocked
      if (throttleResponse?.consumedPoints > 1) {
        retrySecs = Math.ceil(throttleResponse.msBeforeNext / 1000);
      }
      if (retrySecs > 0) {
        throw new ThrottlerException(
          `Too many attempts, please retry after ${String(retrySecs)}`
        );
      }
      const user: {
        authId: string;
        email?: string;
        password?: string;
        emailVerified?: boolean;
      } = {
        authId: '1',
        ...('email' in params && { email: params.email }),
        ...('password' in params &&
          !params.updateEmail && { password: params.password }),
        ...(emailChangedBool && { emailVerified: false })
      };
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
      delete user.password;

      this.logger.info(`FrontendUser_MODULE<${loggerTitle}>`, {
        meta: {
          payload: {
            id: existingUser.id,
            authenticatedEmail: params.checkEmail
          }
        }
      });
    } catch (error) {
      if (
        error.status !== HttpStatus.TOO_MANY_REQUESTS &&
        error.name !== 'UnprocessableEntityException'
      ) {
        throw new InvalidPasswordException(error.message);
      }
      throw error;
    }
  }

  async checkUniqueEmail(command: UpdateUserAuthorized): Promise<void> {
    if (command.params.email) {
      const errorPayload: ValidationPayloadInterface[] = [];
      const checkUnique =
        await this.frontendUserRepository.countEntityByCondition({
          id: Not(command.id),
          email: command.params.email
        });
      if (checkUnique > 0) {
        errorPayload.push({
          property: 'email',
          constraints: {
            unique: 'already taken'
          }
        });
      }
      if (Object.keys(errorPayload).length > 0) {
        throw new UnprocessableEntityException(errorPayload);
      }
    }
  }
}
