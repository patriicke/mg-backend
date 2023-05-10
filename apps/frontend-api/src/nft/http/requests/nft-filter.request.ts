import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsString, MinLength, ValidateIf } from 'class-validator';

export class NftFilterRequest {
  @ApiPropertyOptional()
  @ValidateIf((o) => o.keyword)
  @IsString()
  @Transform(({ value }) => value.trim())
  @MinLength(3)
  keyword: string;
}
