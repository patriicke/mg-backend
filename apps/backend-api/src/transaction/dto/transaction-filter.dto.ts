import { ApiPropertyOptional, OmitType } from '@nestjs/swagger';
import { CommonSearchFieldDto } from '@app/common-module';
import { TransactionStatus, TransactionType } from '@app/modules/transaction';
import { IsDate, IsIn, ValidateIf } from 'class-validator';
import { Transform } from 'class-transformer';
import moment from 'moment';

const transactionStatusArray = [
  TransactionStatus.PENDING,
  TransactionStatus.WAITING,
  TransactionStatus.CONFIRMING,
  TransactionStatus.CONFIRMED,
  TransactionStatus.SENDING,
  TransactionStatus.PROCESSING,
  TransactionStatus.PARTIALLY_PAID,
  TransactionStatus.FINISHED,
  TransactionStatus.FAILED,
  TransactionStatus.REFUNDED,
  TransactionStatus.EXPIRED
];

const transactionTypeArray = [
  TransactionType.DEPOSIT,
  TransactionType.WITHDRAWAL
];

export class TransactionFilterDto extends OmitType(CommonSearchFieldDto, [
  'keywords'
]) {
  @ApiPropertyOptional()
  @ValidateIf((o) => o.type)
  @IsIn(transactionTypeArray, {
    message: `type must be one of ${transactionTypeArray.join(', ')}`
  })
  type: TransactionType;

  @ApiPropertyOptional()
  @ValidateIf((o) => o.status)
  @IsIn(transactionStatusArray, {
    message: `status must be one of ${transactionStatusArray.join(', ')}`
  })
  status: TransactionStatus;

  @ApiPropertyOptional()
  @ValidateIf((o) => o.fromDate)
  @Transform(({ value }) => moment(value).startOf('day').toDate())
  @IsDate()
  fromDate: Date;

  @ApiPropertyOptional()
  @ValidateIf((o) => o.toDate)
  @Transform(({ value }) => moment(value).endOf('day').toDate())
  @IsDate()
  toDate: Date;
}
