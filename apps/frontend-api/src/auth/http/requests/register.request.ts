import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DisposableEmailValidator, IsEqualTo } from '@app/common-module';
import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
  Validate,
  ValidateIf
} from 'class-validator';
import { Transform } from 'class-transformer';
export class RegisterRequest {
  @ApiProperty()
  @IsNotEmpty()
  @IsBoolean()
  sendToken: boolean;

  @ApiProperty()
  @ValidateIf((o) => !o.sendToken)
  @IsNotEmpty()
  @Transform(({ value }) => value.toLowerCase())
  readonly username: string;

  @ApiProperty()
  @ValidateIf((o) => o.sendToken)
  @IsNotEmpty()
  @IsEmail()
  @Validate(DisposableEmailValidator)
  @Transform(({ value }) => value.toLowerCase())
  readonly email: string;

  @ApiProperty()
  @ValidateIf((o) => !o.sendToken)
  @IsNotEmpty()
  readonly token: string;

  @ApiPropertyOptional()
  @ValidateIf(({ val }) => val)
  @IsString()
  readonly referralCode: string;

  @ApiProperty()
  @ValidateIf((o) => !o.sendToken)
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(20)
  @Matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s)/, {
    message:
      'password should contain at least one lowercase letter, one uppercase letter, one numeric digit, and one special character'
  })
  readonly password: string;

  @ApiProperty()
  @ValidateIf((o) => !o.sendToken)
  @IsNotEmpty()
  @IsEqualTo('password')
  confirmPassword: string;
}
