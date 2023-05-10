import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class ProcessWithdrawlDto {
  @ApiProperty()
  @IsNotEmpty()
  transactionIds: number[];
}
