export class NftQuery {
  constructor(
    readonly slug: string,
    readonly props: Partial<{
      limit: number;
      page: number;
    }>
  ) {}
}
