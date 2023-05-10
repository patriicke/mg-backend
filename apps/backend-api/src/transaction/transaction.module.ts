import { Module } from '@nestjs/common';
import { TransactionController } from './transaction.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transaction, TransactionService } from '@app/modules/transaction';

@Module({
  imports: [TypeOrmModule.forFeature([Transaction])],
  controllers: [TransactionController],
  providers: [TransactionService]
})
export class TransactionModule {}
