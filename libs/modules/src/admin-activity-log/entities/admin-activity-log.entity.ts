import { CustomBaseEntity } from '@app/common-module';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { UserEntity } from '../../../../../apps/backend-api/src/auth/entity/user.entity';

@Entity({
  name: 'admin_activity_log'
})
export class AdminActivityLog extends CustomBaseEntity {
  @Column()
  type: string;

  @Column()
  module: string;

  @Column()
  userId: number;

  @ManyToOne(() => UserEntity)
  @JoinColumn()
  user: UserEntity;

  @Column()
  message: string;

  @Column('simple-json', { nullable: true })
  metaData: {
    userId: number;
    courtId: number;
    FrontendUserId: number;
    roleId: number;
    emailTemplateId: number;
  };
}
