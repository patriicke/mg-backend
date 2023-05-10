import { instanceToPlain, plainToInstance } from 'class-transformer';
import { BaseRepository } from '@app/common-module';
import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

import { EmailTemplateEntity } from '../entities/email-template.entity';
import { EmailTemplate } from '../serializer/email-template.serializer';

@Injectable()
export class EmailTemplateRepository extends BaseRepository<
  EmailTemplateEntity,
  EmailTemplate
> {
  constructor(private dataSource: DataSource) {
    super(EmailTemplateEntity, dataSource.createEntityManager());
  }
  transform(model: EmailTemplateEntity, transformOption = {}): EmailTemplate {
    return plainToInstance(
      EmailTemplate,
      instanceToPlain(model, transformOption),
      transformOption
    );
  }

  transformMany(
    models: EmailTemplateEntity[],
    transformOption = {}
  ): EmailTemplate[] {
    return models.map((model) => this.transform(model, transformOption));
  }
}
