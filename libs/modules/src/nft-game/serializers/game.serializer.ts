import { ModelSerializer, roundOff } from '@app/common-module';
import {
  FrontendUser,
  FrontendUserRepository,
  cryptoGameHistoryGroupsForSerializing
} from '@app/modules/frontend-user';
import { Exclude, Expose, Transform } from 'class-transformer';
import { GameType } from '../entities/game.entity';

export const personalGroupsForSerializing: string[] = ['personal'];
export const historyGroupsForSerializing: string[] = ['history'];
export const nftGameImageForSerializing: string[] = ['nft-images'];
export const basicFieldGroupsForSerializing: string[] = ['basic'];
export const adminFieldGroupsForSerializing: string[] = ['admin'];

export class GameSerializer extends ModelSerializer {
  @Expose()
  id: number;

  @Expose({
    groups: basicFieldGroupsForSerializing
  })
  uuid: string;

  @Expose({
    groups: adminFieldGroupsForSerializing
  })
  balanceId: string;

  @Expose({
    groups: adminFieldGroupsForSerializing
  })
  userId: number;

  @Expose({
    groups: basicFieldGroupsForSerializing
  })
  @Transform(({ value }) => {
    return roundOff(value, 2);
  })
  winProbability: number;

  @Expose({
    groups: basicFieldGroupsForSerializing
  })
  serverHash: string;

  @Expose({
    groups: basicFieldGroupsForSerializing
  })
  chain: string;

  @Expose({
    groups: basicFieldGroupsForSerializing
  })
  tokenId: string;

  @Expose({
    groups: basicFieldGroupsForSerializing
  })
  nftAddress: string;

  @Expose({
    groups: [...basicFieldGroupsForSerializing, ...nftGameImageForSerializing]
  })
  nftImage: string;

  @Expose({
    groups: [...nftGameImageForSerializing]
  })
  @Transform(({ obj }) => {
    return obj?.detail?.symbol.toUpperCase();
  })
  symbol: string;

  @Expose({
    groups: basicFieldGroupsForSerializing
  })
  @Transform(({ value }) => {
    return roundOff(value, 2);
  })
  price: number;

  @Expose({
    groups: [
      ...basicFieldGroupsForSerializing,
      ...historyGroupsForSerializing,
      ...personalGroupsForSerializing
    ]
  })
  @Transform(({ value }) => {
    return roundOff(value, 2);
  })
  betAmount: number;

  @Expose({
    groups: basicFieldGroupsForSerializing
  })
  nonce: number;

  @Expose({
    groups: [...basicFieldGroupsForSerializing, ...personalGroupsForSerializing]
  })
  status: string;

  @Expose({
    groups: [
      ...basicFieldGroupsForSerializing,
      ...historyGroupsForSerializing,
      ...personalGroupsForSerializing
    ]
  })
  type: string;

  @Expose({
    groups: [
      ...basicFieldGroupsForSerializing,
      ...historyGroupsForSerializing,
      ...personalGroupsForSerializing
    ]
  })
  createdAt: Date;

  @Expose({
    groups: basicFieldGroupsForSerializing
  })
  updatedAt: Date;

  @Exclude()
  detail: {
    symbol: string;
  };

  @Expose()
  @Transform(({ obj }) =>
    FrontendUserRepository.transform(obj.user, {
      groups:
        obj.type === GameType.CRYPTO_SLOT
          ? cryptoGameHistoryGroupsForSerializing
          : []
    })
  )
  user: FrontendUser;
}
