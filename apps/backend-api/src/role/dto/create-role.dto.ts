import {
  IsNotEmpty,
  IsNumber,
  IsString,
  MaxLength,
  MinLength,
  Validate,
  ValidateIf
} from 'class-validator';

import { UniqueValidatorPipe } from '@app/common-module';
import { RoleEntity } from '../../role/entities/role.entity';

export class CreateRoleDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(2, {
    message: 'minLength-{"ln":2,"count":2}'
  })
  @MaxLength(32, {
    message: 'maxLength-{"ln":32,"count":32}'
  })
  @Validate(UniqueValidatorPipe, [RoleEntity], {
    message: 'already taken'
  })
  name: string;

  @ValidateIf((object, value) => value)
  @IsString()
  description: string;

  @ValidateIf((object, value) => value)
  @IsNumber(
    {},
    {
      each: true,
      message: 'should be array of numbers'
    }
  )
  permissions: number[];
}
