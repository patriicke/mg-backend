import { ICommandHandler, CommandHandler } from '@nestjs/cqrs';
import { CreatePayment } from './create-payment';
import { CustomHttpException } from '@app/common-module';
import { HttpStatus } from '@nestjs/common';
import {
  TransactionService,
  TransactionStatus,
  TransactionType
} from '@app/modules/transaction';
@CommandHandler(CreatePayment)
export class CreatePaymentHandler implements ICommandHandler<CreatePayment> {
  constructor(readonly service: TransactionService) {}
  async execute(command: CreatePayment): Promise<number> {
    try {
      const { data } = await this.service.call(`payment`, 'POST', {
        price_amount: command.priceAmount,
        price_currency: command.priceCurrency,
        pay_currency: command.payCurrency,
        ...(process.env.NODE_ENV === 'development' && { case: 'success' })
      });
      const payment = await this.service.create({
        userId: command.userId,
        type: TransactionType.DEPOSIT,
        status: TransactionStatus.WAITING,
        paymentId: data.payment_id,
        depositAddress: data.pay_address,
        fiatAmount: parseFloat(data.price_amount.toFixed(2)),
        payAmount: parseFloat(data.pay_amount.toFixed(6)),
        amountReceived: parseFloat(data.amount_received.toFixed(6)),
        currency: data.pay_currency
      });
      return payment.id;
    } catch (error) {
      // console.log(error.response, error.response.data);
      throw new CustomHttpException(
        error?.response?.data?.message || 'error creating payment',
        HttpStatus.BAD_REQUEST
      );
    }
  }
}
