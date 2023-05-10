import { HttpException, HttpStatus } from '@nestjs/common';

import { ExceptionTitleList } from '../custom-constant/exception-title-list.constant';
import { StatusCodesList } from '../custom-constant/status-codes-list.constant';

export class CustomHttpException extends HttpException {
  constructor(message?: string, statusCode?: number, code?: number) {
    super(
      {
        message: message || ExceptionTitleList.BadRequest,
        code: code || StatusCodesList.BadRequest,
        statusCode: statusCode || HttpStatus.BAD_REQUEST,
        error: true
      },
      statusCode || HttpStatus.BAD_REQUEST
    );
  }
}
