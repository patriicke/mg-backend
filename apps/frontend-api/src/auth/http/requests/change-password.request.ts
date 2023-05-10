import { ApiProperty } from '@nestjs/swagger';
import { IsEqualTo } from '@app/common-module';
import { IsNotEmpty, Matches, MaxLength, MinLength } from 'class-validator';

export class ChangePasswordRequest {
  @ApiProperty()
  @IsNotEmpty({ message: 'password is required' })
  checkPassword: string;

  @ApiProperty()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(20)
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
