import { Injectable } from '@nestjs/common';

@Injectable()
export class FrontendApiService {
  getHello() {
    return {
      message: 'Hello World!'
    };
  }
}
