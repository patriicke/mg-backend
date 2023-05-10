import { FrontendUser } from '@app/modules/frontend-user';
import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn
} from 'typeorm';

@Entity({
  name: 'fe_refresh_token'
})
export class FeRefreshToken extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @ManyToOne(() => FrontendUser, (feUser) => feUser.refreshTokens)
  @JoinColumn({ name: 'userId', referencedColumnName: 'id' })
  user: FrontendUser;

  @Column()
  ip: string;

  @Column()
  userAgent: string;

  @Column()
  browser: string;

  @Column()
  os: string;

  @Column()
  isRevoked: boolean;

  @Column()
  expires: Date;
}
