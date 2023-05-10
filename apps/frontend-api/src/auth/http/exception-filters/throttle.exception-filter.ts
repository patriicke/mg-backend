import {
  Catch,
  ExceptionFilter,
  ArgumentsHost,
  HttpStatus
} from '@nestjs/common';
import { ThrottlerException } from '@nestjs/throttler';
import { Response } from 'express';

@Catch(ThrottlerException)
export class TooManyRequestExceptionFilter
  implements ExceptionFilter<ThrottlerException>
{
  catch(exception: ThrottlerException, host: ArgumentsHost): any {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const meta = {
      api: {
        version: '0.0.1'
      }
    };
    response.status(HttpStatus.TOO_MANY_REQUESTS).json({
      meta,
      errors: {
        title: 'Too many requests',
        code: HttpStatus.TOO_MANY_REQUESTS,
        detail: exception.message
      }
    });
  }
}
