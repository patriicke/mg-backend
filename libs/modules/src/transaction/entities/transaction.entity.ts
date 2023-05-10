import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { CustomBaseEntity } from '@app/common-module';
import { FrontendUser } from '@app/modules/frontend-user';
import { Balance } from '@app/modules/balance';

export enum TransactionType {
  DEPOSIT = 'deposit',
  WITHDRAWAL = 'withdrawal'
}

export enum TransactionStatus {
  PENDING = 'pending',
  WAITING = 'waiting',
  PROCESSING = 'processing',
  CONFIRMING = 'confirming',
  CONFIRMED = 'confirmed',
  SENDING = 'sending',
  PARTIALLY_PAID = 'partially_paid',
  FINISHED = 'finished',
  FAILED = 'failed',
  REFUNDED = 'refunded',
  EXPIRED = 'expired'
}

@Entity({
  name: 'transaction'
})
export class Transaction extends CustomBaseEntity {
  @Column({ generated: 'uuid' })
  uuid: string;

  @Column()
  currency: string;

  @Column()
  paymentId: string;

  @Column()
  depositAddress: string;

  @Column()
  memo: string;

  @Column('decimal', { precision: 20, scale: 8 })
  fiatAmount: number;

  @Column('decimal', { precision: 20, scale: 8 })
  payAmount: number;

  @Column('decimal', { precision: 20, scale: 8 })
  amountReceived: number;

  @Column()
  type: TransactionType;

  @Column()
  status: TransactionStatus;

  @Column({ type: 'json' })
  detail: any;

  @ManyToOne(() => FrontendUser)
  user: FrontendUser;

  @Column()
  userId: number;

  @Column()
  batchWithdrawalId: string;

  @OneToMany(() => Balance, (balance) => balance.transaction)
  balances: Balance[];
}
