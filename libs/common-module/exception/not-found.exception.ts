import { HttpException, HttpStatus } from '@nestjs/common';

import { ExceptionTitleList } from '../custom-constant/exception-title-list.constant';
import { StatusCodesList } from '../custom-constant/status-codes-list.constant';

export class NotFoundException extends HttpException {
  constructor(message?: string, code?: number) {
    super(
      {
        message: message || ExceptionTitleList.NotFound,
        code: code || StatusCodesList.NotFound,
        statusCode: HttpStatus.NOT_FOUND,
        error: true
      },
      HttpStatus.NOT_FOUND
    );
  }
}
