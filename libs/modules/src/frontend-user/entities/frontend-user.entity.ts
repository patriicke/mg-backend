import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  Index,
  OneToMany
} from 'typeorm';
import bcrypt from 'bcrypt';
import { CustomBaseEntity } from '@app/common-module';
import { Exclude } from 'class-transformer';
import { FeRefreshToken } from '@app/modules/fe-refresh-token';
import { Transaction } from '@app/modules/transaction';

/**
 * FrontendUser Entity
 */
@Entity({
  name: 'frontend_user'
})
export class FrontendUser extends CustomBaseEntity {
  @Index({
    unique: true
  })
  @Column()
  email: string;

  @Column()
  password: string;

  @Column()
  salt: string;

  @Index({
    unique: true
  })
  @Column()
  username: string;

  @Column()
  address: string;

  @Column()
  phantomAddress: string;

  @Column()
  identifier: string;

  @Column()
  showUsername: boolean;

  @Column()
  avatar: string;

  @Column()
  accountVerified: boolean;

  @Column()
  status: boolean;

  @Column()
  token: string;

  @Column()
  tokenExpiry: Date;

  @Column()
  referralCode: string;

  @Column()
  referralId: number;

  @Column()
  referralPoints: number;

  @Column()
  serverHash: string;

  @Column()
  nonce: string;

  @Column()
  deletedAt: Date;

  @OneToMany(() => Transaction, (transaction) => transaction.user)
  transactions: Transaction[];

  @Exclude({
    toPlainOnly: true
  })
  totalDepositCount: number;

  @Exclude({
    toPlainOnly: true
  })
  skipHashPassword = false;

  @Exclude({
    toPlainOnly: true
  })
  getPlainUsername: false;

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

  @OneToMany(() => FeRefreshToken, (feRefreshToken) => feRefreshToken.user)
  refreshTokens: FeRefreshToken[];
}
