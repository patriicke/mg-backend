import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

import { ExceptionTitleList } from '@app/common-module';

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  protected errorMessage = ExceptionTitleList.TooManyTries;
}
