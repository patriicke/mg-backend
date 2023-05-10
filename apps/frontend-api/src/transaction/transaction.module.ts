import { Module } from '@nestjs/common';
import { TransactionController } from './http/controller/transaction.controller';
import { HttpModule } from '@nestjs/axios';
import { CqrsModule } from '@nestjs/cqrs';
import { GetPaymentMethodsHandler } from './queries/get-payment-methods.handler';
import { EstimateConversionHandler } from './queries/estimate-conversion.handler';
import { CreatePaymentHandler } from './commands/create-payment.handler';
import { PaymentCallbackHandler } from './commands/payment-callback.handler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transaction, TransactionService } from '@app/modules/transaction';
import { GetTransactionByIdHandler } from './queries/get-transaction-by-id.handler';
import { CreatePayoutHandler } from './commands/create-payout.handler';
import { FrontendUserRepository } from '@app/modules/frontend-user';
import { GetTransactionHistoryHandler } from './queries/get-transaction-history.handler';

@Module({
  imports: [
    CqrsModule,
    HttpModule.registerAsync({
      useFactory: () => ({
        timeout: 10000,
        maxRedirects: 5
      })
    }),
    TypeOrmModule.forFeature([Transaction])
  ],
  controllers: [TransactionController],
  providers: [
    TransactionService,
    FrontendUserRepository,
    GetPaymentMethodsHandler,
    EstimateConversionHandler,
    CreatePaymentHandler,
    CreatePayoutHandler,
    PaymentCallbackHandler,
    GetTransactionByIdHandler,
    GetTransactionHistoryHandler
  ]
})
export class TransactionModule {}
