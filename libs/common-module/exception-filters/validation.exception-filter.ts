import {
  Catch,
  ExceptionFilter,
  ArgumentsHost,
  HttpStatus,
  UnprocessableEntityException
} from '@nestjs/common';
import { Response } from 'express';

@Catch(UnprocessableEntityException)
export class ValidationExceptionFilter
  implements ExceptionFilter<UnprocessableEntityException>
{
  catch(exception: UnprocessableEntityException, host: ArgumentsHost): any {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const errors: any = [];
    const validationError: any = exception.getResponse();

    if (validationError.message && validationError.message?.length) {
      for (const errorPayload of validationError.message) {
        errors.push({
          property: errorPayload.property,
          constraints: Object.keys(errorPayload.constraints).join(', '),
          messages: Object.values(errorPayload.constraints).join(', ')
        });
      }
    }
    const meta = {
      api: {
        version: '0.0.1'
      }
    };
    response.status(HttpStatus.UNPROCESSABLE_ENTITY).json({
      meta,
      title: exception.message,
      status: HttpStatus.UNPROCESSABLE_ENTITY,
      errors
    });
  }
}
