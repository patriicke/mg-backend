import {
  ApiHideProperty,
  ApiProperty,
  ApiPropertyOptional
} from '@nestjs/swagger';
import { Expose, Transform } from 'class-transformer';
import { ModelSerializer } from '@app/common-module';
import {
  FrontendUser,
  FrontendUserRepository
} from '@app/modules/frontend-user';
import {
  TransactionStatus,
  TransactionType
} from '../entities/transaction.entity';
import { Balance, BalanceRepository } from '@app/modules/balance';

export const basicFieldGroupsForSerializing: string[] = ['basic'];
export const adminFieldGroupsForSerializing: string[] = ['admin'];

export class TransactionSerializer extends ModelSerializer {
  @Expose({
    groups: [
      ...adminFieldGroupsForSerializing,
      ...basicFieldGroupsForSerializing
    ]
  })
  id: number;

  @Expose({
    groups: [...adminFieldGroupsForSerializing]
  })
  userId: number;

  @Expose({
    groups: [
      ...adminFieldGroupsForSerializing,
      ...basicFieldGroupsForSerializing
    ]
  })
  uuid: string;

  @Expose({
    groups: [
      ...adminFieldGroupsForSerializing,
      ...basicFieldGroupsForSerializing
    ]
  })
  currency: string;

  @Expose({
    groups: [
      ...adminFieldGroupsForSerializing,
      ...basicFieldGroupsForSerializing
    ]
  })
  paymentId: string;

  @Expose({
    groups: [...adminFieldGroupsForSerializing]
  })
  memo: string;

  @Expose({
    groups: [
      ...adminFieldGroupsForSerializing,
      ...basicFieldGroupsForSerializing
    ]
  })
  @Transform(({ value }) => {
    return parseFloat(parseFloat(value).toFixed(2));
  })
  fiatAmount: number;

  @Expose({
    groups: [
      ...adminFieldGroupsForSerializing,
      ...basicFieldGroupsForSerializing
    ]
  })
  @Transform(({ value }) => {
    return parseFloat(parseFloat(value).toFixed(6));
  })
  payAmount: number;

  @Expose({
    groups: [...adminFieldGroupsForSerializing]
  })
  @Transform(({ value }) => {
    return parseFloat(parseFloat(value).toFixed(6));
  })
  amountReceived: number;

  @Expose({
    groups: [
      ...adminFieldGroupsForSerializing,
      ...basicFieldGroupsForSerializing
    ]
  })
  type: TransactionType;

  @Expose({
    groups: [
      ...adminFieldGroupsForSerializing,
      ...basicFieldGroupsForSerializing
    ]
  })
  status: TransactionStatus;

  @Expose({
    groups: [...adminFieldGroupsForSerializing]
  })
  detail: any;

  @ApiProperty()
  @Expose({
    groups: [
      ...adminFieldGroupsForSerializing,
      ...basicFieldGroupsForSerializing
    ]
  })
  depositAddress: string;

  @ApiHideProperty()
  @Expose({
    groups: adminFieldGroupsForSerializing
  })
  @Transform(({ obj }) =>
    FrontendUserRepository.transform(obj.user, {
      groups: ['admin']
    })
  )
  user: FrontendUser;

  @ApiPropertyOptional()
  @Expose({
    groups: [
      ...adminFieldGroupsForSerializing,
      ...basicFieldGroupsForSerializing
    ]
  })
  createdAt: Date;

  @ApiPropertyOptional()
  @Expose({
    groups: adminFieldGroupsForSerializing
  })
  updatedAt: Date;

  @ApiPropertyOptional()
  @Expose({
    groups: adminFieldGroupsForSerializing
  })
  batchWithdrawalId: number;

  @ApiHideProperty()
  @Expose({
    groups: basicFieldGroupsForSerializing
  })
  @Transform(({ obj }) =>
    obj.balances
      ? BalanceRepository.transformMany(obj.balances, {
          groups: ['basic']
        })
      : undefined
  )
  balances: Balance;
}
