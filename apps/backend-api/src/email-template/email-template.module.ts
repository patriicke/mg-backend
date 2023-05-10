import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UniqueValidatorPipe } from '@app/common-module';

import {
  EmailTemplateService,
  EmailTemplateEntity,
  EmailTemplateRepository
} from '@app/modules/email-template';
import { EmailTemplateController } from '../email-template/email-template.controller';
import { AuthModule } from '../auth/auth.module';
@Module({
  imports: [
    TypeOrmModule.forFeature([EmailTemplateEntity]),
    forwardRef(() => AuthModule)
  ],
  exports: [EmailTemplateService],
  controllers: [EmailTemplateController],
  providers: [
    EmailTemplateRepository,
    EmailTemplateService,
    UniqueValidatorPipe
  ]
})
export class EmailTemplateModule {}
