import { DisposableEmailValidator } from '@app/common-module';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, Validate } from 'class-validator';

export class UpdateUserEmailRequest {
  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  @Validate(DisposableEmailValidator)
  @Transform(({ value }) => value.toLowerCase())
  readonly email: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'password is required' })
  readonly checkPassword: string;
}
