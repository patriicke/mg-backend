import { TransactionService } from '@app/modules/transaction';
import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Query,
  Patch
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtTwoFactorGuard } from '../common/guard/jwt-two-factor.guard';
import { PermissionGuard } from '../common/guard/permission.guard';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { TransactionFilterDto } from './dto/transaction-filter.dto';
import { ProcessWithdrawlDto } from './dto/process-withdrawl.dto';
import { VerifyWithdrawlDto } from './dto/verify-withdrawl.dto';
@Controller('transaction')
@ApiBearerAuth()
@ApiTags('Transaction')
@UseGuards(JwtTwoFactorGuard, PermissionGuard)
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post()
  create(@Body() createTransactionDto: CreateTransactionDto) {
    return this.transactionService.create(createTransactionDto);
  }

  @Get('/')
  getTransactions(@Query() query: TransactionFilterDto) {
    return this.transactionService.getfilteredTransactions(
      query,
      {
        groups: ['admin']
      },
      ['user']
    );
  }

  @Post('/process/withdrawal')
  processPendingWithdrawls(@Body() body: ProcessWithdrawlDto) {
    return this.transactionService.processPendingWithdrawls(
      body.transactionIds
    );
  }

  @Patch('/verify/withdrawal')
  verifyPendingWithdrawls(@Body() body: VerifyWithdrawlDto) {
    return this.transactionService.verifyPendingWithdrawls(
      body.batchWithdrawalId,
      body.verificationCode
    );
  }
}
