import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions } from '@nestjs/microservices';
import { QueueBullModule } from './queue-bull.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    QueueBullModule,
    {
      options: {
        host: '0.0.0.0',
        port: process.env.QUEUE_BULL_PORT
      }
    }
  );
  await app.listen();
}
bootstrap();
