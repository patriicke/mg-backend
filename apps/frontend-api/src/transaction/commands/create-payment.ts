export class CreatePayment {
  readonly priceAmount: number;
  readonly priceCurrency: string;
  readonly payCurrency: string;
  readonly userId: number;

  constructor(props: CreatePayment) {
    Object.assign(this, props);
  }
}
