import { MigrationInterface, QueryRunner } from 'typeorm';

import templates from '../../config/email-template';
import { EmailTemplateEntity } from '@app/modules/email-template';

export class CreateEmailTemplateSeed1673336014551
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.manager
      .createQueryBuilder()
      .insert()
      .into(EmailTemplateEntity)
      .values(templates)
      .orIgnore()
      .execute();
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.manager.getRepository(EmailTemplateEntity).delete({});
  }
}
