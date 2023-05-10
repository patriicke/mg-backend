import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import config from 'config';
import {
  Transaction,
  TransactionService,
  TransactionStatus,
  TransactionType
} from '../transaction';
import { Cache } from 'cache-manager';
import { EntityManager } from 'typeorm';
import {
  ReferralDepositTrack,
  ReferralDepositTrackService
} from '../referral-deposit-track';
import { FrontendUser } from '../frontend-user';
import { referralBonus } from 'libs/common-module/custom-constant/referral-bonus';
import { Balance, BalanceRepository, BalanceType } from '../balance';
import { IReferralBounus } from './interfaces';
import { depositBonus } from '@app/common-module';
const nowPayConfig = config.get('nowPay');

@Injectable()
export class CronJobsService {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheService: Cache,
    @Inject(EntityManager) private readonly entityManager: EntityManager,
    private readonly transactionService: TransactionService,
    private readonly balanceRepository: BalanceRepository,
    private readonly referralDepositTrackService: ReferralDepositTrackService
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async checkTransactionsForReferralDeposits() {
    const transactions =
      await this.transactionService.getTransactionByStatusesAndType(
        [
          TransactionStatus.WAITING,
          TransactionStatus.CONFIRMING,
          TransactionStatus.CONFIRMED,
          TransactionStatus.SENDING,
          TransactionStatus.PARTIALLY_PAID
        ],
        TransactionType.DEPOSIT,
        ['user'],
        { createdAt: 'ASC' }
      );
    if (transactions.length === 0) {
      return;
    }

    for (const transaction of transactions) {
      const transactionBusyState = await this.cacheService.get(
        `transaction/busy/${transaction.paymentId}`
      );

      if (transactionBusyState) {
        continue;
      }

      await this.cacheService.set(
        `transaction/busy/${transaction.paymentId}`,
        true,
        {
          ttl: 60
        }
      );

      try {
        const transactionResponse = await this.transactionService.call(
          `payment/${transaction.paymentId}`,
          'GET'
        );

        const transactionResponseStatus =
          transactionResponse?.data?.payment_status;

        if (!transactionResponseStatus) {
          continue;
        }

        if (
          transactionResponseStatus.trim().toLowerCase() ===
          TransactionStatus.FINISHED
        ) {
          if (transaction?.user?.referralId) {
            await this.handleReferralBonusLogic({
              referralId: transaction?.user?.referralId,
              userId: transaction.userId,
              transactionId: transaction.id
            });
          }
          await this.saveBalanceAndDepositBonus(transaction);
        }

        await this.cacheService.del(
          `transaction/busy/${transaction.paymentId}`
        );

        await this.transactionService.update(transaction.id, {
          status: transactionResponseStatus
        });
      } catch (err) {
        await this.cacheService.del(
          `transaction/busy/${transaction.paymentId}`
        );
        console.log(
          `${err?.message}: Transaction payment id:${transaction.paymentId}`
        );
        continue;
      }
    }
  }

  async handleReferralBonusLogic(payload: IReferralBounus) {
    return new Promise(async (resolve, reject) => {
      const { referralId, userId, transactionId } = payload;

      const referralDepositCount =
        await this.referralDepositTrackService.checkMaximumReferralDepositCount(
          userId,
          referralId
        );
      if (referralDepositCount < 5) {
        await this.entityManager
          .transaction(async (queryRunner) => {
            await queryRunner.save(ReferralDepositTrack, {
              userId,
              referralUserId: referralId
            });
            await queryRunner.increment(
              FrontendUser,
              {
                id: referralId
              },
              'referralPoints',
              1
            );
            const { referralPoints } = await queryRunner.findOne(FrontendUser, {
              where: {
                id: referralId
              },
              select: ['referralPoints']
            });
            if (referralBonus[referralPoints]) {
              queryRunner.save(Balance, {
                transactionId,
                userId: referralId,
                amount: referralBonus[referralPoints],
                type: BalanceType.REFERRAL_BONUS
              });
            }
            resolve(true);
          })
          .catch((err) => {
            reject(err);
          });
      }
      resolve(true);
    });
  }

  async saveBalanceAndDepositBonus(transaction: Transaction) {
    return new Promise(async (resolve, reject) => {
      await this.entityManager
        .transaction(async (queryRunner) => {
          queryRunner.save(Balance, {
            userId: transaction.userId,
            transactionId: transaction.id,
            amount: transaction.fiatAmount,
            type: BalanceType.DEPOSIT
          });

          const depositBonusCount =
            await this.balanceRepository.depositBonusBalanceCount(
              transaction.userId
            );
          if (depositBonus[depositBonusCount]) {
            queryRunner.save(Balance, {
              userId: transaction.userId,
              transactionId: transaction.id,
              amount: parseFloat(
                (
                  (depositBonus[depositBonusCount] / 100) *
                  transaction.fiatAmount
                ).toFixed(2)
              ),
              type: BalanceType.DEPOSIT_BONUS
            });
          }
          resolve(true);
        })
        .catch((err) => {
          reject(err);
        });
      resolve(true);
    });
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async handleProcessingPayoutTransactions() {
    try {
      const transactions =
        await this.transactionService.getTransactionByStatusesAndType(
          [TransactionStatus.PROCESSING, TransactionStatus.SENDING],
          TransactionType.WITHDRAWAL,
          [],
          { createdAt: 'ASC' }
        );
      if (transactions.length === 0) {
        return;
      }
      const authResponse = await this.transactionService.call('auth', 'POST', {
        email: nowPayConfig.email,
        password: nowPayConfig.password
      });
      for (const transaction of transactions) {
        try {
          const transactionBusyState = await this.cacheService.get(
            `transaction/busy/${transaction.paymentId}`
          );

          if (transactionBusyState) {
            continue;
          }
          await this.cacheService.set(
            `transaction/busy/${transaction.paymentId}`,
            true
          );
          const transactionResponse = await this.transactionService.call(
            `payout/${transaction.paymentId}`,
            'GET',
            {},
            authResponse.data.token
          );

          const transactionResponseStatus =
            transactionResponse?.data?.[0]?.status;

          if (!transactionResponseStatus) {
            continue;
          }
          await this.transactionService.update(transaction.id, {
            status: transactionResponseStatus
          });
          await this.cacheService.del(
            `transaction/busy/${transaction.paymentId}`
          );
        } catch (err) {
          console.log(
            `processingPayoutTransaction: ${transaction.paymentId}`,
            err.message
          );
          await this.cacheService.del(
            `transaction/busy/${transaction.paymentId}`
          );
          continue;
        }
      }
    } catch (err) {
      console.log('processingPayoutTransaction', err.message);
    }
  }
}
