import { PartialType } from '@nestjs/swagger';
import { CommonSearchFieldDto } from '@app/common-module';

export class PermissionFilterDto extends PartialType(CommonSearchFieldDto) {}
