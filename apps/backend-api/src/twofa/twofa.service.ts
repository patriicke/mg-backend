import { HttpStatus, Injectable } from '@nestjs/common';
import config from 'config';
import { Response } from 'express';
import { authenticator } from 'otplib';
import { toFileStream, toDataURL } from 'qrcode';
import { StatusCodesList, CustomHttpException } from '@app/common-module';

import { AuthService } from '../auth/auth.service';
import { UserEntity } from '../auth/entity/user.entity';

const TwofaConfig = config.get('twofa');

@Injectable()
export class TwofaService {
  constructor(private readonly usersService: AuthService) {}

  async generateTwoFASecret(user: UserEntity) {
    if (user.twoFAThrottleTime > new Date()) {
      throw new CustomHttpException(
        `tooManyRequest-{"second":"${this.differentBetweenDatesInSec(
          user.twoFAThrottleTime,
          new Date()
        )}"}`,
        HttpStatus.TOO_MANY_REQUESTS,
        StatusCodesList.TooManyTries
      );
    }
    const secret = authenticator.generateSecret();
    const otpauthUrl = authenticator.keyuri(
      user.email,
      TwofaConfig.authenticationAppNAme,
      secret
    );
    await this.usersService.setTwoFactorAuthenticationSecret(secret, user.id);
    return {
      secret,
      otpauthUrl
    };
  }

  isTwoFACodeValid(twoFASecret: string, user: UserEntity) {
    console.log(
      '🚀 ~ file: twofa.service.ts:42 ~ TwofaService ~ isTwoFACodeValid ~ twoFASecret:',
      twoFASecret,
      user
    );

    return authenticator.verify({
      token: twoFASecret,
      secret: user.twoFASecret
    });
  }

  async pipeQrCodeStream(stream: Response, otpauthUrl: string) {
    return toFileStream(stream, otpauthUrl);
  }

  async qrDataToUrl(otpauthUrl: string): Promise<string> {
    return toDataURL(otpauthUrl);
  }

  differentBetweenDatesInSec(initialDate: Date, endDate: Date): number {
    const diffInSeconds = Math.abs(initialDate.getTime() - endDate.getTime());
    return Math.ceil(diffInSeconds / 1000);
  }
}
