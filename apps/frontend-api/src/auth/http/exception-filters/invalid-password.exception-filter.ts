import {
  Catch,
  ExceptionFilter,
  ArgumentsHost,
  HttpStatus
} from '@nestjs/common';
import { Response } from 'express';
import { InvalidPasswordException } from '../exceptions/invalid-password.exception';

@Catch(InvalidPasswordException)
export class InvalidPasswordExceptionFilter
  implements ExceptionFilter<InvalidPasswordException>
{
  catch(exception: InvalidPasswordException, host: ArgumentsHost): any {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const meta = {
      api: {
        version: '0.0.1'
      }
    };
    response.status(HttpStatus.FORBIDDEN).json({
      meta,
      errors: {
        title: 'invalid password provided',
        code: HttpStatus.FORBIDDEN,
        detail: exception.message
      }
    });
  }
}
