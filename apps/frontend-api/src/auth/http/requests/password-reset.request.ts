import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class PasswordResetRequest {
  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  readonly email: string;
}
