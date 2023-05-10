import { ApiPropertyOptional } from '@nestjs/swagger';
import { CommonSearchFieldDto } from '@app/common-module';
import { ValidateIf } from 'class-validator';

export class SearchFrontendUserDto extends CommonSearchFieldDto {
  @ApiPropertyOptional()
  @ValidateIf((object, value) => value)
  status: boolean;
}
