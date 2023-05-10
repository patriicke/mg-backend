import { Controller, Get, Inject } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@Controller()
export class AppController {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger
  ) {}
  @Get('/health')
  health() {
    this.logger.info(`Check<Health>`, {
      context: 'AppController',
      meta: {
        payload: {
          message: 'health all good'
        },
        type: 'health'
      }
    });
    return {
      status: 200
    };
  }

  @Get('')
  index() {
    return {
      message: 'hello world'
    };
  }
}
