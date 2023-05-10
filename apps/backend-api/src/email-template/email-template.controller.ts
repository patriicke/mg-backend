import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards
} from '@nestjs/common';
import { ApiExcludeEndpoint, ApiTags } from '@nestjs/swagger';
import { Pagination } from '@app/common-module';

import { EmailTemplateService } from '@app/modules/email-template';
import {
  CreateEmailTemplateDto,
  UpdateEmailTemplateDto,
  EmailTemplatesSearchFilterDto
} from '@app/modules/email-template';
import { PermissionGuard } from '../common/guard/permission.guard';
import { EmailTemplate } from '@app/modules/email-template';
import { JwtTwoFactorGuard } from '../common/guard/jwt-two-factor.guard';
@ApiTags('email-templates')
@UseGuards(JwtTwoFactorGuard, PermissionGuard)
@Controller('email-templates')
export class EmailTemplateController {
  constructor(private readonly emailTemplateService: EmailTemplateService) {}

  @ApiExcludeEndpoint()
  @Post()
  create(
    @Body()
    createEmailTemplateDto: CreateEmailTemplateDto
  ): Promise<EmailTemplate> {
    return this.emailTemplateService.create(createEmailTemplateDto);
  }

  @Get()
  findAll(
    @Query()
    filter: EmailTemplatesSearchFilterDto
  ): Promise<Pagination<EmailTemplate>> {
    return this.emailTemplateService.findAll(filter);
  }

  @Get(':id')
  findOne(
    @Param('id')
    id: string
  ): Promise<EmailTemplate> {
    return this.emailTemplateService.findOne(+id);
  }

  @Put(':id')
  update(
    @Param('id')
    id: string,
    @Body()
    updateEmailTemplateDto: UpdateEmailTemplateDto
  ): Promise<EmailTemplate> {
    return this.emailTemplateService.update(+id, updateEmailTemplateDto);
  }

  @ApiExcludeEndpoint()
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('id')
    id: string
  ): Promise<void> {
    return this.emailTemplateService.remove(+id);
  }
}
