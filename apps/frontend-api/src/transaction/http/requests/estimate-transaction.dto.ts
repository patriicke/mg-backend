import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';

export class EstimateTransactionDto {
  @IsNotEmpty()
  @Transform(({ value }) => parseFloat(value))
  amount: number;

  @IsNotEmpty()
  @IsString()
  currencyFrom: string;

  @IsNotEmpty()
  @IsString()
  currencyTo: string;
}
