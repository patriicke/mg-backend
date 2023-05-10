import { CustomBaseEntity } from '@app/common-module';
import { Column, Entity } from 'typeorm';

@Entity({
  name: 'nft'
})
export class NftEntity extends CustomBaseEntity {
  @Column()
  tokenId: string;

  @Column()
  nftContractAddress: string;

  @Column()
  contractType: string;

  @Column()
  chain: string;

  @Column()
  name: string;

  @Column()
  collectionName: string;

  @Column()
  slug: string;

  @Column()
  numSales: string;

  @Column()
  description: string;

  @Column()
  imageUrl: string;

  @Column()
  shortName: string;

  @Column('decimal', { precision: 20, scale: 8 })
  lastSaleTotalPrice: number;

  @Column('decimal', { precision: 20, scale: 8 })
  lastSaleDecimals: number;

  @Column('decimal', { precision: 20, scale: 8 })
  lastSaleUsdPrice: number;
}
