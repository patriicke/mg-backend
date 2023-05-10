import {
  Catch,
  ExceptionFilter,
  ArgumentsHost,
  HttpStatus
} from '@nestjs/common';
import { Response } from 'express';
import { NotFoundException } from '../exception/not-found.exception';

@Catch(NotFoundException)
export class NotFoundExceptionFilter
  implements ExceptionFilter<NotFoundException>
{
  catch(exception: NotFoundException, host: ArgumentsHost): any {
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
        title: 'item not found',
        code: HttpStatus.NOT_FOUND,
        detail: exception.message
      }
    });
  }
}
