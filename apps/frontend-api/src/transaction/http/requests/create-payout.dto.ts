import { Transform } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
export class CreatePayoutDto {
  @IsNotEmpty()
  @IsString()
  address: string;

  @IsNotEmpty()
  @IsString()
  currency: string;

  @IsNotEmpty()
  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  amount: number;
}
