import { IsNotEmpty } from 'class-validator';

export class PaymentCallbackDto {
  @IsNotEmpty()
  token: string;
}
