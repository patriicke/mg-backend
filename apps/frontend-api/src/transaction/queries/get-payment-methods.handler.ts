import { IQueryHandler, QueryBus, QueryHandler } from '@nestjs/cqrs';
import { Cache } from 'cache-manager';
import { GetPaymentMethods } from './get-payment-methods';
import { PaymentMethodsResult } from '../query-results/payment-methods.result';
import { CustomHttpException } from '@app/common-module';
import { CACHE_MANAGER, HttpStatus, Inject } from '@nestjs/common';
import { TransactionService } from '@app/modules/transaction';

@QueryHandler(GetPaymentMethods)
export class GetPaymentMethodsHandler
  implements IQueryHandler<GetPaymentMethods>
{
  constructor(
    readonly queryBus: QueryBus,
    private readonly service: TransactionService,
    @Inject(CACHE_MANAGER) private readonly cacheService: Cache
  ) {}

  async execute(): Promise<PaymentMethodsResult[]> {
    try {
      const cacheKey = 'payment_methods';
      let paymentMethods: Record<string, string[]>;
      const cachedMethods = await this.cacheService.get<any>(cacheKey);

      if (cachedMethods && Object.keys(cachedMethods)) {
        paymentMethods = cachedMethods;
      } else {
        const { data } = await this.service.call('currencies', 'GET');
        await this.cacheService.set<any>(cacheKey, data, {
          ttl: 30
        });
        paymentMethods = data;
      }

      return paymentMethods.currencies?.map(
        (paymentMethod) => new PaymentMethodsResult({ name: paymentMethod })
      );
    } catch (error) {
      throw new CustomHttpException(
        error.message || 'error getting payment methods',
        HttpStatus.BAD_REQUEST
      );
    }
  }
}
