import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class ResponseTransformInterceptor implements NestInterceptor {
  intercept(_context: ExecutionContext, next: CallHandler): Observable<any> {
    const meta = {
      api: {
        version: '0.0.1'
      }
    };
    return next.handle().pipe(
      map((data: any) => {
        return {
          meta,
          data
        };
      })
    );
  }
}
