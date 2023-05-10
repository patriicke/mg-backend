import {
  Catch,
  ExceptionFilter,
  ArgumentsHost,
  HttpStatus
} from '@nestjs/common';
import { Response } from 'express';
import { CustomHttpException } from '../exception/custom-http.exception';

@Catch(CustomHttpException)
export class CustomHttpExceptionFilter
  implements ExceptionFilter<CustomHttpException>
{
  catch(exception: CustomHttpException, host: ArgumentsHost): any {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const meta = {
      api: {
        version: '0.0.1'
      }
    };
    response.status(HttpStatus.BAD_REQUEST).json({
      meta,
      errors: {
        title: 'Invalid Data.',
        code: HttpStatus.BAD_REQUEST,
        detail: exception.message
      }
    });
  }
}
