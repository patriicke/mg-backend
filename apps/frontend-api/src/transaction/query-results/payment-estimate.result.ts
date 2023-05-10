export class PaymentEstimateResult {
  readonly currencyFrom: string;
  readonly amountFrom: number;
  readonly currencyTo: string;
  readonly estimatedAmount: number;
  constructor(props: PaymentEstimateResult) {
    Object.assign(this, props);
  }
}
