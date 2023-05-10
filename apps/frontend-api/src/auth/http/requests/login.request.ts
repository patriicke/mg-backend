import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty } from 'class-validator';

export class LoginRequest {
  @ApiProperty()
  @IsNotEmpty()
  @Transform(({ value }) => value.toLowerCase())
  readonly email: string;

  @ApiProperty()
  @IsNotEmpty()
  readonly password: string;
}
