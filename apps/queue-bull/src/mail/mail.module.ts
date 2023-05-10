import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { PugAdapter } from '@nestjs-modules/mailer/dist/adapters/pug.adapter';
import config from 'config';
import { MailProcessor } from './mail.processor';
import { BullQueueModule } from '@app/bull-queue-lib';
const mailConfig = config.get('mail');
@Module({
  imports: [
    BullQueueModule,
    MailerModule.forRootAsync({
      useFactory: () => ({
        transport: {
          host: process.env.MAIL_HOST || mailConfig.host,
          port: process.env.MAIL_PORT || mailConfig.port,
          secure: mailConfig.secure,
          ignoreTLS: mailConfig.ignoreTLS,
          auth: {
            user: process.env.MAIL_USER || mailConfig.user,
            pass: process.env.MAIL_PASS || mailConfig.pass
          }
        },
        defaults: {
          from: `"${process.env.MAIL_FROM || mailConfig.from}" <${
            process.env.MAIL_FROM || mailConfig.fromMail
          }>`
        },
        preview: mailConfig.preview,
        template: {
          dir: __dirname + '../../../../../src/mail/templates/email/layouts/',
          adapter: new PugAdapter(),
          options: {
            strict: true
          }
        }
      })
    })
  ],
  controllers: [],
  providers: [MailProcessor],
  exports: []
})
export class MailModule {}
