import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumberString, ValidateIf } from 'class-validator';
import { Transform } from 'class-transformer';

export class NftRequest {
  // @ApiPropertyOptional()
  // @ValidateIf((o) => o.cursor)
  // @IsString()
  // cursor: string;

  @ApiPropertyOptional()
  @ValidateIf((o) => o.limit)
  @IsNumberString()
  @Transform((value) => Number(value))
  limit: number;

  @ApiPropertyOptional()
  @ValidateIf((o) => o.page)
  @IsNumberString()
  @Transform((value) => Number(value))
  page: number;
}
