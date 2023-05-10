import { Injectable } from '@nestjs/common';
import { BalanceRepository } from '../repositories/balance.repository';
import { IAddWinBalanceBalance, IDeductBetBalance } from '../interfaces';

@Injectable()
export class BalanceService {
  constructor(private readonly repository: BalanceRepository) {}

  async deductBetBalance(payload: IDeductBetBalance) {
    const { userId, betAmount } = payload;
    return this.repository.save({
      userId,
      amount: -betAmount
    });
  }

  async addWinBalance(payload: IAddWinBalanceBalance) {
    const { userId, winAmount } = payload;
    return this.repository.save({
      userId,
      amount: winAmount
    });
  }
}
