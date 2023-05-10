import { Inject, Injectable } from '@nestjs/common';
import { Queue } from 'bull';
import config from 'config';
import { InjectQueue } from '@nestjs/bull';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

import { MailJobInterface } from '../mail/interface/mail-job.interface';
import { EmailTemplateService } from '@app/modules/email-template';

@Injectable()
export class MailService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    @InjectQueue(config.get('mail.queueName'))
    private readonly mailQueue: Queue,
    private readonly emailTemplateService: EmailTemplateService
  ) {}

  /**
   * Replace place holder
   * @param str
   * @param obj
   */
  stringInject(str = '', obj = {}): string {
    let newStr = str;
    Object.keys(obj).forEach((key) => {
      const placeHolder = `{{${key}}}`;
      if (newStr.includes(placeHolder)) {
        newStr = newStr.replace(placeHolder, obj[key] || ' ');
      }
    });
    return newStr;
  }

  async sendMail(payload: MailJobInterface, type: string): Promise<void> {
    const mailBody = await this.emailTemplateService.findByCode(payload.code);
    if (mailBody) {
      try {
        payload.context.content = this.stringInject(
          mailBody.body,
          payload.context
        );
        await this.mailQueue.add(type, {
          payload
        });
        this.logger.info('MAIL_MODULE<Send Mail> ', {
          meta: {
            subject: payload.subject,
            type: type
          }
        });
      } catch (error) {
        this.logger.error('MAIL_MODULE<Send Mail> ', {
          meta: {
            error: error
          }
        });
      }
    }
  }
}
