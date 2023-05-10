import { IsNotEmpty, Matches, MinLength } from 'class-validator';

import { IsEqualTo } from '@app/common-module';
import { ApiProperty } from '@nestjs/swagger';

/**
 * reset password data transfer object
 */
export class ResetPasswordDto {
  @ApiProperty()
  @IsNotEmpty()
  token: string;

  @ApiProperty()
  @IsNotEmpty()
  @MinLength(8, {
    message: 'minLength-{"ln":8,"count":8}'
  })
  @Matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s)/, {
    message:
      'password should contain at least one lowercase letter, one uppercase letter, one numeric digit, and one special character'
  })
  password: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsEqualTo('password')
  confirmPassword: string;
}
