import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  OneToOne
} from 'typeorm';
import bcrypt from 'bcrypt';
import { Exclude } from 'class-transformer';
import { CustomBaseEntity } from '@app/common-module';

import { UserStatusEnum } from '../../auth/user-status.enum';
import { RoleEntity } from '../../role/entities/role.entity';

/**
 * User Entity
 */
@Entity({
  name: 'user'
})
export class UserEntity extends CustomBaseEntity {
  @Index({
    unique: true
  })
  @Column()
  email: string;

  @Column()
  @Exclude({
    toPlainOnly: true
  })
  password: string;

  @Index()
  @Column()
  firstName: string;

  @Index()
  @Column()
  lastName: string;

  @Column()
  @Exclude()
  address: string;

  @Column()
  contact: string;

  @Column()
  avatar: string;

  @Column()
  status: UserStatusEnum;

  @Column()
  @Exclude({
    toPlainOnly: true
  })
  token: string;

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP'
  })
  tokenValidityDate: Date;

  @Column()
  @Exclude({
    toPlainOnly: true
  })
  salt: string;

  @Column({
    nullable: true
  })
  @Exclude({
    toPlainOnly: true
  })
  twoFASecret?: string;

  @Exclude({
    toPlainOnly: true
  })
  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP'
  })
  twoFAThrottleTime?: Date;

  @Column({
    default: false
  })
  isTwoFAEnabled: boolean;

  @Exclude({
    toPlainOnly: true
  })
  skipHashPassword = false;

  @Column()
  disabled: boolean;

  @OneToOne(() => RoleEntity)
  @JoinColumn()
  role: RoleEntity;

  @Column()
  roleId: number;

  @BeforeInsert()
  @BeforeUpdate()
  async hashPasswordUpsert() {
    if (this.password && !this.skipHashPassword) {
      await this.hashPassword();
    }
  }

  async validatePassword(password: string): Promise<boolean> {
    const hash = await bcrypt.hash(password, this.salt);
    return hash === this.password;
  }

  async hashPassword() {
    this.password = await bcrypt.hash(this.password, this.salt);
  }
}
