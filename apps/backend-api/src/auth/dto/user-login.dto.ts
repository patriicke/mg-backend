import { IsLowercase, IsNotEmpty, IsBoolean, IsEmail } from 'class-validator';

/**
 * user login data transfer object
 */
export class UserLoginDto {
  @IsNotEmpty()
  @IsLowercase()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;

  @IsBoolean()
  remember: boolean;
}
