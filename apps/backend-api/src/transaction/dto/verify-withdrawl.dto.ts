import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class VerifyWithdrawlDto {
  @ApiProperty()
  @IsNotEmpty()
  batchWithdrawalId: string;

  @ApiProperty()
  @IsNotEmpty()
  verificationCode: string;
}
