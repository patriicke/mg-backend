import { Transform } from 'class-transformer';
import { IsNotEmpty, IsPositive, IsString, Min } from 'class-validator';

export class CreatePaymentDto {
  // check value should be positive and greater than 0
  @IsNotEmpty()
  @Min(1)
  @Transform(({ value }) => parseFloat(value))
  @IsPositive()
  @Min(1)
  priceAmount: number;

  @IsNotEmpty()
  @IsString()
  priceCurrency: string;

  @IsNotEmpty()
  @IsString()
  payCurrency: string;
}
