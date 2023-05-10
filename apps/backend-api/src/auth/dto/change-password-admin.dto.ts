import { IsNotEmpty, MinLength, Matches } from 'class-validator';
import { IsEqualTo } from '@app/common-module';

export class ChangePasswordAdminDto {
  @IsNotEmpty()
  @MinLength(8, {
    message: 'minLength-{"ln":8,"count":8}'
  })
  @Matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s)/, {
    message:
      'password should contain at least one lowercase letter, one uppercase letter, one numeric digit, and one special character'
  })
  password: string;

  @IsNotEmpty()
  @IsEqualTo('password', {
    message: 'isEqualTo-{"field":"password"}'
  })
  confirmPassword: string;
}
