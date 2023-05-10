import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  InternalServerErrorException
} from '@nestjs/common';
import { Response } from 'express';

@Catch(InternalServerErrorException)
export class InternalErrorExceptionsFilter implements ExceptionFilter {
  public catch(exception: InternalServerErrorException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const meta = {
      api: {
        version: '0.0.1'
      }
    };
    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      meta,
      errors: {
        title: 'internal server error',
        code: HttpStatus.INTERNAL_SERVER_ERROR,
        detail: exception.message
      }
    });
  }
}
