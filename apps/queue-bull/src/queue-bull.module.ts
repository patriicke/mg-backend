import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import ormConfig from '@app/config/config/ormconfig';
import { MailModule } from './mail/mail.module';
import { EmailTemplate } from '@app/modules/email-template';
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        ...ormConfig,
        autoLoadEntities: true,
        entities: [EmailTemplate]
      })
    }),
    MailModule
  ],
  controllers: [],
  providers: []
})
export class QueueBullModule {}
