import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty } from 'class-validator';
import { WalletType } from './verify-wallet-signature.request';

export class FetchIdentifierBodyDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsIn([WalletType.METAMASK, WalletType.PHANTOM])
  type: WalletType;
}
