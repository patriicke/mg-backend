import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { Not, ObjectLiteral } from 'typeorm';

import {
  CommonServiceInterface,
  ExceptionTitleList,
  StatusCodesList,
  ForbiddenException,
  Pagination
} from '@app/common-module';

import { CreateEmailTemplateDto } from '../dto/create-email-template.dto';
import { UpdateEmailTemplateDto } from '../dto/update-email-template.dto';
import { EmailTemplateRepository } from '../repository/email-template.repository';
import { EmailTemplate } from '../serializer/email-template.serializer';
import { EmailTemplatesSearchFilterDto } from '../dto/email-templates-search-filter.dto';

@Injectable()
export class EmailTemplateService
  implements CommonServiceInterface<EmailTemplate>
{
  constructor(private readonly repository: EmailTemplateRepository) {}

  /**
   * convert string to slug(code)
   * @param text
   */
  slugify(text: string) {
    return text
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');
  }

  /**
   * Find Email Template By Code(slug)
   * @param code
   */
  findByCode(code: string): Promise<EmailTemplate> {
    return this.repository.findOne({
      select: ['body'],
      where: {
        code
      }
    });
  }

  /**
   * Create new Email Template
   * @param createEmailTemplateDto
   */
  create(
    createEmailTemplateDto: CreateEmailTemplateDto
  ): Promise<EmailTemplate> {
    return this.repository.createEntity({
      ...createEmailTemplateDto,
      code: this.slugify(createEmailTemplateDto.title)
    });
  }

  /**
   * Get all email templates paginated list
   * @param filter
   */
  findAll(
    filter: EmailTemplatesSearchFilterDto
  ): Promise<Pagination<EmailTemplate>> {
    return this.repository.paginate(
      filter,
      [],
      ['title', 'subject', 'body', 'sender']
    );
  }

  /**
   * Find Email Template By Id
   * @param id
   */
  findOne(id: number): Promise<EmailTemplate> {
    return this.repository.get(id);
  }

  /**
   * Update Email Template by id
   * @param id
   * @param updateEmailTemplateDto
   */
  async update(
    id: number,
    updateEmailTemplateDto: UpdateEmailTemplateDto
  ): Promise<EmailTemplate> {
    const template = await this.repository.get(id);
    const condition: ObjectLiteral = {
      title: updateEmailTemplateDto.title
    };
    condition.id = Not(id);
    const countSameDescription = await this.repository.countEntityByCondition(
      condition
    );
    if (countSameDescription > 0) {
      throw new UnprocessableEntityException({
        property: 'title',
        constraints: {
          unique: 'already taken'
        }
      });
    }
    const emailTemplate = await this.repository.updateEntity(template, {
      ...updateEmailTemplateDto,
      code: this.slugify(updateEmailTemplateDto.title)
    });

    return emailTemplate;
  }

  /**
   * Remove Email Template By id
   * @param id
   */
  async remove(id: number): Promise<void> {
    const template = await this.findOne(id);
    if (template.isDefault) {
      throw new ForbiddenException(
        ExceptionTitleList.DeleteDefaultError,
        StatusCodesList.DeleteDefaultError
      );
    }
    await this.repository.delete({ id });
  }
}
