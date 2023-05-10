export class CreatePayout {
  readonly address: string;
  readonly currency: string;
  readonly amount: number;
  readonly userId: number;

  constructor(props: CreatePayout) {
    Object.assign(this, props);
  }
}
