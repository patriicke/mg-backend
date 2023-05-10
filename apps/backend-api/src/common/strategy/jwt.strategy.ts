import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Injectable } from '@nestjs/common';
import config from 'config';
import { UnauthorizedException } from '@app/common-module';

import { JwtPayloadDto } from '../../auth/dto/jwt-payload.dto';
import { AuthService } from '../../auth/auth.service';
import { UserSerializer } from '../../auth/serializer/user.serializer';

const cookieExtractor = (req) => {
  return req?.cookies?.Authentication;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt-strategy') {
  constructor(private readonly service: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor]),
      secretOrKey: process.env.JWT_SECRET || config.get('jwt.secret')
    });
  }

  /**
   * Validate if user exists and return user entity
   * @param payload
   */
  async validate(payload: JwtPayloadDto): Promise<UserSerializer> {
    const { subject } = payload;
    const user = await this.service.findOne(Number(subject), [
      'role',
      'role.permission'
    ]);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
