import { Optional } from '@nestjs/common';
import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  Validate
} from 'class-validator';
import { UniqueValidatorPipe } from '@app/common-module';

import { EmailTemplateEntity } from '../../email-template/entities/email-template.entity';

export class CreateEmailTemplateDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(128, {
    message: 'maxLength-{"ln":128,"count":128}'
  })
  @Validate(UniqueValidatorPipe, [EmailTemplateEntity], {
    message: 'already taken'
  })
  title: string;

  @IsNotEmpty()
  @IsString()
  @IsEmail()
  sender: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(255, {
    message: 'maxLength-{"ln":255,"count":255}'
  })
  subject: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(50, {
    message: 'minLength-{"ln":50,"count":50}'
  })
  body: string;

  @Optional()
  @IsString()
  @MaxLength(255, {
    message: 'maxLength-{"ln":255,"count":255}'
  })
  code: string;

  @Optional()
  @IsString()
  target: string;

  @IsOptional()
  @IsBoolean()
  isDefault: boolean;
}
