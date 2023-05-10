import { PartialType } from '@nestjs/swagger';
import { CommonSearchFieldDto } from '@app/common-module';

export class RoleFilterDto extends PartialType(CommonSearchFieldDto) {}
