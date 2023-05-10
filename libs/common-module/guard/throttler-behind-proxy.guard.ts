import { ThrottlerGuard } from '@nestjs/throttler';
import { Injectable } from '@nestjs/common';
import requestIp from 'request-ip';

@Injectable()
export class ThrottlerBehindProxyGuard extends ThrottlerGuard {
  protected getTracker(req: any): string {
    return req.clientIp || requestIp.getClientIp(req);
  }
}
