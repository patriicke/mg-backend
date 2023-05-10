import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TokenExpiredError } from 'jsonwebtoken';

import {
  ForbiddenException,
  StatusCodesList,
  UnauthorizedException
} from '@app/common-module';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt-strategy') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest(err, user, info) {
    if (info instanceof TokenExpiredError) {
      throw new ForbiddenException(
        'tokenExpired',
        StatusCodesList.TokenExpired
      );
    }
    if (err || !user) {
      throw err || new UnauthorizedException();
    }
    return user;
  }
}
