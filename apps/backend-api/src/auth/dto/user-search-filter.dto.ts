import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { ValidateIf } from 'class-validator';

import { CommonSearchFieldDto } from '@app/common-module';

export class UserSearchFilterDto extends PartialType(CommonSearchFieldDto) {
  @ApiPropertyOptional()
  @ValidateIf((object, value) => value)
  roleId: string;
}
