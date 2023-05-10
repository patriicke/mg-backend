import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import bcrypt from 'bcrypt';
import {
  FrontendUser,
  FrontendUserRepository,
  FrontendUserSerializer
} from '@app/modules/frontend-user';
import { CustomHttpException } from '@app/common-module';
import { RegisterFrontendUser } from './register-frontend-user';
import { MailService } from '@app/bull-queue-lib';
@CommandHandler(RegisterFrontendUser)
export class RegisterFrontendUserHandler
  implements ICommandHandler<RegisterFrontendUser>
{
  constructor(
    private readonly repository: FrontendUserRepository,
    private readonly mailService: MailService
  ) {}

  async execute(
    command: RegisterFrontendUser
  ): Promise<FrontendUserSerializer> {
    const { params, sendToken } = command;
    let userData: FrontendUser;
    if (sendToken) {
      userData = await this.sendToken(params);
    } else {
      userData = await this.verifyTokenAndUpdate(params);
    }
    const serializedUser: FrontendUserSerializer =
      this.repository.transform(userData);
    delete serializedUser.skipHashPassword;
    return serializedUser;
  }

  async sendToken(
    payload: RegisterFrontendUser['params']
  ): Promise<FrontendUser> {
    let userData: FrontendUser;
    const currentDateTime = new Date();
    currentDateTime.setHours(currentDateTime.getHours() + 24);
    const token = await this.repository.generateUniqueCode(8, 'token');
    const existingUser = await this.repository.getUserByEmailOrUsername(
      payload.email,
      payload.username
    );
    if (existingUser && existingUser?.accountVerified) {
      if (
        payload.email.toLowerCase().trim() ===
        existingUser.email.toLowerCase().trim()
      ) {
        throw new CustomHttpException('Email already exists.');
      }
      if (
        payload.username.toLowerCase().trim() ===
        existingUser.username.toLowerCase().trim()
      ) {
        throw new CustomHttpException('Username already exists.');
      }
    }
    if (existingUser) {
      userData = (await this.repository.updateEntity(existingUser, {
        token,
        tokenExpiry: currentDateTime
      })) as FrontendUser;
    } else {
      userData = await this.repository.store({
        email: payload.email,
        username: payload.username,
        token,
        tokenExpiry: currentDateTime,
        skipHashPassword: true
      });
    }

    this.mailService.sendMail(
      {
        to: payload.email,
        subject: 'Email Verification',
        slug: 'registration-verification',
        context: {
          token
        }
      },
      'system-mail'
    );
    return userData;
  }

  async verifyTokenAndUpdate(
    payload: RegisterFrontendUser['params']
  ): Promise<FrontendUser> {
    const referralCode = await this.repository.generateUniqueCode(
      6,
      'referralCode'
    );
    const user = await this.repository.getUserByToken(payload.token);
    if (!user && !payload.createNew) {
      throw new CustomHttpException('Invalid token.');
    }
    if (payload.referralCode) {
      const referralUser = await this.repository.getUserByReferralCode(
        payload.referralCode
      );
      payload['referralId'] = referralUser?.id ?? null;
    }
    const salt = await bcrypt.genSalt();
    const data = {
      referralCode,
      ...(payload['referralId'] && { referralId: payload['referralId'] }),
      salt,
      ...(payload.email && { email: payload.email }),
      token: null,
      tokenExpiry: null,
      username: payload.username,
      ...(!payload.createNew && {
        password: await bcrypt.hash(payload.password, salt)
      }),
      accountVerified: true,
      ...(payload.address && { address: payload.address }),
      ...(payload.phantomAddress && { phantomAddress: payload.phantomAddress }),
      ...(payload.address && { address: payload.address }),
      ...(payload.identifier && { identifier: payload.identifier })
    };
    if (payload.createNew) {
      return (await this.repository.store(data)) as FrontendUser;
    }
    return (await this.repository.updateEntity(user, data)) as FrontendUser;
  }
}
