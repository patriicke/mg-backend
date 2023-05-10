import { HttpException, HttpStatus } from '@nestjs/common';

import { ExceptionTitleList } from '../custom-constant/exception-title-list.constant';
import { StatusCodesList } from '../custom-constant/status-codes-list.constant';

export class TooManyRequestException extends HttpException {
  constructor(message?: string, code?: number) {
    super(
      {
        message: message || ExceptionTitleList.TooManyTries,
        code: code || StatusCodesList.TooManyTries,
        statusCode: HttpStatus.TOO_MANY_REQUESTS,
        error: true
      },
      HttpStatus.TOO_MANY_REQUESTS
    );
  }
}
