import { HttpException, HttpStatus } from '@nestjs/common';

import { ExceptionTitleList } from '../custom-constant/exception-title-list.constant';
import { StatusCodesList } from '../custom-constant/status-codes-list.constant';

export class UnauthorizedException extends HttpException {
  constructor(message?: string, code?: number) {
    super(
      {
        message: message || ExceptionTitleList.Unauthorized,
        code: code || StatusCodesList.UnauthorizedAccess,
        statusCode: HttpStatus.UNAUTHORIZED,
        error: true
      },
      HttpStatus.UNAUTHORIZED
    );
  }
}
