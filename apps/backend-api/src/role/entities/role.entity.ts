import {
  Column,
  Entity,
  Index,
  // JoinColumn,
  JoinTable,
  ManyToMany,
  // ManyToOne,
  OneToMany,
  Unique
} from 'typeorm';
import { CustomBaseEntity } from '@app/common-module';

import { PermissionEntity } from '../../permission/entities/permission.entity';
import { UserEntity } from '../../auth/entity/user.entity';

@Entity({
  name: 'role'
})
@Unique(['name'])
export class RoleEntity extends CustomBaseEntity {
  @Column('varchar', { length: 100 })
  @Index({
    unique: true
  })
  name: string;

  @Column('text')
  description: string;

  @OneToMany(() => UserEntity, (user) => user.role)
  users: UserEntity[];

  @ManyToMany(() => PermissionEntity, (permission) => permission.role)
  @JoinTable({
    name: 'role_permission',
    joinColumn: {
      name: 'roleId',
      referencedColumnName: 'id'
    },
    inverseJoinColumn: {
      name: 'permissionId',
      referencedColumnName: 'id'
    }
  })
  permission: PermissionEntity[];

  constructor(data?: Partial<RoleEntity>) {
    super();
    if (data) {
      Object.assign(this, data);
    }
  }
}
