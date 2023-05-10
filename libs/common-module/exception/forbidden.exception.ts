import { HttpException, HttpStatus } from '@nestjs/common';

import { ExceptionTitleList } from '../custom-constant/exception-title-list.constant';
import { StatusCodesList } from '../custom-constant/status-codes-list.constant';

export class ForbiddenException extends HttpException {
  constructor(message?: string, code?: number) {
    super(
      {
        message: message || ExceptionTitleList.Forbidden,
        code: code || StatusCodesList.Forbidden,
        statusCode: HttpStatus.FORBIDDEN,
        error: true
      },
      HttpStatus.FORBIDDEN
    );
  }
}
