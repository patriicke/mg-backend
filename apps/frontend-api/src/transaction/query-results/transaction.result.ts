import { TransactionStatus, TransactionType } from '@app/modules/transaction';

export class TransactionResult {
  readonly id: number;
  readonly uuid: string;
  readonly currency: string;
  readonly paymentId: string;
  readonly depositAddress: string;
  readonly memo: string;
  readonly fiatAmount: number;
  readonly payAmount: number;
  readonly amountReceived: number;
  readonly type: TransactionType;
  readonly status: TransactionStatus;
  readonly detail: any;
  readonly userId: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  constructor(props: TransactionResult) {
    Object.assign(this, props);
  }
}
