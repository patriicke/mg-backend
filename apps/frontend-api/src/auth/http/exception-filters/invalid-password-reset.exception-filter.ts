import {
  Catch,
  ExceptionFilter,
  ArgumentsHost,
  HttpStatus
} from '@nestjs/common';
import { Response } from 'express';
import { InvalidPasswordResetException } from '../exceptions/invalid-password-reset.exception';

@Catch(InvalidPasswordResetException)
export class InvalidPasswordResetExceptionFilter
  implements ExceptionFilter<InvalidPasswordResetException>
{
  catch(exception: InvalidPasswordResetException, host: ArgumentsHost): any {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const meta = {
      api: {
        version: '0.0.1'
      }
    };
    response.status(HttpStatus.NOT_FOUND).json({
      meta,
      errors: {
        title: 'Invalid password reset request',
        code: HttpStatus.NOT_FOUND,
        detail: exception.message
      }
    });
  }
}
