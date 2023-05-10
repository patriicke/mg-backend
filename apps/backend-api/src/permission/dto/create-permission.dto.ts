import {
  IsIn,
  IsNotEmpty,
  IsString,
  MaxLength,
  Validate
} from 'class-validator';
import { UniqueValidatorPipe } from '@app/common-module';

import { MethodList } from '../../config/permission-config';
import { PermissionEntity } from '../../permission/entities/permission.entity';

const methodListArray = [
  MethodList.GET,
  MethodList.POST,
  MethodList.ANY,
  MethodList.DELETE,
  MethodList.OPTIONS,
  MethodList.OPTIONS
];

export class CreatePermissionDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(32, {
    message: 'maxLength-{"ln":32,"count":32}'
  })
  resource: string;

  @IsNotEmpty()
  @IsString()
  @Validate(UniqueValidatorPipe, [PermissionEntity], {
    message: 'already taken'
  })
  description: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(50, {
    message: 'maxLength-{"ln":50,"count":50}'
  })
  path: string;

  @IsNotEmpty()
  @IsIn(methodListArray, {
    message: `isIn-{"items":"${methodListArray.join(',')}"}`
  })
  method: MethodList;
}
