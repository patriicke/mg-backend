import { ModelSerializer } from '@app/common-module';
import { Expose, Transform } from 'class-transformer';
import { BalanceType } from '../entities/balance.entity';
export const basicFieldGroupsForSerializing: string[] = ['basic'];
export const adminFieldGroupsForSerializing: string[] = ['admin'];
export class BalanceSerializer extends ModelSerializer {
  @Expose({
    groups: [...basicFieldGroupsForSerializing]
  })
  transactionId: number;

  @Expose({
    groups: [...basicFieldGroupsForSerializing]
  })
  @Transform(({ value }) => {
    return parseFloat(parseFloat(value).toFixed(2));
  })
  amount: number;

  @Expose({
    groups: [...basicFieldGroupsForSerializing]
  })
  type: BalanceType;

  @Expose({
    groups: [...adminFieldGroupsForSerializing]
  })
  userId: number;

  @Expose({
    groups: [...adminFieldGroupsForSerializing]
  })
  createdAt: Date;

  @Expose({
    groups: [...adminFieldGroupsForSerializing]
  })
  updatedAt: Date;
}
