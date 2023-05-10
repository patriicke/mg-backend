import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsAlphanumeric,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  MaxLength,
  MinLength,
  ValidateIf
} from 'class-validator';

export class UpdateUserProfileRequest {
  @ApiProperty()
  @IsNotEmpty()
  @IsAlphanumeric()
  @MinLength(3, { message: 'username must be at least 3 characters' })
  @MaxLength(15, { message: 'username must be at most 15 characters' })
  @Transform(({ value }) => value && value.toLowerCase())
  readonly username: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  @Transform(({ value }) => value && value.toLowerCase())
  readonly email: string;

  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    required: false
  })
  @ValidateIf((o, value) => value)
  avatar: Express.Multer.File;

  @ApiPropertyOptional()
  @ValidateIf((o) => o.defaultPicId)
  @Transform(({ value }) => {
    return value ? (parseInt(value) ? parseInt(value) : 'false') : 0;
  })
  @IsNumber()
  defaultPicId: number;

  @ApiProperty()
  @IsNotEmpty()
  @Transform(({ value }) => value === 'true')
  showUsername: boolean;
}
