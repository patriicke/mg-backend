import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength
} from 'class-validator';
import { IsEqualTo } from '@app/common-module';

export class ResetPasswordDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  @MaxLength(20)
  @Matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s)/, {
    message:
      'password should contain at least one lowercase letter, one uppercase letter, one numeric digit, and one special character'
  })
  password: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsEqualTo('password', {
    message: 'isEqualTo-{"field":"password"}'
  })
  confirmPassword: string;
}
