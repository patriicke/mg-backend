import { IQueryHandler, QueryBus, QueryHandler } from '@nestjs/cqrs';
import { EstimateConversion } from './estimate-conversion';
import { PaymentEstimateResult } from '../query-results/payment-estimate.result';
import { HttpStatus } from '@nestjs/common';
import { CustomHttpException } from '@app/common-module';
import { TransactionService } from '@app/modules/transaction';

@QueryHandler(EstimateConversion)
export class EstimateConversionHandler
  implements IQueryHandler<EstimateConversion>
{
  constructor(
    readonly queryBus: QueryBus,
    readonly service: TransactionService
  ) {}

  async execute(query: EstimateConversion): Promise<PaymentEstimateResult> {
    try {
      const queryString = this.service.buildQueryString(query);

      const { data } = await this.service.call(
        `estimate?${queryString}`,
        'GET'
      );
      return new PaymentEstimateResult({
        currencyFrom: data.currency_from,
        amountFrom: data.amount_from,
        currencyTo: data.currency_to,
        estimatedAmount: data.estimated_amount
      });
    } catch (error) {
      throw new CustomHttpException(
        error.message || 'error getting conversion',
        HttpStatus.BAD_REQUEST
      );
    }
  }
}
