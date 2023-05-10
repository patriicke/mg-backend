import { PassportStrategy } from '@nestjs/passport';
import { QueryBus } from '@nestjs/cqrs';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Injectable } from '@nestjs/common';
import config from 'config';
import { FrontendUserSerializer } from '@app/modules/frontend-user';
import { FindFrontendUserInfo } from '../../frontend-user/queries/find-frontend-user-info';

const cookieExtractor = (req) => {
  return req?.cookies?.Fe_Authentication;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt-strategy') {
  constructor(readonly queryBus: QueryBus) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor]),
      secretOrKey: process.env.JWT_SECRET || config.get('feJwt.secret')
    });
  }

  /**
   * Validate if user exists and return user entity
   * @param payload
   */
  async validate(
    payload: Record<string, string>
  ): Promise<FrontendUserSerializer> {
    const { subject } = payload;
    return this.queryBus.execute(FindFrontendUserInfo.byId(subject));
  }
}
