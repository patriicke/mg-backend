import { Exclude, Expose, Transform, Type } from 'class-transformer';
import {
  ApiHideProperty,
  ApiProperty,
  ApiPropertyOptional
} from '@nestjs/swagger';
import { ModelSerializer } from '@app/common-module';

import { UserStatusEnum } from '../../auth/user-status.enum';
import { RoleSerializer } from '../../role/serializer/role.serializer';

export const adminUserGroupsForSerializing: string[] = ['admin'];
export const ownerUserGroupsForSerializing: string[] = ['owner'];
export const defaultUserGroupsForSerializing: string[] = ['timestamps'];

/**
 * user serializer
 */
export class UserSerializer extends ModelSerializer {
  @Expose({
    groups: [...ownerUserGroupsForSerializing, ...adminUserGroupsForSerializing]
  })
  id: number;

  @ApiProperty()
  email: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty()
  @Transform(({ value }) => (value !== 'null' ? value : ''))
  address: string;

  @ApiProperty()
  @Expose({
    groups: ownerUserGroupsForSerializing
  })
  isTwoFAEnabled: boolean;

  @ApiPropertyOptional()
  @Expose({
    groups: ownerUserGroupsForSerializing
  })
  twoFASecret?: string;

  @ApiProperty()
  @Transform(({ value }) => (value !== 'null' ? value : ''))
  contact: string;

  @ApiProperty()
  @Transform(({ value }) => (value !== 'null' ? value : ''))
  avatar: string;

  @ApiPropertyOptional()
  @Expose({
    groups: adminUserGroupsForSerializing
  })
  status: UserStatusEnum;

  @ApiHideProperty()
  @Expose({
    groups: ownerUserGroupsForSerializing
  })
  @Type(() => RoleSerializer)
  role: RoleSerializer;

  @Exclude({
    toClassOnly: true
  })
  roleId: number;

  @Exclude({
    toClassOnly: true
  })
  tokenValidityDate: Date;

  @ApiPropertyOptional()
  @Expose({
    groups: defaultUserGroupsForSerializing
  })
  createdAt: Date;

  @ApiPropertyOptional()
  @Expose({
    groups: defaultUserGroupsForSerializing
  })
  updatedAt: Date;

  @ApiPropertyOptional()
  @Expose({
    groups: defaultUserGroupsForSerializing
  })
  disabled: boolean;
}
