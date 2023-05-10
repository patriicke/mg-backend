export class GetTransactionHistoryQuery {
  constructor(
    readonly userId: number,
    readonly params: Partial<{
      readonly page: number;
      readonly limit: number;
      readonly status: string;
      readonly type: string;
      readonly from: Date;
      readonly to: Date;
    }>
  ) {}
}
