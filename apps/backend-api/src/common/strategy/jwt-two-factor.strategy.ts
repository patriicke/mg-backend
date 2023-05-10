import { HttpStatus, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import config from 'config';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { StatusCodesList, CustomHttpException } from '@app/common-module';
import { RequestContext, RequestUserContext } from '@app/request-context';

import { JwtPayloadDto } from '../../auth/dto/jwt-payload.dto';
import { AuthService } from '../../auth/auth.service';
import { UserSerializer } from '../../auth/serializer/user.serializer';

@Injectable()
export class JwtTwoFactorStrategy extends PassportStrategy(
  Strategy,
  'jwt-two-factor'
) {
  constructor(private readonly service: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          return request?.cookies?.Authentication;
        }
      ]),
      secretOrKey: process.env.JWT_SECRET || config.get('jwt.secret')
    });
  }

  async validate(payload: JwtPayloadDto): Promise<UserSerializer> {
    const { isTwoFAAuthenticated, subject } = payload;
    const user = await this.service.findOne(Number(subject), [
      'role',
      'role.permission'
    ]);
    const ctx: RequestUserContext = RequestContext.get();
    ctx.user = {
      id: user.id
    };
    if (!user.isTwoFAEnabled) {
      return user;
    }
    if (isTwoFAAuthenticated) {
      return user;
    }

    throw new CustomHttpException(
      'otpRequired',
      HttpStatus.FORBIDDEN,
      StatusCodesList.OtpRequired
    );
  }
}
