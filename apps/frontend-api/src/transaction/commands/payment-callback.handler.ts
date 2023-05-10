import { ICommandHandler, CommandHandler } from '@nestjs/cqrs';
import { PaymentCallback } from './payment-callback';
import { CustomHttpException } from '@app/common-module';
import { HttpStatus } from '@nestjs/common';
import { TransactionService } from '@app/modules/transaction';

@CommandHandler(PaymentCallback)
export class PaymentCallbackHandler
  implements ICommandHandler<PaymentCallback>
{
  constructor(readonly service: TransactionService) {}
  async execute() {
    try {
      const { data } = await this.service.call(`payment`, 'POST', {
        // price_amount: command.priceAmount,
        // price_currency: command.priceCurrency,
        // pay_currency: command.payCurrency,
        ...(process.env.NODE_ENV === 'development' && { case: 'success' })
        // order_id : uuid // uuid of transaction
      });
      return data;
    } catch (error) {
      throw new CustomHttpException(
        error.message || 'error creating payment',
        HttpStatus.BAD_REQUEST
      );
    }
  }
}
