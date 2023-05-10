import {
  Catch,
  ExceptionFilter,
  ArgumentsHost,
  HttpStatus
} from '@nestjs/common';
import { Response } from 'express';
import { UnauthorizedException } from '../exception/unauthorized.exception';

@Catch(UnauthorizedException)
export class UnauthorizedExceptionFilter
  implements ExceptionFilter<UnauthorizedException>
{
  catch(exception: UnauthorizedException, host: ArgumentsHost): any {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const meta = {
      api: {
        version: '0.0.1'
      }
    };
    response.status(HttpStatus.UNAUTHORIZED).json({
      meta,
      errors: {
        title: 'unauthorized',
        code: HttpStatus.UNAUTHORIZED,
        detail: exception.message
      }
    });
  }
}
