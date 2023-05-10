import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
  Validate,
  IsOptional
} from 'class-validator';
import { Transform } from 'class-transformer';

import {
  DisposableEmailValidator,
  UniqueValidatorPipe
} from '@app/common-module';
import { UserEntity } from '../../auth/entity/user.entity';

/**
 * register user data transform object
 */
export class RegisterUserDto {
  @IsNotEmpty()
  @IsEmail()
  @Validate(DisposableEmailValidator)
  @Transform(({ value }) => String(value).toLowerCase(), {
    toClassOnly: true
  })
  @Validate(UniqueValidatorPipe, [UserEntity], {
    message: 'already taken'
  })
  email: string;

  @IsNotEmpty()
  @MinLength(5, {
    message: 'minLength-{"ln":5,"count":5}'
  })
  @Matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{5,}$/, {
    message:
      'password should contain at least one lowercase letter, one uppercase letter, one numeric digit, and one special character'
  })
  password: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(2, {
    message: 'minLength-{"ln":2,"count":2}'
  })
  @MaxLength(16, {
    message: 'maxLength-{"ln":16,"count":16}'
  })
  firstName: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(2, {
    message: 'minLength-{"ln":2,"count":2}'
  })
  @MaxLength(16, {
    message: 'maxLength-{"ln":16,"count":16}'
  })
  lastName: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => (value === '' ? undefined : value), {
    toClassOnly: true
  })
  @Matches(/^([0-9]*)?$/, {
    message: 'isValidPhoneNumber'
  })
  @MinLength(9, {
    message: 'minDigit-{"ln":9,"count":9}'
  })
  @MaxLength(15, {
    message: 'maxDigit-{"ln":15,"count":15}'
  })
  @Validate(UniqueValidatorPipe, [UserEntity], {
    message: 'already taken'
  })
  contact: string;
}
