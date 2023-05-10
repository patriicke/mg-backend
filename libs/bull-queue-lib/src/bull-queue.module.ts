import {
  EmailTemplateEntity,
  EmailTemplateRepository,
  EmailTemplateService
} from '@app/modules/email-template';
import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import config from 'config';
import { MailService } from './services/mail.service';
const queueConfig = config.get('queue');
@Module({
  imports: [
    TypeOrmModule.forFeature([EmailTemplateEntity]),
    BullModule.registerQueueAsync({
      name: config.get('mail.queueName'),
      useFactory: () => ({
        redis: {
          host: process.env.REDIS_HOST || queueConfig.host,
          port: process.env.REDIS_PORT || queueConfig.port,
          password: process.env.REDIS_PASSWORD || queueConfig.password,
          retryStrategy(times) {
            return Math.min(times * 50, 2000);
          }
        }
      })
    })
  ],
  controllers: [],
  providers: [EmailTemplateRepository, EmailTemplateService, MailService],
  exports: [EmailTemplateRepository, EmailTemplateService, MailService]
})
export class BullQueueModule {}
