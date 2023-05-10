import { CustomBaseEntity } from '@app/common-module';
import { FrontendUser } from '@app/modules/frontend-user';
import { Column, Entity, ManyToOne } from 'typeorm';

export enum GameType {
  NFT_SLOT = 'nft-slot',
  CRYPTO_SLOT = 'crypto-slot'
}
@Entity({
  name: 'game'
})
export class GameEntity extends CustomBaseEntity {
  @Column({ generated: 'uuid' })
  uuid: string;

  @Column('decimal', { precision: 20, scale: 2 })
  winProbability: number;

  @Column()
  serverHash: string;

  @Column()
  chain: string;

  @Column()
  tokenId: string;

  @Column()
  nftAddress: string;

  @Column()
  nftImage: string;

  @Column('decimal', { precision: 20, scale: 8 })
  price: number;

  @Column('decimal', { precision: 20, scale: 8 })
  betAmount: number;

  @Column()
  nonce: number;

  @Column()
  status: string;

  @Column()
  contractName: string;

  @Column()
  userId: number;

  @ManyToOne(() => FrontendUser)
  user: FrontendUser;

  @Column()
  balanceId: number;

  @Column()
  type: GameType;

  @Column('simple-json', { nullable: true })
  detail: {
    symbol: string;
  };
}
