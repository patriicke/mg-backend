import { ICommandHandler, CommandHandler, QueryBus } from '@nestjs/cqrs';
import { CreatePayout } from './create-payout';
import {
  Transaction,
  TransactionService,
  TransactionStatus,
  TransactionType
} from '@app/modules/transaction';
import { FrontendUserRepository } from '@app/modules/frontend-user';
import { CustomHttpException } from '@app/common-module';
import { HttpStatus } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { InjectEntityManager } from '@nestjs/typeorm';
import { Balance, BalanceType } from '@app/modules/balance';
import { EstimateConversion } from '../queries/estimate-conversion';
@CommandHandler(CreatePayout)
export class CreatePayoutHandler implements ICommandHandler<CreatePayout> {
  constructor(
    @InjectEntityManager()
    readonly entityManager: EntityManager,
    readonly queryBus: QueryBus,
    readonly service: TransactionService,
    readonly frontendUserRepository: FrontendUserRepository
  ) {}
  async execute(command: CreatePayout) {
    const { address, currency, amount, userId } = command;
    const totalWalletBalance =
      await this.frontendUserRepository.getTotalRemainingBalance(userId);
    if (totalWalletBalance < amount) {
      throw new CustomHttpException(
        'Payout balance exceeds total wallet balance',
        HttpStatus.BAD_REQUEST
      );
    }
    const conversionResponse = await this.queryBus.execute(
      new EstimateConversion(amount, 'usd', currency)
    );

    try {
      const data = await this.entityManager.transaction(async (queryRunner) => {
        const transaction = await queryRunner.save(Transaction, {
          currency,
          depositAddress: address,
          fiatAmount: amount,
          payAmount: parseFloat(conversionResponse?.estimatedAmount.toFixed(2)),
          userId,
          status: TransactionStatus.PENDING,
          type: TransactionType.WITHDRAWAL
        });
        await queryRunner.save(Balance, {
          userId,
          transactionId: transaction.id,
          amount: -amount,
          type: BalanceType.WITHDRAWAL
        });
        return transaction;
      });
      return data.id;
    } catch (err) {
      throw new CustomHttpException(
        'Something went wrong during payout',
        HttpStatus.BAD_REQUEST
      );
    }
  }
}
