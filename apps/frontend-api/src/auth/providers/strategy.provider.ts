import { Provider } from '@nestjs/common';
import { JwtStrategy } from '../strategies/jwt.strategies';

export const JwtStrategyProvider = {
  provide: 'JwtStrategy',
  useClass: JwtStrategy
} as Provider;
