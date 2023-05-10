import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { CustomBaseEntity } from '@app/common-module';
import { Transaction } from '@app/modules/transaction';

export enum BalanceType {
  GAME_WIN = 'game_win',
  GAME_LOSS = 'game_loss',
  DEPOSIT = 'deposit',
  WITHDRAWAL = 'withdraw',
  REFERRAL_BONUS = 'referral_bonus',
  DEPOSIT_BONUS = 'deposit_bonus'
}

@Entity({
  name: 'balance'
})
export class Balance extends CustomBaseEntity {
  @Column()
  transactionId: number;

  @Column()
  amount: number;

  @Column()
  type: BalanceType;

  @Column()
  userId: number;

  @ManyToOne(() => Transaction, (transaction) => transaction.balances)
  @JoinColumn({ name: 'transactionId', referencedColumnName: 'id' })
  transaction: Transaction;
}
