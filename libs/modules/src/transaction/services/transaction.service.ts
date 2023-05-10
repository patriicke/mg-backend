import { Injectable } from '@nestjs/common';
import config from 'config';
import axios from 'axios';
import { InjectRepository } from '@nestjs/typeorm';
import { In, IsNull, Not, ObjectLiteral, Repository } from 'typeorm';
import {
  CustomHttpException,
  Pagination,
  PaginationInfoInterface
} from '@app/common-module';
import {
  Transaction,
  TransactionSerializer,
  TransactionStatus,
  TransactionType
} from '@app/modules/transaction';
import { plainToInstance, instanceToPlain } from 'class-transformer';
import { BalanceType } from '@app/modules/balance';

const nowPayConfig = config.get('nowPay');
@Injectable()
export class TransactionService {
  constructor(
    @InjectRepository(Transaction)
    private repository: Repository<Transaction>
  ) {}

  getPendingWithdrawalRequests() {
    return this.repository.find({
      where: {
        type: TransactionType.WITHDRAWAL,
        status: TransactionStatus.PENDING
      }
    });
  }

  getAllWithdrawalRequests() {
    return this.repository.find({
      where: {
        type: TransactionType.WITHDRAWAL
      }
    });
  }

  getAllDepositRequests() {
    return this.repository.find({
      where: {
        type: TransactionType.DEPOSIT
      }
    });
  }

  async getfilteredTransactions(
    searchFilter: Partial<any>,
    transformOptions = {},
    relations = []
  ): Promise<Pagination<TransactionSerializer>> {
    const queryBuilder = this.repository.createQueryBuilder('transaction');

    if (searchFilter.hasOwnProperty('userId') && searchFilter.userId) {
      queryBuilder.andWhere('transaction.userId = :userId', {
        userId: searchFilter.userId
      });
    }
    if (searchFilter.hasOwnProperty('status') && searchFilter.status) {
      queryBuilder.andWhere('transaction.status = :status', {
        status: searchFilter.status
      });
    }
    if (searchFilter.hasOwnProperty('type') && searchFilter.type) {
      queryBuilder.andWhere('transaction.type = :type', {
        type: searchFilter.type
      });
    }

    if (searchFilter.fromDate && searchFilter.toDate) {
      queryBuilder.andWhere('transaction."createdAt" >= :dateFrom', {
        dateFrom: searchFilter.fromDate
      });
      queryBuilder.andWhere('transaction."createdAt" <= :dateTo', {
        dateTo: searchFilter.toDate
      });
    }

    if (relations.length > 0 && relations.includes('user')) {
      queryBuilder.leftJoinAndSelect('transaction.user', 'user');
    }

    if (relations.length > 0 && relations.includes('balancesOnlyBonus')) {
      queryBuilder.leftJoinAndSelect(
        'transaction.balances',
        'balances',
        `balances.type = :type`,
        {
          type: BalanceType.DEPOSIT_BONUS
        }
      );
    }

    const paginationInfo: PaginationInfoInterface =
      this.getPaginationInfo(searchFilter);

    const { page, skip, limit } = paginationInfo;

    const [results, total] = await queryBuilder
      .offset(skip)
      .limit(limit)
      .orderBy('transaction.createdAt', 'DESC')
      .getManyAndCount();

    const serializedResults = this.transformMany(results, transformOptions);

    return new Pagination<TransactionSerializer>({
      results: serializedResults,
      totalItems: total,
      pageSize: limit,
      currentPage: page,
      previous: page > 1 ? page - 1 : 0,
      next: total > skip + limit ? page + 1 : 0
    });
  }

  getPaginationInfo(options): PaginationInfoInterface {
    const page =
      typeof options.page !== 'undefined' && options.page > 0
        ? options.page
        : 1;
    const limit =
      typeof options.limit !== 'undefined' && options.limit > 0
        ? options.limit
        : 10;
    return {
      skip: (page - 1) * limit,
      limit,
      page
    };
  }

  transform(model: Transaction, transformOption = {}): TransactionSerializer {
    return plainToInstance(
      TransactionSerializer,
      instanceToPlain(model, transformOption),
      transformOption
    );
  }

  transformMany(
    models: Transaction[],
    transformOption = {}
  ): TransactionSerializer[] {
    return models.map((model) => this.transform(model, transformOption));
  }

  create(data: Partial<Transaction>) {
    return this.repository.save(data);
  }

  update(id: number, data: Partial<Transaction>) {
    return this.repository.update(id, data);
  }

  async getById(id: number) {
    const data = await this.repository.findOne({
      where: { id }
    });
    return this.transform(data, {
      groups: ['basic']
    });
  }

  call(
    uri: string,
    method: string,
    data: Record<string, any> = {},
    authToken: string = null
  ) {
    const axiosOptions = {
      method,
      url: `${nowPayConfig.baseUri}/${uri}`,
      headers: {
        accept: 'application/json',
        'Accept-Encoding': 'gzip,deflate,compress',
        'x-api-key': nowPayConfig.apiKey
      },
      timeout: 10000,
      maxRedirects: 5,
      ...{ data }
    };
    if (authToken) {
      axiosOptions.headers['Authorization'] = `Bearer ${authToken}`;
    }
    return axios.request(axiosOptions);
  }

  buildQueryString(filters: Record<string, any>) {
    return Object.keys(filters)
      .map(
        (k) =>
          `${encodeURIComponent(
            this.camelToUnderscore(k)
          )}=${encodeURIComponent(filters[k])}`
      )
      .join('&');
  }

  camelToUnderscore(str) {
    return str.replace(/[A-Z]/g, (match) => `_${match.toLowerCase()}`);
  }

  async getTransactionByStatusesAndType(
    statuses: TransactionStatus[],
    type: TransactionType,
    relations: string[] = [],
    order: ObjectLiteral = { createdAt: 'DESC' }
  ) {
    return this.repository.find({
      where: {
        status: In(statuses),
        type,
        paymentId: Not(IsNull())
      },
      order,
      relations
    });
  }

  async processPendingWithdrawls(transactionIds: number[]) {
    let payoutResponseData;
    try {
      const withdrawalPayload = {
        withdrawals: []
      };
      if (transactionIds.length > 10) {
        throw new CustomHttpException(
          'Only 10 transactions can be processed at a time',
          400
        );
      }
      const transactions = await this.repository.find({
        where: {
          id: In(transactionIds),
          status: TransactionStatus.PENDING,
          type: TransactionType.WITHDRAWAL
        }
      });

      if (transactions.length === 0) {
        throw new CustomHttpException('No pending transactions found', 400);
      }

      withdrawalPayload['withdrawals'] = transactions.map((transaction) => {
        return {
          address: transaction.depositAddress,
          currency: transaction.currency,
          amount: transaction.fiatAmount,
          extra_id: transaction.uuid
        };
      });

      const authResponse = await this.call('auth', 'POST', {
        email: nowPayConfig.email,
        password: nowPayConfig.password
      });

      const payoutResponse = await this.call(
        'payout',
        'POST',
        withdrawalPayload,
        authResponse.data.token
      );

      const payoutResponseData = payoutResponse.data;

      if (payoutResponseData.withdrawals.length === 0) {
        throw new CustomHttpException(
          'No pending transactions found on now-pay',
          400
        );
      }

      for (const transaction of payoutResponseData.withdrawals) {
        try {
          const transationData = await this.repository.findOne({
            where: {
              uuid: transaction.extra_id
            }
          });
          if (!transationData) {
            continue;
          }
          await this.repository.update(transationData.id, {
            status: TransactionStatus.WAITING,
            paymentId: transaction?.id,
            batchWithdrawalId: transaction?.batch_withdrawal_id
          });
        } catch (err) {
          continue;
        }
      }
    } catch (err) {
      throw new CustomHttpException(err.message, 400);
    }
    return payoutResponseData;
  }

  async verifyPendingWithdrawls(
    batchWithdrawalId: string,
    verificationCode: string
  ) {
    try {
      const checkBatchIdCount = await this.repository.count({
        where: {
          batchWithdrawalId,
          status: TransactionStatus.WAITING,
          type: TransactionType.WITHDRAWAL
        }
      });
      if (checkBatchIdCount === 0) {
        throw new CustomHttpException(
          `No pending withdrawals found for ${batchWithdrawalId}`,
          400
        );
      }
      const authResponse = await this.call('auth', 'POST', {
        email: nowPayConfig.email,
        password: nowPayConfig.password
      });
      await this.call(
        `payout/${batchWithdrawalId}/verify`,
        'POST',
        {
          verification_code: verificationCode
        },
        authResponse.data.token
      );
      await this.repository.update(
        { batchWithdrawalId },
        { status: TransactionStatus.PROCESSING }
      );
    } catch (err) {
      throw new CustomHttpException(err.message, 400);
    }
  }
}
