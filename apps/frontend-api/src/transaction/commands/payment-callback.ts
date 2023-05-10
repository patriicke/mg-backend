export class PaymentCallback {
  readonly token: string;

  constructor(props: PaymentCallback) {
    Object.assign(this, props);
  }
}
