import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { FrontendApiService } from './frontend-api.service';

@ApiTags('health')
@Controller()
export class FrontendApiController {
  constructor(private readonly frontendApiService: FrontendApiService) {}

  @Get('/health')
  async getHello() {
    return this.frontendApiService.getHello();
  }
}
