import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { GetUser, JwtAuthGuard } from '@app/common-module/index';

import { CreatePayment } from '../../commands/create-payment';
import { PaymentCallback } from '../../commands/payment-callback';
import { EstimateConversion } from '../../queries/estimate-conversion';
import { GetPaymentMethods } from '../../queries/get-payment-methods';
import { GetTransactionById } from '../../queries/get-transaction-by-id';
import { CreatePaymentDto } from '../requests/create-payment.dto';
import { EstimateTransactionDto } from '../requests/estimate-transaction.dto';
import { PaymentCallbackDto } from '../requests/payment-callback.dto';
import { FrontendUser } from '@app/modules/frontend-user';
import { CreatePayoutDto } from '../requests/create-payout.dto';
import { CreatePayout } from '../../commands/create-payout';
import { TransactionService } from '@app/modules/transaction';
import { TransactionHistoryDto } from '../requests/transaction-history.dto';
import { GetTransactionHistoryQuery } from '../../queries/get-transaction-history';

@Controller('transaction')
@ApiTags('Transaction')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class TransactionController {
  constructor(
    private readonly transactionService: TransactionService,
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus
  ) {}

  @Post('/payment')
  async createPayment(
    @GetUser() user: FrontendUser,
    @Body() createPaymentDto: CreatePaymentDto
  ) {
    const id = await this.commandBus.execute(
      new CreatePayment({
        ...createPaymentDto,
        userId: user.id
      })
    );
    return this.queryBus.execute(new GetTransactionById(id));
  }

  @Post('/payout')
  async createPayout(
    @GetUser() user: FrontendUser,
    @Body() createPayoutDto: CreatePayoutDto
  ) {
    const id = await this.commandBus.execute(
      new CreatePayout({
        ...createPayoutDto,
        userId: user.id
      })
    );
    return this.queryBus.execute(new GetTransactionById(id));
  }

  @Get('/history')
  async history(
    @GetUser() user: FrontendUser,
    @Query() historyDto: TransactionHistoryDto
  ) {
    return this.queryBus.execute(
      new GetTransactionHistoryQuery(user.id, historyDto)
    );
  }

  @Get('/callback')
  callback(@Query() paymentCallbackDto: PaymentCallbackDto, @Body() body: any) {
    console.log(
      '🚀 ~ file: transaction.controller.ts:33 ~ TransactionController ~ callback ~ body:',
      body
    );
    return this.commandBus.execute(new PaymentCallback(paymentCallbackDto));
  }

  @Get('/methods')
  paymentMethods() {
    return this.queryBus.execute(new GetPaymentMethods());
  }

  @Get('/estimate')
  estimate(@Query() query: EstimateTransactionDto) {
    return this.queryBus.execute(
      new EstimateConversion(query.amount, query.currencyFrom, query.currencyTo)
    );
  }
}
