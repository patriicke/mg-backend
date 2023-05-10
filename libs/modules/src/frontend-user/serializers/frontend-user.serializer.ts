import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose, Transform } from 'class-transformer';
import { ModelSerializer } from '@app/common-module';
import config from 'config';

export const cryptoGameHistoryGroupsForSerializing: string[] = [
  'crypto-game-history'
];
export const basicFieldGroupsForSerializing: string[] = ['basic'];
export const adminFieldGroupsForSerializing: string[] = ['admin'];

export class FrontendUserSerializer extends ModelSerializer {
  @Expose()
  id: number;

  @Expose({
    groups: [
      ...basicFieldGroupsForSerializing,
      ...adminFieldGroupsForSerializing
    ]
  })
  email: string;

  @Expose({
    groups: basicFieldGroupsForSerializing
  })
  address: string;

  @Expose({
    groups: basicFieldGroupsForSerializing
  })
  phantomAddress: string;

  @Expose({
    groups: basicFieldGroupsForSerializing
  })
  accountVerified: boolean;

  @Expose({
    groups: [
      ...basicFieldGroupsForSerializing,
      ...adminFieldGroupsForSerializing,
      ...cryptoGameHistoryGroupsForSerializing
    ]
  })
  @Transform(({ value, obj }) => {
    return obj.getPlainUsername ? value : obj.showUsername ? value : '******';
  })
  username: string;

  @ApiProperty()
  @Expose({
    groups: adminFieldGroupsForSerializing
  })
  status: boolean;

  @ApiPropertyOptional()
  @Expose({
    groups: basicFieldGroupsForSerializing
  })
  createdAt: Date;

  @ApiPropertyOptional()
  @Expose({
    groups: basicFieldGroupsForSerializing
  })
  deletedAt: Date;

  @ApiPropertyOptional()
  @Expose({
    groups: basicFieldGroupsForSerializing
  })
  updatedAt: Date;

  @Expose({
    groups: [
      ...basicFieldGroupsForSerializing,
      ...adminFieldGroupsForSerializing
    ]
  })
  @Transform(({ value }) => {
    return value
      ? value.includes('default-pic-')
        ? `${config.get('app.appUrl')}/default-images/${value}`
        : `${config.get('app.appUrl')}/images/frontend-profile/${value}`
      : null;
  })
  avatar: string;

  @Expose({
    groups: [
      ...basicFieldGroupsForSerializing,
      ...adminFieldGroupsForSerializing
    ]
  })
  showUsername: boolean;

  @Expose({
    groups: basicFieldGroupsForSerializing
  })
  token: string;

  @Expose({
    groups: basicFieldGroupsForSerializing
  })
  tokenExpiry: Date;

  @Expose({
    groups: basicFieldGroupsForSerializing
  })
  totalWalletBalance?: number;

  @Expose({
    groups: basicFieldGroupsForSerializing
  })
  serverHash: string;

  @Exclude()
  password: string;

  @Exclude()
  salt: string;

  @Expose({
    groups: basicFieldGroupsForSerializing
  })
  identifier: string;

  @Expose({
    groups: basicFieldGroupsForSerializing
  })
  referralCode: string;

  @Expose({
    groups: basicFieldGroupsForSerializing
  })
  referralId: number;

  @Expose({
    groups: basicFieldGroupsForSerializing
  })
  referralPoints: number;

  @Exclude()
  getPlainUsername: false;

  @Exclude()
  nonce: string;
}
