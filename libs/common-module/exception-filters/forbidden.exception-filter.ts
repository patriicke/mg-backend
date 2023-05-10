import {
  Catch,
  ExceptionFilter,
  ArgumentsHost,
  HttpStatus
} from '@nestjs/common';
import { Response } from 'express';
import { ForbiddenException } from '../exception/forbidden.exception';

@Catch(ForbiddenException)
export class ForbiddenExceptionFilter
  implements ExceptionFilter<ForbiddenException>
{
  catch(exception: ForbiddenException, host: ArgumentsHost): any {
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
        title: 'forbidden resource',
        code: HttpStatus.FORBIDDEN,
        detail: exception.message
      }
    });
  }
}
