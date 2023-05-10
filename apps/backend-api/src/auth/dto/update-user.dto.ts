import {
  MaxLength,
  IsIn,
  IsString,
  Matches,
  MinLength,
  ValidateIf
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

import { UserStatusEnum } from '../../auth/user-status.enum';

const statusEnumArray = [
  UserStatusEnum.ACTIVE,
  UserStatusEnum.INACTIVE,
  UserStatusEnum.BLOCKED
];
/**
 * update user data transfer object
 */
export class UpdateUserDto {
  @ApiPropertyOptional()
  @ValidateIf((object, value) => value)
  @IsString()
  @MinLength(2, {
    message: 'minLength-{"ln":2,"count":2}'
  })
  @MaxLength(16, {
    message: 'maxLength-{"ln":16,"count":16}'
  })
  firstName: string;

  @ApiPropertyOptional()
  @ValidateIf((object, value) => value)
  @IsString()
  @MinLength(2, {
    message: 'minLength-{"ln":2,"count":2}'
  })
  @MaxLength(16, {
    message: 'maxLength-{"ln":16,"count":16}'
  })
  lastName: string;

  @ApiPropertyOptional()
  @ValidateIf((object, value) => value)
  @IsString()
  address: string;

  @ApiPropertyOptional()
  @ValidateIf((object, value) => value)
  @IsIn(statusEnumArray, {
    message: `isIn-{"items":"${statusEnumArray.join(',')}"}`
  })
  status: UserStatusEnum;

  @ApiPropertyOptional()
  @ValidateIf((object, value) => value)
  roleId: number;

  @ApiPropertyOptional()
  @IsString()
  @Transform(({ value }) => (value === '' ? undefined : value), {
    toClassOnly: true
  })
  @ValidateIf((object, value) => value)
  @Matches(/^([0-9]*)?$/, {
    message: 'isValidPhoneNumber'
  })
  @MinLength(9, {
    message: 'minLength-{"ln":9,"count":9}'
  })
  @MaxLength(15, {
    message: 'maxLength-{"ln":15,"count":15}'
  })
  contact: string;
}
