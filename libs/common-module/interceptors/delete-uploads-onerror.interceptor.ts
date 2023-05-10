import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { Request } from 'express';
import { Observable, catchError, throwError } from 'rxjs';
import * as util from 'util';
import * as fs from 'fs';
import path = require('path');

const unlink = util.promisify(fs.unlink);

export class DeleteUploadsOnErrorInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>
  ): Observable<any> | Promise<Observable<any>> {
    const request: Request = context.switchToHttp().getRequest();
    return next.handle().pipe(
      catchError((err) => {
        if (request.files) {
          const fileDeletePromises: Promise<any>[] = [];
          Object.values(request.files).forEach((value) =>
            fileDeletePromises.push(
              ...value.map((el) => {
                if (el.path) {
                  return unlink(path.join(process.cwd(), el.path));
                }
                return null;
              })
            )
          );
          Promise.all(fileDeletePromises).catch();
        }
        return throwError(() => err);
      })
    );
  }
}
